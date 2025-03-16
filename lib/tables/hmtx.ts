/**
 * hmtx - 水平メトリクステーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/hmtx
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import { HmtxTable, LongHorMetricRecord } from '../types/tables/hmtx';

/**
 * hmtxテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたhmtxテーブル詳細
 */
export function parseHmtxTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): HmtxTable {
	// 必要な情報をhheaとmaxpテーブルから取得
	const hhea = font.tables['hhea']?.table;
	const maxp = font.tables['maxp']?.table;

	if (!hhea || !maxp) {
		throw new Error('hmtx parsing requires hhea and maxp tables');
	}

	const numGlyphs = maxp.numGlyphs;
	const numOfLongHorMetrics = hhea.numOfLongHorMetrics;

	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// 水平メトリクスデータを解析
	const hMetrics: LongHorMetricRecord[] = [];

	// longhorMetricレコード（advanceWidth + leftSideBearing）を読み込む
	for (let i = 0; i < numOfLongHorMetrics; i++) {
		hMetrics.push({
			advanceWidth: tableReader.readUSHORT(),
			leftSideBearing: tableReader.readSHORT()
		});
	}

	// 残りのグリフの leftSideBearing を読み込む
	const leftSideBearing: number[] = [];
	for (let i = 0; i < numGlyphs - numOfLongHorMetrics; i++) {
		leftSideBearing.push(tableReader.readSHORT());
	}

	return {
		hMetrics,
		leftSideBearing
	};
}
