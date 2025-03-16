/**
 * vhea テーブル型定義
 * 垂直方向のヘッダーテーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/vhea
 */

/**
 * 垂直ヘッダーテーブル (vhea) の詳細情報
 */
export interface VheaTable {
	/**
	 * テーブルのバージョン（1.0 または 1.1）
	 */
	version: number;

	/**
	 * タイポグラフィックアセント（上昇）
	 * フォントの上方向のメトリクス
	 */
	vertTypoAscender: number;

	/**
	 * タイポグラフィックディセント（下降）
	 * フォントの下方向のメトリクス（通常は負の値）
	 */
	vertTypoDescender: number;

	/**
	 * タイポグラフィック行間隔
	 */
	vertTypoLineGap: number;

	/**
	 * 最大の前進高さ
	 */
	advanceHeightMax: number;

	/**
	 * 最小の上サイドベアリング
	 */
	minTopSideBearing: number;

	/**
	 * 最小の下サイドベアリング
	 */
	minBottomSideBearing: number;

	/**
	 * 最大の垂直方向のエクステント
	 */
	yMaxExtent: number;

	/**
	 * キャレットの傾斜（垂直レイアウト用）
	 */
	caretSlopeRise: number;

	/**
	 * キャレットの傾斜（垂直レイアウト用）
	 */
	caretSlopeRun: number;

	/**
	 * キャレットのオフセット（垂直レイアウト用）
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
	 * 垂直メトリクスの数
	 */
	numOfLongVerMetrics: number;
}
