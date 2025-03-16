/**
 * GPOS ルックアップタイプ7 - 文脈依存位置調整サブテーブル
 * 特定のグリフシーケンスに応じて位置調整を適用する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gpos#lookuptype-7-contextual-positioning-subtables
 */

import { DataReader } from '../../utils/data-reader';
import {
	GposLookupType,
	ContextualPositioningSubtable,
	ContextualPositioningFormat1Subtable,
	ContextualPositioningFormat2Subtable,
	ContextualPositioningFormat3Subtable,
	PosLookupRecord,
	PosRule,
	PosRuleSet,
	PosClassRule,
	PosClassSet
} from '../../types/tables/GPOS';
import { parseCoverageTable, parseClassDefTable } from './common';

/**
 * 位置調整ルックアップレコードを解析する
 * 
 * @param reader データリーダー
 * @param count レコードの数
 * @returns 位置調整ルックアップレコードの配列
 */
function parsePosLookupRecords(reader: DataReader, count: number): PosLookupRecord[] {
	const records: PosLookupRecord[] = [];

	for (let i = 0; i < count; i++) {
		records.push({
			sequenceIndex: reader.readUInt16(),
			lookupListIndex: reader.readUInt16()
		});
	}

	return records;
}

/**
 * フォーマット1の文脈依存位置調整サブテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns フォーマット1の文脈依存位置調整サブテーブル
 */
function parseContextualPositioningFormat1(
	reader: DataReader,
	offset: number
): ContextualPositioningFormat1Subtable {
	// オフセット位置に移動
	reader.seek(offset);

	const posFormat = reader.readUInt16();
	const coverageOffset = reader.readUInt16();
	const posRuleSetCount = reader.readUInt16();

	// カバレッジテーブルを解析
	const coverage = parseCoverageTable(reader, offset + coverageOffset);

	// ポジショニングルールセットのオフセットを読み取る
	const posRuleSetOffsets: number[] = [];
	for (let i = 0; i < posRuleSetCount; i++) {
		posRuleSetOffsets.push(reader.readUInt16() + offset);
	}

	// 各ポジショニングルールセットを解析
	const posRuleSets: PosRuleSet[] = [];

	for (const ruleSetOffset of posRuleSetOffsets) {
		reader.save();
		reader.seek(ruleSetOffset);

		const posRuleCount = reader.readUInt16();
		const posRuleOffsets: number[] = [];

		// ルールオフセットを読み取る
		for (let i = 0; i < posRuleCount; i++) {
			posRuleOffsets.push(reader.readUInt16() + ruleSetOffset);
		}

		// 各ルールを解析
		const posRules: PosRule[] = [];

		for (const ruleOffset of posRuleOffsets) {
			reader.save();
			reader.seek(ruleOffset);

			const glyphCount = reader.readUInt16();
			const posCount = reader.readUInt16();

			// 入力シーケンスを読み取る（最初のグリフを除く）
			const inputSequence: number[] = [];
			for (let i = 0; i < glyphCount - 1; i++) {
				inputSequence.push(reader.readUInt16());
			}

			// 位置調整ルックアップレコードを読み取る
			const posLookupRecords = parsePosLookupRecords(reader, posCount);

			posRules.push({
				glyphCount,
				inputSequence,
				posCount,
				posLookupRecords
			});

			reader.restore();
		}

		posRuleSets.push({
			posRuleCount,
			posRuleOffsets,
			posRules
		});

		reader.restore();
	}

	return {
		type: GposLookupType.CONTEXTUAL_POSITIONING,
		posFormat: 1 as const, // Use a const assertion to match the literal type '1'
		coverage,
		posRuleSetCount,
		posRuleSetOffsets,
		posRuleSets
	};
}

/**
 * フォーマット2の文脈依存位置調整サブテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns フォーマット2の文脈依存位置調整サブテーブル
 */
function parseContextualPositioningFormat2(
	reader: DataReader,
	offset: number
): ContextualPositioningFormat2Subtable {
	// オフセット位置に移動
	reader.seek(offset);

	const posFormat = reader.readUInt16();
	const coverageOffset = reader.readUInt16();
	const classDefOffset = reader.readUInt16();
	const classSetCount = reader.readUInt16();

	// カバレッジテーブルとクラス定義テーブルを解析
	const coverage = parseCoverageTable(reader, offset + coverageOffset);
	const classDef = parseClassDefTable(reader, offset + classDefOffset);

	// クラスセットのオフセットを読み取る
	const classSetOffsets: (number | null)[] = [];
	for (let i = 0; i < classSetCount; i++) {
		const classSetOffset = reader.readUInt16();
		classSetOffsets.push(classSetOffset !== 0 ? classSetOffset + offset : null);
	}

	// 各クラスセットを解析
	const classSets: (PosClassSet | null)[] = [];

	for (const classSetOffset of classSetOffsets) {
		if (classSetOffset === null) {
			classSets.push(null);
			continue;
		}

		reader.save();
		reader.seek(classSetOffset);

		const posClassRuleCount = reader.readUInt16();
		const posClassRuleOffsets: number[] = [];

		// クラスルールオフセットを読み取る
		for (let i = 0; i < posClassRuleCount; i++) {
			posClassRuleOffsets.push(reader.readUInt16() + classSetOffset);
		}

		// 各クラスルールを解析
		const posClassRules: PosClassRule[] = [];

		for (const ruleOffset of posClassRuleOffsets) {
			reader.save();
			reader.seek(ruleOffset);

			const glyphCount = reader.readUInt16();
			const posCount = reader.readUInt16();

			// クラスシーケンスを読み取る（最初のクラスを除く）
			const classSequence: number[] = [];
			for (let i = 0; i < glyphCount - 1; i++) {
				classSequence.push(reader.readUInt16());
			}

			// 位置調整ルックアップレコードを読み取る
			const posLookupRecords = parsePosLookupRecords(reader, posCount);

			posClassRules.push({
				glyphCount,
				classSequence,
				posCount,
				posLookupRecords
			});

			reader.restore();
		}

		classSets.push({
			posClassRuleCount,
			posClassRuleOffsets,
			posClassRules
		});

		reader.restore();
	}

	return {
		type: GposLookupType.CONTEXTUAL_POSITIONING,
		posFormat: 2 as const, // Use a const assertion to match the literal type '2'
		coverage,
		classDef,
		classSetCount,
		classSetOffsets,
		classSets
	};
}

/**
 * フォーマット3の文脈依存位置調整サブテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns フォーマット3の文脈依存位置調整サブテーブル
 */
function parseContextualPositioningFormat3(
	reader: DataReader,
	offset: number
): ContextualPositioningFormat3Subtable {
	// オフセット位置に移動
	reader.seek(offset);

	const posFormat = reader.readUInt16();
	const glyphCount = reader.readUInt16();
	const posCount = reader.readUInt16();

	// 各グリフのカバレッジテーブルを解析
	const coverageOffsets: number[] = [];
	for (let i = 0; i < glyphCount; i++) {
		coverageOffsets.push(reader.readUInt16() + offset);
	}

	const coverages: number[][] = [];
	for (const coverageOffset of coverageOffsets) {
		coverages.push(parseCoverageTable(reader, coverageOffset));
	}

	// 位置調整ルックアップレコードを解析
	const posLookupRecords = parsePosLookupRecords(reader, posCount);

	return {
		type: GposLookupType.CONTEXTUAL_POSITIONING,
		posFormat: 3 as const, // Use a const assertion to match the literal type '3'
		glyphCount,
		coverages,
		posCount,
		posLookupRecords
	};
}

/**
 * 文脈依存位置調整サブテーブル（ルックアップタイプ7）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns 文脈依存位置調整サブテーブル
 */
export function parseContextualPositioningSubtable(
	reader: DataReader,
	offset: number
): ContextualPositioningSubtable {
	// 位置を保存
	reader.save();

	try {
		// まずフォーマットタイプを読み取る
		reader.seek(offset);
		const posFormat = reader.readUInt16();

		// フォーマットに応じたパーサーを呼び出す
		switch (posFormat) {
			case 1:
				return parseContextualPositioningFormat1(reader, offset);
			case 2:
				return parseContextualPositioningFormat2(reader, offset);
			case 3:
				return parseContextualPositioningFormat3(reader, offset);
			default:
				throw new Error(`対応していない文脈依存位置調整フォーマット: ${posFormat}`);
		}
	} finally {
		// 位置を復元
		reader.restore();
	}
}