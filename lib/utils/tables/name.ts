/**
 * nameテーブル関連のユーティリティ関数
 */

import { NameTable, NameID, PlatformID, WindowsLanguageID, MacintoshLanguageID } from '../../types/tables/name';

/**
 * 指定した条件に一致する名前レコードを取得
 * 
 * @param name nameテーブル
 * @param nameID 名前ID
 * @param platformID プラットフォームID (省略可)
 * @param languageID 言語ID (省略可)
 * @param encodingID エンコーディングID (省略可)
 */
export function getNameRecord(
	name: NameTable,
	nameID: number,
	platformID?: number,
	languageID?: number,
	encodingID?: number
) {
	// 完全一致で検索
	if (platformID !== undefined && languageID !== undefined && encodingID !== undefined) {
		return name.nameRecords.find(record =>
			record.nameID === nameID &&
			record.platformID === platformID &&
			record.languageID === languageID &&
			record.encodingID === encodingID
		);
	}

	// プラットフォームIDと名前IDで検索
	if (platformID !== undefined) {
		return name.nameRecords.find(record =>
			record.nameID === nameID &&
			record.platformID === platformID
		);
	}

	// 名前IDのみで検索
	return name.nameRecords.find(record => record.nameID === nameID);
}

/**
 * 英語の名前レコードを優先的に取得
 * 
 * @param name nameテーブル
 * @param nameID 名前ID
 */
export function getEnglishNameRecord(name: NameTable, nameID: number) {
	// Windows英語 (米国)
	const windowsEnUS = getNameRecord(
		name,
		nameID,
		PlatformID.WINDOWS,
		WindowsLanguageID.ENGLISH_UNITED_STATES
	);
	if (windowsEnUS) return windowsEnUS;

	// Windows英語 (英国)
	const windowsEnGB = getNameRecord(
		name,
		nameID,
		PlatformID.WINDOWS,
		WindowsLanguageID.ENGLISH_UNITED_KINGDOM
	);
	if (windowsEnGB) return windowsEnGB;

	// Macintosh英語
	const macEnglish = getNameRecord(
		name,
		nameID,
		PlatformID.MACINTOSH,
		MacintoshLanguageID.ENGLISH
	);
	if (macEnglish) return macEnglish;

	// Unicode
	const unicode = getNameRecord(name, nameID, PlatformID.UNICODE);
	if (unicode) return unicode;

	// 何らかの名前レコード
	return getNameRecord(name, nameID);
}

/**
 * フォントファミリー名を取得
 * 
 * @param name nameテーブル
 */
export function getFontFamilyName(name: NameTable) {
	// タイポグラフィックファミリー名 (nameID 16)
	const typographicFamily = getEnglishNameRecord(name, NameID.TYPOGRAPHIC_FAMILY_NAME);
	if (typographicFamily) return typographicFamily.string;

	// 通常のファミリー名 (nameID 1)
	const family = getEnglishNameRecord(name, NameID.FONT_FAMILY_NAME);
	if (family) return family.string;

	return '';
}

/**
 * フォントサブファミリー名を取得
 * 
 * @param name nameテーブル
 */
export function getFontSubfamilyName(name: NameTable) {
	// タイポグラフィックサブファミリー名 (nameID 17)
	const typographicSubfamily = getEnglishNameRecord(name, NameID.TYPOGRAPHIC_SUBFAMILY_NAME);
	if (typographicSubfamily) return typographicSubfamily.string;

	// 通常のサブファミリー名 (nameID 2)
	const subfamily = getEnglishNameRecord(name, NameID.FONT_SUBFAMILY_NAME);
	if (subfamily) return subfamily.string;

	return '';
}

/**
 * フルフォント名を取得
 * 
 * @param name nameテーブル
 */
export function getFullFontName(name: NameTable) {
	// フルフォント名 (nameID 4)
	const fullName = getEnglishNameRecord(name, NameID.FULL_FONT_NAME);
	if (fullName) return fullName.string;

	// ファミリー名 + サブファミリー名を組み合わせる
	const familyName = getFontFamilyName(name);
	const subfamilyName = getFontSubfamilyName(name);

	if (familyName && subfamilyName) {
		return `${familyName} ${subfamilyName}`;
	}

	return familyName || '';
}

/**
 * PostScript名を取得
 * 
 * @param name nameテーブル
 */
export function getPostScriptName(name: NameTable) {
	const psName = getEnglishNameRecord(name, NameID.POSTSCRIPT_NAME);
	return psName ? psName.string : '';
}

/**
 * バージョン文字列を取得
 * 
 * @param name nameテーブル
 */
export function getVersionString(name: NameTable) {
	const version = getEnglishNameRecord(name, NameID.VERSION_STRING);
	return version ? version.string : '';
}

/**
 * 著作権表示を取得
 * 
 * @param name nameテーブル
 */
export function getCopyrightNotice(name: NameTable) {
	const copyright = getEnglishNameRecord(name, NameID.COPYRIGHT_NOTICE);
	return copyright ? copyright.string : '';
}

/**
 * 製造元名を取得
 * 
 * @param name nameテーブル
 */
export function getManufacturerName(name: NameTable) {
	const manufacturer = getEnglishNameRecord(name, NameID.MANUFACTURER_NAME);
	return manufacturer ? manufacturer.string : '';
}

/**
 * デザイナー名を取得
 * 
 * @param name nameテーブル
 */
export function getDesignerName(name: NameTable) {
	const designer = getEnglishNameRecord(name, NameID.DESIGNER);
	return designer ? designer.string : '';
}

/**
 * 説明を取得
 * 
 * @param name nameテーブル
 */
export function getDescription(name: NameTable) {
	const description = getEnglishNameRecord(name, NameID.DESCRIPTION);
	return description ? description.string : '';
}

/**
 * ライセンス説明を取得
 * 
 * @param name nameテーブル
 */
export function getLicenseDescription(name: NameTable) {
	const license = getEnglishNameRecord(name, NameID.LICENSE_DESCRIPTION);
	return license ? license.string : '';
}

/**
 * ライセンス情報URLを取得
 * 
 * @param name nameテーブル
 */
export function getLicenseURL(name: NameTable) {
	const licenseURL = getEnglishNameRecord(name, NameID.LICENSE_INFO_URL);
	return licenseURL ? licenseURL.string : '';
}

/**
 * サンプルテキストを取得
 * 
 * @param name nameテーブル
 */
export function getSampleText(name: NameTable) {
	const sample = getEnglishNameRecord(name, NameID.SAMPLE_TEXT);
	return sample ? sample.string : '';
}

/**
 * 特定の言語IDの名前を取得
 * 
 * @param name nameテーブル
 * @param nameID 名前ID
 * @param platformID プラットフォームID
 * @param languageID 言語ID
 */
export function getLocalizedName(name: NameTable, nameID: number, platformID: PlatformID, languageID: number) {
	const record = getNameRecord(name, nameID, platformID, languageID);
	return record ? record.string : '';
}

/**
 * サポートされている言語IDのリストを取得
 * 
 * @param name nameテーブル
 * @param platformID プラットフォームID (省略可)
 * @param nameID 名前ID (省略可)
 */
export function getSupportedLanguages(name: NameTable, platformID?: PlatformID, nameID?: number) {
	const languages = new Set<number>();

	name.nameRecords.forEach(record => {
		if ((platformID === undefined || record.platformID === platformID) &&
			(nameID === undefined || record.nameID === nameID)) {
			languages.add(record.languageID);
		}
	});

	return Array.from(languages);
}

/**
 * 言語IDを人間が読める形式に変換 (Windows)
 * 
 * @param languageID Windows言語ID
 */
export function getWindowsLanguageName(languageID: number) {
	for (const [key, value] of Object.entries(WindowsLanguageID)) {
		if (typeof value === 'number' && value === languageID) {
			return key.replace(/_/g, ' ');
		}
	}
	return `Unknown (0x${languageID.toString(16).toUpperCase().padStart(4, '0')})`;
}

/**
 * 言語IDを人間が読める形式に変換 (Macintosh)
 * 
 * @param languageID Macintosh言語ID
 */
export function getMacintoshLanguageName(languageID: number) {
	for (const [key, value] of Object.entries(MacintoshLanguageID)) {
		if (typeof value === 'number' && value === languageID) {
			return key.replace(/_/g, ' ');
		}
	}
	return `Unknown (${languageID})`;
}

/**
 * nameIDを人間が読める形式に変換
 * 
 * @param nameID 名前ID
 */
export function getNameIDDescription(nameID: number) {
	for (const [key, value] of Object.entries(NameID)) {
		if (typeof value === 'number' && value === nameID) {
			return key.replace(/_/g, ' ');
		}
	}
	return `Unknown (${nameID})`;
}

/**
 * プラットフォームIDを人間が読める形式に変換
 * 
 * @param platformID プラットフォームID
 */
export function getPlatformIDName(platformID: number) {
	for (const [key, value] of Object.entries(PlatformID)) {
		if (typeof value === 'number' && value === platformID) {
			return key;
		}
	}
	return `Unknown (${platformID})`;
}

/**
 * フォントの基本情報を取得
 * 
 * @param name nameテーブル
 */
export function getFontBasicInfo(name: NameTable) {
	return {
		family: getFontFamilyName(name),
		subfamily: getFontSubfamilyName(name),
		fullName: getFullFontName(name),
		postscriptName: getPostScriptName(name),
		version: getVersionString(name),
		copyright: getCopyrightNotice(name),
		manufacturer: getManufacturerName(name),
		designer: getDesignerName(name)
	};
}
