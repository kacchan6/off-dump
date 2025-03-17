/**
 * GPOS ルックアップタイプ3 - 筆記体接続サブテーブル
 * 筆記体スタイルの文字を接続するためのグリフのエントリー/エグジットポイントを定義する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gpos#lookuptype-3-cursive-attachment-positioning-subtable
 */

import { DataReader } from '../../utils/data-reader';
import { CursiveAttachmentSubtable, EntryExitRecord, GposLookupType } from '../../types/tables/GPOS';
import { parseCoverageTable } from './gpos-gsub';
import { parseAnchorTable } from './gpos';

/**
 * 筆記体接続サブテーブル（ルックアップタイプ3）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns 筆記体接続サブテーブル
 */
export function parseCursiveAttachmentSubtable(
	reader: DataReader,
	offset: number
): CursiveAttachmentSubtable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// 基本情報を読み取る（フォーマットは常に1）
		const posFormat = reader.readUInt16();
		if (posFormat !== 1) {
			throw new Error(`対応していない筆記体接続フォーマット: ${posFormat}`);
		}

		const coverageOffset = reader.readUInt16();
		const entryExitCount = reader.readUInt16();

		// カバレッジテーブルを解析
		const coverage = parseCoverageTable(reader, offset + coverageOffset);

		// エントリーエグジットレコードのオフセットを読み取る
		const entryExitRecords: EntryExitRecord[] = [];

		for (let i = 0; i < entryExitCount; i++) {
			const entryAnchorOffset = reader.readUInt16();
			const exitAnchorOffset = reader.readUInt16();

			entryExitRecords.push({
				entryAnchor: entryAnchorOffset !== 0 ? parseAnchorTable(reader, offset + entryAnchorOffset) : undefined,
				exitAnchor: exitAnchorOffset !== 0 ? parseAnchorTable(reader, offset + exitAnchorOffset) : undefined
			});
		}

		return {
			type: GposLookupType.CURSIVE_ATTACHMENT,
			posFormat,
			coverage,
			entryExitCount,
			entryExitRecords
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}
