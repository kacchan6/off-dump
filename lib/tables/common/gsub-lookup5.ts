/**
 * GSUB ルックアップタイプ5 - 文脈依存置換サブテーブル
 * 特定のグリフシーケンスに基づいてグリフを置換する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gsub#lookuptype-5-contextual-substitution-subtable
 */

import { DataReader } from '../../utils/data-reader';
import {
	GsubLookupType,
	ContextualSubstitutionSubtable,
	ContextualSubstitutionFormat1Subtable,
	ContextualSubstitutionFormat2Subtable,
	ContextualSubstitutionFormat3Subtable,
	SubstLookupRecord
} from '../../types/tables/GSUB';
import { parseCoverageTable, parseClassDefTable } from './gpos-gsub';

/**
 * 置換ルックアップレコードを解析する
 * 
 * @param reader データリーダー
 * @param count レコードの数
 * @returns 置換ルックアップレコードの配列
 */
function parseSubstLookupRecords(reader: DataReader, count: number): SubstLookupRecord[] {
	const records: SubstLookupRecord[] = [];

	for (let i = 0; i < count; i++) {
		records.push({
			sequenceIndex: reader.readUInt16(),
			lookupListIndex: reader.readUInt16()
		});
	}

	return records;
}

/**
 * フォーマット1の文脈依存置換サブテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns フォーマット1の文脈依存置換サブテーブル
 */
function parseContextualSubstitutionFormat1(
	reader: DataReader,
	offset: number
): ContextualSubstitutionFormat1Subtable {
	// オフセット位置に移動
	reader.seek(offset);

	const substFormat = reader.readUInt16();
	const coverageOffset = reader.readUInt16();
	const subRuleSetCount = reader.readUInt16();

	// カバレッジテーブルを解析
	const coverage = parseCoverageTable(reader, offset + coverageOffset);

	// 置換ルールセットのオフセットを読み取る
	const subRuleSetOffsets: number[] = [];
	for (let i = 0; i < subRuleSetCount; i++) {
		subRuleSetOffsets.push(reader.readUInt16() + offset);
	}

	// 各置換ルールセットを解析
	const subRuleSets = [];

	for (const ruleSetOffset of subRuleSetOffsets) {
		reader.save();
		reader.seek(ruleSetOffset);

		const subRuleCount = reader.readUInt16();
		const subRuleOffsets: number[] = [];

		// ルールオフセットを読み取る
		for (let i = 0; i < subRuleCount; i++) {
			subRuleOffsets.push(reader.readUInt16() + ruleSetOffset);
		}

		// 各ルールを解析
		const subRules = [];

		for (const ruleOffset of subRuleOffsets) {
			reader.save();
			reader.seek(ruleOffset);

			const glyphCount = reader.readUInt16();
			const substCount = reader.readUInt16();

			// 入力シーケンスを読み取る（最初のグリフを除く）
			const inputSequence: number[] = [];
			for (let i = 0; i < glyphCount - 1; i++) {
				inputSequence.push(reader.readUInt16());
			}

			// 置換ルックアップレコードを読み取る
			const substLookupRecords = parseSubstLookupRecords(reader, substCount);

			subRules.push({
				glyphCount,
				inputSequence,
				substCount,
				substLookupRecords
			});

			reader.restore();
		}

		subRuleSets.push({
			subRuleCount,
			subRules
		});

		reader.restore();
	}

	return {
		type: GsubLookupType.CONTEXTUAL,
		substFormat: 1 as const,
		coverage,
		subRuleSetCount,
		subRuleSets
	};
}

/**
 * フォーマット2の文脈依存置換サブテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns フォーマット2の文脈依存置換サブテーブル
 */
function parseContextualSubstitutionFormat2(
	reader: DataReader,
	offset: number
): ContextualSubstitutionFormat2Subtable {
	// オフセット位置に移動
	reader.seek(offset);

	const substFormat = reader.readUInt16();
	const coverageOffset = reader.readUInt16();
	const classDefOffset = reader.readUInt16();
	const subClassSetCount = reader.readUInt16();

	// カバレッジテーブルとクラス定義テーブルを解析
	const coverage = parseCoverageTable(reader, offset + coverageOffset);
	const classDef = parseClassDefTable(reader, offset + classDefOffset);

	// クラスセットのオフセットを読み取る
	const classSetOffsets: (number | null)[] = [];
	for (let i = 0; i < subClassSetCount; i++) {
		const classSetOffset = reader.readUInt16();
		classSetOffsets.push(classSetOffset !== 0 ? classSetOffset + offset : null);
	}

	// 各クラスセットを解析
	const classSet: (any | null)[] = [];

	for (const classSetOffset of classSetOffsets) {
		if (classSetOffset === null) {
			classSet.push(null);
			continue;
		}

		reader.save();
		reader.seek(classSetOffset);

		const subClassRuleCount = reader.readUInt16();
		const subClassRuleOffsets: number[] = [];

		// クラスルールオフセットを読み取る
		for (let i = 0; i < subClassRuleCount; i++) {
			subClassRuleOffsets.push(reader.readUInt16() + classSetOffset);
		}

		// 各クラスルールを解析
		const subClassRules = [];

		for (const ruleOffset of subClassRuleOffsets) {
			reader.save();
			reader.seek(ruleOffset);

			const glyphCount = reader.readUInt16();
			const substCount = reader.readUInt16();

			// クラスシーケンスを読み取る（最初のクラスを除く）
			const classSequence: number[] = [];
			for (let i = 0; i < glyphCount - 1; i++) {
				classSequence.push(reader.readUInt16());
			}

			// 置換ルックアップレコードを読み取る
			const substLookupRecords = parseSubstLookupRecords(reader, substCount);

			subClassRules.push({
				glyphCount,
				classSequence,
				substCount,
				substLookupRecords
			});

			reader.restore();
		}

		classSet.push({
			subClassRuleCount,
			subClassRules
		});

		reader.restore();
	}

	return {
		type: GsubLookupType.CONTEXTUAL,
		substFormat: 2 as const,
		coverage,
		classDef,
		classSetCount: subClassSetCount,
		classSet
	};
}

/**
 * フォーマット3の文脈依存置換サブテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns フォーマット3の文脈依存置換サブテーブル
 */
function parseContextualSubstitutionFormat3(
	reader: DataReader,
	offset: number
): ContextualSubstitutionFormat3Subtable {
	// オフセット位置に移動
	reader.seek(offset);

	const substFormat = reader.readUInt16();
	const glyphCount = reader.readUInt16();
	const substCount = reader.readUInt16();

	// 各グリフのカバレッジテーブルを解析
	const coverageOffsets: number[] = [];
	for (let i = 0; i < glyphCount; i++) {
		coverageOffsets.push(reader.readUInt16() + offset);
	}

	const coverages: number[][] = [];
	for (const coverageOffset of coverageOffsets) {
		coverages.push(parseCoverageTable(reader, coverageOffset));
	}

	// 置換ルックアップレコードを解析
	const substLookupRecords = parseSubstLookupRecords(reader, substCount);

	return {
		type: GsubLookupType.CONTEXTUAL,
		substFormat: 3 as const,
		glyphCount,
		coverages,
		substCount,
		substLookupRecords
	};
}

/**
 * 文脈依存置換サブテーブル（ルックアップタイプ5）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns 文脈依存置換サブテーブル
 */
export function parseContextualSubstitutionSubtable(
	reader: DataReader,
	offset: number
): ContextualSubstitutionSubtable {
	// 位置を保存
	reader.save();

	try {
		// まずフォーマットタイプを読み取る
		reader.seek(offset);
		const substFormat = reader.readUInt16();

		// フォーマットに応じたパーサーを呼び出す
		switch (substFormat) {
			case 1:
				return parseContextualSubstitutionFormat1(reader, offset);
			case 2:
				return parseContextualSubstitutionFormat2(reader, offset);
			case 3:
				return parseContextualSubstitutionFormat3(reader, offset);
			default:
				throw new Error(`対応していない文脈依存置換フォーマット: ${substFormat}`);
		}
	} finally {
		// 位置を復元
		reader.restore();
	}
}
