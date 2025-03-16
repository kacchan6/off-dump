import { ArrayBufferRef } from "../utils/array-buffer-ref";
import { DataReader } from "../utils/data-reader";
import { Font, TableDirectoryEntry } from "./font";
import { CmapTable } from "./tables/cmap";
import { DsigTable } from "./tables/DSIG";
import { GposTable } from "./tables/GPOS";
import { GsubTable } from "./tables/GSUB";
import { HeadTable } from "./tables/head";
import { HheaTable } from "./tables/hhea";
import { HmtxTable } from "./tables/hmtx";
import { MaxpTable } from "./tables/maxp";
import { NameTable } from "./tables/name";
import { OS2Table } from "./tables/OS_2";
import { PostTable } from "./tables/post";
import { VheaTable } from "./tables/vhea";
import { VmtxTable } from "./tables/vmtx";
import { VorgTable } from "./tables/VORG";

/**
 * テーブルパーサー関数の型定義
 */
export type TableParser = (
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
) => any;

/**
 * 既知のテーブルタイプのマッピング
 */
export interface KnownTableTypeMap {
	'cmap': CmapTable;
	'head': HeadTable;
	'name': NameTable;
	'hhea': HheaTable;
	'OS_2': OS2Table;
	'post': PostTable;
	'maxp': MaxpTable;
	'vhea': VheaTable;
	'hmtx': HmtxTable;
	'vmtx': VmtxTable;
	'DSIG': DsigTable;
	'VORG': VorgTable;
	'GPOS': GposTable;
	'GSUB': GsubTable;
	// 他のテーブルの型をここに追加
}

/**
 * 不明なテーブル詳細インターフェース
 */
export interface UnknownTable {
	/**
	 * テーブルの生データ
	 */
	data: ArrayBufferRef;
}
