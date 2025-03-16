/**
 * BASE テーブル関連のユーティリティ関数
 */

import { Font } from '../../types/font';
import {
	BaseTable,
	BaseVersion,
	BaselineTag,
	BaseAxisTable,
	BaseScriptRecord,
	BaseValuesTable,
	BaseCoordTable
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
		version: baseTable.version === BaseVersion.VERSION_1_0 ? '1.0' : '1.1'
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
		baselineTags: axisTable.baseTagList.baselineTags,
		scriptCount: axisTable.baseScriptList.length
	};

	// スクリプト情報を追加
	analysis.scripts = axisTable.baseScriptList.map(script => ({
		tag: script.baseScriptTag,
		hasBaseValues: !!script.baseScript.baseValues,
		hasDefaultMinMax: !!script.baseScript.defaultMinMax,
		langSysCount: script.baseScript.baseLangSysRecords?.length || 0
	}));

	return analysis;
}

/**
 * 座標テーブルの詳細を分析する
 * 
 * @param coordTable 座標テーブル
 * @returns 座標テーブルの分析結果
 */
export function analyzeBaseCoordTable(coordTable: BaseCoordTable): object {
	const analysis: any = {
		format: coordTable.baseCoordFormat,
		coordinate: coordTable.coordinate
	};

	// フォーマットに応じた追加情報
	if (coordTable.baseCoordFormat === 2) {
		analysis.referenceGlyph = coordTable.referenceGlyph;
		analysis.baselineIndex = coordTable.baselineIndex;
	} else if (coordTable.baseCoordFormat === 3 && coordTable.deviceTable) {
		analysis.hasDeviceTable = true;
		analysis.deviceTable = {
			startSize: coordTable.deviceTable.startSize,
			endSize: coordTable.deviceTable.endSize,
			deltaFormat: coordTable.deviceTable.deltaFormat
		};
	}

	return analysis;
}

/**
 * ベースライン値テーブルの詳細を分析する
 * 
 * @param valuesTable ベースライン値テーブル
 * @param tagList ベースラインタグリスト
 * @returns ベースライン値テーブルの分析結果
 */
export function analyzeBaseValuesTable(valuesTable: BaseValuesTable, baselineTags: BaselineTag[]): object {
	const analysis: any = {
		defaultBaselineIndex: valuesTable.defaultIndex,
		defaultBaselineTag: baselineTags[valuesTable.defaultIndex] || 'Unknown'
	};

	// 座標情報を追加
	analysis.baseCoords = valuesTable.baseCoords.map((coord, index) => ({
		baselineTag: baselineTags[index] || `Unknown-${index}`,
		...analyzeBaseCoordTable(coord)
	}));

	return analysis;
}

/**
 * フォントのベースラインスクリプトを取得する
 * 
 * @param baseTable BASEテーブル
 * @returns ベースラインスクリプトの情報
 */
export function getBaselineScripts(baseTable: BaseTable): object[] {
	const scripts: object[] = [];

	// 水平軸のスクリプト
	if (baseTable.horizAxis) {
		baseTable.horizAxis.baseScriptList.forEach(scriptRecord => {
			scripts.push({
				axis: 'horizontal',
				tag: scriptRecord.baseScriptTag,
				hasBaseValues: !!scriptRecord.baseScript.baseValues,
				hasDefaultMinMax: !!scriptRecord.baseScript.defaultMinMax,
				langSysCount: scriptRecord.baseScript.baseLangSysRecords?.length || 0
			});
		});
	}

	// 垂直軸のスクリプト
	if (baseTable.vertAxis) {
		baseTable.vertAxis.baseScriptList.forEach(scriptRecord => {
			scripts.push({
				axis: 'vertical',
				tag: scriptRecord.baseScriptTag,
				hasBaseValues: !!scriptRecord.baseScript.baseValues,
				hasDefaultMinMax: !!scriptRecord.baseScript.defaultMinMax,
				langSysCount: scriptRecord.baseScript.baseLangSysRecords?.length || 0
			});
		});
	}

	return scripts;
}

/**
 * ベースラインタグのリストを取得する
 * 
 * @param baseTable BASEテーブル
 * @returns ベースラインタグのリスト
 */
export function listBaselineTags(baseTable: BaseTable): BaselineTag[] {
	const tags = new Set<BaselineTag>();

	// 水平軸のベースラインタグ
	if (baseTable.horizAxis && baseTable.horizAxis.baseTagList) {
		baseTable.horizAxis.baseTagList.baselineTags.forEach(tag => tags.add(tag));
	}

	// 垂直軸のベースラインタグ
	if (baseTable.vertAxis && baseTable.vertAxis.baseTagList) {
		baseTable.vertAxis.baseTagList.baselineTags.forEach(tag => tags.add(tag));
	}

	return Array.from(tags);
}

/**
 * 特定スクリプトのベースライン値を取得する
 * 
 * @param baseTable BASEテーブル
 * @param scriptTag スクリプトタグ (例: 'latn')
 * @param axisType 軸タイプ ('horizontal' または 'vertical')
 * @returns ベースライン値の情報
 */
export function getScriptBaselineValues(
	baseTable: BaseTable,
	scriptTag: string,
	axisType: 'horizontal' | 'vertical' = 'horizontal'
): object | null {
	// 軸テーブルを選択
	const axisTable = axisType === 'horizontal' ? baseTable.horizAxis : baseTable.vertAxis;
	if (!axisTable) {
		return null;
	}

	// スクリプトを検索
	const scriptRecord = axisTable.baseScriptList.find(
		record => record.baseScriptTag === scriptTag
	);
	if (!scriptRecord || !scriptRecord.baseScript.baseValues) {
		return null;
	}

	// ベースライン値を分析
	return analyzeBaseValuesTable(
		scriptRecord.baseScript.baseValues,
		axisTable.baseTagList.baselineTags
	);
}
