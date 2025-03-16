/**
 * GSUB（グリフ置換）テーブル関連のユーティリティ関数
 */

import { LangSysRecord, LangSysTable } from '../../types/common';
import { Font } from '../../types/font';
import {
	AlternateSubstitutionSubtable,
	GsubLookupType,
	GsubTable,
	LigatureSubstitutionSubtable,
	MultipleSubstitutionSubtable,
	SingleSubstitutionSubtable
} from '../../types/tables/GSUB';

/**
 * GSUBテーブルが存在するかどうかをチェックする
 * 
 * @param font フォントオブジェクト
 * @returns GSUBテーブルが存在する場合はtrue
 */
export function hasGsubTable(font: Font): boolean {
	return font.tables['GSUB'] !== undefined;
}

/**
 * GSUBテーブルからルックアップのリストを取得する
 * 
 * @param gsub GSUBテーブル
 * @returns ルックアップタイプのリスト
 */
export function getGsubLookupTypes(gsub: GsubTable): GsubLookupType[] {
	const lookupTypes: GsubLookupType[] = [];

	if (!gsub || !gsub.lookupList) {
		return lookupTypes;
	}

	for (const lookup of gsub.lookupList) {
		if (!lookupTypes.includes(lookup.lookupType)) {
			lookupTypes.push(lookup.lookupType);
		}
	}

	return lookupTypes;
}

/**
 * GSUBテーブルからルックアップタイプの説明を取得する
 * 
 * @param lookupType ルックアップタイプ
 * @returns ルックアップタイプの説明
 */
export function getGsubLookupTypeDescription(lookupType: GsubLookupType): string {
	switch (lookupType) {
		case GsubLookupType.SINGLE:
			return '単一置換';
		case GsubLookupType.MULTIPLE:
			return '複数置換';
		case GsubLookupType.ALTERNATE:
			return '代替置換';
		case GsubLookupType.LIGATURE:
			return '合字置換';
		case GsubLookupType.CONTEXTUAL:
			return '文脈依存置換';
		case GsubLookupType.CHAINING_CONTEXTUAL:
			return '連鎖文脈依存置換';
		case GsubLookupType.EXTENSION_SUBSTITUTION:
			return '拡張置換';
		case GsubLookupType.REVERSE_CHAINING_CONTEXTUAL:
			return '逆連鎖文脈依存単一置換';
		default:
			return `未知のルックアップタイプ: ${lookupType}`;
	}
}

/**
 * 単一置換サブテーブルの詳細を取得する
 * 
 * @param subtable 単一置換サブテーブル
 * @returns 単一置換の詳細情報
 */
export function getSingleSubstitutionDetails(subtable: SingleSubstitutionSubtable): object {
	return {
		format: subtable.substFormat,
		glyphCount: subtable.coverage.length,
		substitutionType: subtable.substFormat === 1
			? `デルタ置換 (${subtable.deltaGlyphID})`
			: '直接置換'
	};
}

/**
 * 複数置換サブテーブルの詳細を取得する
 * 
 * @param subtable 複数置換サブテーブル
 * @returns 複数置換の詳細情報
 */
export function getMultipleSubstitutionDetails(subtable: MultipleSubstitutionSubtable): object {
	return {
		sequenceCount: subtable.sequenceCount,
		maxReplacementLength: Math.max(...subtable.sequences.map(seq => seq.length)),
		coverageGlyphCount: subtable.coverage.length
	};
}

/**
 * 代替置換サブテーブルの詳細を取得する
 * 
 * @param subtable 代替置換サブテーブル
 * @returns 代替置換の詳細情報
 */
export function getAlternateSubstitutionDetails(subtable: AlternateSubstitutionSubtable): object {
	return {
		alternateSetCount: subtable.alternateSetCount,
		maxAlternatesPerGlyph: Math.max(...subtable.alternateSets.map(set => set.length)),
		coverageGlyphCount: subtable.coverage.length
	};
}

/**
 * 合字置換サブテーブルの詳細を取得する
 * 
 * @param subtable 合字置換サブテーブル
 * @returns 合字置換の詳細情報
 */
export function getLigatureSubstitutionDetails(subtable: LigatureSubstitutionSubtable): object {
	return {
		ligatureSetCount: subtable.ligatureSetCount,
		maxComponentCount: Math.max(...subtable.ligatureSets.map(
			set => Math.max(...set.ligatures.map(lig => lig.componentCount))
		)),
		coverageGlyphCount: subtable.coverage.length
	};
}

/**
 * GSUBテーブルの概要情報を取得する
 * 
 * @param font フォントオブジェクト
 * @returns GSUBテーブルの概要情報
 */
export function getGsubSummary(font: Font): object | null {
	const gsubTable = font.tables['GSUB']?.table as GsubTable;

	if (!gsubTable) {
		return null;
	}

	const lookupTypes = getGsubLookupTypes(gsubTable);
	const lookupDescriptions = lookupTypes.map(type => getGsubLookupTypeDescription(type));

	const summary = {
		version: gsubTable.header.version === 0x00010000 ? '1.0' : '1.1',
		scriptCount: gsubTable.scriptList.length,
		featureCount: gsubTable.featureList.length,
		lookupCount: gsubTable.lookupList.length,
		lookupTypes: lookupDescriptions,
		hasFeatureVariations: gsubTable.header.featureVariationsOffset !== undefined &&
			gsubTable.header.featureVariationsOffset > 0
	};

	return summary;
}

/**
 * 特定スクリプトと言語のGSUB機能を取得する
 * 
 * @param gsub GSUBテーブル
 * @param scriptTag スクリプトタグ (例: 'latn')
 * @param langTag 言語タグ (省略可、デフォルトは言語システムを使用)
 * @returns 機能タグのリスト
 */
export function getGsubFeatures(gsub: GsubTable, scriptTag: string, langTag?: string): string[] {
	if (!gsub || !gsub.scriptList || !gsub.featureList) {
		return [];
	}

	// スクリプトを探す
	const script = gsub.scriptList.find(s => s.scriptTag === scriptTag);
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
		if (index < gsub.featureList.length) {
			features.push(gsub.featureList[index].featureTag);
		}
	}

	return features;
}
