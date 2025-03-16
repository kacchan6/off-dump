/**
 * BASE テーブルパーサー
 * 基本スクリプトのベースライン情報を解析する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/base
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import {
	BaseTable,
	BaseVersion,
	BaseAxisTable,
	BaseCoordTable,
	BaseScriptTable,
	BaselineRecord,
	BaseAnchor,
	BaseCoordinateRecord,
	BaselineTag
} from '../types/tables/BASE';
import { parseDeviceTable } from './gposgsub/common';

/**
 * アンカーテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset アンカーテーブルへのオフセット
 * @returns アンカーテーブル
 */
function parseBaseAnchor(reader: DataReader, offset: number): BaseAnchor {
	reader.save();
	reader.seek(offset);

	// アンカーフォーマットを読み取る
	const format = reader.readUInt16();
	const xCoordinate = reader.readInt16();
	const yCoordinate = reader.readInt16();

	const anchor: BaseAnchor = {
		format,
		xCoordinate,
		yCoordinate
	};

	// フォーマット2の場合: デバイステーブルへのオフセット
	if (format === 2) {
		const xDeviceOffset = reader.readUInt16();
		const yDeviceOffset = reader.readUInt16();

		// デバイステーブルを解析（オフセットが0でない場合）
		const deviceTable = xDeviceOffset !== 0
			? parseDeviceTable(reader, offset + xDeviceOffset)
			: undefined;

		if (deviceTable) {
			anchor.deviceTable = deviceTable;
		}
	}

	reader.restore();
	return anchor;
}

/**
 * 座標テーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset 座標テーブルへのオフセット
 * @returns 座標テーブル
 */
function parseBaseCoordTable(reader: DataReader, offset: number): BaseCoordTable {
	reader.save();
	reader.seek(offset);

	// デフォルト座標値を読み取る
	const defaultCoordinate = reader.readInt16();

	// 座標レコードを解析
	const coordinateRecordCount = reader.readUInt16();
	const coordinateRecords: BaseCoordinateRecord[] = [];

	if (coordinateRecordCount > 0) {
		for (let i = 0; i < coordinateRecordCount; i++) {
			const scriptTag = reader.readTag();
			const languageTag = reader.readTag(); // 0が入る可能性がある
			const coordinate = reader.readInt16();
			const deviceOffset = reader.readUInt16();

			const record: BaseCoordinateRecord = {
				scriptTag,
				coordinate
			};

			// 言語タグが空でない場合のみ追加
			if (languageTag !== '\0\0\0\0') {
				record.languageTag = languageTag;
			}

			// デバイステーブルがある場合は解析
			const deviceTable = deviceOffset !== 0
				? parseDeviceTable(reader, offset + deviceOffset)
				: undefined;

			if (deviceTable) {
				record.deviceTable = deviceTable;
			}

			coordinateRecords.push(record);
		}
	}

	reader.restore();

	return {
		defaultCoordinate,
		coordinateRecords: coordinateRecords.length > 0 ? coordinateRecords : undefined
	};
}

// Rest of the code remains the same
/**
 * 軸テーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset 軸テーブルへのオフセット
 * @returns 軸テーブル
 */
function parseBaseAxisTable(reader: DataReader, offset: number): BaseAxisTable {
	reader.save();
	reader.seek(offset);

	// ベースコード、最小コード、最大コードテーブルのオフセットを読み取る
	const baseCoordOffset = reader.readUInt16();
	const minCoordOffset = reader.readUInt16();
	const maxCoordOffset = reader.readUInt16();

	const axisTable: BaseAxisTable = {
		baseCoordTable: parseBaseCoordTable(reader, offset + baseCoordOffset)
	};

	// 最小座標テーブルがある場合
	if (minCoordOffset !== 0) {
		axisTable.minCoordTable = parseBaseCoordTable(reader, offset + minCoordOffset);
	}

	// 最大座標テーブルがある場合
	if (maxCoordOffset !== 0) {
		axisTable.maxCoordTable = parseBaseCoordTable(reader, offset + maxCoordOffset);
	}

	reader.restore();
	return axisTable;
}

/**
 * スクリプトテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset スクリプトテーブルへのオフセット
 * @returns スクリプトテーブル
 */
function parseBaseScriptTable(reader: DataReader, offset: number): BaseScriptTable {
	reader.save();
	reader.seek(offset);

	// デフォルトベースラインタグを読み取る
	const defaultBaselineTag = reader.readTag() as BaselineTag;

	// ベースラインレコードカウントを読み取る
	const baselineRecordCount = reader.readUInt16();
	const baselineRecords: BaselineRecord[] = [];

	// ベースラインレコードを解析
	for (let i = 0; i < baselineRecordCount; i++) {
		const baselineTag = reader.readTag() as BaselineTag;
		const baselineAnchorOffset = reader.readUInt16();

		baselineRecords.push({
			baselineTag,
			baselineAnchor: parseBaseAnchor(reader, offset + baselineAnchorOffset)
		});
	}

	reader.restore();

	return {
		defaultBaselineTag,
		baselineRecords
	};
}

/**
 * BASE テーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたBASEテーブル詳細
 */
export function parseBaseTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): BaseTable {
	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// BASE テーブルヘッダーを読み込む
	const version = tableReader.readUInt32() as BaseVersion;
	const scriptListOffset = tableReader.readUInt16();
	const horizAxisOffset = tableReader.readUInt16();
	const vertAxisOffset = tableReader.readUInt16();

	// スクリプトリストを解析
	const scriptList: BaseScriptTable[] = [];
	const scriptCount = tableReader.readUInt16();
	const scriptOffsets: number[] = [];

	// スクリプトのオフセットを読み取る
	for (let i = 0; i < scriptCount; i++) {
		scriptOffsets.push(tableReader.readUInt16() + entry.offset + scriptListOffset);
	}

	// 各スクリプトを解析
	for (const scriptOffset of scriptOffsets) {
		scriptList.push(parseBaseScriptTable(reader, scriptOffset));
	}

	// 結果オブジェクトを構築
	const baseTable: BaseTable = {
		version,
		scriptListOffset,
		scriptList
	};

	// 水平軸テーブルがある場合
	if (horizAxisOffset !== 0) {
		baseTable.horizAxisOffset = horizAxisOffset;
		baseTable.horizAxis = parseBaseAxisTable(reader, entry.offset + horizAxisOffset);
	}

	// 垂直軸テーブルがある場合
	if (vertAxisOffset !== 0) {
		baseTable.vertAxisOffset = vertAxisOffset;
		baseTable.vertAxis = parseBaseAxisTable(reader, entry.offset + vertAxisOffset);
	}

	return baseTable;
}
