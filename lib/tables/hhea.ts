/**
 * hhea - 水平ヘッダーテーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/hhea
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import { HheaTable } from '../types/tables/hhea';

/**
 * hheaテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたhheaテーブル詳細
 */
export function parseHheaTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): HheaTable {
	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// hheaテーブルの解析
	const version = tableReader.readFixed();
	const ascent = tableReader.readFWORD();
	const descent = tableReader.readFWORD();
	const lineGap = tableReader.readFWORD();
	const advanceWidthMax = tableReader.readUFWORD();
	const minLeftSideBearing = tableReader.readFWORD();
	const minRightSideBearing = tableReader.readFWORD();
	const xMaxExtent = tableReader.readFWORD();
	const caretSlopeRise = tableReader.readInt16();
	const caretSlopeRun = tableReader.readInt16();
	const caretOffset = tableReader.readFWORD();
	const reserved1 = tableReader.readInt16();
	const reserved2 = tableReader.readInt16();
	const reserved3 = tableReader.readInt16();
	const reserved4 = tableReader.readInt16();
	const metricDataFormat = tableReader.readInt16();
	const numOfLongHorMetrics = tableReader.readUInt16();

	return {
		version,
		ascent,
		descent,
		lineGap,
		advanceWidthMax,
		minLeftSideBearing,
		minRightSideBearing,
		xMaxExtent,
		caretSlopeRise,
		caretSlopeRun,
		caretOffset,
		reserved1,
		reserved2,
		reserved3,
		reserved4,
		metricDataFormat,
		numOfLongHorMetrics
	};
}
