/**
 * head テーブル型定義
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/head
 */

/**
 * フォントヘッダーフラグ
 */
export enum HeadFlags {
	BASELINE_AT_0 = 0x0001,
	LEFT_SIDEBEARING_AT_0 = 0x0002,
	INSTRUCTIONS_DEPEND_ON_POINT_SIZE = 0x0004,
	FORCE_PPEM_TO_INTEGER = 0x0008,
	INSTRUCTIONS_ALTER_ADVANCE_WIDTH = 0x0010,
	// 5-10 reserved
	LOSSLESS_FONT_DATA = 0x0800,
	CONVERTED_FONT = 0x1000,
	OPTIMIZED_FOR_CLEARTYPE = 0x2000,
	LAST_RESORT_FONT = 0x4000
}

/**
 * フォントのマクロスタイル
 */
export enum MacStyle {
	BOLD = 0x0001,
	ITALIC = 0x0002,
	UNDERLINE = 0x0004,
	OUTLINE = 0x0008,
	SHADOW = 0x0010,
	CONDENSED = 0x0020,
	EXTENDED = 0x0040,
	// 7-15 reserved
}

/**
 * フォントヘッダーテーブル (head) の詳細情報
 */
export interface HeadTable {
	/**
	 * フォントのバージョン番号
	 */
	version: number;

	/**
	 * フォントのリビジョン
	 */
	fontRevision: number;

	/**
	 * チェックサム調整値
	 */
	checkSumAdjustment: number;

	/**
	 * マジックナンバー (0x5F0F3CF5)
	 */
	magicNumber: number;

	/**
	 * フォントのフラグ
	 */
	flags: number;

	/**
	 * EM正方形のユニット数
	 */
	unitsPerEm: number;

	/**
	 * 作成日時
	 */
	created: Date;

	/**
	 * 更新日時
	 */
	modified: Date;

	/**
	 * フォントのバウンディングボックスのxMin
	 */
	xMin: number;

	/**
	 * フォントのバウンディングボックスのyMin
	 */
	yMin: number;

	/**
	 * フォントのバウンディングボックスのxMax
	 */
	xMax: number;

	/**
	 * フォントのバウンディングボックスのyMax
	 */
	yMax: number;

	/**
	 * フォントのMacスタイル
	 */
	macStyle: number;

	/**
	 * 最小の読み取り可能サイズ（ピクセル単位）
	 */
	lowestRecPPEM: number;

	/**
	 * フォントの方向性のヒント
	 */
	fontDirectionHint: number;

	/**
	 * インデックスからロケーションフォーマット
	 * 0: 短いオフセット、1: 長いオフセット
	 */
	indexToLocFormat: number;

	/**
	 * glyfテーブルのデータ形式
	 */
	glyphDataFormat: number;
}
