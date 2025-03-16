/**
 * GSUB - グリフ置換テーブル
 * テキストレイアウトのためのグリフ置換情報を提供する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gsub
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import { GsubTable, GsubHeader, GsubVersion } from '../types/tables/GSUB';
import {
	parseScriptListTable, parseFeatureListTable, parseLookupListTable
} from './gposgsub/common';

// GSUBルックアップ解析関数をインポート
import { parseGsubLookupTable } from './gposgsub/gsub-common';

/**
 * GSUBテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたGSUBテーブル詳細
 */
export function parseGsubTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): GsubTable {
	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// テーブルの開始オフセットを保存
	const tableStart = entry.offset;

	// ヘッダー情報を読み取る
	const version = tableReader.readUInt32();
	const scriptListOffset = tableReader.readUInt16();
	const featureListOffset = tableReader.readUInt16();
	const lookupListOffset = tableReader.readUInt16();

	// バージョン1.1の場合は機能バリエーションオフセットを読み取る
	let featureVariationsOffset = 0;
	if (version === GsubVersion.VERSION_1_1) {
		featureVariationsOffset = tableReader.readUInt16();
	}

	// ヘッダーオブジェクトを作成
	const header: GsubHeader = {
		version: version as GsubVersion,
		scriptListOffset,
		featureListOffset,
		lookupListOffset,
	};

	if (featureVariationsOffset !== 0) {
		header.featureVariationsOffset = featureVariationsOffset;
	}

	// スクリプトリスト、機能リスト、ルックアップリストを解析
	const scriptList = parseScriptListTable(reader, tableStart + scriptListOffset);
	const featureList = parseFeatureListTable(reader, tableStart + featureListOffset);
	const lookupList = parseLookupListTable(
		reader,
		tableStart + lookupListOffset,
		parseGsubLookupTable
	);

	// 機能バリエーションを解析（現在は未実装）
	// let featureVariations = undefined;
	// if (featureVariationsOffset !== 0) {
	//    featureVariations = parseFeatureVariationsTable(reader, tableStart + featureVariationsOffset);
	// }

	// GSUBテーブルを返す
	return {
		header,
		scriptList,
		featureList,
		lookupList
	};
}