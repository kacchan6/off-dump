/**
 * 不明なテーブル用の汎用的なテーブルハンドラ
 */

import { Font, TableDirectoryEntry } from '../types/font';
import { UnknownTable } from '../types/table';
import { ArrayBufferRef } from '../utils/array-buffer-ref';
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
	// 元のバッファとオフセット、長さの情報を使って
	// 新しいバッファを作成する代わりに情報を保持するだけ
	return {
		data: new ArrayBufferRef(reader.getBuffer(), entry.offset, entry.length)
	};
}
