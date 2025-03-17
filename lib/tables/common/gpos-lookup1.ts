/**
 * GPOS ルックアップタイプ1 - 単一位置調整サブテーブル
 * 個々のグリフに対する位置調整情報を提供する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gpos#lookuptype-1-single-adjustment-positioning-subtable
 */

import { DataReader } from '../../utils/data-reader';
import { GposLookupType, SingleAdjustmentSubtable } from '../../types/tables/GPOS';
import { parseCoverageTable } from './gpos-gsub';
import { parseValueRecord } from './gpos';

/**
 * 単一位置調整サブテーブル（ルックアップタイプ1）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns 単一位置調整サブテーブル
 */
export function parseSingleAdjustmentSubtable(
	reader: DataReader,
	offset: number
): SingleAdjustmentSubtable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// 基本情報を読み取る
		const posFormat = reader.readUInt16();
		const coverageOffset = reader.readUInt16();
		const valueFormat = reader.readUInt16();

		// カバレッジテーブルを解析
		const coverage = parseCoverageTable(reader, offset + coverageOffset);

		// フォーマット1: 単一の値レコード
		if (posFormat === 1) {
			// 全てのグリフに同じ調整値を適用
			const valueRecord = parseValueRecord(reader, valueFormat);

			return {
				type: GposLookupType.SINGLE_ADJUSTMENT,
				posFormat,
				coverage,
				valueFormat,
				valueRecord
			};
		}

		// フォーマット2: 複数の値レコード
		if (posFormat === 2) {
			// カバレッジ内の各グリフに対して個別の調整値を持つ
			const valueCount = reader.readUInt16();
			const valueRecords = [];

			for (let i = 0; i < valueCount; i++) {
				valueRecords.push(parseValueRecord(reader, valueFormat));
			}

			return {
				type: GposLookupType.SINGLE_ADJUSTMENT,
				posFormat,
				coverage,
				valueFormat,
				valueRecords
			};
		}

		throw new Error(`対応していないSinglePos形式: ${posFormat}`);
	} finally {
		// 位置を復元
		reader.restore();
	}
}
