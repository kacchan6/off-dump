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

function parseDeviceTable(reader: DataReader, offset: number): DeviceTable {
	reader.seek(offset);

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
function parseBaseAnchor(reader: DataReader, baseOffset: number): BaseAnchor {
	const anchorOffset = reader.getOffset();
	reader.seek(baseOffset + anchorOffset);

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
		const deviceTable: BaseAnchor['deviceTable'] = {};

		if (xDeviceOffset !== 0) {
			deviceTable.xDeviceTable = parseDeviceTable(reader, baseOffset + anchorOffset + xDeviceOffset);
		}

		if (yDeviceOffset !== 0) {
			deviceTable.yDeviceTable = parseDeviceTable(reader, baseOffset + anchorOffset + yDeviceOffset);
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
function parseBaseCoordTable(reader: DataReader, baseOffset: number): BaseCoordTable {
	const coordOffset = reader.getOffset();
	reader.seek(baseOffset + coordOffset);

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
			record.deviceTable = parseDeviceTable(reader, baseOffset + coordOffset + deviceTableOffset);
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
function parseBaseAxisTable(reader: DataReader, baseOffset: number): BaseAxisTable {
	const axisOffset = reader.getOffset();
	reader.seek(baseOffset + axisOffset);

	const baseCoordOffset = reader.readUInt16();
	const minCoordOffset = reader.readUInt16();
	const maxCoordOffset = reader.readUInt16();

	const baseCoordTable = parseBaseCoordTable(reader, baseOffset + axisOffset + baseCoordOffset);

	const axisTable: BaseAxisTable = {
		baseCoordTable
	};

	// 最小座標テーブルがある場合
	if (minCoordOffset !== 0) {
		axisTable.minCoordTable = parseBaseCoordTable(reader, baseOffset + axisOffset + minCoordOffset);
	}

	// 最大座標テーブルがある場合
	if (maxCoordOffset !== 0) {
		axisTable.maxCoordTable = parseBaseCoordTable(reader, baseOffset + axisOffset + maxCoordOffset);
	}

	return axisTable;
}

/**
 * ベースラインテーブルを解析する
 */
function parseBaseScriptTable(reader: DataReader, baseOffset: number): BaseScriptTable {
	const scriptOffset = reader.getOffset();
	reader.seek(baseOffset + scriptOffset);

	const defaultBaselineTag = reader.readTag() as BaselineTag;
	const baselineRecordCount = reader.readUInt16();
	const baselineRecords: BaselineRecord[] = [];

	for (let i = 0; i < baselineRecordCount; i++) {
		const baselineTag = reader.readTag() as BaselineTag;
		const baselineAnchorOffset = reader.readUInt16();

		baselineRecords.push({
			baselineTag,
			baselineAnchor: parseBaseAnchor(reader, baseOffset + scriptOffset)
		});
	}

	return {
		defaultBaselineTag,
		baselineRecords
	};
}

export function parseBaseTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): BaseTable {
	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// メジャーバージョンとマイナーバージョンを16ビット単位で読み取る
	const majorVersion = tableReader.readUInt16();
	const minorVersion = tableReader.readUInt16();

	// バージョンを結合
	const version = (majorVersion << 16) | minorVersion;

	const scriptListOffset = tableReader.readUInt16();
	const horizAxisOffset = tableReader.readUInt16();
	const vertAxisOffset = tableReader.readUInt16();

	// バージョン1.1の場合は追加のフィールドを読み取る
	let itemVarStoreOffset = 0;
	if (version === BaseVersion.VERSION_1_1) {
		itemVarStoreOffset = tableReader.readUInt32();
	}

	// スクリプトリストのカウントを読み取る
	const scriptCount = tableReader.readUInt16();

	// スクリプトオフセットの配列を読み取る
	const scriptOffsets: number[] = [];
	for (let i = 0; i < scriptCount; i++) {
		scriptOffsets.push(tableReader.readUInt16() + entry.offset + scriptListOffset);
	}

	// 各スクリプトを解析
	const scriptList: BaseScriptTable[] = [];
	for (const scriptOffset of scriptOffsets) {
		scriptList.push(parseBaseScriptTable(reader, entry.offset));
	}

	// 結果オブジェクトを構築
	const baseTable: BaseTable = {
		version: version as BaseVersion,
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

	// バージョン1.1の場合、itemVarStoreOffsetを追加
	if (version === BaseVersion.VERSION_1_1 && itemVarStoreOffset !== 0) {
		baseTable.itemVarStoreOffset = itemVarStoreOffset;
	}

	return baseTable;
}