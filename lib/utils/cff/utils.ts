/**
 * CFF/CFF2共通のユーティリティ関数
 */

import {
	CharStringOperator,
	CharStringProgram,

	DictIndex,
	PrivateDictCommon
} from '../../types/common';
import { Font } from '../../types/font';
import { Cff2Table } from '../../types/tables/CFF2';
import { CffTable } from '../../types/tables/CFF_';
import { CFFInterpreter } from './interpreter';
import { GlyphPath } from './path';

/**
 * フォントがCFFテーブルを持っているかチェック
 * 
 * @param font フォントオブジェクト
 * @returns CFFテーブルが存在する場合はtrue
 */
export function hasCffTable(font: Font): boolean {
	return font.tables['CFF_'] !== undefined;
}

/**
 * フォントがCFF2テーブルを持っているかチェック
 * 
 * @param font フォントオブジェクト
 * @returns CFF2テーブルが存在する場合はtrue
 */
export function hasCff2Table(font: Font): boolean {
	return font.tables['CFF2'] !== undefined;
}

/**
 * フォントがCFF/CFF2テーブルを持っているかチェック
 * 
 * @param font フォントオブジェクト
 * @returns CFF/CFF2テーブルのいずれかが存在する場合はtrue
 */
export function hasCffOrCff2Table(font: Font): boolean {
	return hasCffTable(font) || hasCff2Table(font);
}

/**
 * フォントからCFF/CFF2テーブルを取得
 * 
 * @param font フォントオブジェクト
 * @returns CFF/CFF2テーブル（存在しない場合はnull）
 */
export function getCffOrCff2Table(font: Font): CffTable | Cff2Table | null {
	if (hasCffTable(font)) {
		return font.tables['CFF_']?.table as CffTable;
	}
	if (hasCff2Table(font)) {
		return font.tables['CFF2']?.table as Cff2Table;
	}
	return null;
}

/**
 * CFFかCFF2かを判定
 * 
 * @param table CFF/CFF2テーブル
 * @returns CFF2の場合はtrue、CFFの場合はfalse
 */
export function isCff2Table(table: CffTable | Cff2Table): table is Cff2Table {
	return 'header' in table && table.header.major === 2;
}

/**
 * CharStringオペレータの名前を取得
 * 
 * @param operator CharStringオペレータ
 * @returns オペレータの名前
 */
export function getCharStringOperatorName(operator: CharStringOperator): string {
	switch (operator) {
		case CharStringOperator.HSTEM: return 'HSTEM';
		case CharStringOperator.VSTEM: return 'VSTEM';
		case CharStringOperator.VMOVETO: return 'VMOVETO';
		case CharStringOperator.RLINETO: return 'RLINETO';
		case CharStringOperator.HLINETO: return 'HLINETO';
		case CharStringOperator.VLINETO: return 'VLINETO';
		case CharStringOperator.RRCURVETO: return 'RRCURVETO';
		case CharStringOperator.CALLSUBR: return 'CALLSUBR';
		case CharStringOperator.RETURN: return 'RETURN';
		case CharStringOperator.ESCAPE: return 'ESCAPE';
		case CharStringOperator.ENDCHAR: return 'ENDCHAR';
		case CharStringOperator.HSTEMHM: return 'HSTEMHM';
		case CharStringOperator.HINTMASK: return 'HINTMASK';
		case CharStringOperator.CNTRMASK: return 'CNTRMASK';
		case CharStringOperator.RMOVETO: return 'RMOVETO';
		case CharStringOperator.HMOVETO: return 'HMOVETO';
		case CharStringOperator.VSTEMHM: return 'VSTEMHM';
		case CharStringOperator.RCURVELINE: return 'RCURVELINE';
		case CharStringOperator.RLINECURVE: return 'RLINECURVE';
		case CharStringOperator.VVCURVETO: return 'VVCURVETO';
		case CharStringOperator.HHCURVETO: return 'HHCURVETO';
		case CharStringOperator.CALLGSUBR: return 'CALLGSUBR';
		case CharStringOperator.VHCURVETO: return 'VHCURVETO';
		case CharStringOperator.HVCURVETO: return 'HVCURVETO';

		// 拡張オペレータ（ESCAPE後）
		case CharStringOperator.DOTSECTION: return 'DOTSECTION';
		case CharStringOperator.AND: return 'AND';
		case CharStringOperator.OR: return 'OR';
		case CharStringOperator.NOT: return 'NOT';
		case CharStringOperator.ABS: return 'ABS';
		case CharStringOperator.ADD: return 'ADD';
		case CharStringOperator.SUB: return 'SUB';
		case CharStringOperator.DIV: return 'DIV';
		case CharStringOperator.NEG: return 'NEG';
		case CharStringOperator.EQ: return 'EQ';
		case CharStringOperator.DROP: return 'DROP';
		case CharStringOperator.PUT: return 'PUT';
		case CharStringOperator.GET: return 'GET';
		case CharStringOperator.IFELSE: return 'IFELSE';
		case CharStringOperator.RANDOM: return 'RANDOM';
		case CharStringOperator.MUL: return 'MUL';
		case CharStringOperator.SQRT: return 'SQRT';
		case CharStringOperator.DUP: return 'DUP';
		case CharStringOperator.EXCH: return 'EXCH';
		case CharStringOperator.INDEX: return 'INDEX';
		case CharStringOperator.ROLL: return 'ROLL';
		case CharStringOperator.HFLEX: return 'HFLEX';
		case CharStringOperator.FLEX: return 'FLEX';
		case CharStringOperator.HFLEX1: return 'HFLEX1';
		case CharStringOperator.FLEX1: return 'FLEX1';

		// CFF2固有のオペレータ
		case CharStringOperator.BLEND: return 'BLEND';

		default:
			// 拡張オペレータの場合
			if ((operator & 0xff00) === 0x0c00) {
				return `ESCAPE(${operator & 0xff})`;
			}
			return `Unknown(${operator})`;
	}
}

/**
 * CharStringプログラムの可読表現を生成
 * 
 * @param program CharStringプログラム
 * @returns 人間が読める形式の文字列
 */
export function formatCharStringProgram(program: CharStringProgram): string {
	let result = '';

	for (const cmd of program) {
		const opName = getCharStringOperatorName(cmd.operator);
		const operands = cmd.operands.map(op => op.toString()).join(' ');

		if (operands) {
			result += `${operands} ${opName}\n`;
		} else {
			result += `${opName}\n`;
		}
	}

	return result;
}

/**
 * DictIndexのサマリー情報を取得
 * 
 * @param index DictIndex
 * @returns サマリー情報
 */
export function getDictIndexSummary(index: DictIndex): object {
	return {
		count: index.count,
		offSize: index.offSize,
		dataSize: index.data.reduce((sum, item) => sum + item.length, 0)
	};
}

/**
 * PrivateDictの共通情報を取得
 * 
 * @param dict PrivateDict
 * @returns サマリー情報
 */
export function getPrivateDictSummary(dict: PrivateDictCommon): object {
	const info: Record<string, any> = {};

	// よく使用される値をサマリーに含める
	if (dict.blueValues) info.blueValues = dict.blueValues;
	if (dict.otherBlues) info.otherBlues = dict.otherBlues;
	if (dict.familyBlues) info.familyBlues = dict.familyBlues;
	if (dict.familyOtherBlues) info.familyOtherBlues = dict.familyOtherBlues;
	if (dict.blueScale !== undefined) info.blueScale = dict.blueScale;
	if (dict.blueShift !== undefined) info.blueShift = dict.blueShift;
	if (dict.blueFuzz !== undefined) info.blueFuzz = dict.blueFuzz;
	if (dict.stdHW !== undefined) info.stdHW = dict.stdHW;
	if (dict.stdVW !== undefined) info.stdVW = dict.stdVW;
	if (dict.stemSnapH) info.stemSnapH = dict.stemSnapH;
	if (dict.stemSnapV) info.stemSnapV = dict.stemSnapV;
	if (dict.forceBold !== undefined) info.forceBold = dict.forceBold;
	if (dict.languageGroup !== undefined) info.languageGroup = dict.languageGroup;
	if (dict.expansionFactor !== undefined) info.expansionFactor = dict.expansionFactor;
	if (dict.initialRandomSeed !== undefined) info.initialRandomSeed = dict.initialRandomSeed;
	if (dict.defaultWidthX !== undefined) info.defaultWidthX = dict.defaultWidthX;
	if (dict.nominalWidthX !== undefined) info.nominalWidthX = dict.nominalWidthX;
	if (dict.subrs !== undefined) info.hasSubroutines = true;

	return info;
}

/**
 * 指定したフォントから各グリフのSVG表現を取得する
 * 
 * @param font フォントオブジェクト
 * @param options オプション設定
 * @returns グリフID -> SVG文字列のマップ
 */
export function extractGlyphsAsSVG(
	font: Font,
	options: {
		glyphIds?: number[];
		flipY?: boolean;
		scale?: number;
	} = {}
): Map<number, string> {
	const result = new Map<number, string>();

	// フォントにCFF/CFF2テーブルが含まれていない場合は空のマップを返す
	if (!hasCffOrCff2Table(font)) {
		return result;
	}

	const table = getCffOrCff2Table(font);
	if (!table) {
		return result;
	}

	// CFFインタプリタをインスタンス化
	const interpreter = new CFFInterpreter(table);

	// 最大グリフID
	const maxGlyphId = table.charStringsIndex.count - 1;

	// 処理するグリフIDのリスト
	const glyphIds = options.glyphIds || Array.from({ length: maxGlyphId + 1 }, (_, i) => i);

	// 各グリフのSVGを生成
	for (const glyphId of glyphIds) {
		if (glyphId < 0 || glyphId > maxGlyphId) {
			continue;
		}

		try {
			// グリフパスを取得
			const glyphPath = interpreter.getGlyphPath(glyphId);

			// SVG文字列に変換
			const svgPath = CFFInterpreter.pathToSVGString(glyphPath.path);

			// 簡易SVG要素を生成
			const flipY = options.flipY !== undefined ? options.flipY : true;
			const scale = options.scale || 1;

			const transform = flipY
				? `transform="scale(${scale}, ${-scale}) translate(0, -1000)"`
				: `transform="scale(${scale})"`;

			const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
        <g ${transform}>
          <path d="${svgPath}" fill="black" />
        </g>
      </svg>`;

			result.set(glyphId, svg);
		} catch (error) {
			console.error(`Error extracting glyph ${glyphId}:`, error);
		}
	}

	return result;
}

/**
 * フォントからグリフパスデータを抽出
 * 
 * @param font フォントオブジェクト
 * @param options オプション設定
 * @returns グリフID -> パスデータのマップ
 */
export function extractGlyphPaths(
	font: Font,
	options: {
		glyphIds?: number[];
	} = {}
): Map<number, GlyphPath> {
	const result = new Map<number, GlyphPath>();

	// フォントにCFF/CFF2テーブルが含まれていない場合は空のマップを返す
	if (!hasCffOrCff2Table(font)) {
		return result;
	}

	const table = getCffOrCff2Table(font);
	if (!table) {
		return result;
	}

	// CFFインタプリタをインスタンス化
	const interpreter = new CFFInterpreter(table);

	// 最大グリフID
	const maxGlyphId = table.charStringsIndex.count - 1;

	// 処理するグリフIDのリスト
	const glyphIds = options.glyphIds || Array.from({ length: maxGlyphId + 1 }, (_, i) => i);

	// 各グリフのパスデータを抽出
	for (const glyphId of glyphIds) {
		if (glyphId < 0 || glyphId > maxGlyphId) {
			continue;
		}

		try {
			// グリフパスを取得
			const glyphPath = interpreter.getGlyphPath(glyphId);
			result.set(glyphId, glyphPath);
		} catch (error) {
			console.error(`Error extracting glyph path ${glyphId}:`, error);
		}
	}

	return result;
}
