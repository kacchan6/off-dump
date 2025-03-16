/**
 * フォントテーブルのレジストリとパーサーのマッピング
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';

// テーブルパーサー
import { parseHeadTable } from './head';
import { TableParser, UnknownTable } from '../types/table';
import { parseNameTable } from './name';
import { parseCmapTable } from './cmap';
import { parseHheaTable } from './hhea';
import { parseOS2Table } from './OS_2';
import { parsePostTable } from './post';
import { parseMaxpTable } from './maxp';
import { parseVheaTable } from './vhea';
import { parseHmtxTable } from './hmtx';
import { parseVmtxTable } from './vmtx';
import { ArrayBufferRef } from '../utils/array-buffer-ref';
import { parseDsigTable } from './DSIG';

/**
 * テーブル名とパーサー関数のマッピング
 */
export const tableParsers: { [tag: string]: TableParser } = {
	'head': parseHeadTable,
	'name': parseNameTable,
	'cmap': parseCmapTable,
	'hhea': parseHheaTable,
	'OS/2': parseOS2Table,
	'post': parsePostTable,
	'maxp': parseMaxpTable,
	'vhea': parseVheaTable,
	'hmtx': parseHmtxTable,
	'vmtx': parseVmtxTable,
	'DSIG': parseDsigTable,
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

/**
 * 不明なテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされた不明なテーブル詳細
 */
function parseUnknownTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): UnknownTable {
	// 元のバッファとオフセット、長さの情報を使って
	// 新しいバッファを作成する代わりに情報を保持するだけ
	return {
		data: new ArrayBufferRef(reader.getBuffer(), entry.offset, entry.length)
	};
}
