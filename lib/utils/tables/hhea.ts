/**
 * hheaテーブル関連のユーティリティ関数
 */

import { HheaTable } from '../../types/tables/hhea';

/**
 * フォントの完全な行の高さを計算する
 * 
 * @param hhea hheaテーブル
 * @returns 行の高さ（ピクセル単位）
 */
export function getLineHeight(hhea: HheaTable): number {
	return Math.abs(hhea.ascent) + Math.abs(hhea.descent) + hhea.lineGap;
}

/**
 * キャレットの傾斜角度を計算する（ラジアン単位）
 * 
 * @param hhea hheaテーブル
 * @returns 角度（ラジアン）
 */
export function getCaretSlopeAngle(hhea: HheaTable): number {
	if (hhea.caretSlopeRun === 0) {
		return Math.PI / 2; // 90度（垂直）
	}
	return Math.atan2(hhea.caretSlopeRise, hhea.caretSlopeRun);
}

/**
 * キャレットの傾斜角度を計算する（度単位）
 * 
 * @param hhea hheaテーブル
 * @returns 角度（度）
 */
export function getCaretSlopeAngleDegrees(hhea: HheaTable): number {
	return getCaretSlopeAngle(hhea) * 180 / Math.PI;
}

/**
 * フォントのタイポグラフィックメトリクスの概要を取得
 * 
 * @param hhea hheaテーブル
 * @returns メトリクスの概要オブジェクト
 */
export function getHheaMetricsSummary(hhea: HheaTable): object {
	return {
		lineHeight: getLineHeight(hhea),
		ascent: hhea.ascent,
		descent: hhea.descent,
		lineGap: hhea.lineGap,
		caretAngle: getCaretSlopeAngleDegrees(hhea).toFixed(2) + '°',
		advanceWidthMax: hhea.advanceWidthMax,
		numberOfHorizontalMetrics: hhea.numOfLongHorMetrics
	};
}
