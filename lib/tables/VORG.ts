/**
 * VORG - 垂直原点テーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/vorg
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import { VorgTable, VertOriginYMetric } from '../types/tables/VORG';

/**
 * VORGテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたVORGテーブル詳細
 */
export function parseVorgTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): VorgTable {
	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// VORGテーブルの解析
	const majorVersion = tableReader.readUInt16();
	const minorVersion = tableReader.readUInt16();
	const defaultVertOriginY = tableReader.readInt16();
	const numVertOriginYMetrics = tableReader.readUInt16();

	// 垂直原点Y座標のメトリクスを読み込む
	const vertOriginYMetrics: VertOriginYMetric[] = [];
	for (let i = 0; i < numVertOriginYMetrics; i++) {
		const glyphIndex = tableReader.readUInt16();
		const vertOriginY = tableReader.readInt16();
		vertOriginYMetrics.push({ glyphIndex, vertOriginY });
	}

	return {
		majorVersion,
		minorVersion,
		defaultVertOriginY,
		numVertOriginYMetrics,
		vertOriginYMetrics
	};
}
