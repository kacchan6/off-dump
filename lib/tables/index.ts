/**
 * フォントテーブルのレジストリとパーサーのマッピング
 */

import { Font, TableDirectoryEntry } from '../types/font';
import { DataReader } from '../utils/data-reader';

// テーブルパーサー
import { TableParser, UnknownTable } from '../types/table';
import { ArrayBufferRef } from '../utils/array-buffer-ref';
import { parseBaseTable } from './BASE';
import { parseCFF2Table } from './CFF2';
import { parseCFFTable as parseCffTable } from './CFF_';
import { parseCmapTable } from './cmap';
import { parseDsigTable } from './DSIG';
import { parseGposTable } from './GPOS';
import { parseGsubTable } from './GSUB';
import { parseHeadTable } from './head';
import { parseHheaTable } from './hhea';
import { parseHmtxTable } from './hmtx';
import { parseMaxpTable } from './maxp';
import { parseNameTable } from './name';
import { parseOS2Table } from './OS_2';
import { parsePostTable } from './post';
import { parseVheaTable } from './vhea';
import { parseVmtxTable } from './vmtx';
import { parseVorgTable } from './VORG';

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
	'VORG': parseVorgTable,
	'GPOS': parseGposTable,
	'GSUB': parseGsubTable,
	'BASE': parseBaseTable,
	'CFF ': parseCffTable,
	'CFF2': parseCFF2Table,
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
