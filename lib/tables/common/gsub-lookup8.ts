/**
 * GSUB ルックアップタイプ8 - 逆連鎖文脈依存単一置換サブテーブル
 * 前後の文脈を検査して、特定のグリフを逆方向に置換する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gsub#lookuptype-8-reverse-chaining-contextual-single-substitution-subtable
 */

import { DataReader } from '../../utils/data-reader';
import {
	GsubLookupType,
	ReverseChainSingleSubstitutionSubtable
} from '../../types/tables/GSUB';
import { parseCoverageTable } from './gpos-gsub';

/**
 * 逆連鎖文脈依存単一置換サブテーブル（ルックアップタイプ8）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns 逆連鎖文脈依存単一置換サブテーブル
 */
export function parseReverseChainSingleSubstitutionSubtable(
	reader: DataReader,
	offset: number
): ReverseChainSingleSubstitutionSubtable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// 基本情報を読み取る
		const substFormat = reader.readUInt16();
		if (substFormat !== 1) {
			throw new Error(`対応していない逆連鎖文脈依存単一置換フォーマット: ${substFormat}`);
		}

		// カバレッジテーブルを解析
		const coverageOffset = reader.readUInt16();
		const coverage = parseCoverageTable(reader, offset + coverageOffset);

		// バックトラック（後ろから前に）カバレッジテーブル
		const backtrackGlyphCount = reader.readUInt16();
		const backtrackCoverageOffsets: number[] = [];
		for (let i = 0; i < backtrackGlyphCount; i++) {
			backtrackCoverageOffsets.push(reader.readUInt16() + offset);
		}

		// バックトラックカバレッジテーブルを解析
		const backtrackCoverages: number[][] = [];
		for (const coverageOffset of backtrackCoverageOffsets) {
			backtrackCoverages.push(parseCoverageTable(reader, coverageOffset));
		}

		// 先読みカバレッジテーブル
		const lookAheadGlyphCount = reader.readUInt16();
		const lookAheadCoverageOffsets: number[] = [];
		for (let i = 0; i < lookAheadGlyphCount; i++) {
			lookAheadCoverageOffsets.push(reader.readUInt16() + offset);
		}

		// 先読みカバレッジテーブルを解析
		const lookAheadCoverages: number[][] = [];
		for (const coverageOffset of lookAheadCoverageOffsets) {
			lookAheadCoverages.push(parseCoverageTable(reader, coverageOffset));
		}

		// 置換グリフの数と置換グリフIDの配列
		const glyphCount = reader.readUInt16();
		const substituteGlyphIDs: number[] = [];
		for (let i = 0; i < glyphCount; i++) {
			substituteGlyphIDs.push(reader.readUInt16());
		}

		return {
			type: GsubLookupType.REVERSE_CHAINING_CONTEXTUAL,
			substFormat: 1 as const,
			coverage,
			backtrackGlyphCount,
			backtrackCoverages,
			lookAheadGlyphCount,
			lookAheadCoverages,
			glyphCount,
			substituteGlyphIDs
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}
