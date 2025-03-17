/**
 * GPOS ルックアップタイプ2 - ペア位置調整サブテーブル
 * グリフペアに対する位置調整情報を提供する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gpos#lookuptype-2-pair-adjustment-positioning-subtable
 */

import { ClassPairValueRecord, GposLookupType, PairAdjustmentSubtable, PairSetTable, PairValueRecord } from '../../types/tables/GPOS';
import { DataReader } from '../../utils/data-reader';
import { parseClassDefTable, parseCoverageTable } from './gpos-gsub';
import { parseValueRecord } from './gpos';

/**
 * ペア位置調整サブテーブル（ルックアップタイプ2）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns ペア位置調整サブテーブル
 */
export function parsePairAdjustmentSubtable(
	reader: DataReader,
	offset: number
): PairAdjustmentSubtable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// 基本情報を読み取る
		const posFormat = reader.readUInt16();
		const coverageOffset = reader.readUInt16();
		const valueFormat1 = reader.readUInt16();
		const valueFormat2 = reader.readUInt16();

		// カバレッジテーブルを解析
		const coverage = parseCoverageTable(reader, offset + coverageOffset);

		// フォーマット1: ペアセット（グリフごとのペアリスト）
		if (posFormat === 1) {
			const pairSetCount = reader.readUInt16();
			const pairSetOffsets = [];

			// ペアセットオフセットを読み取る
			for (let i = 0; i < pairSetCount; i++) {
				pairSetOffsets.push(reader.readUInt16() + offset);
			}

			const pairSets: PairSetTable[] = [];

			// 各ペアセットを解析
			for (const pairSetOffset of pairSetOffsets) {
				reader.save();
				reader.seek(pairSetOffset);

				const pairValueCount = reader.readUInt16();
				const pairValueRecords: PairValueRecord[] = [];

				// 各ペア値レコードを解析
				for (let i = 0; i < pairValueCount; i++) {
					const secondGlyph = reader.readUInt16();
					const value1 = parseValueRecord(reader, valueFormat1);
					const value2 = parseValueRecord(reader, valueFormat2);

					pairValueRecords.push({
						secondGlyph,
						value1,
						value2
					});
				}

				pairSets.push({
					pairValueCount,
					pairValueRecords
				});

				reader.restore();
			}

			return {
				type: GposLookupType.PAIR_ADJUSTMENT,
				posFormat,
				coverage,
				valueFormat1,
				valueFormat2,
				pairSets
			};
		}

		// フォーマット2: クラスペア（クラスベースのペア調整）
		if (posFormat === 2) {
			const classDef1Offset = reader.readUInt16();
			const classDef2Offset = reader.readUInt16();
			const class1Count = reader.readUInt16();
			const class2Count = reader.readUInt16();

			// クラス定義テーブルを解析
			const classDef1 = parseClassDefTable(reader, offset + classDef1Offset);
			const classDef2 = parseClassDefTable(reader, offset + classDef2Offset);

			// クラスペア値レコードの2次元配列
			const classPairValueRecords: ClassPairValueRecord[][] = [];

			// 各クラスペア値レコードを解析（class1Count × class2Count）
			for (let i = 0; i < class1Count; i++) {
				const rowRecords: ClassPairValueRecord[] = [];

				for (let j = 0; j < class2Count; j++) {
					const value1 = parseValueRecord(reader, valueFormat1);
					const value2 = parseValueRecord(reader, valueFormat2);

					rowRecords.push({
						value1,
						value2
					});
				}

				classPairValueRecords.push(rowRecords);
			}

			return {
				type: GposLookupType.PAIR_ADJUSTMENT,
				posFormat,
				coverage,
				valueFormat1,
				valueFormat2,
				classDef1,
				classDef2,
				class1Count,
				class2Count,
				classPairValueRecords
			};
		}

		throw new Error(`対応していないPairPos形式: ${posFormat}`);
	} finally {
		// 位置を復元
		reader.restore();
	}
}
