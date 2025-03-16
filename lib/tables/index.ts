/**
 * フォントテーブルのレジストリとパーサーのマッピング
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';

// テーブルパーサー
import { parseHeadTable } from './head';
import { parseUnknownTable } from './unknown';
import { TableParser } from '../types/tables/parser';
import { parseNameTable } from './name';

/**
 * テーブル名とパーサー関数のマッピング
 */
export const tableParsers: { [tag: string]: TableParser } = {
	'head': parseHeadTable,
	'name': parseNameTable,
	// 他のテーブルのパーサーをここに追加
};

/**
 * テーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたテーブル詳細
 */
export function parseTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): any {
	// テーブル名に対応するパーサーがある場合はそれを使用
	const parser = tableParsers[entry.tag];
	if (parser) {
		return parser(reader, entry, font);
	}

	// 対応するパーサーがない場合は未知のテーブルとして処理
	return parseUnknownTable(reader, entry, font);
}
