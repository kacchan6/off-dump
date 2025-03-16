/**
 * GPOS ルックアップタイプ6 - マーク同士の接続サブテーブル
 * アクセント記号などのマークグリフを他のマークグリフに接続する位置情報を提供する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gpos#lookuptype-6-mark-to-mark-attachment-positioning-subtable
 */

import { DataReader } from '../../utils/data-reader';
import {
	GposLookupType,
	MarkToMarkAttachmentSubtable,
	MarkArrayTable,
	Mark2ArrayTable,
	Mark2Record,
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
 * マーク2アレイを解析する
 * 
 * @param reader データリーダー
 * @param offset マーク2アレイへのオフセット
 * @param markClassCount マーククラスの数
 * @param baseOffset ベースオフセット
 * @returns マーク2アレイ
 */
function parseMark2Array(
	reader: DataReader,
	offset: number,
	markClassCount: number,
	baseOffset: number
): Mark2ArrayTable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		const mark2Count = reader.readUInt16();
		const mark2Records: Mark2Record[] = [];

		for (let i = 0; i < mark2Count; i++) {
			const mark2Anchors: (AnchorPoint | null)[] = [];

			// 各マーククラスに対するアンカーポイントを読み取る
			for (let j = 0; j < markClassCount; j++) {
				const mark2AnchorOffset = reader.readUInt16();

				if (mark2AnchorOffset !== 0) {
					const anchor = parseAnchorTable(reader, baseOffset + mark2AnchorOffset);
					mark2Anchors.push(anchor || null);
				} else {
					mark2Anchors.push(null);
				}
			}

			mark2Records.push({
				mark2Anchors
			});
		}

		return {
			mark2Count,
			mark2Records
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}

/**
 * マーク同士の接続サブテーブル（ルックアップタイプ6）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns マーク同士の接続サブテーブル
 */
export function parseMarkToMarkAttachmentSubtable(
	reader: DataReader,
	offset: number
): MarkToMarkAttachmentSubtable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// 基本情報を読み取る（フォーマットは常に1）
		const posFormat = reader.readUInt16();
		if (posFormat !== 1) {
			throw new Error(`対応していないマーク同士の接続フォーマット: ${posFormat}`);
		}

		const mark1CoverageOffset = reader.readUInt16();
		const mark2CoverageOffset = reader.readUInt16();
		const markClassCount = reader.readUInt16();
		const mark1ArrayOffset = reader.readUInt16();
		const mark2ArrayOffset = reader.readUInt16();

		// カバレッジテーブルを解析
		const mark1Coverage = parseCoverageTable(reader, offset + mark1CoverageOffset);
		const mark2Coverage = parseCoverageTable(reader, offset + mark2CoverageOffset);

		// マーク1アレイとマーク2アレイを解析
		const mark1Array = parseMarkArray(reader, offset + mark1ArrayOffset, offset);
		const mark2Array = parseMark2Array(reader, offset + mark2ArrayOffset, markClassCount, offset);

		return {
			type: GposLookupType.MARK_TO_MARK_ATTACHMENT,
			posFormat,
			mark1Coverage,
			mark2Coverage,
			markClassCount,
			mark1Array,
			mark2Array
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}