/**
 * GPOS ルックアップタイプ4 - マークとベースの接続サブテーブル
 * アクセント記号などのマークグリフをベース文字に接続する位置情報を提供する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gpos#lookuptype-4-mark-to-base-attachment-positioning-subtable
 */

import { DataReader } from '../../utils/data-reader';
import {
	GposLookupType,
	MarkToBaseAttachmentSubtable,
	MarkArrayTable,
	MarkRecord,
	BaseArrayTable,
	BaseRecord,
	AnchorPoint
} from '../../types/tables/GPOS';
import { parseCoverageTable } from './gpos-gsub';
import { parseAnchorTable } from './gpos';

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
		const markRecords: MarkRecord[] = [];

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
 * ベースアレイを解析する
 * 
 * @param reader データリーダー
 * @param offset ベースアレイへのオフセット
 * @param markClassCount マーククラスの数
 * @param baseOffset ベースオフセット
 * @returns ベースアレイ
 */
function parseBaseArray(
	reader: DataReader,
	offset: number,
	markClassCount: number,
	baseOffset: number
): BaseArrayTable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		const baseCount = reader.readUInt16();
		const baseRecords: BaseRecord[] = [];

		for (let i = 0; i < baseCount; i++) {
			const baseAnchors: (AnchorPoint | null)[] = [];

			// 各マーククラスに対するアンカーポイントを読み取る
			for (let j = 0; j < markClassCount; j++) {
				const baseAnchorOffset = reader.readUInt16();

				// オフセットが0でない場合のみアンカーテーブルを解析
				if (baseAnchorOffset !== 0) {
					const anchor = parseAnchorTable(reader, baseOffset + baseAnchorOffset);
					baseAnchors.push(anchor || null);
				} else {
					baseAnchors.push(null);
				}
			}

			baseRecords.push({
				baseAnchors
			});
		}

		return {
			baseCount,
			baseRecords
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}

/**
 * マークとベースの接続サブテーブル（ルックアップタイプ4）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns マークとベースの接続サブテーブル
 */
export function parseMarkToBaseAttachmentSubtable(
	reader: DataReader,
	offset: number
): MarkToBaseAttachmentSubtable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// 基本情報を読み取る（フォーマットは常に1）
		const posFormat = reader.readUInt16();
		if (posFormat !== 1) {
			throw new Error(`対応していないマークとベースの接続フォーマット: ${posFormat}`);
		}

		const markCoverageOffset = reader.readUInt16();
		const baseCoverageOffset = reader.readUInt16();
		const markClassCount = reader.readUInt16();
		const markArrayOffset = reader.readUInt16();
		const baseArrayOffset = reader.readUInt16();

		// カバレッジテーブルを解析
		const markCoverage = parseCoverageTable(reader, offset + markCoverageOffset);
		const baseCoverage = parseCoverageTable(reader, offset + baseCoverageOffset);

		// マークアレイとベースアレイを解析
		const markArray = parseMarkArray(reader, offset + markArrayOffset, offset);
		const baseArray = parseBaseArray(reader, offset + baseArrayOffset, markClassCount, offset);

		return {
			type: GposLookupType.MARK_TO_BASE_ATTACHMENT,
			posFormat,
			markCoverage,
			baseCoverage,
			markClassCount,
			markArray,
			baseArray
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}