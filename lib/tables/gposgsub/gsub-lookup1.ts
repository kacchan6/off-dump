/**
 * GSUB ルックアップタイプ1 - 単一置換サブテーブル
 * 個々のグリフに対する置換情報を提供する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gsub#lookuptype-1-single-substitution-subtable
 */

import { DataReader } from '../../utils/data-reader';
import { GsubLookupType, SingleSubstitutionSubtable } from '../../types/tables/GSUB';
import { parseCoverageTable } from './common';

/**
 * 単一置換サブテーブル（ルックアップタイプ1）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns 単一置換サブテーブル
 */
export function parseSingleSubstitutionSubtable(
	reader: DataReader,
	offset: number
): SingleSubstitutionSubtable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// 基本情報を読み取る
		const substFormat = reader.readUInt16();
		const coverageOffset = reader.readUInt16();

		// カバレッジテーブルを解析
		const coverage = parseCoverageTable(reader, offset + coverageOffset);

		// フォーマット1: デルタ置換
		if (substFormat === 1) {
			// グリフID + deltaGlyphID = 置換後のグリフID
			const deltaGlyphID = reader.readInt16();

			return {
				type: GsubLookupType.SINGLE,
				substFormat: 1,
				coverage,
				deltaGlyphID
			};
		}

		// フォーマット2: グリフID直接マッピング
		if (substFormat === 2) {
			// 置換グリフ数はカバレッジのグリフ数と同じ
			const glyphCount = coverage.length;

			// 各カバレッジグリフに対応する置換グリフID
			const substitute: number[] = [];
			for (let i = 0; i < glyphCount; i++) {
				substitute.push(reader.readUInt16());
			}

			return {
				type: GsubLookupType.SINGLE,
				substFormat: 2,
				coverage,
				substitute
			};
		}

		throw new Error(`対応していないSingleSubst形式: ${substFormat}`);
	} finally {
		// 位置を復元
		reader.restore();
	}
}
