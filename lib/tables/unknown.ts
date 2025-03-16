/**
 * 不明なテーブル用の汎用的なテーブルハンドラ
 */

import { Font, TableDirectoryEntry } from '../types/font';
import { UnknownTable } from '../types/tables/unknown';
import { DataReader } from '../utils/data-reader';

/**
 * 不明なテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされた不明なテーブル詳細
 */
export function parseUnknownTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): UnknownTable {
	// テーブルの位置にシーク
	reader.seek(entry.offset);

	// テーブルの内容をバイナリデータとして読み取る
	const data = reader.readBytes(entry.length);

	// 不明なテーブルとして返す
	return {
		data
	};
}
