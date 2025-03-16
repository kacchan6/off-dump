/**
 * BASE テーブル関連のユーティリティ関数
 */

import { Font } from '../../types/font';
import {
	BaseTable,
	BaseVersion,
	BaselineTag,
	BaseAxisTable,
	BaseCoordinateRecord
} from '../../types/tables/BASE';

/**
 * フォントにBASEテーブルが存在するかをチェックする
 * 
 * @param font フォントオブジェクト
 * @returns BASEテーブルが存在する場合はtrue
 */
export function hasBaseTable(font: Font): boolean {
	return font.tables['BASE'] !== undefined;
}

/**
 * ベースラインタグを人間が読める形式に変換する
 * 
 * @param tag ベースラインタグ
 * @returns タグの説明
 */
export function getBaselineTagDescription(tag: BaselineTag): string {
	switch (tag) {
		case BaselineTag.ROMAN:
			return 'ラテン文字のベースライン';
		case BaselineTag.HANGING:
			return 'ぶら下げベースライン';
		case BaselineTag.IDEOGRAPHIC:
			return 'イデオグラフィックベースライン';
		case BaselineTag.MATHEMATICAL:
			return '数学記号のベースライン';
		default:
			return `不明なベースラインタグ: ${tag}`;
	}
}

/**
 * BASEテーブルの基本情報を取得する
 * 
 * @param font フォントオブジェクト
 * @returns BASEテーブルの基本情報
 */
export function getBaseSummary(font: Font): object | null {
	const baseTable = font.tables['BASE']?.table as BaseTable;

	if (!baseTable) {
		return null;
	}

	const summary: any = {
		version: baseTable.version === BaseVersion.VERSION_1_0 ? '1.0' : 'Unknown',
		scriptCount: baseTable.scriptList.length
	};

	// 水平軸情報
	if (baseTable.horizAxis) {
		summary.horizontalAxis = analyzeBaseAxisTable(baseTable.horizAxis);
	}

	// 垂直軸情報
	if (baseTable.vertAxis) {
		summary.verticalAxis = analyzeBaseAxisTable(baseTable.vertAxis);
	}

	return summary;
}

/**
 * 軸テーブルの詳細を分析する
 * 
 * @param axisTable 軸テーブル
 * @returns 軸テーブルの分析結果
 */
export function analyzeBaseAxisTable(axisTable: BaseAxisTable): object {
	const analysis: any = {
		baseCoordinate: axisTable.baseCoordTable.defaultCoordinate
	};

	// 特定スクリプトや言語の座標レコードを分析
	if (axisTable.baseCoordTable.coordinateRecords) {
		analysis.coordinateRecordCount = axisTable.baseCoordTable.coordinateRecords.length;
		analysis.coordinateRecords = axisTable.baseCoordTable.coordinateRecords.map(analyzeCoordinateRecord);
	}

	// 最小座標テーブルがある場合
	if (axisTable.minCoordTable) {
		analysis.minCoordinate = axisTable.minCoordTable.defaultCoordinate;
		if (axisTable.minCoordTable.coordinateRecords) {
			analysis.minCoordinateRecords = axisTable.minCoordTable.coordinateRecords.map(analyzeCoordinateRecord);
		}
	}

	// 最大座標テーブルがある場合
	if (axisTable.maxCoordTable) {
		analysis.maxCoordinate = axisTable.maxCoordTable.defaultCoordinate;
		if (axisTable.maxCoordTable.coordinateRecords) {
			analysis.maxCoordinateRecords = axisTable.maxCoordTable.coordinateRecords.map(analyzeCoordinateRecord);
		}
	}

	return analysis;
}

/**
 * 座標レコードの詳細を分析する
 * 
 * @param record 座標レコード
 * @returns 座標レコードの分析結果
 */
export function analyzeCoordinateRecord(record: BaseCoordinateRecord): object {
	const analysis: any = {
		scriptTag: record.scriptTag,
		coordinate: record.coordinate
	};

	// 言語タグがある場合は追加
	if (record.languageTag) {
		analysis.languageTag = record.languageTag;
	}

	// デバイステーブルがある場合は追加情報を含める
	if (record.deviceTable) {
		analysis.deviceTable = {
			startSize: record.deviceTable.startSize,
			endSize: record.deviceTable.endSize,
			deltaFormat: record.deviceTable.deltaFormat,
			deltaValuesCount: record.deviceTable.deltaValues.length
		};
	}

	return analysis;
}

/**
 * フォントのベースラインスクリプトを取得する
 * 
 * @param baseTable BASEテーブル
 * @returns ベースラインスクリプトの情報
 */
export function getBaselineScripts(baseTable: BaseTable): object[] {
	return baseTable.scriptList.map(script => ({
		defaultBaselineTag: getBaselineTagDescription(script.defaultBaselineTag),
		baselineRecords: script.baselineRecords.map(record => ({
			baselineTag: getBaselineTagDescription(record.baselineTag),
			anchorFormat: record.baselineAnchor.format,
			xCoordinate: record.baselineAnchor.xCoordinate,
			yCoordinate: record.baselineAnchor.yCoordinate
		}))
	}));
}

/**
 * ベースラインタグのリストを取得する
 * 
 * @param baseTable BASEテーブル
 * @returns ベースラインタグのリスト
 */
export function listBaselineTags(baseTable: BaseTable): BaselineTag[] {
	const tags = new Set<BaselineTag>();

	// デフォルトベースラインタグを追加
	baseTable.scriptList.forEach(script => {
		tags.add(script.defaultBaselineTag);
	});

	// ベースラインレコードからタグを追加
	baseTable.scriptList.forEach(script => {
		script.baselineRecords.forEach(record => {
			tags.add(record.baselineTag);
		});
	});

	return Array.from(tags);
}
