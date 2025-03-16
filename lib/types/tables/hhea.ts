/**
 * hhea テーブル型定義
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/hhea
 */

/**
 * 水平ヘッダーテーブル (hhea) の詳細情報
 */
export interface HheaTable {
	/**
	 * テーブルのバージョン（1.0）
	 */
	version: number;

	/**
	 * アセント（上昇）
	 * フォントの上方向のメトリクス
	 */
	ascent: number;

	/**
	 * ディセント（下降）
	 * フォントの下方向のメトリクス（通常は負の値）
	 */
	descent: number;

	/**
	 * 行間隔
	 */
	lineGap: number;

	/**
	 * 最大の前進幅
	 */
	advanceWidthMax: number;

	/**
	 * 最小の左サイドベアリング
	 */
	minLeftSideBearing: number;

	/**
	 * 最小の右サイドベアリング
	 */
	minRightSideBearing: number;

	/**
	 * 最大のグリフエクステント
	 */
	xMaxExtent: number;

	/**
	 * キャレットの傾斜
	 */
	caretSlopeRise: number;

	/**
	 * キャレットの傾斜
	 */
	caretSlopeRun: number;

	/**
	 * キャレットのオフセット
	 */
	caretOffset: number;

	/**
	 * 予約済み (0)
	 */
	reserved1: number;

	/**
	 * 予約済み (0)
	 */
	reserved2: number;

	/**
	 * 予約済み (0)
	 */
	reserved3: number;

	/**
	 * 予約済み (0)
	 */
	reserved4: number;

	/**
	 * メトリクスデータ形式
	 */
	metricDataFormat: number;

	/**
	 * 水平メトリクスの数
	 */
	numOfLongHorMetrics: number;
}
