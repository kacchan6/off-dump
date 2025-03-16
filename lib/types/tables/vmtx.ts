/**
 * vmtx テーブル型定義
 * 垂直メトリクステーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/vmtx
 */

/**
 * 垂直方向のメトリクスレコード
 */
export interface LongVerMetricRecord {
	/**
	 * グリフの垂直方向の前進高さ
	 */
	advanceHeight: number;

	/**
	 * グリフの上サイドベアリング
	 */
	topSideBearing: number;
}

/**
 * 垂直メトリクステーブル (vmtx)
 */
export interface VmtxTable {
	/**
	 * 垂直方向のメトリクス（高さと上サイドベアリング）
	 * 最初のnumOfLongVerMetrics個のグリフのメトリクス
	 */
	vMetrics: LongVerMetricRecord[];

	/**
	 * 残りのグリフの上サイドベアリング
	 * これらのグリフの高さは最後のvMetricsエントリの値を使用
	 */
	topSideBearing: number[];
}
