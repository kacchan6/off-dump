/**
 * vhea - 垂直ヘッダーテーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/vhea
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import { VheaTable } from '../types/tables/vhea';

/**
 * vheaテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたvheaテーブル詳細
 */
export function parseVheaTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): VheaTable {
	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// vheaテーブルの解析
	const version = tableReader.readVersion16Dot16();
	const vertTypoAscender = tableReader.readSHORT();
	const vertTypoDescender = tableReader.readSHORT();
	const vertTypoLineGap = tableReader.readSHORT();
	const advanceHeightMax = tableReader.readUSHORT();
	const minTopSideBearing = tableReader.readSHORT();
	const minBottomSideBearing = tableReader.readSHORT();
	const yMaxExtent = tableReader.readSHORT();
	const caretSlopeRise = tableReader.readSHORT();
	const caretSlopeRun = tableReader.readSHORT();
	const caretOffset = tableReader.readSHORT();
	const reserved1 = tableReader.readSHORT();
	const reserved2 = tableReader.readSHORT();
	const reserved3 = tableReader.readSHORT();
	const reserved4 = tableReader.readSHORT();
	const metricDataFormat = tableReader.readSHORT();
	const numOfLongVerMetrics = tableReader.readUSHORT();

	return {
		version,
		vertTypoAscender,
		vertTypoDescender,
		vertTypoLineGap,
		advanceHeightMax,
		minTopSideBearing,
		minBottomSideBearing,
		yMaxExtent,
		caretSlopeRise,
		caretSlopeRun,
		caretOffset,
		reserved1,
		reserved2,
		reserved3,
		reserved4,
		metricDataFormat,
		numOfLongVerMetrics
	};
}
