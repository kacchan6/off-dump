/**
 * postテーブル関連のユーティリティ関数
 */

import {
	PostTable,
	PostTableV2,
	PostTableV25
} from '../../types/tables/post';

/**
 * 標準Macintoshグリフ名リスト
 * インデックス0から257までの標準名
 */
export const standardMacGlyphNames = [
	'.notdef', '.null', 'nonmarkingreturn', 'space', 'exclam', 'quotedbl', 'numbersign', 'dollar',
	'percent', 'ampersand', 'quotesingle', 'parenleft', 'parenright', 'asterisk', 'plus', 'comma',
	'hyphen', 'period', 'slash', 'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
	'eight', 'nine', 'colon', 'semicolon', 'less', 'equal', 'greater', 'question', 'at', 'A', 'B',
	'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
	'V', 'W', 'X', 'Y', 'Z', 'bracketleft', 'backslash', 'bracketright', 'asciicircum', 'underscore',
	'grave', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
	's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde', 'Adieresis',
	'Aring', 'Ccedilla', 'Eacute', 'Ntilde', 'Odieresis', 'Udieresis', 'aacute', 'agrave', 'acircumflex',
	'adieresis', 'atilde', 'aring', 'ccedilla', 'eacute', 'egrave', 'ecircumflex', 'edieresis', 'iacute',
	'igrave', 'icircumflex', 'idieresis', 'ntilde', 'oacute', 'ograve', 'ocircumflex', 'odieresis',
	'otilde', 'uacute', 'ugrave', 'ucircumflex', 'udieresis', 'dagger', 'degree', 'cent', 'sterling',
	'section', 'bullet', 'paragraph', 'germandbls', 'registered', 'copyright', 'trademark', 'acute',
	'dieresis', 'notequal', 'AE', 'Oslash', 'infinity', 'plusminus', 'lessequal', 'greaterequal',
	'yen', 'mu', 'partialdiff', 'summation', 'product', 'pi', 'integral', 'ordfeminine', 'ordmasculine',
	'Omega', 'ae', 'oslash', 'questiondown', 'exclamdown', 'logicalnot', 'radical', 'florin',
	'approxequal', 'Delta', 'guillemotleft', 'guillemotright', 'ellipsis', 'nonbreakingspace',
	'Agrave', 'Atilde', 'Otilde', 'OE', 'oe', 'endash', 'emdash', 'quotedblleft', 'quotedblright',
	'quoteleft', 'quoteright', 'divide', 'lozenge', 'ydieresis', 'Ydieresis', 'fraction', 'currency',
	'guilsinglleft', 'guilsinglright', 'fi', 'fl', 'daggerdbl', 'periodcentered', 'quotesinglbase',
	'quotedblbase', 'perthousand', 'Acircumflex', 'Ecircumflex', 'Aacute', 'Edieresis', 'Egrave',
	'Iacute', 'Icircumflex', 'Idieresis', 'Igrave', 'Oacute', 'Ocircumflex', 'apple', 'Ograve',
	'Uacute', 'Ucircumflex', 'Ugrave', 'dotlessi', 'circumflex', 'tilde', 'macron', 'breve',
	'dotaccent', 'ring', 'cedilla', 'hungarumlaut', 'ogonek', 'caron', 'Lslash', 'lslash', 'Scaron',
	'scaron', 'Zcaron', 'zcaron', 'brokenbar', 'Eth', 'eth', 'Yacute', 'yacute', 'Thorn', 'thorn',
	'minus', 'multiply', 'onesuperior', 'twosuperior', 'threesuperior', 'onehalf', 'onequarter',
	'threequarters', 'franc', 'Gbreve', 'gbreve', 'Idotaccent', 'Scedilla', 'scedilla', 'Cacute',
	'cacute', 'Ccaron', 'ccaron', 'dcroat'
];

/**
 * テーブルがPostTableV2型かどうかを判定する型ガード
 */
function isPostTableV2(post: PostTable): post is PostTableV2 {
	return post.format === 2.0;
}

/**
 * テーブルがPostTableV25型かどうかを判定する型ガード
 */
function isPostTableV25(post: PostTable): post is PostTableV25 {
	return post.format === 2.5;
}

/**
 * グリフIDに対応するグリフ名を取得する
 * 
 * @param post postテーブル
 * @param glyphId グリフID
 * @returns グリフ名（取得できない場合は空文字列）
 */
export function getGlyphName(post: PostTable, glyphId: number): string {
	// フォーマット1.0: 標準Macintoshグリフセット
	if (post.format === 1.0) {
		return glyphId < standardMacGlyphNames.length ? standardMacGlyphNames[glyphId] : '';
	}

	// フォーマット2.0: カスタムグリフ名マッピング
	if (isPostTableV2(post)) {
		if (glyphId >= post.numGlyphs) {
			return '';
		}

		const nameIndex = post.glyphNameIndex[glyphId];
		if (nameIndex < 258) {
			// 標準名
			return standardMacGlyphNames[nameIndex];
		} else {
			// カスタム名
			const customNameIndex = nameIndex - 258;
			return customNameIndex < post.names.length ? post.names[customNameIndex] : '';
		}
	}

	// フォーマット2.5: 最適化マッピング
	if (isPostTableV25(post)) {
		if (glyphId >= post.numGlyphs) {
			return '';
		}

		// オフセットをMacintoshグリフインデックスに適用
		const macIndex = glyphId + post.offset[glyphId];
		return macIndex >= 0 && macIndex < standardMacGlyphNames.length
			? standardMacGlyphNames[macIndex]
			: '';
	}

	// フォーマット3.0: グリフ名はなし
	// フォーマット4.0: Appleの仕様（未サポート）
	return '';
}

/**
 * グリフインデックスからグリフ名のマッピングを取得する
 * 
 * @param post postテーブル
 * @returns グリフインデックスからグリフ名へのマップ
 */
export function getAllGlyphNames(post: PostTable): Map<number, string> {
	const glyphNames = new Map<number, string>();

	// フォーマット1.0
	if (post.format === 1.0) {
		for (let i = 0; i < standardMacGlyphNames.length; i++) {
			glyphNames.set(i, standardMacGlyphNames[i]);
		}
		return glyphNames;
	}

	// フォーマット2.0
	if (isPostTableV2(post)) {
		for (let i = 0; i < post.numGlyphs; i++) {
			const name = getGlyphName(post, i);
			if (name) {
				glyphNames.set(i, name);
			}
		}
		return glyphNames;
	}

	// フォーマット2.5
	if (isPostTableV25(post)) {
		for (let i = 0; i < post.numGlyphs; i++) {
			const name = getGlyphName(post, i);
			if (name) {
				glyphNames.set(i, name);
			}
		}
		return glyphNames;
	}

	// フォーマット3.0と4.0はグリフ名を提供しないか未サポート
	return glyphNames;
}

/**
 * postテーブルがイタリック体かどうか判定する
 * 
 * @param post postテーブル
 * @returns イタリックならtrue
 */
export function isItalic(post: PostTable): boolean {
	return post.italicAngle !== 0;
}

/**
 * postテーブルが固定ピッチフォントかどうか判定する
 * 
 * @param post postテーブル
 * @returns 固定ピッチならtrue
 */
export function isFixedPitch(post: PostTable): boolean {
	return post.isFixedPitch !== 0;
}

/**
 * イタリック角度を度数法に変換する
 * 
 * @param post postテーブル
 * @returns 度数法でのイタリック角度
 */
export function getItalicAngleDegrees(post: PostTable): number {
	return post.italicAngle * (180 / Math.PI);
}

/**
 * postテーブルの基本情報を抽出する
 * 
 * @param post postテーブル
 * @returns テーブルの基本情報オブジェクト
 */
export function getPostTableInfo(post: PostTable): object {
	// 基本情報
	const info: any = {
		format: post.format.toFixed(1),
		italicAngle: post.italicAngle,
		italicAngleDegrees: getItalicAngleDegrees(post),
		underlinePosition: post.underlinePosition,
		underlineThickness: post.underlineThickness,
		isFixedPitch: isFixedPitch(post),
		memoryUsage: {
			minType42: post.minMemType42,
			maxType42: post.maxMemType42,
			minType1: post.minMemType1,
			maxType1: post.maxMemType1
		}
	};

	// フォーマット固有のデータを追加
	if (isPostTableV2(post)) {
		info.numGlyphs = post.numGlyphs;
		info.customGlyphNames = post.names.length;
	} else if (isPostTableV25(post)) {
		info.numGlyphs = post.numGlyphs;
	}

	return info;
}
