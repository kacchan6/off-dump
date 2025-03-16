/**
 * GPOS ルックアップタイプ5 - マークと合字の接続サブテーブル
 * アクセント記号などのマークグリフを合字のコンポーネントに接続する位置情報を提供する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gpos#lookuptype-5-mark-to-ligature-attachment-positioning-subtable
 */

import { DataReader } from '../../utils/data-reader';
import {
	GposLookupType,
	MarkToLigatureAttachmentSubtable,
	MarkArrayTable,
	LigatureArrayTable,
	LigatureAttachTable,
	ComponentRecord,
	AnchorPoint
} from '../../types/tables/GPOS';
import { parseCoverageTable } from './common';
import { parseAnchorTable } from './gpos-common';

/**
 * マークアレイを解析する
 * 
 * @param reader データリーダー
 * @param offset マークアレイへのオフセット
 * @param baseOffset ベースオフセット
 * @returns マークアレイ
 */
function parseMarkArray(reader: DataReader, offset: number, baseOffset: number): MarkArrayTable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		const markCount = reader.readUInt16();
		const markRecords = [];

		for (let i = 0; i < markCount; i++) {
			const markClass = reader.readUInt16();
			const markAnchorOffset = reader.readUInt16();

			// アンカーテーブルを解析
			const markAnchor = parseAnchorTable(reader, baseOffset + markAnchorOffset);

			// アンカーが見つかった場合は使用し、見つからない場合はデフォルトのアンカーを作成
			if (markAnchor) {
				markRecords.push({
					markClass,
					markAnchor
				});
			} else {
				// デフォルトのアンカーを作成
				markRecords.push({
					markClass,
					markAnchor: {
						anchorFormat: 1,
						xCoordinate: 0,
						yCoordinate: 0
					}
				});
			}
		}

		return {
			markCount,
			markRecords
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}

/**
 * 合字アレイを解析する
 * 
 * @param reader データリーダー
 * @param offset 合字アレイへのオフセット
 * @param markClassCount マーククラスの数
 * @param baseOffset ベースオフセット
 * @returns 合字アレイ
 */
function parseLigatureArray(
	reader: DataReader,
	offset: number,
	markClassCount: number,
	baseOffset: number
): LigatureArrayTable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		const ligatureCount = reader.readUInt16();
		const ligatureAttachOffsets = [];

		// 合字アタッチメントテーブルのオフセットを読み取る
		for (let i = 0; i < ligatureCount; i++) {
			ligatureAttachOffsets.push(reader.readUInt16() + offset);
		}

		// 各合字アタッチメントテーブルを解析
		const ligatureAttachments: LigatureAttachTable[] = [];

		for (const ligatureOffset of ligatureAttachOffsets) {
			reader.save();
			reader.seek(ligatureOffset);

			const componentCount = reader.readUInt16();
			const componentRecords: ComponentRecord[] = [];

			// 各コンポーネントレコードを解析
			for (let i = 0; i < componentCount; i++) {
				const ligatureAnchors: (AnchorPoint | null)[] = [];

				// 各マーククラスに対するアンカーポイントを読み取る
				for (let j = 0; j < markClassCount; j++) {
					const ligatureAnchorOffset = reader.readUInt16();

					if (ligatureAnchorOffset !== 0) {
						const anchor = parseAnchorTable(reader, baseOffset + ligatureAnchorOffset);
						ligatureAnchors.push(anchor || null);
					} else {
						ligatureAnchors.push(null);
					}
				}

				componentRecords.push({
					ligatureAnchors
				});
			}

			ligatureAttachments.push({
				componentCount,
				componentRecords
			});

			reader.restore();
		}

		return {
			ligatureCount,
			ligatureAttachments
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}

/**
 * マークと合字の接続サブテーブル（ルックアップタイプ5）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns マークと合字の接続サブテーブル
 */
export function parseMarkToLigatureAttachmentSubtable(
	reader: DataReader,
	offset: number
): MarkToLigatureAttachmentSubtable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// 基本情報を読み取る（フォーマットは常に1）
		const posFormat = reader.readUInt16();
		if (posFormat !== 1) {
			throw new Error(`対応していないマークと合字の接続フォーマット: ${posFormat}`);
		}

		const markCoverageOffset = reader.readUInt16();
		const ligatureCoverageOffset = reader.readUInt16();
		const markClassCount = reader.readUInt16();
		const markArrayOffset = reader.readUInt16();
		const ligatureArrayOffset = reader.readUInt16();

		// カバレッジテーブルを解析
		const markCoverage = parseCoverageTable(reader, offset + markCoverageOffset);
		const ligatureCoverage = parseCoverageTable(reader, offset + ligatureCoverageOffset);

		// マークアレイと合字アレイを解析
		const markArray = parseMarkArray(reader, offset + markArrayOffset, offset);
		const ligatureArray = parseLigatureArray(reader, offset + ligatureArrayOffset, markClassCount, offset);

		return {
			type: GposLookupType.MARK_TO_LIGATURE_ATTACHMENT,
			posFormat,
			markCoverage,
			ligatureCoverage,
			markClassCount,
			markArray,
			ligatureArray
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}
