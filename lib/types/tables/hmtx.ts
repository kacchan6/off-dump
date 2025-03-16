/**
 * hmtx テーブル型定義
 * 水平メトリクステーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/hmtx
 */

/**
 * 水平方向のメトリクスレコード
 */
export interface LongHorMetricRecord {
	/**
	 * グリフの水平方向の前進幅
	 */
	advanceWidth: number;

	/**
	 * グリフの左サイドベアリング
	 */
	leftSideBearing: number;
}

/**
 * 水平メトリクステーブル (hmtx)
 */
export interface HmtxTable {
	/**
	 * 水平方向のメトリクス（幅と左サイドベアリング）
	 * 最初のnumOfLongHorMetrics個のグリフのメトリクス
	 */
	hMetrics: LongHorMetricRecord[];

	/**
	 * 残りのグリフの左サイドベアリング
	 * これらのグリフの幅は最後のhMetricsエントリの値を使用
	 */
	leftSideBearing: number[];
}
