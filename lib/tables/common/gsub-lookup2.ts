/**
 * GSUB ルックアップタイプ2 - 複数置換サブテーブル
 * 一つのグリフを複数のグリフに置換する情報を提供する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gsub#lookuptype-2-multiple-substitution-subtable
 */

import { DataReader } from '../../utils/data-reader';
import { GsubLookupType, MultipleSubstitutionSubtable } from '../../types/tables/GSUB';
import { parseCoverageTable } from './gpos-gsub';

/**
 * 複数置換サブテーブル（ルックアップタイプ2）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns 複数置換サブテーブル
 */
export function parseMultipleSubstitutionSubtable(
	reader: DataReader,
	offset: number
): MultipleSubstitutionSubtable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// 基本情報を読み取る（フォーマットは常に1）
		const substFormat = reader.readUInt16();
		if (substFormat !== 1) {
			throw new Error(`対応していないMultipleSubst形式: ${substFormat}`);
		}

		const coverageOffset = reader.readUInt16();
		const sequenceCount = reader.readUInt16();

		// カバレッジテーブルを解析
		const coverage = parseCoverageTable(reader, offset + coverageOffset);

		// 各置換シーケンスへのオフセット配列
		const sequenceOffsets: number[] = [];
		for (let i = 0; i < sequenceCount; i++) {
			sequenceOffsets.push(reader.readUInt16() + offset);
		}

		// 各置換シーケンスを解析
		const sequences: number[][] = [];

		for (const sequenceOffset of sequenceOffsets) {
			// 現在位置を保存
			reader.save();

			// シーケンスの位置に移動
			reader.seek(sequenceOffset);

			// グリフ数を読み取る
			const glyphCount = reader.readUInt16();

			// 置換グリフのシーケンスを読み取る
			const sequence: number[] = [];
			for (let i = 0; i < glyphCount; i++) {
				sequence.push(reader.readUInt16());
			}

			sequences.push(sequence);

			// 保存した位置に戻る
			reader.restore();
		}

		return {
			type: GsubLookupType.MULTIPLE,
			substFormat: 1,
			coverage,
			sequenceCount,
			sequences
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}