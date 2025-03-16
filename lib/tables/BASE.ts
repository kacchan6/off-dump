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
	BaseScriptRecord,
	BaseAnchor,
	BaseValuesTable,
	MinMaxTable,
	FeatMinMaxRecord,
	BaseLangSysRecord,
	BaseTagListTable,
	BaselineTag
} from '../types/tables/BASE';

/**
 * デバイステーブルを解析する
 */
function parseDeviceTable(reader: DataReader, tableStart: number, offset: number): DeviceTable | undefined {
	if (offset === 0) {
		return undefined;
	}

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
 * ベースライン座標テーブルを解析する
 */
function parseBaseCoordTable(reader: DataReader, tableStart: number, coordOffset: number): BaseCoordTable | undefined {
	if (coordOffset === 0) {
		return undefined;
	}

	reader.seek(tableStart + coordOffset);

	const baseCoordFormat = reader.readUInt16();
	const coordinate = reader.readInt16();

	const result: BaseCoordTable = {
		baseCoordFormat,
		coordinate
	};

	// フォーマットに応じて追加フィールドを読み込む
	if (baseCoordFormat === 2) {
		result.referenceGlyph = reader.readUInt16();
		result.baselineIndex = reader.readUInt16();
	} else if (baseCoordFormat === 3) {
		const deviceTableOffset = reader.readUInt16();
		if (deviceTableOffset !== 0) {
			result.deviceTable = parseDeviceTable(reader, tableStart + coordOffset, deviceTableOffset);
		}
	}

	return result;
}

/**
 * MinMaxテーブルを解析する
 */
function parseMinMaxTable(reader: DataReader, tableStart: number, minMaxOffset: number, version: BaseVersion): MinMaxTable | undefined {
	if (minMaxOffset === 0) {
		return undefined;
	}

	reader.seek(tableStart + minMaxOffset);

	const minCoordOffset = reader.readUInt16();
	const maxCoordOffset = reader.readUInt16();

	const minMaxTable: MinMaxTable = {};

	if (minCoordOffset !== 0) {
		minMaxTable.minCoord = parseBaseCoordTable(reader, tableStart + minMaxOffset, minCoordOffset);
	}

	if (maxCoordOffset !== 0) {
		minMaxTable.maxCoord = parseBaseCoordTable(reader, tableStart + minMaxOffset, maxCoordOffset);
	}

	// バージョン1.1では機能変異レコードがある
	if (version === BaseVersion.VERSION_1_1) {
		const featMinMaxCount = reader.readUInt16();
		if (featMinMaxCount > 0) {
			minMaxTable.featMinMaxRecord = [];

			for (let i = 0; i < featMinMaxCount; i++) {
				const featureTableTag = reader.readTag();
				const minCoordOffset = reader.readUInt16();
				const maxCoordOffset = reader.readUInt16();

				const featRecord: FeatMinMaxRecord = {
					featureTableTag
				};

				if (minCoordOffset !== 0) {
					featRecord.minCoord = parseBaseCoordTable(reader, tableStart + minMaxOffset, minCoordOffset);
				}

				if (maxCoordOffset !== 0) {
					featRecord.maxCoord = parseBaseCoordTable(reader, tableStart + minMaxOffset, maxCoordOffset);
				}

				minMaxTable.featMinMaxRecord.push(featRecord);
			}
		}
	}

	return minMaxTable;
}

/**
 * ベースライン値テーブルを解析する
 */
function parseBaseValuesTable(reader: DataReader, tableStart: number, valuesOffset: number): BaseValuesTable | undefined {
	if (valuesOffset === 0) {
		return undefined;
	}

	reader.seek(tableStart + valuesOffset);

	const defaultIndex = reader.readUInt16();
	const baseCoordCount = reader.readUInt16();

	const baseCoordOffsets: number[] = [];
	for (let i = 0; i < baseCoordCount; i++) {
		baseCoordOffsets.push(reader.readUInt16());
	}

	const baseCoords: BaseCoordTable[] = [];
	for (const offset of baseCoordOffsets) {
		if (offset !== 0) {
			const baseCoord = parseBaseCoordTable(reader, tableStart + valuesOffset, offset);
			if (baseCoord) {
				baseCoords.push(baseCoord);
			}
		} else {
			// オフセットが0の場合はnullを追加（インデックスを維持するため）
			baseCoords.push({
				baseCoordFormat: 0,
				coordinate: 0
			});
		}
	}

	return {
		defaultIndex,
		baseCoordCount,
		baseCoords
	};
}

/**
 * 言語システムテーブルを解析する
 */
function parseBaseLangSysTable(reader: DataReader, tableStart: number, langSysOffset: number, version: BaseVersion): BaseLangSysRecord | undefined {
	if (langSysOffset === 0) {
		return undefined;
	}

	reader.seek(tableStart + langSysOffset);

	const baseLangSysTag = reader.readTag();
	const minMaxOffset = reader.readUInt16();

	const minMax = parseMinMaxTable(reader, tableStart + langSysOffset, minMaxOffset, version);

	if (!minMax) {
		return undefined;
	}

	return {
		baseLangSysTag,
		minMax
	};
}

/**
 * スクリプトテーブルを解析する
 */
function parseBaseScriptTable(reader: DataReader, tableStart: number, scriptOffset: number, version: BaseVersion): BaseScriptTable {
	reader.seek(tableStart + scriptOffset);

	const baseValuesOffset = reader.readUInt16();
	const defaultMinMaxOffset = reader.readUInt16();
	const baseLangSysCount = reader.readUInt16();

	const result: BaseScriptTable = {};

	// ベースライン値テーブルを解析（オプション）
	if (baseValuesOffset !== 0) {
		result.baseValues = parseBaseValuesTable(reader, tableStart + scriptOffset, baseValuesOffset);
	}

	// デフォルト最小/最大テーブルを解析（オプション）
	if (defaultMinMaxOffset !== 0) {
		result.defaultMinMax = parseMinMaxTable(reader, tableStart + scriptOffset, defaultMinMaxOffset, version);
	}

	// 言語システムレコードを解析（オプション）
	if (baseLangSysCount > 0) {
		result.baseLangSysRecords = [];

		const baseLangSysOffsets: { tag: string, offset: number }[] = [];
		for (let i = 0; i < baseLangSysCount; i++) {
			const tag = reader.readTag();
			const offset = reader.readUInt16();
			if (offset !== 0) {
				baseLangSysOffsets.push({ tag, offset });
			}
		}

		for (const { tag, offset } of baseLangSysOffsets) {
			reader.seek(tableStart + scriptOffset + offset);
			const minMaxOffset = reader.readUInt16();

			if (minMaxOffset !== 0) {
				const minMax = parseMinMaxTable(reader, tableStart + scriptOffset + offset, minMaxOffset, version);
				if (minMax) {
					result.baseLangSysRecords.push({
						baseLangSysTag: tag,
						minMax
					});
				}
			}
		}
	}

	return result;
}

/**
 * タグリストテーブルを解析する
 */
function parseBaseTagListTable(reader: DataReader, tableStart: number, tagListOffset: number): BaseTagListTable {
	reader.seek(tableStart + tagListOffset);

	const baseTagCount = reader.readUInt16();
	const baselineTags: BaselineTag[] = [];

	for (let i = 0; i < baseTagCount; i++) {
		baselineTags.push(reader.readTag() as BaselineTag);
	}

	return {
		baseTagCount,
		baselineTags
	};
}

/**
 * スクリプトリストテーブルを解析する
 */
function parseBaseScriptListTable(reader: DataReader, tableStart: number, scriptListOffset: number, version: BaseVersion): BaseScriptRecord[] {
	reader.seek(tableStart + scriptListOffset);

	const baseScriptCount = reader.readUInt16();
	const baseScriptRecords: BaseScriptRecord[] = [];

	// スクリプトレコードのオフセットを読み込む
	const scriptRecords: { tag: string, offset: number }[] = [];
	for (let i = 0; i < baseScriptCount; i++) {
		const tag = reader.readTag();
		const offset = reader.readUInt16();
		if (offset !== 0) {
			scriptRecords.push({ tag, offset });
		}
	}

	// 各スクリプトテーブルを解析
	for (const { tag, offset } of scriptRecords) {
		const baseScript = parseBaseScriptTable(reader, tableStart + scriptListOffset, offset, version);
		baseScriptRecords.push({
			baseScriptTag: tag,
			baseScript
		});
	}

	return baseScriptRecords;
}

/**
 * 軸テーブルを解析する
 */
function parseBaseAxisTable(reader: DataReader, tableStart: number, axisOffset: number, version: BaseVersion): BaseAxisTable | undefined {
	if (axisOffset === 0) {
		return undefined;
	}

	reader.seek(tableStart + axisOffset);

	const baseTagListOffset = reader.readUInt16();
	const baseScriptListOffset = reader.readUInt16();

	const baseTagList = parseBaseTagListTable(reader, tableStart + axisOffset, baseTagListOffset);
	const baseScriptList = parseBaseScriptListTable(reader, tableStart + axisOffset, baseScriptListOffset, version);

	return {
		baseTagList,
		baseScriptList
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

	// 水平軸と垂直軸のオフセットを読み込む
	const horizAxisOffset = reader.readUInt16();
	const vertAxisOffset = reader.readUInt16();

	// バージョン1.1の場合は追加のフィールドを読み取る
	let itemVarStoreOffset = 0;
	if (version === BaseVersion.VERSION_1_1) {
		itemVarStoreOffset = reader.readUInt32();
	}

	// 結果オブジェクトを構築
	const baseTable: BaseTable = {
		version: version as BaseVersion
	};

	// 水平軸テーブルを読み込む
	if (horizAxisOffset !== 0) {
		baseTable.horizAxis = parseBaseAxisTable(reader, tableStart, horizAxisOffset, version as BaseVersion);
	}

	// 垂直軸テーブルを読み込む
	if (vertAxisOffset !== 0) {
		baseTable.vertAxis = parseBaseAxisTable(reader, tableStart, vertAxisOffset, version as BaseVersion);
	}

	// バージョン1.1の場合は項目変更ストアオフセットを追加
	if (version === BaseVersion.VERSION_1_1 && itemVarStoreOffset !== 0) {
		baseTable.itemVarStoreOffset = itemVarStoreOffset;
	}

	return baseTable;
}