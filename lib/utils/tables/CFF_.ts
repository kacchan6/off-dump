/**
 * CFF (Compact Font Format) テーブル固有のユーティリティ関数
 */

import { Font } from '../../types/font';
import { CffTable, NameIndex, StringIndex, Charset, Encoding, TopDict } from '../../types/tables/CFF_';
import { CharsetFormat, EncodingFormat } from '../../types/tables/CFF_';
import { hasCffTable, getPrivateDictSummary, getDictIndexSummary } from '../cff/utils';

/**
 * 標準CFF文字列リスト
 */
export const StandardStrings = [
	'.notdef', 'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent',
	'ampersand', 'quoteright', 'parenleft', 'parenright', 'asterisk', 'plus',
	'comma', 'hyphen', 'period', 'slash', 'zero', 'one', 'two', 'three', 'four',
	'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon', 'less', 'equal',
	'greater', 'question', 'at', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
	'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
	'bracketleft', 'backslash', 'bracketright', 'asciicircum', 'underscore',
	'quoteleft', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
	'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'braceleft',
	'bar', 'braceright', 'asciitilde', 'exclamdown', 'cent', 'sterling',
	'fraction', 'yen', 'florin', 'section', 'currency', 'quotesingle',
	'quotedblleft', 'guillemotleft', 'guilsinglleft', 'guilsinglright', 'fi',
	'fl', 'endash', 'dagger', 'daggerdbl', 'periodcentered', 'paragraph',
	'bullet', 'quotesinglbase', 'quotedblbase', 'quotedblright', 'guillemotright',
	'ellipsis', 'perthousand', 'questiondown', 'grave', 'acute', 'circumflex',
	'tilde', 'macron', 'breve', 'dotaccent', 'dieresis', 'ring', 'cedilla',
	'hungarumlaut', 'ogonek', 'caron', 'emdash', 'AE', 'ordfeminine', 'Lslash',
	'Oslash', 'OE', 'ordmasculine', 'ae', 'dotlessi', 'lslash', 'oslash', 'oe',
	'germandbls', 'onesuperior', 'logicalnot', 'mu', 'trademark', 'Eth', 'onehalf',
	'plusminus', 'Thorn', 'onequarter', 'divide', 'brokenbar', 'degree', 'thorn',
	'threequarters', 'twosuperior', 'registered', 'minus', 'eth', 'multiply',
	'threesuperior', 'copyright', 'Aacute', 'Acircumflex', 'Adieresis', 'Agrave',
	'Aring', 'Atilde', 'Ccedilla', 'Eacute', 'Ecircumflex', 'Edieresis', 'Egrave',
	'Iacute', 'Icircumflex', 'Idieresis', 'Igrave', 'Ntilde', 'Oacute',
	'Ocircumflex', 'Odieresis', 'Ograve', 'Otilde', 'Scaron', 'Uacute',
	'Ucircumflex', 'Udieresis', 'Ugrave', 'Yacute', 'Ydieresis', 'Zcaron',
	'aacute', 'acircumflex', 'adieresis', 'agrave', 'aring', 'atilde', 'ccedilla',
	'eacute', 'ecircumflex', 'edieresis', 'egrave', 'iacute', 'icircumflex',
	'idieresis', 'igrave', 'ntilde', 'oacute', 'ocircumflex', 'odieresis',
	'ograve', 'otilde', 'scaron', 'uacute', 'ucircumflex', 'udieresis', 'ugrave',
	'yacute', 'ydieresis', 'zcaron', 'exclamsmall', 'Hungarumlautsmall',
	'dollaroldstyle', 'dollarsuperior', 'ampersandsmall', 'Acutesmall',
	'parenleftsuperior', 'parenrightsuperior', 'twodotenleader', 'onedotenleader',
	'zerooldstyle', 'oneoldstyle', 'twooldstyle', 'threeoldstyle', 'fouroldstyle',
	'fiveoldstyle', 'sixoldstyle', 'sevenoldstyle', 'eightoldstyle',
	'nineoldstyle', 'commasuperior', 'threequartersemdash', 'periodsuperior',
	'questionsmall', 'asuperior', 'bsuperior', 'centsuperior', 'dsuperior',
	'esuperior', 'isuperior', 'lsuperior', 'msuperior', 'nsuperior', 'osuperior',
	'rsuperior', 'ssuperior', 'tsuperior', 'ff', 'ffi', 'ffl', 'parenleftinferior',
	'parenrightinferior', 'Circumflexsmall', 'hyphensuperior', 'Gravesmall',
	'Asmall', 'Bsmall', 'Csmall', 'Dsmall', 'Esmall', 'Fsmall', 'Gsmall',
	'Hsmall', 'Ismall', 'Jsmall', 'Ksmall', 'Lsmall', 'Msmall', 'Nsmall',
	'Osmall', 'Psmall', 'Qsmall', 'Rsmall', 'Ssmall', 'Tsmall', 'Usmall',
	'Vsmall', 'Wsmall', 'Xsmall', 'Ysmall', 'Zsmall', 'colonmonetary',
	'onefitted', 'rupiah', 'Tildesmall', 'exclamdownsmall', 'centoldstyle',
	'Lslashsmall', 'Scaronsmall', 'Zcaronsmall', 'Dieresissmall', 'Brevesmall',
	'Caronsmall', 'Dotaccentsmall', 'Macronsmall', 'figuredash', 'hypheninferior',
	'Ogoneksmall', 'Ringsmall', 'Cedillasmall', 'questiondownsmall', 'oneeighth',
	'threeeighths', 'fiveeighths', 'seveneighths', 'onethird', 'twothirds',
	'zerosuperior', 'foursuperior', 'fivesuperior', 'sixsuperior',
	'sevensuperior', 'eightsuperior', 'ninesuperior', 'zeroinferior',
	'oneinferior', 'twoinferior', 'threeinferior', 'fourinferior', 'fiveinferior',
	'sixinferior', 'seveninferior', 'eightinferior', 'nineinferior',
	'centinferior', 'dollarinferior', 'periodinferior', 'commainferior',
	'Agravesmall', 'Aacutesmall', 'Acircumflexsmall', 'Atildesmall',
	'Adieresissmall', 'Aringsmall', 'AEsmall', 'Ccedillasmall', 'Egravesmall',
	'Eacutesmall', 'Ecircumflexsmall', 'Edieresissmall', 'Igravesmall',
	'Iacutesmall', 'Icircumflexsmall', 'Idieresissmall', 'Ethsmall',
	'Ntildesmall', 'Ogravesmall', 'Oacutesmall', 'Ocircumflexsmall',
	'Otildesmall', 'Odieresissmall', 'OEsmall', 'Oslashsmall', 'Ugravesmall',
	'Uacutesmall', 'Ucircumflexsmall', 'Udieresissmall', 'Yacutesmall',
	'Thornsmall', 'Ydieresissmall', '001.000', '001.001', '001.002', '001.003',
	'Black', 'Bold', 'Book', 'Light', 'Medium', 'Regular', 'Roman', 'Semibold'
];

/**
 * 文字列IDから文字列を取得
 * 
 * @param sid 文字列ID
 * @param stringIndex 文字列インデックス
 * @returns 文字列
 */
export function getCFFString(sid: number, stringIndex: StringIndex): string {
	// 標準文字列の場合
	if (sid < StandardStrings.length) {
		return StandardStrings[sid];
	}

	// カスタム文字列の場合
	const customIndex = sid - StandardStrings.length;
	if (customIndex < stringIndex.strings.length) {
		return stringIndex.strings[customIndex];
	}

	return `.sid${sid}`;
}

/**
 * 名前インデックスからフォント名を取得
 * 
 * @param nameIndex 名前インデックス
 * @returns フォント名（見つからない場合は空文字列）
 */
export function getFontName(nameIndex: NameIndex): string {
	if (nameIndex.count === 0 || nameIndex.names.length === 0) {
		return '';
	}

	return nameIndex.names[0];
}

/**
 * 名前インデックスの概要情報を取得
 * 
 * @param nameIndex 名前インデックス
 * @returns 概要情報
 */
export function getNameIndexSummary(nameIndex: NameIndex): object {
	return {
		count: nameIndex.count,
		names: nameIndex.names
	};
}

/**
 * 文字列インデックスの概要情報を取得
 * 
 * @param stringIndex 文字列インデックス
 * @returns 概要情報
 */
export function getStringIndexSummary(stringIndex: StringIndex): object {
	return {
		count: stringIndex.count,
		strings: stringIndex.strings.length > 20
			? stringIndex.strings.slice(0, 20).concat(['...'])
			: stringIndex.strings
	};
}

/**
 * CharsetフォーマットからCharsetフォーマット名を取得
 * 
 * @param format Charsetフォーマット
 * @returns フォーマット名
 */
export function getCharsetFormatName(format: CharsetFormat): string {
	switch (format) {
		case CharsetFormat.Format0: return 'Format 0';
		case CharsetFormat.Format1: return 'Format 1';
		case CharsetFormat.Format2: return 'Format 2';
		default: return `Unknown Format ${format}`;
	}
}

/**
 * Charsetの概要情報を取得
 * 
 * @param charset Charset
 * @returns 概要情報
 */
export function getCharsetSummary(charset: Charset): object {
	const info: Record<string, any> = {
		format: getCharsetFormatName(charset.format)
	};

	switch (charset.format) {
		case CharsetFormat.Format0:
			info.glyphCount = charset.glyph.length;
			info.examples = charset.glyph.slice(0, 10);
			break;

		case CharsetFormat.Format1:
		case CharsetFormat.Format2:
			info.rangeCount = charset.ranges.length;
			info.examples = charset.ranges.slice(0, 5);
			break;
	}

	return info;
}

/**
 * EncodingフォーマットからEncodingフォーマット名を取得
 * 
 * @param format Encodingフォーマット
 * @returns フォーマット名
 */
export function getEncodingFormatName(format: EncodingFormat): string {
	switch (format) {
		case EncodingFormat.Format0: return 'Format 0';
		case EncodingFormat.Format1: return 'Format 1';
		default: return `Unknown Format ${format}`;
	}
}

/**
 * Encodingの概要情報を取得
 * 
 * @param encoding Encoding
 * @returns 概要情報
 */
export function getEncodingSummary(encoding: Encoding): object {
	const info: Record<string, any> = {
		format: getEncodingFormatName(encoding.format)
	};

	switch (encoding.format) {
		case EncodingFormat.Format0:
			info.codeCount = encoding.nCodes;
			info.examples = encoding.codes.slice(0, 10);
			break;

		case EncodingFormat.Format1:
			info.rangeCount = encoding.nRanges;
			info.examples = encoding.ranges.slice(0, 5);
			break;
	}

	if (encoding.supplement) {
		info.supplement = {
			count: encoding.supplement.nSups,
			examples: encoding.supplement.supplement.slice(0, 5)
		};
	}

	return info;
}

/**
 * TopDictの概要情報を取得
 * 
 * @param topDict TopDict
 * @param stringIndex 文字列インデックス
 * @returns 概要情報
 */
export function getTopDictSummary(topDict: TopDict, stringIndex: StringIndex): object {
	const info: Record<string, any> = {};

	// 基本プロパティを追加
	if (topDict.version !== undefined) info.version = getCFFString(topDict.version, stringIndex);
	if (topDict.notice !== undefined) info.notice = getCFFString(topDict.notice, stringIndex);
	if (topDict.copyright !== undefined) info.copyright = getCFFString(topDict.copyright, stringIndex);
	if (topDict.fullName !== undefined) info.fullName = getCFFString(topDict.fullName, stringIndex);
	if (topDict.familyName !== undefined) info.familyName = getCFFString(topDict.familyName, stringIndex);
	if (topDict.weight !== undefined) info.weight = getCFFString(topDict.weight, stringIndex);
	if (topDict.isFixedPitch !== undefined) info.isFixedPitch = !!topDict.isFixedPitch;
	if (topDict.italicAngle !== undefined) info.italicAngle = topDict.italicAngle;
	if (topDict.underlinePosition !== undefined) info.underlinePosition = topDict.underlinePosition;
	if (topDict.underlineThickness !== undefined) info.underlineThickness = topDict.underlineThickness;
	if (topDict.paintType !== undefined) info.paintType = topDict.paintType;
	if (topDict.charstringType !== undefined) info.charstringType = topDict.charstringType;
	if (topDict.fontMatrix) info.fontMatrix = topDict.fontMatrix;
	if (topDict.uniqueId !== undefined) info.uniqueId = topDict.uniqueId;
	if (topDict.fontBBox) info.fontBBox = topDict.fontBBox;
	if (topDict.strokeWidth !== undefined) info.strokeWidth = topDict.strokeWidth;
	if (topDict.xuid) info.xuid = topDict.xuid;

	// オフセット情報
	const offsets: Record<string, number> = {};
	if (topDict.charset !== undefined) offsets.charset = topDict.charset;
	if (topDict.encoding !== undefined) offsets.encoding = topDict.encoding;
	if (topDict.charStrings !== undefined) offsets.charStrings = topDict.charStrings;
	if (topDict.private) offsets.private = topDict.private[1];
	if (topDict.fdArray !== undefined) offsets.fdArray = topDict.fdArray;
	if (topDict.fdSelect !== undefined) offsets.fdSelect = topDict.fdSelect;

	if (Object.keys(offsets).length > 0) {
		info.offsets = offsets;
	}

	// CIDフォント情報
	if (topDict.ros) {
		info.isCIDFont = true;
		info.ros = {
			registry: getCFFString(topDict.ros[0], stringIndex),
			ordering: getCFFString(topDict.ros[1], stringIndex),
			supplement: topDict.ros[2]
		};

		if (topDict.cidFontVersion !== undefined) info.cidFontVersion = topDict.cidFontVersion;
		if (topDict.cidFontRevision !== undefined) info.cidFontRevision = topDict.cidFontRevision;
		if (topDict.cidFontType !== undefined) info.cidFontType = topDict.cidFontType;
		if (topDict.cidCount !== undefined) info.cidCount = topDict.cidCount;
	} else {
		info.isCIDFont = false;
	}

	return info;
}

/**
 * CFFテーブルの概要情報を取得
 * 
 * @param cff CFFテーブル
 * @returns 概要情報
 */
export function getCffTableSummary(cff: CffTable): object {
	const info: Record<string, any> = {
		version: `${cff.header.major}.${cff.header.minor}`,
		names: getNameIndexSummary(cff.nameIndex),
		topDict: getTopDictSummary(cff.topDictIndex.data[0], cff.stringIndex),
		strings: getStringIndexSummary(cff.stringIndex),
		charStrings: getDictIndexSummary(cff.charStringsIndex),
		globalSubrs: {
			count: cff.globalSubrIndex.count
		}
	};

	// 文字セット情報
	if (cff.charsetData) {
		info.charset = getCharsetSummary(cff.charsetData);
	}

	// エンコーディング情報
	if (cff.encodingData) {
		info.encoding = getEncodingSummary(cff.encodingData);
	}

	// PrivateDict情報
	if (cff.privateDicts && cff.privateDicts.length > 0) {
		info.privateDicts = cff.privateDicts.map(dict => getPrivateDictSummary(dict));
	}

	// CIDフォント情報
	if (cff.fdArray) {
		info.fdArray = getDictIndexSummary(cff.fdArray);
	}

	if (cff.fdSelect) {
		info.hasFDSelect = true;
		info.fdSelectFormat = cff.fdSelect.format;
	}

	return info;
}

/**
 * フォントからCFFテーブルの概要情報を取得
 * 
 * @param font フォントオブジェクト
 * @returns 概要情報（CFFテーブルが存在しない場合はnull）
 */
export function getCffSummary(font: Font): object | null {
	if (!hasCffTable(font)) {
		return null;
	}

	const cff = font.tables['CFF_']?.table as CffTable;
	if (!cff) {
		return null;
	}

	return getCffTableSummary(cff);
}

/**
 * フォントのCFFデータをエクスポート（概要情報とグリフパス）
 * 
 * @param font フォントオブジェクト
 * @returns CFFデータ（CFFテーブルが存在しない場合はnull）
 */
export function exportCffData(font: Font): object | null {
	if (!hasCffTable(font)) {
		return null;
	}

	const summary = getCffSummary(font);
	if (!summary) {
		return null;
	}

	return {
		summary,
		fontName: getFontName(font.tables['CFF_']?.table.nameIndex),
		isCIDKeyed: 'ros' in (summary as any).topDict,
	};
}

/**
 * チャーセット（文字セット）データからグリフ名のマッピングを取得
 * 
 * @param charset Charset
 * @param stringIndex 文字列インデックス
 * @param numGlyphs グリフの総数
 * @returns グリフID -> グリフ名のマップ
 */
export function getGlyphNamesFromCharset(
	charset: Charset,
	stringIndex: StringIndex,
	numGlyphs: number
): Map<number, string> {
	const glyphNames = new Map<number, string>();

	// グリフ0は常に.notdef
	glyphNames.set(0, '.notdef');

	switch (charset.format) {
		case CharsetFormat.Format0:
			// Format 0: 単純なリスト
			for (let i = 0; i < charset.glyph.length && i + 1 < numGlyphs; i++) {
				const sid = charset.glyph[i];
				glyphNames.set(i + 1, getCFFString(sid, stringIndex));
			}
			break;

		case CharsetFormat.Format1:
			// Format 1: 範囲
			let glyphId = 1;
			for (const range of charset.ranges) {
				const first = range.first;
				const count = range.nLeft + 1;

				for (let i = 0; i < count && glyphId < numGlyphs; i++) {
					const sid = first + i;
					glyphNames.set(glyphId++, getCFFString(sid, stringIndex));
				}
			}
			break;

		case CharsetFormat.Format2:
			// Format 2: 拡張範囲
			glyphId = 1;
			for (const range of charset.ranges) {
				const first = range.first;
				const count = range.nLeft + 1;

				for (let i = 0; i < count && glyphId < numGlyphs; i++) {
					const sid = first + i;
					glyphNames.set(glyphId++, getCFFString(sid, stringIndex));
				}
			}
			break;
	}

	return glyphNames;
}

/**
 * フォントからグリフ名のマッピングを取得
 * 
 * @param font フォントオブジェクト
 * @returns グリフID -> グリフ名のマップ（CFFテーブルが存在しない場合は空のマップ）
 */
export function getCffGlyphNames(font: Font): Map<number, string> {
	const glyphNames = new Map<number, string>();

	if (!hasCffTable(font)) {
		return glyphNames;
	}

	const cff = font.tables['CFF_']?.table as CffTable;
	if (!cff || !cff.charStringsIndex) {
		return glyphNames;
	}

	// グリフの総数
	const numGlyphs = cff.charStringsIndex.count;

	// グリフ0は常に.notdef
	glyphNames.set(0, '.notdef');

	// 文字セットからグリフ名を取得
	if (cff.charsetData) {
		return getGlyphNamesFromCharset(cff.charsetData, cff.stringIndex, numGlyphs);
	}

	// 文字セットがない場合は標準名を使用
	for (let i = 1; i < numGlyphs; i++) {
		glyphNames.set(i, `glyph${i}`);
	}

	return glyphNames;
}
