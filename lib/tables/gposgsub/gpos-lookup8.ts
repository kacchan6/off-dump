/**
 * GPOS ルックアップタイプ8 - 連鎖文脈依存位置調整サブテーブル
 * 前後の文脈（バックトラックと先読み）を含めた特定のグリフシーケンスに応じて位置調整を適用する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gpos#lookuptype-8-chained-contextual-positioning-subtable
 */

import { DataReader } from '../../utils/data-reader';
import {
	GposLookupType,
	ChainedContextualPositioningSubtable,
	ChainContextualPositioningFormat1Subtable,
	ChainContextualPositioningFormat2Subtable,
	ChainContextualPositioningFormat3Subtable,
	PosLookupRecord,
	ChainPosRule,
	ChainPosRuleSet,
	ChainClassRule,
	ChainClassSet
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
 * フォーマット1の連鎖文脈依存位置調整サブテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns フォーマット1の連鎖文脈依存位置調整サブテーブル
 */
function parseChainContextualPositioningFormat1(
	reader: DataReader,
	offset: number
): ChainContextualPositioningFormat1Subtable {
	// オフセット位置に移動
	reader.seek(offset);

	const posFormat = reader.readUInt16();
	const coverageOffset = reader.readUInt16();
	const chainPosRuleSetCount = reader.readUInt16();

	// カバレッジテーブルを解析
	const coverage = parseCoverageTable(reader, offset + coverageOffset);

	// チェーンポジショニングルールセットのオフセットを読み取る
	const chainPosRuleSetOffsets: number[] = [];
	for (let i = 0; i < chainPosRuleSetCount; i++) {
		chainPosRuleSetOffsets.push(reader.readUInt16() + offset);
	}

	// 各チェーンポジショニングルールセットを解析
	const chainPosRuleSets: ChainPosRuleSet[] = [];

	for (const ruleSetOffset of chainPosRuleSetOffsets) {
		reader.save();
		reader.seek(ruleSetOffset);

		const chainPosRuleCount = reader.readUInt16();
		const chainPosRuleOffsets: number[] = [];

		// ルールオフセットを読み取る
		for (let i = 0; i < chainPosRuleCount; i++) {
			chainPosRuleOffsets.push(reader.readUInt16() + ruleSetOffset);
		}

		// 各ルールを解析
		const chainPosRules: ChainPosRule[] = [];

		for (const ruleOffset of chainPosRuleOffsets) {
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

			// 位置調整ルックアップレコード
			const posCount = reader.readUInt16();
			const posLookupRecords = parsePosLookupRecords(reader, posCount);

			chainPosRules.push({
				backtrackGlyphCount,
				backtrackSequence,
				inputGlyphCount,
				inputSequence,
				lookAheadGlyphCount,
				lookAheadSequence,
				posCount,
				posLookupRecords
			});

			reader.restore();
		}

		chainPosRuleSets.push({
			chainPosRuleCount,
			chainPosRuleOffsets,
			chainPosRules
		});

		reader.restore();
	}

	return {
		type: GposLookupType.CHAINED_CONTEXTUAL_POSITIONING,
		posFormat,
		coverage,
		chainPosRuleSetCount,
		chainPosRuleSetOffsets,
		chainPosRuleSets
	};
}

/**
 * フォーマット2の連鎖文脈依存位置調整サブテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns フォーマット2の連鎖文脈依存位置調整サブテーブル
 */
function parseChainContextualPositioningFormat2(
	reader: DataReader,
	offset: number
): ChainContextualPositioningFormat2Subtable {
	// オフセット位置に移動
	reader.seek(offset);

	const posFormat = reader.readUInt16();
	const coverageOffset = reader.readUInt16();
	const backtrackClassDefOffset = reader.readUInt16();
	const inputClassDefOffset = reader.readUInt16();
	const lookAheadClassDefOffset = reader.readUInt16();
	const chainClassSetCount = reader.readUInt16();

	// カバレッジテーブルとクラス定義テーブルを解析
	const coverage = parseCoverageTable(reader, offset + coverageOffset);
	const backtrackClassDef = parseClassDefTable(reader, offset + backtrackClassDefOffset);
	const inputClassDef = parseClassDefTable(reader, offset + inputClassDefOffset);
	const lookAheadClassDef = parseClassDefTable(reader, offset + lookAheadClassDefOffset);

	// チェーンクラスセットのオフセットを読み取る
	const chainClassSetOffsets: (number | null)[] = [];
	for (let i = 0; i < chainClassSetCount; i++) {
		const chainClassSetOffset = reader.readUInt16();
		chainClassSetOffsets.push(chainClassSetOffset !== 0 ? chainClassSetOffset + offset : null);
	}

	// 各チェーンクラスセットを解析
	const chainClassSets: (ChainClassSet | null)[] = [];

	for (const classSetOffset of chainClassSetOffsets) {
		if (classSetOffset === null) {
			chainClassSets.push(null);
			continue;
		}

		reader.save();
		reader.seek(classSetOffset);

		const chainClassRuleCount = reader.readUInt16();
		const chainClassRuleOffsets: number[] = [];

		// クラスルールオフセットを読み取る
		for (let i = 0; i < chainClassRuleCount; i++) {
			chainClassRuleOffsets.push(reader.readUInt16() + classSetOffset);
		}

		// 各チェーンクラスルールを解析
		const chainClassRules: ChainClassRule[] = [];

		for (const ruleOffset of chainClassRuleOffsets) {
			reader.save();
			reader.seek(ruleOffset);

			// バックトラッククラスシーケンス
			const backtrackGlyphCount = reader.readUInt16();
			const backtrackSequence: number[] = [];
			for (let i = 0; i < backtrackGlyphCount; i++) {
				backtrackSequence.push(reader.readUInt16());
			}

			// 入力クラスシーケンス（最初のクラスを除く）
			const inputGlyphCount = reader.readUInt16();
			const inputSequence: number[] = [];
			for (let i = 0; i < inputGlyphCount - 1; i++) {
				inputSequence.push(reader.readUInt16());
			}

			// 先読みクラスシーケンス
			const lookAheadGlyphCount = reader.readUInt16();
			const lookAheadSequence: number[] = [];
			for (let i = 0; i < lookAheadGlyphCount; i++) {
				lookAheadSequence.push(reader.readUInt16());
			}

			// 位置調整ルックアップレコード
			const posCount = reader.readUInt16();
			const posLookupRecords = parsePosLookupRecords(reader, posCount);

			chainClassRules.push({
				backtrackGlyphCount,
				backtrackSequence,
				inputGlyphCount,
				inputSequence,
				lookAheadGlyphCount,
				lookAheadSequence,
				posCount,
				posLookupRecords
			});

			reader.restore();
		}

		chainClassSets.push({
			chainClassRuleCount,
			chainClassRuleOffsets,
			chainClassRules
		});

		reader.restore();
	}

	return {
		type: GposLookupType.CHAINED_CONTEXTUAL_POSITIONING,
		posFormat,
		coverage,
		backtrackClassDef,
		inputClassDef,
		lookAheadClassDef,
		chainClassSetCount,
		chainClassSetOffsets,
		chainClassSets
	};
}

/**
 * フォーマット3の連鎖文脈依存位置調整サブテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns フォーマット3の連鎖文脈依存位置調整サブテーブル
 */
function parseChainContextualPositioningFormat3(
	reader: DataReader,
	offset: number
): ChainContextualPositioningFormat3Subtable {
	// オフセット位置に移動
	reader.seek(offset);

	const posFormat = reader.readUInt16();

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

	// 位置調整ルックアップレコード
	const posCount = reader.readUInt16();
	const posLookupRecords = parsePosLookupRecords(reader, posCount);

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
		type: GposLookupType.CHAINED_CONTEXTUAL_POSITIONING,
		posFormat,
		backtrackGlyphCount,
		backtrackCoverages,
		inputGlyphCount,
		inputCoverages,
		lookAheadGlyphCount,
		lookAheadCoverages,
		posCount,
		posLookupRecords
	};
}

/**
 * 連鎖文脈依存位置調整サブテーブル（ルックアップタイプ8）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns 連鎖文脈依存位置調整サブテーブル
 */
export function parseChainedContextualPositioningSubtable(
	reader: DataReader,
	offset: number
): ChainedContextualPositioningSubtable {
	// 位置を保存
	reader.save();

	try {
		// まずフォーマットタイプを読み取る
		reader.seek(offset);
		const posFormat = reader.readUInt16();

		// フォーマットに応じたパーサーを呼び出す
		switch (posFormat) {
			case 1:
				return parseChainContextualPositioningFormat1(reader, offset);
			case 2:
				return parseChainContextualPositioningFormat2(reader, offset);
			case 3:
				return parseChainContextualPositioningFormat3(reader, offset);
			default:
				throw new Error(`対応していない連鎖文脈依存位置調整フォーマット: ${posFormat}`);
		}
	} finally {
		// 位置を復元
		reader.restore();
	}
}
