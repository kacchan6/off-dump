/**
 * head - フォントヘッダーテーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/head
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import { HeadTable } from '../types/tables/head';

/**
 * headテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたheadテーブル詳細
 */
export function parseHeadTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): HeadTable {
	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// headテーブルの解析
	const version = tableReader.readFixed();
	const fontRevision = tableReader.readFixed();
	const checkSumAdjustment = tableReader.readUInt32();
	const magicNumber = tableReader.readUInt32();

	// マジックナンバーの検証
	if (magicNumber !== 0x5F0F3CF5) {
		throw new Error(`Invalid head table magic number: 0x${magicNumber.toString(16).toUpperCase()}`);
	}

	const flags = tableReader.readUInt16();
	const unitsPerEm = tableReader.readUInt16();
	const created = tableReader.readLongDateTime();
	const modified = tableReader.readLongDateTime();
	const xMin = tableReader.readFWORD();
	const yMin = tableReader.readFWORD();
	const xMax = tableReader.readFWORD();
	const yMax = tableReader.readFWORD();
	const macStyle = tableReader.readUInt16();
	const lowestRecPPEM = tableReader.readUInt16();
	const fontDirectionHint = tableReader.readInt16();
	const indexToLocFormat = tableReader.readInt16();
	const glyphDataFormat = tableReader.readInt16();

	return {
		version,
		fontRevision,
		checkSumAdjustment,
		magicNumber,
		flags,
		unitsPerEm,
		created,
		modified,
		xMin,
		yMin,
		xMax,
		yMax,
		macStyle,
		lowestRecPPEM,
		fontDirectionHint,
		indexToLocFormat,
		glyphDataFormat
	};
}
