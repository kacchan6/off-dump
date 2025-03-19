/**
 * CFF/CFF2 グリフ抽出モジュール
 * フォントからグリフデータを抽出し、SVG形式に変換する
 */

import { Font } from '../../types/font';
import { Cff2Table } from '../../types/tables/CFF2';
import { CffTable } from '../../types/tables/CFF_';
import { StandardStrings } from '../tables/CFF_';
import { CFFInterpreter } from './interpreter';
import { PathCommand } from './path';

/**
 * グリフ情報
 */
export interface GlyphInfo {
	/**
	 * グリフID
	 */
	id: number;

	/**
	 * グリフ名 (CFF1のみ)
	 */
	name?: string;

	/**
	 * パスデータ
	 */
	path: PathCommand[];

	/**
	 * 送り幅
	 */
	advance: number;

	/**
	 * SVGパス文字列
	 */
	svgPath: string;
}

/**
 * CFF/CFF2フォントからグリフを抽出するクラス
 */
export class CFFGlyphExtractor {
	private font: Font;
	private interpreter: CFFInterpreter;
	private cffTable: CffTable | Cff2Table;
	private isCFF2: boolean;

	/**
	 * コンストラクタ
	 * 
	 * @param font フォントデータ
	 */
	constructor(font: Font) {
		this.font = font;

		// CFFまたはCFF2テーブルを取得
		if (font.tables.CFF2) {
			this.cffTable = font.tables.CFF2.table;
			this.isCFF2 = true;
		} else if (font.tables.CFF_) {
			this.cffTable = font.tables.CFF_.table;
			this.isCFF2 = false;
		} else {
			throw new Error('フォントにCFFまたはCFF2テーブルが含まれていません');
		}

		// インタプリタを初期化
		this.interpreter = new CFFInterpreter(this.cffTable);
	}

	/**
	 * グリフ名を取得 (CFF1のみ)
	 * 
	 * @param glyphId グリフID
	 * @returns グリフ名 (CFF2の場合はundefined)
	 */
	private getGlyphName(glyphId: number): string | undefined {
		if (this.isCFF2) {
			return undefined;
		}

		const cffTable = this.cffTable as CffTable;

		// .notdefグリフの特別処理
		if (glyphId === 0) {
			return '.notdef';
		}

		// 文字セットがない場合はグリフIDを返す
		if (!cffTable.charsetData) {
			return `glyph${glyphId}`;
		}

		let sid: number | undefined;

		// 文字セットのフォーマットに応じてSIDを特定
		switch (cffTable.charsetData.format) {
			case 0: {
				// Format 0: グリフIDからSIDへの直接マッピング
				if (glyphId - 1 < cffTable.charsetData.glyph.length) {
					sid = cffTable.charsetData.glyph[glyphId - 1];
				}
				break;
			}
			case 1: {
				// Format 1: 範囲ベースのマッピング
				let glyphIndex = 1; // .notdefの後から開始

				for (const range of cffTable.charsetData.ranges) {
					const rangeSize = range.nLeft + 1;

					if (glyphId >= glyphIndex && glyphId < glyphIndex + rangeSize) {
						sid = range.first + (glyphId - glyphIndex);
						break;
					}

					glyphIndex += rangeSize;
				}
				break;
			}
			case 2: {
				// Format 2: 範囲ベースのマッピング (16ビット)
				let glyphIndex = 1; // .notdefの後から開始

				for (const range of cffTable.charsetData.ranges) {
					const rangeSize = range.nLeft + 1;

					if (glyphId >= glyphIndex && glyphId < glyphIndex + rangeSize) {
						sid = range.first + (glyphId - glyphIndex);
						break;
					}

					glyphIndex += rangeSize;
				}
				break;
			}
		}

		// SIDからグリフ名を取得
		if (sid !== undefined) {
			// 標準文字列
			if (sid < 391) {
				return getCFFStandardString(sid);
			}

			// カスタム文字列
			const stringIndex = sid - 391;
			if (stringIndex < cffTable.stringIndex.strings.length) {
				return cffTable.stringIndex.strings[stringIndex];
			}
		}

		return `glyph${glyphId}`;
	}

	/**
	 * 単一グリフの情報を取得
	 * 
	 * @param glyphId グリフID
	 * @returns グリフ情報
	 */
	public getGlyph(glyphId: number): GlyphInfo {
		// グリフのパスデータを取得
		const glyphPath = this.interpreter.getGlyphPath(glyphId);

		// SVGパス文字列に変換
		const svgPath = CFFInterpreter.pathToSVGString(glyphPath.path);

		return {
			id: glyphId,
			name: this.getGlyphName(glyphId),
			path: glyphPath.path,
			advance: glyphPath.advance,
			svgPath
		};
	}

	/**
	 * 全てのグリフの情報を取得
	 * 
	 * @returns グリフ情報の配列
	 */
	public getAllGlyphs(): GlyphInfo[] {
		const glyphs: GlyphInfo[] = [];
		const glyphCount = this.cffTable.charStringsIndex.count;

		for (let glyphId = 0; glyphId < glyphCount; glyphId++) {
			try {
				const glyph = this.getGlyph(glyphId);
				glyphs.push(glyph);
			} catch (error) {
				console.error(`グリフID ${glyphId} の抽出中にエラーが発生しました:`, error);
			}
		}

		return glyphs;
	}

	/**
	 * グリフをSVG要素として取得
	 * 
	 * @param glyphId グリフID
	 * @param options SVG生成オプション
	 * @returns SVG要素の文字列
	 */
	public getGlyphSVG(
		glyphId: number,
		options: {
			width?: number;
			height?: number;
			scale?: number;
			flipY?: boolean;
		} = {}
	): string {
		const {
			width = 1000,
			height = 1000,
			scale = 1,
			flipY = true
		} = options;

		const glyph = this.getGlyph(glyphId);

		// SVGのviewBoxを設定
		let viewBox = '0 0 1000 1000';

		// フォントにbBoxが含まれていれば使用
		if (this.isCFF2) {
			const cff2Table = this.cffTable as Cff2Table;
			if (cff2Table.topDict.fontBBox) {
				const [xMin, yMin, xMax, yMax] = cff2Table.topDict.fontBBox;
				viewBox = `${xMin} ${yMin} ${xMax - xMin} ${yMax - yMin}`;
			}
		} else {
			const cffTable = this.cffTable as CffTable;
			if (cffTable.topDictIndex && cffTable.topDictIndex.data.length > 0) {
				// TopDictを解析
				const topDict = cffTable.topDictIndex.data[0];
				// fontBBox演算子を探す (5)
				// ここは単純化しています。実際には適切なTopDict解析が必要です
			}
		}

		// Y軸の反転変換（OpenTypeフォントは原点が左下、SVGは左上）
		const transform = flipY ? 'scale(1, -1) translate(0, -1000)' : '';

		return `<svg xmlns="http://www.w3.org/2000/svg" 
      width="${width}" 
      height="${height}" 
      viewBox="${viewBox}">
      <g transform="${transform}" scale="${scale}">
        <path d="${glyph.svgPath}" fill="black" />
      </g>
    </svg>`;
	}
}

/**
 * CFF標準文字列を取得する関数
 * 
 * @param sid 文字列ID
 * @returns 標準文字列
 */
function getCFFStandardString(sid: number): string {
	return StandardStrings[sid] || `.sid${sid}`;
}
