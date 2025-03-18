/**
 * CFF/CFF2テーブルのグリフメトリクスと統計分析のユーティリティ関数
 */

import { Font } from '../../types/font';
import { hasCffOrCff2Table, getCffOrCff2Table, extractGlyphPaths } from './utils';
import { PathCommand } from './path';

/**
 * グリフアウトラインの境界ボックスを計算
 * 
 * @param path パスコマンド配列
 * @returns 境界ボックス（xMin, yMin, xMax, yMax）
 */
export function calculateBoundingBox(path: PathCommand[]): { xMin: number, yMin: number, xMax: number, yMax: number } {
	let xMin = Number.POSITIVE_INFINITY;
	let yMin = Number.POSITIVE_INFINITY;
	let xMax = Number.NEGATIVE_INFINITY;
	let yMax = Number.NEGATIVE_INFINITY;

	// パスが空の場合、デフォルト値を返す
	if (path.length === 0) {
		return { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
	}

	// 各パスコマンドの座標を処理
	for (const cmd of path) {
		switch (cmd.type) {
			case 'M':
			case 'L':
				xMin = Math.min(xMin, cmd.x);
				yMin = Math.min(yMin, cmd.y);
				xMax = Math.max(xMax, cmd.x);
				yMax = Math.max(yMax, cmd.y);
				break;

			case 'C':
				// 制御点もチェック
				xMin = Math.min(xMin, cmd.x, cmd.x1, cmd.x2);
				yMin = Math.min(yMin, cmd.y, cmd.y1, cmd.y2);
				xMax = Math.max(xMax, cmd.x, cmd.x1, cmd.x2);
				yMax = Math.max(yMax, cmd.y, cmd.y1, cmd.y2);
				break;

			// Zコマンドには座標がないのでスキップ
		}
	}

	return { xMin, yMin, xMax, yMax };
}

/**
 * グリフアウトラインの幅と高さを計算
 * 
 * @param path パスコマンド配列
 * @returns 幅と高さ
 */
export function calculatePathDimensions(path: PathCommand[]): { width: number, height: number } {
	const bbox = calculateBoundingBox(path);
	return {
		width: bbox.xMax - bbox.xMin,
		height: bbox.yMax - bbox.yMin
	};
}

/**
 * グリフパスからの高度な情報を取得
 * 
 * @param path パスコマンド配列
 * @returns 高度なパス情報
 */
export function getPathAnalysis(path: PathCommand[]): {
	bbox: { xMin: number, yMin: number, xMax: number, yMax: number };
	dimensions: { width: number, height: number };
	commands: { moves: number, lines: number, curves: number, closes: number };
	pathLength: number;
} {
	const bbox = calculateBoundingBox(path);
	const dimensions = {
		width: bbox.xMax - bbox.xMin,
		height: bbox.yMax - bbox.yMin
	};

	// コマンド統計
	const commands = {
		moves: 0,
		lines: 0,
		curves: 0,
		closes: 0
	};

	// パス長の概算
	let pathLength = 0;
	let lastX = 0, lastY = 0;

	for (let i = 0; i < path.length; i++) {
		const cmd = path[i];

		switch (cmd.type) {
			case 'M':
				commands.moves++;
				lastX = cmd.x;
				lastY = cmd.y;
				break;

			case 'L':
				commands.lines++;
				// 直線距離を計算
				pathLength += Math.sqrt(Math.pow(cmd.x - lastX, 2) + Math.pow(cmd.y - lastY, 2));
				lastX = cmd.x;
				lastY = cmd.y;
				break;

			case 'C':
				commands.curves++;
				// ベジェ曲線の長さは複雑なので、ここでは制御点間の距離で近似
				pathLength += Math.sqrt(Math.pow(cmd.x1 - lastX, 2) + Math.pow(cmd.y1 - lastY, 2));
				pathLength += Math.sqrt(Math.pow(cmd.x2 - cmd.x1, 2) + Math.pow(cmd.y2 - cmd.y1, 2));
				pathLength += Math.sqrt(Math.pow(cmd.x - cmd.x2, 2) + Math.pow(cmd.y - cmd.y2, 2));
				lastX = cmd.x;
				lastY = cmd.y;
				break;

			case 'Z':
				commands.closes++;
				// 閉じるパスの長さを追加（最後の点から最初の点まで）
				// 最初のMを見つける
				for (let j = i - 1; j >= 0; j--) {
					if (path[j].type === 'M') {
						const moveCmd = path[j] as { type: 'M', x: number, y: number };
						pathLength += Math.sqrt(Math.pow(moveCmd.x - lastX, 2) + Math.pow(moveCmd.y - lastY, 2));
						lastX = moveCmd.x;
						lastY = moveCmd.y;
						break;
					}
				}
				break;
		}
	}

	return {
		bbox,
		dimensions,
		commands,
		pathLength
	};
}

/**
 * フォントのCFF/CFF2グリフメトリクス統計を取得
 * 
 * @param font フォントオブジェクト
 * @param options オプション設定
 * @returns メトリクス統計
 */
export function getCffGlyphMetricsStatistics(
	font: Font,
	options: {
		sampleSize?: number; // 分析するグリフの最大数（全てのグリフを分析するとパフォーマンスが悪化する可能性がある）
		glyphIds?: number[]; // 特定のグリフIDだけを分析
	} = {}
): object | null {
	if (!hasCffOrCff2Table(font)) {
		return null;
	}

	const table = getCffOrCff2Table(font);
	if (!table) {
		return null;
	}

	// グリフパスを抽出
	const maxGlyphId = table.charStringsIndex.count - 1;

	// 分析するグリフIDを決定
	let glyphIds: number[];

	if (options.glyphIds) {
		// 特定のグリフIDを使用
		glyphIds = options.glyphIds.filter(id => id >= 0 && id <= maxGlyphId);
	} else if (options.sampleSize && options.sampleSize < maxGlyphId + 1) {
		// サンプリング
		const step = Math.max(1, Math.floor((maxGlyphId + 1) / options.sampleSize));
		glyphIds = Array.from({ length: Math.ceil((maxGlyphId + 1) / step) }, (_, i) => i * step)
			.filter(id => id <= maxGlyphId);
	} else {
		// 全てのグリフ
		glyphIds = Array.from({ length: maxGlyphId + 1 }, (_, i) => i);
	}

	// グリフパスを取得
	const glyphPaths = extractGlyphPaths(font, { glyphIds });

	// 統計情報の初期化
	const stats = {
		glyphCount: glyphPaths.size,
		advanceWidth: {
			min: Number.POSITIVE_INFINITY,
			max: Number.NEGATIVE_INFINITY,
			avg: 0,
			median: 0
		},
		pathCommands: {
			moves: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, avg: 0, sum: 0 },
			lines: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, avg: 0, sum: 0 },
			curves: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, avg: 0, sum: 0 },
			closes: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, avg: 0, sum: 0 }
		},
		dimensions: {
			width: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, avg: 0 },
			height: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, avg: 0 }
		},
		boundingBox: {
			xMin: Number.POSITIVE_INFINITY,
			yMin: Number.POSITIVE_INFINITY,
			xMax: Number.NEGATIVE_INFINITY,
			yMax: Number.NEGATIVE_INFINITY
		},
		pathLength: {
			min: Number.POSITIVE_INFINITY,
			max: Number.NEGATIVE_INFINITY,
			avg: 0,
			total: 0
		}
	};

	// 分析のための一時データ格納用
	const advanceWidths: number[] = [];
	const widths: number[] = [];
	const heights: number[] = [];
	const pathLengths: number[] = [];

	// 各グリフを分析
	for (const [glyphId, glyphPath] of glyphPaths.entries()) {
		// 送り幅の統計
		const advanceWidth = glyphPath.advance;
		advanceWidths.push(advanceWidth);
		stats.advanceWidth.min = Math.min(stats.advanceWidth.min, advanceWidth);
		stats.advanceWidth.max = Math.max(stats.advanceWidth.max, advanceWidth);

		// パス分析
		const analysis = getPathAnalysis(glyphPath.path);

		// コマンド統計の更新
		stats.pathCommands.moves.min = Math.min(stats.pathCommands.moves.min, analysis.commands.moves);
		stats.pathCommands.moves.max = Math.max(stats.pathCommands.moves.max, analysis.commands.moves);
		stats.pathCommands.moves.sum += analysis.commands.moves;

		stats.pathCommands.lines.min = Math.min(stats.pathCommands.lines.min, analysis.commands.lines);
		stats.pathCommands.lines.max = Math.max(stats.pathCommands.lines.max, analysis.commands.lines);
		stats.pathCommands.lines.sum += analysis.commands.lines;

		stats.pathCommands.curves.min = Math.min(stats.pathCommands.curves.min, analysis.commands.curves);
		stats.pathCommands.curves.max = Math.max(stats.pathCommands.curves.max, analysis.commands.curves);
		stats.pathCommands.curves.sum += analysis.commands.curves;

		stats.pathCommands.closes.min = Math.min(stats.pathCommands.closes.min, analysis.commands.closes);
		stats.pathCommands.closes.max = Math.max(stats.pathCommands.closes.max, analysis.commands.closes);
		stats.pathCommands.closes.sum += analysis.commands.closes;

		// 寸法統計の更新
		widths.push(analysis.dimensions.width);
		heights.push(analysis.dimensions.height);

		stats.dimensions.width.min = Math.min(stats.dimensions.width.min, analysis.dimensions.width);
		stats.dimensions.width.max = Math.max(stats.dimensions.width.max, analysis.dimensions.width);

		stats.dimensions.height.min = Math.min(stats.dimensions.height.min, analysis.dimensions.height);
		stats.dimensions.height.max = Math.max(stats.dimensions.height.max, analysis.dimensions.height);

		// バウンディングボックス全体の更新
		stats.boundingBox.xMin = Math.min(stats.boundingBox.xMin, analysis.bbox.xMin);
		stats.boundingBox.yMin = Math.min(stats.boundingBox.yMin, analysis.bbox.yMin);
		stats.boundingBox.xMax = Math.max(stats.boundingBox.xMax, analysis.bbox.xMax);
		stats.boundingBox.yMax = Math.max(stats.boundingBox.yMax, analysis.bbox.yMax);

		// パス長の統計更新
		pathLengths.push(analysis.pathLength);
		stats.pathLength.min = Math.min(stats.pathLength.min, analysis.pathLength);
		stats.pathLength.max = Math.max(stats.pathLength.max, analysis.pathLength);
		stats.pathLength.total += analysis.pathLength;
	}

	// 平均値と中央値の計算
	if (advanceWidths.length > 0) {
		stats.advanceWidth.avg = advanceWidths.reduce((sum, val) => sum + val, 0) / advanceWidths.length;

		// 中央値の計算
		advanceWidths.sort((a, b) => a - b);
		const mid = Math.floor(advanceWidths.length / 2);
		stats.advanceWidth.median = advanceWidths.length % 2 === 0
			? (advanceWidths[mid - 1] + advanceWidths[mid]) / 2
			: advanceWidths[mid];
	}

	if (widths.length > 0) {
		stats.dimensions.width.avg = widths.reduce((sum, val) => sum + val, 0) / widths.length;
	}

	if (heights.length > 0) {
		stats.dimensions.height.avg = heights.reduce((sum, val) => sum + val, 0) / heights.length;
	}

	if (pathLengths.length > 0) {
		stats.pathLength.avg = stats.pathLength.total / pathLengths.length;
	}

	if (stats.glyphCount > 0) {
		stats.pathCommands.moves.avg = stats.pathCommands.moves.sum / stats.glyphCount;
		stats.pathCommands.lines.avg = stats.pathCommands.lines.sum / stats.glyphCount;
		stats.pathCommands.curves.avg = stats.pathCommands.curves.sum / stats.glyphCount;
		stats.pathCommands.closes.avg = stats.pathCommands.closes.sum / stats.glyphCount;
	}

	return stats;
}

/**
 * 特定のグリフの詳細なメトリクスを取得
 * 
 * @param font フォントオブジェクト
 * @param glyphId グリフID
 * @returns グリフの詳細メトリクス
 */
export function getGlyphMetricsDetail(font: Font, glyphId: number): object | null {
	if (!hasCffOrCff2Table(font)) {
		return null;
	}

	// 指定されたグリフのパスを取得
	const glyphPaths = extractGlyphPaths(font, { glyphIds: [glyphId] });
	const glyphPath = glyphPaths.get(glyphId);

	if (!glyphPath) {
		return null;
	}

	// パス分析
	const analysis = getPathAnalysis(glyphPath.path);

	return {
		id: glyphId,
		advanceWidth: glyphPath.advance,
		boundingBox: analysis.bbox,
		dimensions: analysis.dimensions,
		commandCounts: analysis.commands,
		pathLength: analysis.pathLength,
		// コンテキスト情報を追加（該当するグリフのどのようなグリフか）
		context: {
			hasOutline: glyphPath.path.length > 0,
			isComposite: false, // CFFは複合グリフの概念がない
			isSpace: analysis.commands.moves === 0 ||
				(analysis.dimensions.width === 0 && analysis.dimensions.height === 0),
			isWide: analysis.dimensions.width > 1.5 * analysis.dimensions.height
		}
	};
}

/**
 * パスの複雑さを数値化する
 * 
 * @param path パスコマンド配列
 * @returns 複雑さスコア（高いほど複雑）
 */
export function calculatePathComplexity(path: PathCommand[]): number {
	// パス分析を取得
	const analysis = getPathAnalysis(path);

	// 複雑さの指標:
	// 1. コマンド数（多いほど複雑）
	const commandCount = analysis.commands.moves + analysis.commands.lines +
		analysis.commands.curves + analysis.commands.closes;

	// 2. 曲線の比率（曲線が多いほど複雑）
	const curveRatio = analysis.commands.curves > 0
		? analysis.commands.curves / (analysis.commands.lines + analysis.commands.curves)
		: 0;

	// 3. パスの長さとバウンディングボックスの面積の比率（長いパスが小さな面積に収まっている場合は複雑）
	const bboxArea = (analysis.bbox.xMax - analysis.bbox.xMin) * (analysis.bbox.yMax - analysis.bbox.yMin);
	const lengthToAreaRatio = bboxArea > 0 ? analysis.pathLength / Math.sqrt(bboxArea) : 0;

	// 複雑さスコアの計算（重み付け）
	const complexityScore = commandCount * 0.5 + curveRatio * 30 + lengthToAreaRatio * 0.2;

	return complexityScore;
}

/**
 * フォント内の最も複雑なグリフを特定する
 * 
 * @param font フォントオブジェクト
 * @param options オプション設定
 * @returns 複雑さでソートされたグリフID配列
 */
export function findMostComplexGlyphs(
	font: Font,
	options: {
		limit?: number; // 返す結果の最大数
		sampleSize?: number; // 分析するグリフの最大数
	} = {}
): { glyphId: number, complexity: number }[] {
	if (!hasCffOrCff2Table(font)) {
		return [];
	}

	const table = getCffOrCff2Table(font);
	if (!table) {
		return [];
	}

	// グリフパスを抽出
	const maxGlyphId = table.charStringsIndex.count - 1;

	// サンプリング
	let glyphIds: number[];
	if (options.sampleSize && options.sampleSize < maxGlyphId + 1) {
		const step = Math.max(1, Math.floor((maxGlyphId + 1) / options.sampleSize));
		glyphIds = Array.from({ length: Math.ceil((maxGlyphId + 1) / step) }, (_, i) => i * step)
			.filter(id => id <= maxGlyphId);
	} else {
		glyphIds = Array.from({ length: maxGlyphId + 1 }, (_, i) => i);
	}

	// グリフパスを取得
	const glyphPaths = extractGlyphPaths(font, { glyphIds });

	// 各グリフの複雑さを計算
	const complexityScores: { glyphId: number, complexity: number }[] = [];

	for (const [glyphId, glyphPath] of glyphPaths.entries()) {
		const complexity = calculatePathComplexity(glyphPath.path);
		complexityScores.push({ glyphId, complexity });
	}

	// 複雑さでソート（降順）
	complexityScores.sort((a, b) => b.complexity - a.complexity);

	// 結果数を制限
	const limit = options.limit || complexityScores.length;
	return complexityScores.slice(0, limit);
}

/**
 * CFF/CFF2フォントの送り幅分布を分析
 * 
 * @param font フォントオブジェクト
 * @returns 送り幅の分布分析
 */
export function analyzeAdvanceWidthDistribution(font: Font): object | null {
	if (!hasCffOrCff2Table(font)) {
		return null;
	}

	// すべてのグリフパスを取得
	const glyphPaths = extractGlyphPaths(font);

	if (glyphPaths.size === 0) {
		return null;
	}

	// 送り幅を収集
	const advanceWidths: number[] = [];
	glyphPaths.forEach(path => advanceWidths.push(path.advance));

	// 基本統計
	const min = Math.min(...advanceWidths);
	const max = Math.max(...advanceWidths);
	const sum = advanceWidths.reduce((acc, val) => acc + val, 0);
	const avg = sum / advanceWidths.length;

	// 中央値
	const sorted = [...advanceWidths].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	const median = sorted.length % 2 === 0
		? (sorted[mid - 1] + sorted[mid]) / 2
		: sorted[mid];

	// ヒストグラムの作成
	const bucketSize = Math.max(1, Math.ceil((max - min) / 20)); // 最大20バケット
	const histogram: Record<string, number> = {};

	sorted.forEach(width => {
		const bucketIndex = Math.floor((width - min) / bucketSize);
		const bucketStart = min + bucketIndex * bucketSize;
		const bucketEnd = bucketStart + bucketSize - 1;
		const bucketLabel = `${bucketStart}-${bucketEnd}`;

		if (!histogram[bucketLabel]) {
			histogram[bucketLabel] = 0;
		}
		histogram[bucketLabel]++;
	});

	// 最頻値
	let mostFrequentWidth = min;
	let maxFrequency = 0;

	Object.entries(histogram).forEach(([bucketLabel, frequency]) => {
		if (frequency > maxFrequency) {
			maxFrequency = frequency;
			// バケットの中央値を最頻値とする
			const [start, end] = bucketLabel.split('-').map(Number);
			mostFrequentWidth = (start + end) / 2;
		}
	});

	// 分布範囲をN分割
	const percentiles: Record<string, number> = {};
	for (let i = 10; i <= 90; i += 10) {
		const index = Math.floor(sorted.length * i / 100);
		percentiles[`${i}%`] = sorted[index];
	}

	// 等幅フォントかどうかを判定
	const isMonospaced = (max - min) / max < 0.01 || new Set(advanceWidths).size <= 2;

	return {
		count: advanceWidths.length,
		min,
		max,
		avg,
		median,
		mostFrequent: mostFrequentWidth,
		range: max - min,
		standardDeviation: Math.sqrt(advanceWidths.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / advanceWidths.length),
		percentiles,
		histogram,
		isMonospaced
	};
}

/**
 * フォント内のすべてのグリフの曲線/直線比率を計算
 * 
 * @param font フォントオブジェクト
 * @returns 曲線/直線比率の分析
 */
export function analyzeCurveToLineRatio(font: Font): object | null {
	if (!hasCffOrCff2Table(font)) {
		return null;
	}

	// すべてのグリフパスを取得
	const glyphPaths = extractGlyphPaths(font);

	if (glyphPaths.size === 0) {
		return null;
	}

	// グリフごとの曲線/直線比率を計算
	const ratios: number[] = [];
	const glyphRatios: { glyphId: number, ratio: number }[] = [];

	let totalCurves = 0;
	let totalLines = 0;

	for (const [glyphId, glyphPath] of glyphPaths.entries()) {
		const analysis = getPathAnalysis(glyphPath.path);

		totalCurves += analysis.commands.curves;
		totalLines += analysis.commands.lines;

		const ratio = analysis.commands.lines > 0
			? analysis.commands.curves / analysis.commands.lines
			: analysis.commands.curves > 0 ? Number.POSITIVE_INFINITY : 0;

		ratios.push(ratio);
		glyphRatios.push({ glyphId, ratio });
	}

	// グリフを曲線/直線比率の高い順にソート
	glyphRatios.sort((a, b) => b.ratio - a.ratio);

	// 基本統計
	const validRatios = ratios.filter(r => r !== Number.POSITIVE_INFINITY);
	const min = validRatios.length > 0 ? Math.min(...validRatios) : 0;
	const max = validRatios.length > 0 ? Math.max(...validRatios) : 0;
	const sum = validRatios.reduce((acc, val) => acc + val, 0);
	const avg = validRatios.length > 0 ? sum / validRatios.length : 0;

	// フォント全体の比率
	const overallRatio = totalLines > 0 ? totalCurves / totalLines : totalCurves > 0 ? Number.POSITIVE_INFINITY : 0;

	// 曲線のみのグリフと直線のみのグリフの数
	const curvesOnlyCount = ratios.filter(r => r === Number.POSITIVE_INFINITY).length;
	const linesOnlyCount = ratios.filter(r => r === 0).length;
	const mixedCount = ratios.filter(r => r > 0 && r < Number.POSITIVE_INFINITY).length;

	return {
		overallRatio: overallRatio === Number.POSITIVE_INFINITY ? "∞" : overallRatio.toFixed(2),
		totalCurves,
		totalLines,
		glyphCount: glyphPaths.size,
		curvesOnlyGlyphs: curvesOnlyCount,
		linesOnlyGlyphs: linesOnlyCount,
		mixedGlyphs: mixedCount,
		ratioStatistics: {
			min,
			max,
			avg,
			median: validRatios.length > 0 ? validRatios.sort((a, b) => a - b)[Math.floor(validRatios.length / 2)] : 0
		},
		// 最も曲線が多いグリフ上位5個
		mostCurvy: glyphRatios.slice(0, 5).map(item => ({
			glyphId: item.glyphId,
			ratio: item.ratio === Number.POSITIVE_INFINITY ? "∞" : item.ratio.toFixed(2)
		})),
		// 曲線と直線のバランスが良いグリフ（比率が1に近いもの）
		mostBalanced: [...glyphRatios]
			.filter(item => item.ratio !== Number.POSITIVE_INFINITY && item.ratio > 0)
			.sort((a, b) => Math.abs(a.ratio - 1) - Math.abs(b.ratio - 1))
			.slice(0, 5)
			.map(item => ({ glyphId: item.glyphId, ratio: item.ratio.toFixed(2) }))
	};
}

/**
 * グリフの対称性を分析する
 * 
 * @param path パスコマンド配列
 * @returns 対称スコア (0〜1、1が完全に対称)
 */
export function analyzeGlyphSymmetry(path: PathCommand[]): {
	horizontalSymmetry: number;
	verticalSymmetry: number;
} {
// 境界