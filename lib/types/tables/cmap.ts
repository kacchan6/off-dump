/**
 * cmap テーブル型定義
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/cmap
 */

/**
 * cmapテーブルヘッダー
 */
export interface CmapHeader {
	/**
	 * バージョン（常に0）
	 */
	version: number;

	/**
	 * サブテーブルの数
	 */
	numTables: number;
}

/**
 * cmapエンコーディングレコード
 */
export interface CmapEncodingRecord {
	/**
	 * プラットフォームID
	 */
	platformID: number;

	/**
	 * プラットフォーム固有のエンコーディングID
	 */
	encodingID: number;

	/**
	 * サブテーブルへのオフセット（cmapテーブルの先頭から）
	 */
	offset: number;

	/**
	 * 解析されたサブテーブル
	 */
	subtable?: AnyCmapSubtable;
}

/**
 * プラットフォームID
 */
export enum CmapPlatformID {
	UNICODE = 0,
	MACINTOSH = 1,
	RESERVED = 2,
	WINDOWS = 3
}

/**
 * Unicodeプラットフォームのエンコーディングid
 */
export enum CmapUnicodeEncodingID {
	UNICODE_1_0 = 0,
	UNICODE_1_1 = 1,
	ISO_10646 = 2,
	UNICODE_2_0_BMP = 3,
	UNICODE_2_0_FULL = 4,
	UNICODE_VARIATION_SEQUENCES = 5,
	UNICODE_FULL = 6
}

/**
 * Windowsプラットフォームのエンコーディングid
 */
export enum CmapWindowsEncodingID {
	SYMBOL = 0,
	UNICODE_BMP = 1,
	SHIFT_JIS = 2,
	PRC = 3,
	BIG5 = 4,
	WANSUNG = 5,
	JOHAB = 6,
	UNICODE_FULL = 10
}

/**
 * Macintoshプラットフォームのエンコーディングid
 */
export enum CmapMacintoshEncodingID {
	ROMAN = 0,
	JAPANESE = 1,
	CHINESE_TRADITIONAL = 2,
	KOREAN = 3,
	ARABIC = 4,
	HEBREW = 5,
	GREEK = 6,
	RUSSIAN = 7,
	RSYMBOL = 8,
	DEVANAGARI = 9,
	GURMUKHI = 10,
	GUJARATI = 11,
	ORIYA = 12,
	BENGALI = 13,
	TAMIL = 14,
	TELUGU = 15,
	KANNADA = 16,
	MALAYALAM = 17,
	SINHALESE = 18,
	BURMESE = 19,
	KHMER = 20,
	THAI = 21,
	LAOTIAN = 22,
	GEORGIAN = 23,
	ARMENIAN = 24,
	CHINESE_SIMPLIFIED = 25,
	TIBETAN = 26,
	MONGOLIAN = 27,
	GEEZ = 28,
	SLAVIC = 29,
	VIETNAMESE = 30,
	SINDHI = 31,
	UNINTERPRETED = 32
}

/**
 * cmapサブテーブルのフォーマット
 */
export enum CmapFormat {
	BYTE_ENCODING = 0,          // 非推奨
	HIGH_BYTE_MAPPING = 2,      // 非推奨
	SEGMENT_MAPPING = 4,
	TRIMMED_TABLE_MAPPING = 6,
	MIXED_16_32_BIT_MAPPING = 8,
	TRIMMED_ARRAY = 10,
	SEGMENTED_COVERAGE = 12,
	MANY_TO_ONE_RANGE_MAPPINGS = 13,
	UNICODE_VARIATION_SEQUENCES = 14
}

/**
 * cmapサブテーブルの基本インターフェース
 */
export interface CmapSubtable {
	/**
	 * サブテーブルのフォーマット
	 */
	format: CmapFormat;

	/**
	 * 言語タグ（サブテーブルフォーマットによっては使用しない）
	 */
	language?: number;
}

/**
 * フォーマット0：バイトエンコーディングテーブル（非推奨）
 */
export interface CmapFormat0Subtable extends CmapSubtable {
	/**
	 * フォーマット（0）
	 */
	format: CmapFormat.BYTE_ENCODING;

	/**
	 * グリフインデックス配列 (文字コード->グリフインデックス)
	 * 256要素の配列
	 */
	glyphIdArray: number[];
}

/**
 * フォーマット2：高バイトマッピング（非推奨）
 * 主に中国語、日本語、韓国語のフォント用
 */
export interface CmapFormat2Subtable extends CmapSubtable {
	/**
	 * フォーマット（2）
	 */
	format: CmapFormat.HIGH_BYTE_MAPPING;

	/**
	 * 高バイト値のサブヘッダインデックス配列 (256エントリ)
	 */
	subHeaderKeys: number[];

	/**
	 * サブヘッダ配列
	 */
	subHeaders: CmapFormat2SubHeader[];

	/**
	 * グリフインデックス配列
	 */
	glyphIdArray: number[];
}

/**
 * フォーマット2のサブヘッダ
 */
export interface CmapFormat2SubHeader {
	/**
	 * 最初の下位バイト
	 */
	firstCode: number;

	/**
	 * エントリカウント
	 */
	entryCount: number;

	/**
	 * idDelta
	 */
	idDelta: number;

	/**
	 * idRangeOffset
	 */
	idRangeOffset: number;

	/**
	 * このサブヘッダに関連するglyphIdArrayのインデックス
	 */
	glyphIdArrayIndex: number;
}

/**
 * フォーマット8：混合16/32ビットマッピング
 */
export interface CmapFormat8Subtable extends CmapSubtable {
	/**
	 * フォーマット（8）
	 */
	format: CmapFormat.MIXED_16_32_BIT_MAPPING;

	/**
	 * 予約済み（常に0）
	 */
	reserved: number;

	/**
	 * テーブルの長さ（バイト単位）
	 */
	length: number;

	/**
	 * 言語
	 */
	language: number;

	/**
	 * is32配列（8192要素のビットフィールド）
	 */
	is32: Uint8Array;

	/**
	 * グループ数
	 */
	numGroups: number;

	/**
	 * グループ配列
	 */
	groups: CmapFormat8Group[];
}

/**
 * フォーマット8のグループ（フォーマット12と同じ構造）
 */
export interface CmapFormat8Group {
	/**
	 * 開始文字コード
	 */
	startCharCode: number;

	/**
	 * 終了文字コード
	 */
	endCharCode: number;

	/**
	 * 開始グリフID
	 */
	startGlyphID: number;
}

/**
 * フォーマット10：トリム配列
 */
export interface CmapFormat10Subtable extends CmapSubtable {
	/**
	 * フォーマット（10）
	 */
	format: CmapFormat.TRIMMED_ARRAY;

	/**
	 * 予約済み（常に0）
	 */
	reserved: number;

	/**
	 * テーブルの長さ（バイト単位）
	 */
	length: number;

	/**
	 * 言語
	 */
	language: number;

	/**
	 * 開始文字コード
	 */
	startCharCode: number;

	/**
	 * 文字数
	 */
	numChars: number;

	/**
	 * グリフインデックス配列
	 */
	glyphs: number[];
}

/**
 * フォーマット13：多対一範囲マッピング
 */
export interface CmapFormat13Subtable extends CmapSubtable {
	/**
	 * フォーマット（13）
	 */
	format: CmapFormat.MANY_TO_ONE_RANGE_MAPPINGS;

	/**
	 * 予約済み（常に0）
	 */
	reserved: number;

	/**
	 * テーブルの長さ（バイト単位）
	 */
	length: number;

	/**
	 * 言語
	 */
	language: number;

	/**
	 * グループ数
	 */
	numGroups: number;

	/**
	 * グループ配列
	 */
	groups: CmapFormat13Group[];
}

/**
 * フォーマット13のグループ
 */
export interface CmapFormat13Group {
	/**
	 * 開始文字コード
	 */
	startCharCode: number;

	/**
	 * 終了文字コード
	 */
	endCharCode: number;

	/**
	 * グリフID（範囲内のすべての文字に対して同じ）
	 */
	glyphID: number;
}

/**
 * フォーマット4：セグメントマッピング
 */
export interface CmapFormat4Subtable extends CmapSubtable {
	/**
	 * フォーマット（4）
	 */
	format: CmapFormat.SEGMENT_MAPPING;

	/**
	 * セグメント数 * 2
	 */
	segCountX2: number;

	/**
	 * 2の累乗の検索範囲
	 */
	searchRange: number;

	/**
	 * エントリセレクタ（検索範囲のlog2）
	 */
	entrySelector: number;

	/**
	 * レンジシフト
	 */
	rangeShift: number;

	/**
	 * 終了コードポイント配列
	 */
	endCode: number[];

	/**
	 * 予約済み値（常に0）
	 */
	reservedPad: number;

	/**
	 * 開始コードポイント配列
	 */
	startCode: number[];

	/**
	 * デルタ値配列
	 */
	idDelta: number[];

	/**
	 * idRangeOffsetへのオフセット配列
	 */
	idRangeOffset: number[];

	/**
	 * グリフインデックス配列
	 */
	glyphIdArray: number[];
}

/**
 * フォーマット6：トリムテーブルマッピング
 */
export interface CmapFormat6Subtable extends CmapSubtable {
	/**
	 * フォーマット（6）
	 */
	format: CmapFormat.TRIMMED_TABLE_MAPPING;

	/**
	 * 最初のコードポイント
	 */
	firstCode: number;

	/**
	 * エントリ数
	 */
	entryCount: number;

	/**
	 * グリフインデックス配列
	 */
	glyphIdArray: number[];
}

/**
 * フォーマット12：セグメントカバレッジ
 */
export interface CmapFormat12Subtable extends CmapSubtable {
	/**
	 * フォーマット（12）
	 */
	format: CmapFormat.SEGMENTED_COVERAGE;

	/**
	 * 予約済み（常に0）
	 */
	reserved: number;

	/**
	 * テーブルの長さ（バイト単位）
	 */
	length: number;

	/**
	 * 言語
	 */
	language: number;

	/**
	 * グループ数
	 */
	numGroups: number;

	/**
	 * グループ配列
	 */
	groups: CmapFormat12Group[];
}

/**
 * フォーマット12のグループ
 */
export interface CmapFormat12Group {
	/**
	 * 開始文字コード
	 */
	startCharCode: number;

	/**
	 * 終了文字コード
	 */
	endCharCode: number;

	/**
	 * 開始グリフID
	 */
	startGlyphID: number;
}

/**
 * フォーマット14：Unicodeバリエーションシーケンス
 */
export interface CmapFormat14Subtable extends CmapSubtable {
	/**
	 * フォーマット（14）
	 */
	format: CmapFormat.UNICODE_VARIATION_SEQUENCES;

	/**
	 * テーブルの長さ（バイト単位）
	 */
	length: number;

	/**
	 * バリエーションセレクタレコードの数
	 */
	numVarSelectorRecords: number;

	/**
	 * バリエーションセレクタレコード配列
	 */
	varSelectors: CmapVariationSelectorRecord[];
}

/**
 * バリエーションセレクタレコード
 */
export interface CmapVariationSelectorRecord {
	/**
	 * バリエーションセレクタ
	 */
	varSelector: number;

	/**
	 * デフォルトUVSテーブルへのオフセット
	 */
	defaultUVSOffset: number;

	/**
	 * 非デフォルトUVSテーブルへのオフセット
	 */
	nonDefaultUVSOffset: number;

	/**
	 * デフォルトUVSテーブル（あれば）
	 */
	defaultUVS?: CmapDefaultUVSTable;

	/**
	 * 非デフォルトUVSテーブル（あれば）
	 */
	nonDefaultUVS?: CmapNonDefaultUVSTable;
}

/**
 * デフォルトUVSテーブル
 */
export interface CmapDefaultUVSTable {
	/**
	 * UVSマッピングの数
	 */
	numUnicodeValueRanges: number;

	/**
	 * UVSマッピング範囲の配列
	 */
	ranges: CmapUnicodeValueRange[];
}

/**
 * Unicodeバリュー範囲
 */
export interface CmapUnicodeValueRange {
	/**
	 * 開始Unicodeコードポイント
	 */
	startUnicodeValue: number;

	/**
	 * 追加コードポイント数
	 */
	additionalCount: number;
}

/**
 * 非デフォルトUVSテーブル
 */
export interface CmapNonDefaultUVSTable {
	/**
	 * UVSマッピングの数
	 */
	numUVSMappings: number;

	/**
	 * UVSマッピングの配列
	 */
	uvsMappings: CmapUVSMapping[];
}

/**
 * UVSマッピング
 */
export interface CmapUVSMapping {
	/**
	 * Unicodeコードポイント
	 */
	unicodeValue: number;

	/**
	 * グリフID
	 */
	glyphID: number;
}

/**
 * 任意のcmapサブテーブル型（型ガード用）
 */
export type AnyCmapSubtable =
	CmapFormat0Subtable |
	CmapFormat2Subtable |
	CmapFormat4Subtable |
	CmapFormat6Subtable |
	CmapFormat8Subtable |
	CmapFormat10Subtable |
	CmapFormat12Subtable |
	CmapFormat13Subtable |
	CmapFormat14Subtable;

/**
 * cmapテーブル全体
 */
export interface CmapTable {
	/**
	 * cmapテーブルヘッダー
	 */
	header: CmapHeader;

	/**
	 * エンコーディングレコード配列
	 */
	encodingRecords: CmapEncodingRecord[];
}
