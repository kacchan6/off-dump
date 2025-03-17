/**
 * GSUB ルックアップタイプ6 - 連鎖文脈依存置換サブテーブル
 * 前後の文脈を含めた特定のグリフシーケンスに基づいてグリフを置換する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gsub#lookuptype-6-chaining-contextual-substitution-subtable
 */

import { DataReader } from '../../utils/data-reader';
import {
	GsubLookupType,
	ChainingContextualSubstitutionSubtable,
	ChainingContextualSubstitutionFormat1Subtable,
	ChainingContextualSubstitutionFormat2Subtable,
	ChainingContextualSubstitutionFormat3Subtable,
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
 * フォーマット1の連鎖文脈依存置換サブテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns フォーマット1の連鎖文脈依存置換サブテーブル
 */
function parseChainingContextualSubstitutionFormat1(
	reader: DataReader,
	offset: number
): ChainingContextualSubstitutionFormat1Subtable {
	// オフセット位置に移動
	reader.seek(offset);

	const substFormat = reader.readUInt16();
	const coverageOffset = reader.readUInt16();
	const chainSubRuleSetCount = reader.readUInt16();

	// カバレッジテーブルを解析
	const coverage = parseCoverageTable(reader, offset + coverageOffset);

	// チェーン置換ルールセットのオフセットを読み取る
	const chainSubRuleSetOffsets: number[] = [];
	for (let i = 0; i < chainSubRuleSetCount; i++) {
		chainSubRuleSetOffsets.push(reader.readUInt16() + offset);
	}

	// 各チェーン置換ルールセットを解析
	const chainSubRuleSets = [];

	for (const ruleSetOffset of chainSubRuleSetOffsets) {
		reader.save();
		reader.seek(ruleSetOffset);

		const chainSubRuleCount = reader.readUInt16();
		const chainSubRuleOffsets: number[] = [];

		// ルールオフセットを読み取る
		for (let i = 0; i < chainSubRuleCount; i++) {
			chainSubRuleOffsets.push(reader.readUInt16() + ruleSetOffset);
		}

		// 各ルールを解析
		const chainSubRules = [];

		for (const ruleOffset of chainSubRuleOffsets) {
			reader.save();
			reader.seek(ruleOffset);

			// バックトラックシーケンス
			const backtrackGlyphCount = reader.readUInt16();
			const backtrackSequence: number[] = [];
			for (let i = 0; i < backtrackGlyphCount; i++) {
				backtrackSequence.push(reader.readUInt16());
			}

			// 入力シーケンス（最初のグリフを除く）
			const inputGlyphCount = reader.readUInt16();
			const inputSequence: number[] = [];
			for (let i = 0; i < inputGlyphCount - 1; i++) {
				inputSequence.push(reader.readUInt16());
			}

			// 先読みシーケンス
			const lookAheadGlyphCount = reader.readUInt16();
			const lookAheadSequence: number[] = [];
			for (let i = 0; i < lookAheadGlyphCount; i++) {
				lookAheadSequence.push(reader.readUInt16());
			}

			// 置換の数
			const substCount = reader.readUInt16();

			// 置換ルックアップレコードを読み取る
			const substLookupRecords = parseSubstLookupRecords(reader, substCount);

			chainSubRules.push({
				backtrackGlyphCount,
				backtrackSequence,
				inputGlyphCount,
				inputSequence,
				lookAheadGlyphCount,
				lookAheadSequence,
				substCount,
				substLookupRecords
			});

			reader.restore();
		}

		chainSubRuleSets.push({
			chainSubRuleCount,
			chainSubRules
		});

		reader.restore();
	}

	return {
		type: GsubLookupType.CHAINING_CONTEXTUAL,
		substFormat: 1 as const,
		coverage,
		chainSubRuleSetCount,
		chainSubRuleSets
	};
}

/**
 * フォーマット2の連鎖文脈依存置換サブテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns フォーマット2の連鎖文脈依存置換サブテーブル
 */
function parseChainingContextualSubstitutionFormat2(
	reader: DataReader,
	offset: number
): ChainingContextualSubstitutionFormat2Subtable {
	// オフセット位置に移動
	reader.seek(offset);

	const substFormat = reader.readUInt16();
	const coverageOffset = reader.readUInt16();
	const backtrackClassDefOffset = reader.readUInt16();
	const inputClassDefOffset = reader.readUInt16();
	const lookAheadClassDefOffset = reader.readUInt16();
	const chainSubClassSetCount = reader.readUInt16();

	// カバレッジテーブルとクラス定義テーブルを解析
	const coverage = parseCoverageTable(reader, offset + coverageOffset);
	const backtrackClassDef = parseClassDefTable(reader, offset + backtrackClassDefOffset);
	const inputClassDef = parseClassDefTable(reader, offset + inputClassDefOffset);
	const lookAheadClassDef = parseClassDefTable(reader, offset + lookAheadClassDefOffset);

	// クラスセットのオフセットを読み取る
	const chainSubClassSetOffsets: (number | null)[] = [];
	for (let i = 0; i < chainSubClassSetCount; i++) {
		const chainSubClassSetOffset = reader.readUInt16();
		chainSubClassSetOffsets.push(chainSubClassSetOffset !== 0 ? chainSubClassSetOffset + offset : null);
	}

	// 各クラスセットを解析
	const chainSubClassSets: (any | null)[] = [];

	for (const classSetOffset of chainSubClassSetOffsets) {
		if (classSetOffset === null) {
			chainSubClassSets.push(null);
			continue;
		}

		reader.save();
		reader.seek(classSetOffset);

		const chainSubClassRuleCount = reader.readUInt16();
		const chainSubClassRuleOffsets: number[] = [];

		// クラスルールオフセットを読み取る
		for (let i = 0; i < chainSubClassRuleCount; i++) {
			chainSubClassRuleOffsets.push(reader.readUInt16() + classSetOffset);
		}

		// 各クラスルールを解析
		const chainSubClassRules = [];

		for (const ruleOffset of chainSubClassRuleOffsets) {
			reader.save();
			reader.seek(ruleOffset);

			// バックトラッククラスシーケンス
			const backtrackGlyphCount = reader.readUInt16();
			const backtrackClassSequence: number[] = [];
			for (let i = 0; i < backtrackGlyphCount; i++) {
				backtrackClassSequence.push(reader.readUInt16());
			}

			// 入力クラスシーケンス（最初のクラスを除く）
			const inputGlyphCount = reader.readUInt16();
			const inputClassSequence: number[] = [];
			for (let i = 0; i < inputGlyphCount - 1; i++) {
				inputClassSequence.push(reader.readUInt16());
			}

			// 先読みクラスシーケンス
			const lookAheadGlyphCount = reader.readUInt16();
			const lookAheadClassSequence: number[] = [];
			for (let i = 0; i < lookAheadGlyphCount; i++) {
				lookAheadClassSequence.push(reader.readUInt16());
			}

			// 置換の数
			const substCount = reader.readUInt16();

			// 置換ルックアップレコードを読み取る
			const substLookupRecords = parseSubstLookupRecords(reader, substCount);

			chainSubClassRules.push({
				backtrackGlyphCount,
				backtrackClassSequence,
				inputGlyphCount,
				inputClassSequence,
				lookAheadGlyphCount,
				lookAheadClassSequence,
				substCount,
				substLookupRecords
			});

			reader.restore();
		}

		chainSubClassSets.push({
			chainSubClassRuleCount,
			chainSubClassRules
		});

		reader.restore();
	}

	return {
		type: GsubLookupType.CHAINING_CONTEXTUAL,
		substFormat: 2 as const,
		coverage,
		backtrackClassDef,
		inputClassDef,
		lookAheadClassDef,
		chainSubClassSetCount,
		chainSubClassSets
	};
}

/**
 * フォーマット3の連鎖文脈依存置換サブテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns フォーマット3の連鎖文脈依存置換サブテーブル
 */
function parseChainingContextualSubstitutionFormat3(
	reader: DataReader,
	offset: number
): ChainingContextualSubstitutionFormat3Subtable {
	// オフセット位置に移動
	reader.seek(offset);

	const substFormat = reader.readUInt16();

	// バックトラックカバレッジテーブル
	const backtrackGlyphCount = reader.readUInt16();
	const backtrackCoverageOffsets: number[] = [];
	for (let i = 0; i < backtrackGlyphCount; i++) {
		backtrackCoverageOffsets.push(reader.readUInt16() + offset);
	}

	// 入力カバレッジテーブル
	const inputGlyphCount = reader.readUInt16();
	const inputCoverageOffsets: number[] = [];
	for (let i = 0; i < inputGlyphCount; i++) {
		inputCoverageOffsets.push(reader.readUInt16() + offset);
	}

	// 先読みカバレッジテーブル
	const lookAheadGlyphCount = reader.readUInt16();
	const lookAheadCoverageOffsets: number[] = [];
	for (let i = 0; i < lookAheadGlyphCount; i++) {
		lookAheadCoverageOffsets.push(reader.readUInt16() + offset);
	}

	// 置換の数
	const substCount = reader.readUInt16();

	// 置換ルックアップレコードを読み取る
	const substLookupRecords = parseSubstLookupRecords(reader, substCount);

	// 各カバレッジテーブルを解析
	const backtrackCoverages: number[][] = [];
	for (const coverageOffset of backtrackCoverageOffsets) {
		backtrackCoverages.push(parseCoverageTable(reader, coverageOffset));
	}

	const inputCoverages: number[][] = [];
	for (const coverageOffset of inputCoverageOffsets) {
		inputCoverages.push(parseCoverageTable(reader, coverageOffset));
	}

	const lookAheadCoverages: number[][] = [];
	for (const coverageOffset of lookAheadCoverageOffsets) {
		lookAheadCoverages.push(parseCoverageTable(reader, coverageOffset));
	}

	return {
		type: GsubLookupType.CHAINING_CONTEXTUAL,
		substFormat: 3 as const,
		backtrackGlyphCount,
		backtrackCoverages,
		inputGlyphCount,
		inputCoverages,
		lookAheadGlyphCount,
		lookAheadCoverages,
		substCount,
		substLookupRecords
	};
}

/**
 * 連鎖文脈依存置換サブテーブル（ルックアップタイプ6）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns 連鎖文脈依存置換サブテーブル
 */
export function parseChainingContextualSubstitutionSubtable(
	reader: DataReader,
	offset: number
): ChainingContextualSubstitutionSubtable {
	// 位置を保存
	reader.save();

	try {
		// まずフォーマットタイプを読み取る
		reader.seek(offset);
		const substFormat = reader.readUInt16();

		// フォーマットに応じたパーサーを呼び出す
		switch (substFormat) {
			case 1:
				return parseChainingContextualSubstitutionFormat1(reader, offset);
			case 2:
				return parseChainingContextualSubstitutionFormat2(reader, offset);
			case 3:
				return parseChainingContextualSubstitutionFormat3(reader, offset);
			default:
				throw new Error(`対応していない連鎖文脈依存置換フォーマット: ${substFormat}`);
		}
	} finally {
		// 位置を復元
		reader.restore();
	}
}
