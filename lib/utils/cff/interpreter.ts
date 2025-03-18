/**
 * CFF/CFF2 インタプリタのメイン実装
 * Type 2 CharString をパースして SVG パスデータに変換する
 * 
 * 参照:
 * - https://learn.microsoft.com/en-us/typography/opentype/spec/cff
 * - https://learn.microsoft.com/en-us/typography/opentype/spec/cff2
 * - https://adobe-type-tools.github.io/font-tech-notes/pdfs/5177.Type2.pdf
 */

import {
	CharStringCommand,
	CharStringOperator,
	CharStringProgram,
	DictIndex,
	FDSelect,
	FDSelectFormat,
	SubrIndex
} from '../../types/common';
import { Cff2Table } from '../../types/tables/CFF2';
import { CffTable } from '../../types/tables/CFF_';
import { parseCharString } from '../../tables/common/cff';
import { GlyphPath, PathCommand, PathState, pathToSVGString } from './path';
import { CharStringProcessor } from './char-string-processor';
import { SubroutineHandler } from './subroutine-handler';

/**
 * CFF/CFF2 インタプリタ
 * CharString をパースして SVG パスデータに変換する
 */
export class CFFInterpreter {
	private isCFF2: boolean;
	private charStringsIndex: DictIndex;
	private globalSubrs: SubrIndex;
	private localSubrs: SubrIndex[];
	private fdSelect: FDSelect | undefined;
	private defaultWidthX: number = 0;
	private nominalWidthX: number = 0;

	/**
	 * コンストラクタ
	 * 
	 * @param table CFFまたはCFF2テーブル
	 */
	constructor(table: CffTable | Cff2Table) {
		this.isCFF2 = 'varStore' in table;
		this.charStringsIndex = table.charStringsIndex;
		this.globalSubrs = table.globalSubrIndex;

		// ローカルサブルーチンの設定
		if ('localSubrIndices' in table && table.localSubrIndices) {
			this.localSubrs = table.localSubrIndices;
		} else {
			// PrivateDict から SubrIndex を抽出
			this.localSubrs = table.privateDicts.map(dict => {
				if ('localSubrIndex' in dict && dict.localSubrIndex) {
					return dict.localSubrIndex;
				}
				return {
					count: 0,
					offSize: 0,
					offsets: [],
					subrs: []
				};
			});
		}

		this.fdSelect = table.fdSelect;

		// デフォルト幅と公称幅の設定
		if (table.privateDicts.length > 0) {
			const privateDict = table.privateDicts[0];
			if (privateDict.defaultWidthX !== undefined) {
				this.defaultWidthX = privateDict.defaultWidthX;
			}
			if (privateDict.nominalWidthX !== undefined) {
				this.nominalWidthX = privateDict.nominalWidthX;
			}
		}
	}

	/**
	 * グリフIDに対応するCharStringデータを取得
	 * 
	 * @param glyphId グリフID
	 * @returns CharStringデータ
	 */
	private getCharStringData(glyphId: number): Uint8Array {
		if (glyphId < 0 || glyphId >= this.charStringsIndex.count) {
			throw new Error(`無効なグリフID: ${glyphId}`);
		}
		return this.charStringsIndex.data[glyphId];
	}

	/**
	 * グリフIDに対応するFD（Font DICT）インデックスを取得
	 * 
	 * @param glyphId グリフID
	 * @returns FDインデックス
	 */
	private getFDIndex(glyphId: number): number {
		if (!this.fdSelect) {
			return 0;
		}

		switch (this.fdSelect.format) {
			case FDSelectFormat.Format0:
				return this.fdSelect.fds[glyphId];

			case FDSelectFormat.Format3:
				for (let i = 0; i < this.fdSelect.nRanges; i++) {
					const range = this.fdSelect.ranges[i];
					const nextRangeStart = (i < this.fdSelect.nRanges - 1)
						? this.fdSelect.ranges[i + 1].first
						: this.fdSelect.sentinel;

					if (glyphId >= range.first && glyphId < nextRangeStart) {
						return range.fd;
					}
				}
				break;

			case FDSelectFormat.Format4:
				for (let i = 0; i < this.fdSelect.nRanges; i++) {
					const range = this.fdSelect.ranges[i];
					const nextRangeStart = (i < this.fdSelect.nRanges - 1)
						? this.fdSelect.ranges[i + 1].first
						: this.fdSelect.sentinel;

					if (glyphId >= range.first && glyphId < nextRangeStart) {
						return range.fd;
					}
				}
				break;
		}

		return 0;
	}

	/**
	 * グリフのパスデータを取得
	 * 
	 * @param glyphId グリフID
	 * @returns SVG風のパスデータ
	 */
	public getGlyphPath(glyphId: number): GlyphPath {
		const charStringData = this.getCharStringData(glyphId);
		const program = parseCharString(charStringData);

		const fdIndex = this.getFDIndex(glyphId);
		const localSubrs = this.localSubrs[fdIndex] || this.localSubrs[0];

		return this.executeCharString(program, localSubrs);
	}

	/**
	 * CharStringプログラムを実行してパスデータを生成
	 * 
	 * @param program CharStringプログラム
	 * @param localSubrs ローカルサブルーチン
	 * @param initialWidth 初期幅
	 * @param callStack 呼び出しスタック（再帰制御用）
	 * @returns SVG風のパスデータ
	 */
	public executeCharString(
		program: CharStringProgram,
		localSubrs: SubrIndex,
		initialWidth?: number,
		callStack: number[] = []
	): GlyphPath {
		// パス状態の初期化
		const state = new PathState(this.defaultWidthX, this.nominalWidthX, initialWidth);

		// スタックの初期化
		const stack: number[] = [];

		// プログラムの実行
		for (let i = 0; i < program.length; i++) {
			const cmd = program[i];
			const op = cmd.operator;
			const args = cmd.operands;

			// スタックにオペランドを追加
			args.forEach(arg => stack.push(arg));

			// 演算子に基づいてパスを構築
			switch (op) {
				// ステム関連のコマンド
				case CharStringOperator.HSTEM:
				case CharStringOperator.HSTEMHM:
					CharStringProcessor.handleStem(state, stack, true);
					break;

				case CharStringOperator.VSTEM:
				case CharStringOperator.VSTEMHM:
					CharStringProcessor.handleStem(state, stack, false);
					break;

				// 移動コマンド
				case CharStringOperator.RMOVETO:
				case CharStringOperator.HMOVETO:
				case CharStringOperator.VMOVETO:
					CharStringProcessor.handleMove(state, stack, op);
					break;

				// 直線コマンド
				case CharStringOperator.RLINETO:
				case CharStringOperator.HLINETO:
				case CharStringOperator.VLINETO:
					CharStringProcessor.handleLine(state, stack, op);
					break;

				// 曲線コマンド
				case CharStringOperator.RRCURVETO:
					CharStringProcessor.handleCurve(state, stack);
					break;

				case CharStringOperator.HHCURVETO:
					CharStringProcessor.handleHHCurve(state, stack);
					break;

				case CharStringOperator.VVCURVETO:
					CharStringProcessor.handleVVCurve(state, stack);
					break;

				case CharStringOperator.HVCURVETO:
					CharStringProcessor.handleHVCurve(state, stack);
					break;

				case CharStringOperator.VHCURVETO:
					CharStringProcessor.handleVHCurve(state, stack);
					break;

				// 複合コマンド
				case CharStringOperator.RCURVELINE:
					CharStringProcessor.handleCurveLine(state, stack);
					break;

				case CharStringOperator.RLINECURVE:
					CharStringProcessor.handleLineCurve(state, stack);
					break;

				// フレックスコマンド
				case CharStringOperator.HFLEX:
					CharStringProcessor.handleHFLEX(state, stack);
					break;

				case CharStringOperator.FLEX:
					CharStringProcessor.handleFLEX(state, stack);
					break;

				case CharStringOperator.HFLEX1:
					CharStringProcessor.handleHFLEX1(state, stack);
					break;

				case CharStringOperator.FLEX1:
					CharStringProcessor.handleFLEX1(state, stack);
					break;

				// 終了コマンド
				case CharStringOperator.ENDCHAR:
					return CharStringProcessor.handleEndChar(state, stack);

				// ヒントマスクコマンド
				case CharStringOperator.HINTMASK:
				case CharStringOperator.CNTRMASK:
					// 前のコマンドがステム定義だった場合、それを処理
					if (!state.hasWidth && (stack.length % 2) !== 0) {
						state.width = state.nominalWidthX + stack.shift()!;
						state.hasWidth = true;
					}

					// 未処理のステム定義があれば処理する
					if (stack.length > 0) {
						state.vStemCount += Math.floor(stack.length / 2);
					}

					// ヒントマスクのバイト数はスキップ
					stack.length = 0;
					break;

				// サブルーチン呼び出し
				case CharStringOperator.CALLSUBR:
					SubroutineHandler.handleCallSubr(this, state, stack, localSubrs, callStack);
					break;

				case CharStringOperator.CALLGSUBR:
					SubroutineHandler.handleCallGSubr(
						this, state, stack, this.globalSubrs, localSubrs, callStack
					);
					break;

				// CFF2 固有の演算子
				case CharStringOperator.BLEND:
					// 可変フォントのブレンド処理（このサンプルでは実装していない）
					console.warn('BLEND演算子は現在サポートされていません');
					stack.length = 0;
					break;
			}
		}

		// 明示的なENDCHARがない場合のデフォルト処理
		if (state.path.length > 0) {
			state.closePath();
		}

		return state.getResult();
	}

	/**
	 * すべてのグリフのパスデータを取得
	 * 
	 * @returns グリフIDとパスデータのマップ
	 */
	public getAllGlyphPaths(): Map<number, GlyphPath> {
		const result = new Map<number, GlyphPath>();

		for (let glyphId = 0; glyphId < this.charStringsIndex.count; glyphId++) {
			try {
				const path = this.getGlyphPath(glyphId);
				result.set(glyphId, path);
			} catch (error) {
				console.error(`グリフID ${glyphId} のパース中にエラーが発生しました:`, error);
			}
		}

		return result;
	}

	/**
	 * SVGパスデータ文字列に変換
	 * 
	 * @param path SVG風のパスコマンド配列
	 * @returns SVGパス文字列 (d属性の値)
	 */
	public static pathToSVGString(path: PathCommand[]): string {
		return pathToSVGString(path);
	}
}