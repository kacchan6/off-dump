/**
 * GSUB ルックアップタイプ4 - 合字置換サブテーブル
 * 複数のグリフを一つの合字グリフに置換する情報を提供する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gsub#lookuptype-4-ligature-substitution-subtable
 */

import { DataReader } from '../../utils/data-reader';
import { GsubLookupType, LigatureSubstitutionSubtable, LigatureSet, Ligature } from '../../types/tables/GSUB';
import { parseCoverageTable } from './common';

/**
 * 合字置換サブテーブル（ルックアップタイプ4）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns 合字置換サブテーブル
 */
export function parseLigatureSubstitutionSubtable(
	reader: DataReader,
	offset: number
): LigatureSubstitutionSubtable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// 基本情報を読み取る（フォーマットは常に1）
		const substFormat = reader.readUInt16();
		if (substFormat !== 1) {
			throw new Error(`対応していないLigatureSubst形式: ${substFormat}`);
		}

		const coverageOffset = reader.readUInt16();
		const ligatureSetCount = reader.readUInt16();

		// カバレッジテーブルを解析
		const coverage = parseCoverageTable(reader, offset + coverageOffset);

		// 各合字セットへのオフセット配列
		const ligatureSetOffsets: number[] = [];
		for (let i = 0; i < ligatureSetCount; i++) {
			ligatureSetOffsets.push(reader.readUInt16() + offset);
		}

		// 各合字セットを解析
		const ligatureSets: LigatureSet[] = [];

		for (const ligatureSetOffset of ligatureSetOffsets) {
			// 現在位置を保存
			reader.save();

			// 合字セットの位置に移動
			reader.seek(ligatureSetOffset);

			// 合字数を読み取る
			const ligatureCount = reader.readUInt16();

			// 各合字へのオフセット配列
			const ligatureOffsets: number[] = [];
			for (let i = 0; i < ligatureCount; i++) {
				ligatureOffsets.push(reader.readUInt16() + ligatureSetOffset);
			}

			// 各合字を解析
			const ligatures: Ligature[] = [];

			for (const ligatureOffset of ligatureOffsets) {
				// 現在位置を保存
				reader.save();

				// 合字の位置に移動
				reader.seek(ligatureOffset);

				// 合字グリフIDを読み取る
				const ligatureGlyph = reader.readUInt16();

				// コンポーネント数を読み取る（最初のコンポーネントを除く）
				const componentCount = reader.readUInt16();

				// コンポーネントグリフIDの配列を読み取る（最初のコンポーネントを除く）
				const componentGlyphIDs: number[] = [];
				for (let i = 0; i < componentCount - 1; i++) {
					componentGlyphIDs.push(reader.readUInt16());
				}

				ligatures.push({
					ligatureGlyph,
					componentCount,
					componentGlyphIDs
				});

				// 保存した位置に戻る
				reader.restore();
			}

			ligatureSets.push({
				ligatureCount,
				ligatures
			});

			// 保存した位置に戻る
			reader.restore();
		}

		return {
			type: GsubLookupType.LIGATURE,
			substFormat: 1,
			coverage,
			ligatureSetCount,
			ligatureSets
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}
