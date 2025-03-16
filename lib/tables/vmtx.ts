/**
 * vmtx - 垂直メトリクステーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/vmtx
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import { VmtxTable, LongVerMetricRecord } from '../types/tables/vmtx';

/**
 * vmtxテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたvmtxテーブル詳細
 */
export function parseVmtxTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): VmtxTable {
	// 必要な情報をvheaとmaxpテーブルから取得
	const vhea = font.tables['vhea']?.table;
	const maxp = font.tables['maxp']?.table;

	if (!vhea || !maxp) {
		throw new Error('vmtx parsing requires vhea and maxp tables');
	}

	const numGlyphs = maxp.numGlyphs;
	const numOfLongVerMetrics = vhea.numOfLongVerMetrics;

	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// 垂直メトリクスデータを解析
	const vMetrics: LongVerMetricRecord[] = [];

	// longverMetricレコード（advanceHeight + topSideBearing）を読み込む
	for (let i = 0; i < numOfLongVerMetrics; i++) {
		vMetrics.push({
			advanceHeight: tableReader.readUSHORT(),
			topSideBearing: tableReader.readSHORT()
		});
	}

	// 残りのグリフの topSideBearing を読み込む
	const topSideBearing: number[] = [];
	for (let i = 0; i < numGlyphs - numOfLongVerMetrics; i++) {
		topSideBearing.push(tableReader.readSHORT());
	}

	return {
		vMetrics,
		topSideBearing
	};
}
