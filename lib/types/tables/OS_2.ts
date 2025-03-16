/**
 * OS/2 テーブル型定義
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/os2
 */

/**
 * フォントの重さ（Weight Class）
 */
export enum OS2WeightClass {
	THIN = 100,
	EXTRA_LIGHT = 200,
	LIGHT = 300,
	NORMAL = 400,
	MEDIUM = 500,
	SEMI_BOLD = 600,
	BOLD = 700,
	EXTRA_BOLD = 800,
	BLACK = 900
}

/**
 * フォントの幅（Width Class）
 */
export enum OS2WidthClass {
	ULTRA_CONDENSED = 1,
	EXTRA_CONDENSED = 2,
	CONDENSED = 3,
	SEMI_CONDENSED = 4,
	NORMAL = 5,
	SEMI_EXPANDED = 6,
	EXPANDED = 7,
	EXTRA_EXPANDED = 8,
	ULTRA_EXPANDED = 9
}

/**
 * フォントタイプ（fsType）
 */
export enum OS2FSType {
	// ビットフラグの定義
	RESTRICTED_LICENSE_EMBEDDING = 0x0002,
	PREVIEW_AND_PRINT_EMBEDDING = 0x0004,
	EDITABLE_EMBEDDING = 0x0008,
	NO_SUBSETTING = 0x0100,
	BITMAP_EMBEDDING_ONLY = 0x0200
}

/**
 * フォント選択フラグ（fsSelection）
 */
export enum OS2FSSelection {
	ITALIC = 0x0001,
	UNDERSCORE = 0x0002,
	NEGATIVE = 0x0004,
	OUTLINED = 0x0008,
	STRIKEOUT = 0x0010,
	BOLD = 0x0020,
	REGULAR = 0x0040,
	USE_TYPO_METRICS = 0x0080,
	WWS = 0x0100,
	OBLIQUE = 0x0200
}

/**
 * ファミリークラス（iBMFamilyClass）
 */
export interface OS2FamilyClass {
	/**
	 * クラスID
	 */
	class: number;

	/**
	 * サブクラスID
	 */
	subclass: number;
}

/**
 * OS/2テーブルの共通フィールド（バージョン0）
 */
export interface OS2TableV0 {
	/**
	 * テーブルのバージョン
	 */
	version: number;

	/**
	 * 平均文字幅
	 */
	xAvgCharWidth: number;

	/**
	 * フォントの重さ
	 */
	usWeightClass: number;

	/**
	 * フォントの幅
	 */
	usWidthClass: number;

	/**
	 * フォントの埋め込み制限
	 */
	fsType: number;

	/**
	 * 購読済みサイズ
	 */
	ySubscriptXSize: number;

	/**
	 * 購読済みY寸法
	 */
	ySubscriptYSize: number;

	/**
	 * 購読済みXオフセット
	 */
	ySubscriptXOffset: number;

	/**
	 * 購読済みYオフセット
	 */
	ySubscriptYOffset: number;

	/**
	 * 上付きXサイズ
	 */
	ySuperscriptXSize: number;

	/**
	 * 上付きYサイズ
	 */
	ySuperscriptYSize: number;

	/**
	 * 上付きXオフセット
	 */
	ySuperscriptXOffset: number;

	/**
	 * 上付きYオフセット
	 */
	ySuperscriptYOffset: number;

	/**
	 * 取り消し線の厚さ
	 */
	yStrikeoutSize: number;

	/**
	 * 取り消し線の位置
	 */
	yStrikeoutPosition: number;

	/**
	 * ファミリークラス
	 */
	sFamilyClass: OS2FamilyClass;

	/**
	 * PANOSE分類
	 */
	panose: Uint8Array;

	/**
	 * Unicodeの範囲 (ビットフィールド)
	 */
	ulUnicodeRange1: number;
	ulUnicodeRange2: number;
	ulUnicodeRange3: number;
	ulUnicodeRange4: number;

	/**
	 * ベンダーID
	 */
	achVendID: string;

	/**
	 * フォント選択フラグ
	 */
	fsSelection: number;

	/**
	 * 最初の文字インデックス
	 */
	usFirstCharIndex: number;

	/**
	 * 最後の文字インデックス
	 */
	usLastCharIndex: number;

	/**
	 * 活字上昇値
	 */
	sTypoAscender: number;

	/**
	 * 活字下降値
	 */
	sTypoDescender: number;

	/**
	 * 活字行間
	 */
	sTypoLineGap: number;

	/**
	 * Windows上昇値
	 */
	usWinAscent: number;

	/**
	 * Windows下降値
	 */
	usWinDescent: number;
}

/**
 * OS/2テーブルバージョン1の追加フィールド
 */
export interface OS2TableV1 extends OS2TableV0 {
	/**
	 * コードページ範囲 (ビットフィールド)
	 */
	ulCodePageRange1: number;
	ulCodePageRange2: number;
}

/**
 * OS/2テーブルバージョン2の追加フィールド
 */
export interface OS2TableV2 extends OS2TableV1 {
	/**
	 * xHeight
	 */
	sxHeight: number;

	/**
	 * Capital height
	 */
	sCapHeight: number;

	/**
	 * デフォルト文字
	 */
	usDefaultChar: number;

	/**
	 * 区切り文字
	 */
	usBreakChar: number;

	/**
	 * 最大コンテキスト
	 */
	usMaxContext: number;
}

/**
 * OS/2テーブルバージョン3の追加フィールド（バージョン2と同じ）
 */
export type OS2TableV3 = OS2TableV2;

/**
 * OS/2テーブルバージョン4の追加フィールド
 */
export interface OS2TableV4 extends OS2TableV3 {
	/**
	 * 下つき文字のy方向最大オフセット
	 */
	usLowerOpticalPointSize: number;

	/**
	 * 上つき文字のy方向最大オフセット
	 */
	usUpperOpticalPointSize: number;
}

/**
 * OS/2テーブルバージョン5の追加フィールド
 */
export interface OS2TableV5 extends OS2TableV4 {
	/**
	 * 修正使用制限フラグ
	 */
	usReserved: number;
}

/**
 * OS/2テーブル（すべてのバージョンを包含）
 */
export type OS2Table = OS2TableV0 | OS2TableV1 | OS2TableV2 | OS2TableV3 | OS2TableV4 | OS2TableV5;
