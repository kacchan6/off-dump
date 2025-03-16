/**
 * BASE テーブルパーサー
 * 基本スクリプトのベースライン情報を解析する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/base
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import { DeviceTable } from '../types/common';
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

/**
 * デバイステーブルを解析する
 */
function parseDeviceTable(reader: DataReader, tableStart: number, offset: number): DeviceTable {
	reader.seek(tableStart + offset);

	const startSize = reader.readUInt16();
	const endSize = reader.readUInt16();
	const deltaFormat = reader.readUInt16();

	const deltaValues: number[] = [];
	const numSizes = endSize - startSize + 1;

	if (deltaFormat === 1) {
		const wordCount = Math.ceil(numSizes * 2 / 16);
		let bitPosition = 0;

		for (let i = 0; i < wordCount; i++) {
			const word = reader.readUInt16();

			for (let j = 0; j < 8 && bitPosition < numSizes; j++, bitPosition++) {
				const deltaValue = (word >> (14 - (j * 2))) & 0x3;
				deltaValues.push(deltaValue >= 2 ? deltaValue - 4 : deltaValue);
			}
		}
	} else if (deltaFormat === 2) {
		const wordCount = Math.ceil(numSizes * 4 / 16);
		let bitPosition = 0;

		for (let i = 0; i < wordCount; i++) {
			const word = reader.readUInt16();

			for (let j = 0; j < 4 && bitPosition < numSizes; j++, bitPosition++) {
				const deltaValue = (word >> (12 - (j * 4))) & 0xF;
				deltaValues.push(deltaValue >= 8 ? deltaValue - 16 : deltaValue);
			}
		}
	} else if (deltaFormat === 3) {
		const wordCount = Math.ceil(numSizes * 8 / 16);
		let bytePosition = 0;

		for (let i = 0; i < wordCount; i++) {
			const word = reader.readUInt16();

			if (bytePosition < numSizes) {
				const highByte = (word >> 8) & 0xFF;
				deltaValues.push(highByte >= 128 ? highByte - 256 : highByte);
				bytePosition++;
			}

			if (bytePosition < numSizes) {
				const lowByte = word & 0xFF;
				deltaValues.push(lowByte >= 128 ? lowByte - 256 : lowByte);
				bytePosition++;
			}
		}
	} else {
		throw new Error(`対応していないデバイステーブルフォーマット: ${deltaFormat}`);
	}

	return {
		startSize,
		endSize,
		deltaFormat,
		deltaValues
	};
}

/**
 * ベースラインアンカーを解析する
 */
function parseBaseAnchor(reader: DataReader, tableStart: number, anchorOffset: number): BaseAnchor {
	reader.seek(tableStart + anchorOffset);

	const format = reader.readUInt16();
	const xCoordinate = reader.readInt16();
	const yCoordinate = reader.readInt16();

	const anchor: BaseAnchor = {
		format,
		xCoordinate,
		yCoordinate
	};

	// フォーマット2の場合: アンカーポイント
	if (format === 2) {
		anchor.anchorPoint = reader.readUInt16();
	}
	// フォーマット3の場合: デバイステーブル
	else if (format === 3) {
		const xDeviceOffset = reader.readUInt16();
		const yDeviceOffset = reader.readUInt16();

		// デバイステーブルを解析（オフセットが0でない場合）
		const deviceTable: BaseAnchor['deviceTable'] = {};

		if (xDeviceOffset !== 0) {
			deviceTable.xDeviceTable = parseDeviceTable(reader, tableStart + anchorOffset, xDeviceOffset);
		}

		if (yDeviceOffset !== 0) {
			deviceTable.yDeviceTable = parseDeviceTable(reader, tableStart + anchorOffset, yDeviceOffset);
		}

		// デバイステーブルが存在する場合のみ追加
		if (Object.keys(deviceTable).length > 0) {
			anchor.deviceTable = deviceTable;
		}
	}

	return anchor;
}

/**
 * ベースライン座標テーブルを解析する
 */
function parseBaseCoordTable(reader: DataReader, tableStart: number, coordOffset: number): BaseCoordTable {
	reader.seek(tableStart + coordOffset);

	const defaultCoordinate = reader.readInt16();
	const coordinateRecordCount = reader.readUInt16();
	const coordinateRecords: BaseCoordinateRecord[] = [];

	for (let i = 0; i < coordinateRecordCount; i++) {
		const scriptTag = reader.readTag();
		const languageTag = reader.readTag();

		const coordinate = reader.readInt16();
		const record: BaseCoordinateRecord = {
			scriptTag,
			coordinate
		};

		// 言語タグが有効な場合のみ追加
		if (languageTag && languageTag !== '\0\0\0\0') {
			record.languageTag = languageTag;
		}

		// デバイステーブルのオフセットを読み取る
		const deviceTableOffset = reader.readUInt16();

		// デバイステーブルが存在する場合は解析
		if (deviceTableOffset !== 0) {
			record.deviceTable = parseDeviceTable(reader, tableStart + coordOffset, deviceTableOffset);
		}

		coordinateRecords.push(record);
	}

	return {
		defaultCoordinate,
		coordinateRecords: coordinateRecords.length > 0 ? coordinateRecords : undefined
	};
}

/**
 * ベースライン軸テーブルを解析する
 */
function parseBaseAxisTable(reader: DataReader, tableStart: number, axisOffset: number): BaseAxisTable {
	reader.seek(tableStart + axisOffset);

	const baseCoordOffset = reader.readUInt16();
	const minCoordOffset = reader.readUInt16();
	const maxCoordOffset = reader.readUInt16();

	// ベース座標テーブルを解析
	const baseCoordTable = parseBaseCoordTable(reader, tableStart + axisOffset, baseCoordOffset);

	const axisTable: BaseAxisTable = {
		baseCoordTable
	};

	// 最小座標テーブルがある場合
	if (minCoordOffset !== 0) {
		axisTable.minCoordTable = parseBaseCoordTable(reader, tableStart + axisOffset, minCoordOffset);
	}

	// 最大座標テーブルがある場合
	if (maxCoordOffset !== 0) {
		axisTable.maxCoordTable = parseBaseCoordTable(reader, tableStart + axisOffset, maxCoordOffset);
	}

	return axisTable;
}

/**
 * ベースラインスクリプトテーブルを解析する
 */
function parseBaseScriptTable(reader: DataReader, tableStart: number, scriptOffset: number): BaseScriptTable {
	// スクリプトテーブル位置に移動
	reader.seek(tableStart + scriptOffset);

	// デフォルトのベースラインタグとレコード数を読み取る
	const defaultBaselineTag = reader.readTag() as BaselineTag;
	const baselineRecordCount = reader.readUInt16();
	const baselineRecords: BaselineRecord[] = [];

	// ベースラインレコードを読み取る
	for (let i = 0; i < baselineRecordCount; i++) {
		const baselineTag = reader.readTag() as BaselineTag;
		const baselineAnchorOffset = reader.readUInt16();

		// 有効なオフセットの場合のみ処理
		if (baselineAnchorOffset === 0) {
			continue;
		}

		// ベースラインアンカーを解析
		baselineRecords.push({
			baselineTag,
			baselineAnchor: parseBaseAnchor(reader, tableStart + scriptOffset, baselineAnchorOffset)
		});
	}

	return {
		defaultBaselineTag,
		baselineRecords
	};
}

/**
 * BASEテーブルをパースする
 */
export function parseBaseTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): BaseTable {
	const tableStart = entry.offset;

	// テーブルの先頭に移動
	reader.seek(tableStart);

	// メジャーバージョンとマイナーバージョンを16ビット単位で読み取る
	const majorVersion = reader.readUInt16();
	const minorVersion = reader.readUInt16();

	// バージョンを結合
	const version = (majorVersion << 16) | minorVersion;

	// オフセットを読み込む
	const scriptListOffset = reader.readUInt16();
	const horizAxisOffset = reader.readUInt16();
	const vertAxisOffset = reader.readUInt16();

	// バージョン1.1の場合は追加のフィールドを読み取る
	let itemVarStoreOffset = 0;
	if (version === BaseVersion.VERSION_1_1) {
		itemVarStoreOffset = reader.readUInt32();
	}

	// 結果オブジェクトを構築
	const baseTable: BaseTable = {
		version: version as BaseVersion,
		scriptListOffset,
		scriptList: []
	};

	// スクリプトリストを読み込む
	if (scriptListOffset > 0) {
		// スクリプトリストテーブル位置に移動
		reader.seek(tableStart + scriptListOffset);

		// スクリプト数を読み取る
		const scriptCount = reader.readUInt16();

		// スクリプトオフセットの配列を読み取る
		const scriptOffsets: number[] = [];
		for (let i = 0; i < scriptCount; i++) {
			const scriptOffset = reader.readUInt16();
			if (scriptOffset > 0) {
				scriptOffsets.push(scriptOffset);
			}
		}

		// 各スクリプトテーブルを解析
		for (const scriptOffset of scriptOffsets) {
			const scriptTable = parseBaseScriptTable(reader, tableStart + scriptListOffset, scriptOffset);
			baseTable.scriptList.push(scriptTable);
		}
	}

	// 水平軸テーブルを読み込む
	if (horizAxisOffset > 0) {
		baseTable.horizAxisOffset = horizAxisOffset;
		baseTable.horizAxis = parseBaseAxisTable(reader, tableStart, horizAxisOffset);
	}

	// 垂直軸テーブルを読み込む
	if (vertAxisOffset > 0) {
		baseTable.vertAxisOffset = vertAxisOffset;
		baseTable.vertAxis = parseBaseAxisTable(reader, tableStart, vertAxisOffset);
	}

	// バージョン1.1の場合は項目変更ストアオフセットを追加
	if (version === BaseVersion.VERSION_1_1 && itemVarStoreOffset !== 0) {
		baseTable.itemVarStoreOffset = itemVarStoreOffset;
	}

	return baseTable;
}