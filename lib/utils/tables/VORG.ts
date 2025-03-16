/**
 * VORGテーブル関連のユーティリティ関数
 */

import { VorgTable } from '../../types/tables/VORG';
import { Font } from '../../types/font';

/**
 * 指定したグリフの垂直原点Y座標を取得する
 * 
 * @param vorg VORGテーブル
 * @param glyphId グリフID
 * @returns 垂直原点Y座標
 */
export function getVertOriginY(vorg: VorgTable, glyphId: number): number {
	// 特定のグリフのカスタムY座標をメトリクス配列から検索
	const metric = vorg.vertOriginYMetrics.find(m => m.glyphIndex === glyphId);

	// カスタム値が見つかった場合はそれを返し、それ以外はデフォルト値を返す
	return metric ? metric.vertOriginY : vorg.defaultVertOriginY;
}

/**
 * フォントから指定したグリフの垂直原点Y座標を取得する
 * 
 * @param font フォントオブジェクト
 * @param glyphId グリフID
 * @returns 垂直原点Y座標（VORGテーブルがない場合はnull）
 */
export function getGlyphVertOriginY(font: Font, glyphId: number): number | null {
	const vorg = font.tables['VORG']?.table as VorgTable | undefined;

	if (!vorg) {
		return null;
	}

	return getVertOriginY(vorg, glyphId);
}

/**
 * VORGテーブルを持つかどうかを判定する
 * 
 * @param font フォントオブジェクト
 * @returns VORGテーブルを持つ場合はtrue
 */
export function hasVorgTable(font: Font): boolean {
	return font.tables['VORG'] !== undefined;
}

/**
 * VORGテーブルの基本情報を取得する
 * 
 * @param vorg VORGテーブル
 * @returns 基本情報のオブジェクト
 */
export function getVorgSummary(vorg: VorgTable): object {
	return {
		version: `${vorg.majorVersion}.${vorg.minorVersion}`,
		defaultVertOriginY: vorg.defaultVertOriginY,
		customMetricsCount: vorg.numVertOriginYMetrics
	};
}

/**
 * カスタム垂直原点を持つグリフの一覧を取得する
 * 
 * @param vorg VORGテーブル
 * @returns グリフIDとその垂直原点Y座標のマップ
 */
export function getCustomVertOriginYGlyphs(vorg: VorgTable): Map<number, number> {
	const map = new Map<number, number>();

	for (const metric of vorg.vertOriginYMetrics) {
		map.set(metric.glyphIndex, metric.vertOriginY);
	}

	return map;
}

/**
 * デフォルト値と大きく異なる垂直原点を持つグリフを見つける
 * 
 * @param vorg VORGテーブル
 * @param threshold しきい値（これ以上デフォルト値と異なる場合に返す）
 * @returns グリフIDとその垂直原点Y座標のリスト
 */
export function findSignificantVertOriginYDifferences(
	vorg: VorgTable,
	threshold: number = 100
): { glyphIndex: number, vertOriginY: number, difference: number }[] {
	const result = [];

	for (const metric of vorg.vertOriginYMetrics) {
		const difference = Math.abs(metric.vertOriginY - vorg.defaultVertOriginY);
		if (difference >= threshold) {
			result.push({
				glyphIndex: metric.glyphIndex,
				vertOriginY: metric.vertOriginY,
				difference
			});
		}
	}

	// 差分の大きい順にソート
	return result.sort((a, b) => b.difference - a.difference);
}

/**
 * VORGテーブルの垂直原点Y座標の統計情報を取得する
 * 
 * @param vorg VORGテーブル
 * @returns 統計情報
 */
export function getVertOriginYStatistics(vorg: VorgTable): {
	min: number;
	max: number;
	average: number;
	median: number;
} {
	// メトリクス配列が空の場合
	if (vorg.vertOriginYMetrics.length === 0) {
		return {
			min: vorg.defaultVertOriginY,
			max: vorg.defaultVertOriginY,
			average: vorg.defaultVertOriginY,
			median: vorg.defaultVertOriginY
		};
	}

	// Y座標の値を配列として取得
	const values = vorg.vertOriginYMetrics.map(m => m.vertOriginY);
	values.push(vorg.defaultVertOriginY); // デフォルト値も含める

	// 最小値と最大値
	const min = Math.min(...values);
	const max = Math.max(...values);

	// 平均値
	const sum = values.reduce((acc, val) => acc + val, 0);
	const average = sum / values.length;

	// 中央値を計算
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	const median = sorted.length % 2 === 0
		? (sorted[middle - 1] + sorted[middle]) / 2
		: sorted[middle];

	return { min, max, average, median };
}
