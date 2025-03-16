/**
 * OS/2テーブル関連のユーティリティ関数
 */

import { OS2FamilyClass, OS2FSSelection, OS2FSType, OS2Table, OS2WeightClass, OS2WidthClass } from '../../types/tables/OS_2';

/**
 * OS/2テーブルのfsTypeフラグをチェックする
 * 
 * @param os2 OS/2テーブル
 * @param flag チェックするフラグ
 * @returns フラグが設定されている場合はtrue
 */
export function hasOS2FSTypeFlag(os2: OS2Table, flag: OS2FSType): boolean {
	return (os2.fsType & flag) !== 0;
}

/**
 * OS/2テーブルのfsSelectionフラグをチェックする
 * 
 * @param os2 OS/2テーブル
 * @param flag チェックするフラグ
 * @returns フラグが設定されている場合はtrue
 */
export function hasOS2FSSelectionFlag(os2: OS2Table, flag: OS2FSSelection): boolean {
	return (os2.fsSelection & flag) !== 0;
}

/**
 * フォントの重さ（usWeightClass）を文字列に変換する
 * 
 * @param weightClass 重さクラス
 * @returns 重さの文字列表現
 */
export function weightClassToString(weightClass: number): string {
	if (weightClass <= 100) return 'Thin';
	if (weightClass <= 200) return 'Extra Light';
	if (weightClass <= 300) return 'Light';
	if (weightClass <= 400) return 'Regular';
	if (weightClass <= 500) return 'Medium';
	if (weightClass <= 600) return 'Semi Bold';
	if (weightClass <= 700) return 'Bold';
	if (weightClass <= 800) return 'Extra Bold';
	return 'Black';
}

/**
 * フォントの幅（usWidthClass）を文字列に変換する
 * 
 * @param widthClass 幅クラス
 * @returns 幅の文字列表現
 */
export function widthClassToString(widthClass: number): string {
	switch (widthClass) {
		case OS2WidthClass.ULTRA_CONDENSED: return 'Ultra Condensed';
		case OS2WidthClass.EXTRA_CONDENSED: return 'Extra Condensed';
		case OS2WidthClass.CONDENSED: return 'Condensed';
		case OS2WidthClass.SEMI_CONDENSED: return 'Semi Condensed';
		case OS2WidthClass.NORMAL: return 'Normal';
		case OS2WidthClass.SEMI_EXPANDED: return 'Semi Expanded';
		case OS2WidthClass.EXPANDED: return 'Expanded';
		case OS2WidthClass.EXTRA_EXPANDED: return 'Extra Expanded';
		case OS2WidthClass.ULTRA_EXPANDED: return 'Ultra Expanded';
		default: return `Unknown (${widthClass})`;
	}
}

/**
 * ファミリークラスの文字列表現を取得する
 * 
 * @param familyClass ファミリークラス
 * @returns ファミリークラスの文字列表現
 */
export function getFamilyClassString(familyClass: OS2FamilyClass): string {
	const classNames = [
		'No Classification',
		'Oldstyle Serifs',
		'Transitional Serifs',
		'Modern Serifs',
		'Clarendon Serifs',
		'Slab Serifs',
		'Freeform Serifs',
		'Sans Serif',
		'Ornamentals',
		'Scripts',
		'Symbol',
		'Mixed Serifs'
	];

	const className = familyClass.class < classNames.length
		? classNames[familyClass.class]
		: `Class ${familyClass.class}`;

	return `${className} (Subclass ${familyClass.subclass})`;
}

/**
 * PANOSE分類の文字列表現を取得する
 * 
 * @param panose PANOSE配列
 * @returns PANOSE分類の文字列表現
 */
export function getPanoseString(panose: Uint8Array): string {
	return Array.from(panose).map(b => b.toString(16).padStart(2, '0')).join(' ');
}

/**
 * フォント埋め込み制限の文字列表現を取得する
 * 
 * @param fsType fsTypeフラグ
 * @returns 埋め込み制限の文字列表現
 */
export function getFSTypeDescription(fsType: number): string[] {
	const descriptions = [];

	if (fsType === 0) {
		return ['Installable Embedding'];
	}

	if (hasOS2FSTypeFlag({ fsType } as OS2Table, OS2FSType.RESTRICTED_LICENSE_EMBEDDING)) {
		descriptions.push('Restricted License Embedding');
	}
	if (hasOS2FSTypeFlag({ fsType } as OS2Table, OS2FSType.PREVIEW_AND_PRINT_EMBEDDING)) {
		descriptions.push('Preview & Print Embedding');
	}
	if (hasOS2FSTypeFlag({ fsType } as OS2Table, OS2FSType.EDITABLE_EMBEDDING)) {
		descriptions.push('Editable Embedding');
	}
	if (hasOS2FSTypeFlag({ fsType } as OS2Table, OS2FSType.NO_SUBSETTING)) {
		descriptions.push('No Subsetting');
	}
	if (hasOS2FSTypeFlag({ fsType } as OS2Table, OS2FSType.BITMAP_EMBEDDING_ONLY)) {
		descriptions.push('Bitmap Embedding Only');
	}

	return descriptions.length > 0 ? descriptions : ['Reserved'];
}

/**
 * フォント選択フラグの文字列表現を取得する
 * 
 * @param os2 OS/2テーブル
 * @returns 選択フラグの文字列配列
 */
export function getFSSelectionFlags(os2: OS2Table): string[] {
	const flags = [];

	if (hasOS2FSSelectionFlag(os2, OS2FSSelection.ITALIC)) flags.push('Italic');
	if (hasOS2FSSelectionFlag(os2, OS2FSSelection.UNDERSCORE)) flags.push('Underscore');
	if (hasOS2FSSelectionFlag(os2, OS2FSSelection.NEGATIVE)) flags.push('Negative');
	if (hasOS2FSSelectionFlag(os2, OS2FSSelection.OUTLINED)) flags.push('Outlined');
	if (hasOS2FSSelectionFlag(os2, OS2FSSelection.STRIKEOUT)) flags.push('Strikeout');
	if (hasOS2FSSelectionFlag(os2, OS2FSSelection.BOLD)) flags.push('Bold');
	if (hasOS2FSSelectionFlag(os2, OS2FSSelection.REGULAR)) flags.push('Regular');
	if (hasOS2FSSelectionFlag(os2, OS2FSSelection.USE_TYPO_METRICS)) flags.push('Use Typo Metrics');
	if (hasOS2FSSelectionFlag(os2, OS2FSSelection.WWS)) flags.push('WWS');
	if (hasOS2FSSelectionFlag(os2, OS2FSSelection.OBLIQUE)) flags.push('Oblique');

	return flags;
}

/**
 * Unicode範囲のサポート状況を確認する
 * 
 * @param os2 OS/2テーブル
 * @param bit ビット位置 (0-127)
 * @returns サポートされている場合はtrue
 */
export function isUnicodeRangeSupported(os2: OS2Table, bit: number): boolean {
	if (bit < 0 || bit > 127) return false;

	const rangeIndex = Math.floor(bit / 32);
	const bitPosition = bit % 32;
	const mask = 1 << bitPosition;

	switch (rangeIndex) {
		case 0: return (os2.ulUnicodeRange1 & mask) !== 0;
		case 1: return (os2.ulUnicodeRange2 & mask) !== 0;
		case 2: return (os2.ulUnicodeRange3 & mask) !== 0;
		case 3: return (os2.ulUnicodeRange4 & mask) !== 0;
		default: return false;
	}
}

/**
 * コードページのサポート状況を確認する
 * 
 * @param os2 OS/2テーブル (バージョン1以上)
 * @param bit ビット位置 (0-63)
 * @returns サポートされている場合はtrue
 */
export function isCodePageSupported(os2: OS2Table, bit: number): boolean {
	if (os2.version < 1 || bit < 0 || bit > 63) return false;

	// バージョン0のテーブルの場合はfalseを返す
	if (!('ulCodePageRange1' in os2)) return false;

	const rangeIndex = Math.floor(bit / 32);
	const bitPosition = bit % 32;
	const mask = 1 << bitPosition;

	switch (rangeIndex) {
		case 0: return (os2.ulCodePageRange1 & mask) !== 0;
		case 1: return (os2.ulCodePageRange2 & mask) !== 0;
		default: return false;
	}
}

/**
 * OS/2テーブルのバージョンに基づいて利用可能なフィールドをチェックする
 * 
 * @param os2 OS/2テーブル
 * @param minVersion 必要な最小バージョン
 * @returns バージョン要件を満たす場合はtrue
 */
export function checkOS2Version(os2: OS2Table, minVersion: number): boolean {
	return os2.version >= minVersion;
}

/**
 * OS/2テーブルの基本情報の概要を取得する
 * 
 * @param os2 OS/2テーブル
 * @returns 基本情報の概要オブジェクト
 */
export function getOS2Summary(os2: OS2Table): object {
	const info: any = {
		version: os2.version,
		weight: {
			class: os2.usWeightClass,
			name: weightClassToString(os2.usWeightClass)
		},
		width: {
			class: os2.usWidthClass,
			name: widthClassToString(os2.usWidthClass)
		},
		fsType: {
			value: os2.fsType,
			description: getFSTypeDescription(os2.fsType)
		},
		familyClass: getFamilyClassString(os2.sFamilyClass),
		panose: getPanoseString(os2.panose),
		vendorID: os2.achVendID,
		fsSelection: {
			value: os2.fsSelection,
			flags: getFSSelectionFlags(os2)
		},
		charRange: {
			first: os2.usFirstCharIndex,
			last: os2.usLastCharIndex
		},
		metrics: {
			typoAscender: os2.sTypoAscender,
			typoDescender: os2.sTypoDescender,
			typoLineGap: os2.sTypoLineGap,
			winAscent: os2.usWinAscent,
			winDescent: os2.usWinDescent
		}
	};

	// バージョン2以上のフィールドを追加
	if (checkOS2Version(os2, 2) && 'sxHeight' in os2) {
		info.advancedMetrics = {
			xHeight: os2.sxHeight,
			capHeight: os2.sCapHeight,
			defaultChar: os2.usDefaultChar,
			breakChar: os2.usBreakChar,
			maxContext: os2.usMaxContext
		};
	}

	return info;
}
