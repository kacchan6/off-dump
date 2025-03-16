/**
 * VORG テーブル型定義
 * 垂直原点テーブル - CFFフォントの垂直レイアウト時の文字の原点位置情報
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/vorg
 */

/**
 * 垂直原点テーブル (VORG) の詳細情報
 */
export interface VorgTable {
	/**
	 * テーブルのメジャーバージョン (通常は1)
	 */
	majorVersion: number;

	/**
	 * テーブルのマイナーバージョン (通常は0)
	 */
	minorVersion: number;

	/**
	 * デフォルトの垂直原点Y座標
	 * CFF topDictで定義されたdefaultVerticalOriginYと同じ値
	 */
	defaultVertOriginY: number;

	/**
	 * 垂直原点Y座標が異なるグリフの数
	 */
	numVertOriginYMetrics: number;

	/**
	 * 垂直原点Y座標のメトリクス配列
	 */
	vertOriginYMetrics: VertOriginYMetric[];
}

/**
 * 垂直原点Y座標のメトリクス
 */
export interface VertOriginYMetric {
	/**
	 * グリフID
	 */
	glyphIndex: number;

	/**
	 * 垂直原点Y座標
	 */
	vertOriginY: number;
}
