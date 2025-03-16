/**
 * DSIG - デジタル署名テーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/dsig
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import { DsigTable, SignatureRecord } from '../types/tables/DSIG';

/**
 * DSIGテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたDSIGテーブル詳細
 */
export function parseDsigTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): DsigTable {
	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// DSIGテーブルのヘッダーを読み込む
	const version = tableReader.readUInt32();
	const numSignatures = tableReader.readUInt16();
	const flags = tableReader.readUInt16();

	// 署名レコードを読み込む
	const signatureRecords: SignatureRecord[] = [];

	// まずレコードのオフセット情報を読み込む
	const recordInfos: Array<{ format: number, offset: number }> = [];
	for (let i = 0; i < numSignatures; i++) {
		const format = tableReader.readUInt32();
		const length = tableReader.readUInt32();
		const signatureBlockId = tableReader.readUInt32();
		const offset = tableReader.readUInt32();

		recordInfos.push({ format, offset });
	}

	// 次に各レコードの署名データを読み込む
	for (let i = 0; i < numSignatures; i++) {
		const info = recordInfos[i];

		// 現在位置を保存
		tableReader.save();

		// 署名レコードの位置に移動
		tableReader.seek(info.offset);

		// 署名レコードのヘッダーを再度読み込む
		const format = tableReader.readUInt32();
		const length = tableReader.readUInt32();
		const signatureBlockId = tableReader.readUInt32();

		// 署名データを読み込む（長さから署名ヘッダーのサイズを引く）
		const dataLength = length - 12; // 12 = format(4) + length(4) + signatureBlockId(4)
		const signatureData = tableReader.readBytes(dataLength);

		signatureRecords.push({
			format,
			length,
			signatureBlockId,
			signatureData
		});

		// 保存した位置に戻る
		tableReader.restore();
	}

	return {
		version,
		numSignatures,
		flags,
		signatureRecords
	};
}
