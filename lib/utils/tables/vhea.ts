/**
 * vheaテーブル関連のユーティリティ関数
 */

import { VheaTable } from '../../types/tables/vhea';

/**
 * フォントの完全な垂直行の高さを計算する
 * 
 * @param vhea vheaテーブル
 * @returns 行の高さ（ピクセル単位）
 */
export function getVerticalLineHeight(vhea: VheaTable): number {
	return Math.abs(vhea.vertTypoAscender) + Math.abs(vhea.vertTypoDescender) + vhea.vertTypoLineGap;
}

/**
 * キャレットの傾斜角度を計算する（ラジアン単位）
 * 
 * @param vhea vheaテーブル
 * @returns 角度（ラジアン）
 */
export function getVerticalCaretSlopeAngle(vhea: VheaTable): number {
	if (vhea.caretSlopeRun === 0) {
		return Math.PI / 2; // 90度（垂直）
	}
	return Math.atan2(vhea.caretSlopeRise, vhea.caretSlopeRun);
}

/**
 * キャレットの傾斜角度を計算する（度単位）
 * 
 * @param vhea vheaテーブル
 * @returns 角度（度）
 */
export function getVerticalCaretSlopeAngleDegrees(vhea: VheaTable): number {
	return getVerticalCaretSlopeAngle(vhea) * 180 / Math.PI;
}

/**
 * フォントの垂直タイポグラフィックメトリクスの概要を取得
 * 
 * @param vhea vheaテーブル
 * @returns メトリクスの概要オブジェクト
 */
export function getVheaMetricsSummary(vhea: VheaTable): object {
	return {
		version: vhea.version,
		verticalLineHeight: getVerticalLineHeight(vhea),
		vertTypoAscender: vhea.vertTypoAscender,
		vertTypoDescender: vhea.vertTypoDescender,
		vertTypoLineGap: vhea.vertTypoLineGap,
		caretAngle: getVerticalCaretSlopeAngleDegrees(vhea).toFixed(2) + '°',
		advanceHeightMax: vhea.advanceHeightMax,
		numberOfVerticalMetrics: vhea.numOfLongVerMetrics
	};
}
