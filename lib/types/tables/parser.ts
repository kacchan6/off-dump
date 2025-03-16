import { DataReader } from "../../utils/data-reader";
import { Font, TableDirectoryEntry } from "../font";

/**
 * テーブルパーサー関数の型定義
 */
export type TableParser = (
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
) => any;

