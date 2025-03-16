/**
 * GSUB ルックアップタイプ3 - 代替置換サブテーブル
 * 一つのグリフに対して複数の代替グリフの選択肢を提供する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gsub#lookuptype-3-alternate-substitution-subtable
 */

import { DataReader } from '../../utils/data-reader';
import { GsubLookupType, AlternateSubstitutionSubtable } from '../../types/tables/GSUB';
import { parseCoverageTable } from './common';

/**
 * 代替置換サブテーブル（ルックアップタイプ3）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns 代替置換サブテーブル
 */
export function parseAlternateSubstitutionSubtable(
	reader: DataReader,
	offset: number
): AlternateSubstitutionSubtable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// 基本情報を読み取る（フォーマットは常に1）
		const substFormat = reader.readUInt16();
		if (substFormat !== 1) {
			throw new Error(`対応していないAlternateSubst形式: ${substFormat}`);
		}

		const coverageOffset = reader.readUInt16();
		const alternateSetCount = reader.readUInt16();

		// カバレッジテーブルを解析
		const coverage = parseCoverageTable(reader, offset + coverageOffset);

		// 各代替セットへのオフセット配列
		const alternateSetOffsets: number[] = [];
		for (let i = 0; i < alternateSetCount; i++) {
			alternateSetOffsets.push(reader.readUInt16() + offset);
		}

		// 各代替セットを解析
		const alternateSets: number[][] = [];

		for (const alternateSetOffset of alternateSetOffsets) {
			// 現在位置を保存
			reader.save();

			// 代替セットの位置に移動
			reader.seek(alternateSetOffset);

			// 代替グリフ数を読み取る
			const glyphCount = reader.readUInt16();

			// 代替グリフIDの配列を読み取る
			const alternateGlyphs: number[] = [];
			for (let i = 0; i < glyphCount; i++) {
				alternateGlyphs.push(reader.readUInt16());
			}

			alternateSets.push(alternateGlyphs);

			// 保存した位置に戻る
			reader.restore();
		}

		return {
			type: GsubLookupType.ALTERNATE,
			substFormat: 1,
			coverage,
			alternateSetCount,
			alternateSets
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}
