/**
 * maxp - 最大プロファイルテーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/maxp
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import { AnyMaxpTable, MaxpTableV05, MaxpTableV1 } from '../types/tables/maxp';

/**
 * maxpテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたmaxpテーブル詳細
 */
export function parseMaxpTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): AnyMaxpTable {
	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// バージョンを読み取る（Fixed形式）
	const version = tableReader.readVersion16Dot16();

	// グリフの数を読み取る
	const numGlyphs = tableReader.readUInt16();

	// バージョンに基づいて追加フィールドを解析
	if (version === 0.5) {
		// バージョン0.5はCFFフォント用の簡易版
		return {
			version: 0.5,
			numGlyphs
		} as MaxpTableV05;
	} else if (version === 1.0) {
		// バージョン1.0はTrueTypeフォント用の完全版
		const v1Table: MaxpTableV1 = {
			version: 1.0,
			numGlyphs,
			maxPoints: tableReader.readUInt16(),
			maxContours: tableReader.readUInt16(),
			maxCompositePoints: tableReader.readUInt16(),
			maxCompositeContours: tableReader.readUInt16(),
			maxZones: tableReader.readUInt16(),
			maxTwilightPoints: tableReader.readUInt16(),
			maxStorage: tableReader.readUInt16(),
			maxFunctionDefs: tableReader.readUInt16(),
			maxInstructionDefs: tableReader.readUInt16(),
			maxStackElements: tableReader.readUInt16(),
			maxSizeOfInstructions: tableReader.readUInt16(),
			maxComponentElements: tableReader.readUInt16(),
			maxComponentDepth: tableReader.readUInt16()
		};

		return v1Table;
	}

	// 未知のバージョンの場合は、読み取った情報だけを返す
	console.warn(`Unknown maxp table version: ${version}`);
	return {
		version,
		numGlyphs
	} as MaxpTableV05;
}
