/**
 * GPOS（グリフ配置）テーブル関連のユーティリティ関数
 */

import { LangSysRecord, LangSysTable } from '../../types/common';
import { Font } from '../../types/font';
import { AnchorPoint, GposLookupType, GposTable } from '../../types/tables/GPOS';

/**
 * GPOSテーブルが存在するかどうかをチェックする
 * 
 * @param font フォントオブジェクト
 * @returns GPOSテーブルが存在する場合はtrue
 */
export function hasGposTable(font: Font): boolean {
	return font.tables['GPOS'] !== undefined;
}

/**
 * GPOSテーブルからルックアップのリストを取得する
 * 
 * @param gpos GPOSテーブル
 * @returns ルックアップタイプのリスト
 */
export function getGposLookupTypes(gpos: GposTable): GposLookupType[] {
	const lookupTypes: GposLookupType[] = [];

	if (!gpos || !gpos.lookupList) {
		return lookupTypes;
	}

	for (const lookup of gpos.lookupList) {
		if (!lookupTypes.includes(lookup.lookupType)) {
			lookupTypes.push(lookup.lookupType);
		}
	}

	return lookupTypes;
}

/**
 * GPOSテーブルからルックアップタイプの説明を取得する
 * 
 * @param lookupType ルックアップタイプ
 * @returns ルックアップタイプの説明
 */
export function getGposLookupTypeDescription(lookupType: GposLookupType): string {
	switch (lookupType) {
		case GposLookupType.SINGLE_ADJUSTMENT:
			return '単一位置調整';
		case GposLookupType.PAIR_ADJUSTMENT:
			return 'ペア位置調整';
		case GposLookupType.CURSIVE_ATTACHMENT:
			return '筆記体接続';
		case GposLookupType.MARK_TO_BASE_ATTACHMENT:
			return 'マークとベースの接続';
		case GposLookupType.MARK_TO_LIGATURE_ATTACHMENT:
			return 'マークと合字の接続';
		case GposLookupType.MARK_TO_MARK_ATTACHMENT:
			return 'マーク同士の接続';
		case GposLookupType.CONTEXTUAL_POSITIONING:
			return '文脈依存位置調整';
		case GposLookupType.CHAINED_CONTEXTUAL_POSITIONING:
			return '連鎖文脈依存位置調整';
		case GposLookupType.EXTENSION_POSITIONING:
			return '拡張位置調整';
		default:
			return `未知のルックアップタイプ: ${lookupType}`;
	}
}

/**
 * GPOSアンカーポイントの情報を文字列で取得する
 * 
 * @param anchor アンカーポイント
 * @returns アンカーポイントの情報を表す文字列
 */
export function formatAnchorPoint(anchor: AnchorPoint | null | undefined): string {
	if (!anchor) {
		return '未定義';
	}

	let info = `(${anchor.xCoordinate}, ${anchor.yCoordinate})`;

	if (anchor.anchorFormat === 2 && anchor.anchorPoint !== undefined) {
		info += ` コントロールポイント: ${anchor.anchorPoint}`;
	} else if (anchor.anchorFormat === 3) {
		info += ' デバイス調整あり';
	}

	return info;
}

/**
 * GPOSテーブルの概要情報を取得する
 * 
 * @param font フォントオブジェクト
 * @returns GPOSテーブルの概要情報
 */
export function getGposSummary(font: Font): object | null {
	const gposTable = font.tables['GPOS']?.table as GposTable;

	if (!gposTable) {
		return null;
	}

	const lookupTypes = getGposLookupTypes(gposTable);
	const lookupDescriptions = lookupTypes.map(type => getGposLookupTypeDescription(type));

	const summary = {
		version: gposTable.header.version === 0x00010000 ? '1.0' : '1.1',
		scriptCount: gposTable.scriptList.length,
		featureCount: gposTable.featureList.length,
		lookupCount: gposTable.lookupList.length,
		lookupTypes: lookupDescriptions,
		hasFeatureVariations: gposTable.header.featureVariationsOffset !== undefined &&
			gposTable.header.featureVariationsOffset > 0
	};

	return summary;
}

/**
 * 特定スクリプトと言語のGPOS機能を取得する
 * 
 * @param gpos GPOSテーブル
 * @param scriptTag スクリプトタグ (例: 'latn')
 * @param langTag 言語タグ (省略可、デフォルトは言語システムを使用)
 * @returns 機能タグのリスト
 */
export function getGposFeatures(gpos: GposTable, scriptTag: string, langTag?: string): string[] {
	if (!gpos || !gpos.scriptList || !gpos.featureList) {
		return [];
	}

	// スクリプトを探す
	const script = gpos.scriptList.find(s => s.scriptTag === scriptTag);
	if (!script) {
		return [];
	}

	// 言語システムを取得
	let langSys: LangSysTable | undefined;
	if (langTag) {
		const langRecord = script.langSysRecords.find((l: LangSysRecord) => l.langSysTag === langTag);
		if (langRecord) {
			langSys = langRecord.langSys;
		}
	} else {
		// デフォルト言語システムを使用
		langSys = script.defaultLangSys;
	}

	if (!langSys) {
		return [];
	}

	// 機能インデックスを取得
	const featureIndices = langSys.featureIndices;
	const features: string[] = [];

	// 対応する機能タグを収集
	for (const index of featureIndices) {
		if (index < gpos.featureList.length) {
			features.push(gpos.featureList[index].featureTag);
		}
	}

	return features;
}