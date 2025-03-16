/**
 * メトリクステーブル（hmtx、vmtx）関連のユーティリティ関数
 */

import { Font } from '../../types/font';
import { HmtxTable } from '../../types/tables/hmtx';
import { VmtxTable } from '../../types/tables/vmtx';

/**
 * 指定したグリフの水平メトリクスを取得する
 * 
 * @param hmtx hmtxテーブル
 * @param glyphId グリフID
 * @param numGlyphs フォント内のグリフ総数
 * @returns 水平メトリクス（幅と左サイドベアリング）
 */
export function getHorizontalMetrics(
	hmtx: HmtxTable,
	glyphId: number,
	numGlyphs: number
): { advanceWidth: number; leftSideBearing: number } {
	// グリフ番号の範囲チェック
	if (glyphId < 0 || glyphId >= numGlyphs) {
		throw new Error(`Glyph ID out of range: ${glyphId}`);
	}

	const numOfLongHorMetrics = hmtx.hMetrics.length;

	// longhorMetricsに含まれるグリフの場合
	if (glyphId < numOfLongHorMetrics) {
		return hmtx.hMetrics[glyphId];
	}

	// それ以外の場合は最後のadvanceWidthを使用
	return {
		advanceWidth: hmtx.hMetrics[numOfLongHorMetrics - 1].advanceWidth,
		leftSideBearing: hmtx.leftSideBearing[glyphId - numOfLongHorMetrics]
	};
}

/**
 * 指定したグリフの垂直メトリクスを取得する
 * 
 * @param vmtx vmtxテーブル
 * @param glyphId グリフID
 * @param numGlyphs フォント内のグリフ総数
 * @returns 垂直メトリクス（高さと上サイドベアリング）
 */
export function getVerticalMetrics(
	vmtx: VmtxTable,
	glyphId: number,
	numGlyphs: number
): { advanceHeight: number; topSideBearing: number } {
	// グリフ番号の範囲チェック
	if (glyphId < 0 || glyphId >= numGlyphs) {
		throw new Error(`Glyph ID out of range: ${glyphId}`);
	}

	const numOfLongVerMetrics = vmtx.vMetrics.length;

	// longverMetricsに含まれるグリフの場合
	if (glyphId < numOfLongVerMetrics) {
		return vmtx.vMetrics[glyphId];
	}

	// それ以外の場合は最後のadvanceHeightを使用
	return {
		advanceHeight: vmtx.vMetrics[numOfLongVerMetrics - 1].advanceHeight,
		topSideBearing: vmtx.topSideBearing[glyphId - numOfLongVerMetrics]
	};
}

/**
 * フォントから指定したグリフの水平メトリクスを取得する
 * 
 * @param font フォントオブジェクト
 * @param glyphId グリフID
 * @returns 水平メトリクス（幅と左サイドベアリング）
 */
export function getGlyphHorizontalMetrics(
	font: Font,
	glyphId: number
): { advanceWidth: number; leftSideBearing: number } | null {
	const hmtx = font.tables['hmtx']?.table;
	const maxp = font.tables['maxp']?.table;

	if (!hmtx || !maxp) {
		return null;
	}

	try {
		return getHorizontalMetrics(hmtx, glyphId, maxp.numGlyphs);
	} catch (e) {
		console.warn(`Failed to get horizontal metrics for glyph ${glyphId}: ${e}`);
		return null;
	}
}

/**
 * フォントから指定したグリフの垂直メトリクスを取得する
 * 
 * @param font フォントオブジェクト
 * @param glyphId グリフID
 * @returns 垂直メトリクス（高さと上サイドベアリング）
 */
export function getGlyphVerticalMetrics(
	font: Font,
	glyphId: number
): { advanceHeight: number; topSideBearing: number } | null {
	const vmtx = font.tables['vmtx']?.table;
	const maxp = font.tables['maxp']?.table;

	if (!vmtx || !maxp) {
		return null;
	}

	try {
		return getVerticalMetrics(vmtx, glyphId, maxp.numGlyphs);
	} catch (e) {
		console.warn(`Failed to get vertical metrics for glyph ${glyphId}: ${e}`);
		return null;
	}
}

/**
 * hmtxテーブルから水平メトリクスの統計情報を取得する
 * 
 * @param hmtx hmtxテーブル
 * @returns 統計情報
 */
export function getHmtxStatistics(hmtx: HmtxTable): {
	minAdvanceWidth: number;
	maxAdvanceWidth: number;
	avgAdvanceWidth: number;
	minLeftSideBearing: number;
	maxLeftSideBearing: number;
} {
	// 最小・最大・平均の初期値
	let minAdvanceWidth = Number.MAX_VALUE;
	let maxAdvanceWidth = Number.MIN_VALUE;
	let totalAdvanceWidth = 0;

	let minLeftSideBearing = Number.MAX_VALUE;
	let maxLeftSideBearing = Number.MIN_VALUE;

	// hMetricsの各エントリを処理
	for (const metric of hmtx.hMetrics) {
		// 幅の統計
		minAdvanceWidth = Math.min(minAdvanceWidth, metric.advanceWidth);
		maxAdvanceWidth = Math.max(maxAdvanceWidth, metric.advanceWidth);
		totalAdvanceWidth += metric.advanceWidth;

		// 左サイドベアリングの統計
		minLeftSideBearing = Math.min(minLeftSideBearing, metric.leftSideBearing);
		maxLeftSideBearing = Math.max(maxLeftSideBearing, metric.leftSideBearing);
	}

	// 追加のleftSideBearingの統計
	for (const lsb of hmtx.leftSideBearing) {
		minLeftSideBearing = Math.min(minLeftSideBearing, lsb);
		maxLeftSideBearing = Math.max(maxLeftSideBearing, lsb);
	}

	// 平均値を計算
	const avgAdvanceWidth = totalAdvanceWidth / hmtx.hMetrics.length;

	return {
		minAdvanceWidth,
		maxAdvanceWidth,
		avgAdvanceWidth,
		minLeftSideBearing,
		maxLeftSideBearing
	};
}

/**
 * vmtxテーブルから垂直メトリクスの統計情報を取得する
 * 
 * @param vmtx vmtxテーブル
 * @returns 統計情報
 */
export function getVmtxStatistics(vmtx: VmtxTable): {
	minAdvanceHeight: number;
	maxAdvanceHeight: number;
	avgAdvanceHeight: number;
	minTopSideBearing: number;
	maxTopSideBearing: number;
} {
	// 最小・最大・平均の初期値
	let minAdvanceHeight = Number.MAX_VALUE;
	let maxAdvanceHeight = Number.MIN_VALUE;
	let totalAdvanceHeight = 0;

	let minTopSideBearing = Number.MAX_VALUE;
	let maxTopSideBearing = Number.MIN_VALUE;

	// vMetricsの各エントリを処理
	for (const metric of vmtx.vMetrics) {
		// 高さの統計
		minAdvanceHeight = Math.min(minAdvanceHeight, metric.advanceHeight);
		maxAdvanceHeight = Math.max(maxAdvanceHeight, metric.advanceHeight);
		totalAdvanceHeight += metric.advanceHeight;

		// 上サイドベアリングの統計
		minTopSideBearing = Math.min(minTopSideBearing, metric.topSideBearing);
		maxTopSideBearing = Math.max(maxTopSideBearing, metric.topSideBearing);
	}

	// 追加のtopSideBearingの統計
	for (const tsb of vmtx.topSideBearing) {
		minTopSideBearing = Math.min(minTopSideBearing, tsb);
		maxTopSideBearing = Math.max(maxTopSideBearing, tsb);
	}

	// 平均値を計算
	const avgAdvanceHeight = totalAdvanceHeight / vmtx.vMetrics.length;

	return {
		minAdvanceHeight,
		maxAdvanceHeight,
		avgAdvanceHeight,
		minTopSideBearing,
		maxTopSideBearing
	};
}

/**
 * フォントの等幅性をチェックする
 * 全てのグリフが同じ幅を持つ場合は等幅フォント
 * 
 * @param hmtx hmtxテーブル
 * @returns 等幅フォントならtrue
 */
export function isMonospacedFont(hmtx: HmtxTable): boolean {
	if (hmtx.hMetrics.length <= 1) {
		return true; // 1つ以下のメトリクスしかない場合は等幅とみなす
	}

	// 最初のグリフの幅を基準とする
	const firstWidth = hmtx.hMetrics[0].advanceWidth;

	// 全てのグリフが同じ幅かチェック
	for (let i = 1; i < hmtx.hMetrics.length; i++) {
		if (hmtx.hMetrics[i].advanceWidth !== firstWidth) {
			return false;
		}
	}

	return true;
}

/**
 * フォントの垂直等幅性をチェックする
 * 全てのグリフが同じ高さを持つ場合は垂直等幅フォント
 * 
 * @param vmtx vmtxテーブル
 * @returns 垂直等幅フォントならtrue
 */
export function isVerticallyMonospaced(vmtx: VmtxTable): boolean {
	if (vmtx.vMetrics.length <= 1) {
		return true; // 1つ以下のメトリクスしかない場合は等幅とみなす
	}

	// 最初のグリフの高さを基準とする
	const firstHeight = vmtx.vMetrics[0].advanceHeight;

	// 全てのグリフが同じ高さかチェック
	for (let i = 1; i < vmtx.vMetrics.length; i++) {
		if (vmtx.vMetrics[i].advanceHeight !== firstHeight) {
			return false;
		}
	}

	return true;
}

/**
 * 水平テキストの幅を計算する
 * 
 * @param font フォントオブジェクト
 * @param glyphIds グリフIDの配列
 * @returns テキストの幅（計算できない場合はnull）
 */
export function calculateHorizontalTextWidth(
	font: Font,
	glyphIds: number[]
): number | null {
	const hmtx = font.tables['hmtx']?.table;
	const maxp = font.tables['maxp']?.table;

	if (!hmtx || !maxp) {
		return null;
	}

	try {
		let totalWidth = 0;

		// 各グリフの幅を加算
		for (const glyphId of glyphIds) {
			const metrics = getHorizontalMetrics(hmtx, glyphId, maxp.numGlyphs);
			totalWidth += metrics.advanceWidth;
		}

		return totalWidth;
	} catch (e) {
		console.error('Error calculating horizontal text width:', e);
		return null;
	}
}

/**
 * 垂直テキストの高さを計算する
 * 
 * @param font フォントオブジェクト
 * @param glyphIds グリフIDの配列
 * @returns テキストの高さ（計算できない場合はnull）
 */
export function calculateVerticalTextHeight(
	font: Font,
	glyphIds: number[]
): number | null {
	const vmtx = font.tables['vmtx']?.table;
	const maxp = font.tables['maxp']?.table;

	if (!vmtx || !maxp) {
		return null;
	}

	try {
		let totalHeight = 0;

		// 各グリフの高さを加算
		for (const glyphId of glyphIds) {
			const metrics = getVerticalMetrics(vmtx, glyphId, maxp.numGlyphs);
			totalHeight += metrics.advanceHeight;
		}

		return totalHeight;
	} catch (e) {
		console.error('Error calculating vertical text height:', e);
		return null;
	}
}

/**
 * フォントの総合的なメトリクス情報を取得する
 * 
 * @param font フォントオブジェクト
 * @returns メトリクス情報のサマリー
 */
export function getFontMetricsSummary(font: Font): object {
	const hmtx = font.tables['hmtx']?.table;
	const vmtx = font.tables['vmtx']?.table;
	const hhea = font.tables['hhea']?.table;
	const vhea = font.tables['vhea']?.table;
	const maxp = font.tables['maxp']?.table;

	const summary: any = {
		numGlyphs: maxp?.numGlyphs || 0
	};

	// 水平メトリクス情報
	if (hmtx && hhea) {
		const hmtxStats = getHmtxStatistics(hmtx);
		summary.horizontal = {
			isMonospaced: isMonospacedFont(hmtx),
			metrics: hmtxStats,
			lineGap: hhea.lineGap,
			ascent: hhea.ascent,
			descent: hhea.descent
		};
	}

	// 垂直メトリクス情報
	if (vmtx && vhea) {
		const vmtxStats = getVmtxStatistics(vmtx);
		summary.vertical = {
			isMonospaced: isVerticallyMonospaced(vmtx),
			metrics: vmtxStats,
			lineGap: vhea.vertTypoLineGap,
			ascender: vhea.vertTypoAscender,
			descender: vhea.vertTypoDescender
		};
	}

	return summary;
}
