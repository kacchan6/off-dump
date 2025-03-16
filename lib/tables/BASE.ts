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
function parseDeviceTable(reader: DataReader, offset: number): DeviceTable {
    reader.seek(offset);

    const startSize = reader.readUInt16();
    const endSize = reader.readUInt16();
    const deltaFormat = reader.readUInt16();

    // デルタ値の配列
    const deltaValues: number[] = [];
    const numSizes = endSize - startSize + 1;

    // フォーマットに基づいてデルタ値を解析
    if (deltaFormat === 1) {
        // 2ビットごとのデルタ値
        const wordCount = Math.ceil(numSizes * 2 / 16);
        let bitPosition = 0;

        for (let i = 0; i < wordCount; i++) {
            const word = reader.readUInt16();

            for (let j = 0; j < 8 && bitPosition < numSizes; j++, bitPosition++) {
                // 各2ビットエントリを抽出
                const deltaValue = (word >> (14 - (j * 2))) & 0x3;
                // 2ビット符号付き値を解釈
                deltaValues.push(deltaValue >= 2 ? deltaValue - 4 : deltaValue);
            }
        }
    } else if (deltaFormat === 2) {
        // 4ビットごとのデルタ値
        const wordCount = Math.ceil(numSizes * 4 / 16);
        let bitPosition = 0;

        for (let i = 0; i < wordCount; i++) {
            const word = reader.readUInt16();

            for (let j = 0; j < 4 && bitPosition < numSizes; j++, bitPosition++) {
                // 各4ビットエントリを抽出
                const deltaValue = (word >> (12 - (j * 4))) & 0xF;
                // 4ビット符号付き値を解釈
                deltaValues.push(deltaValue >= 8 ? deltaValue - 16 : deltaValue);
            }
        }
    } else if (deltaFormat === 3) {
        // 8ビットごとのデルタ値
        const wordCount = Math.ceil(numSizes * 8 / 16);
        let bytePosition = 0;

        for (let i = 0; i < wordCount; i++) {
            const word = reader.readUInt16();

            // 上位バイト
            if (bytePosition < numSizes) {
                const highByte = (word >> 8) & 0xFF;
                // 8ビット符号付き値を解釈
                deltaValues.push(highByte >= 128 ? highByte - 256 : highByte);
                bytePosition++;
            }

            // 下位バイト
            if (bytePosition < numSizes) {
                const lowByte = word & 0xFF;
                // 8ビット符号付き値を解釈
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
 * アンカーテーブルを解析する
 */
function parseBaseAnchor(reader: DataReader, offset: number): BaseAnchor {
    reader.seek(offset);

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
        const xDeviceTable = xDeviceOffset !== 0
            ? parseDeviceTable(reader, offset + xDeviceOffset)
            : undefined;
        const yDeviceTable = yDeviceOffset !== 0
            ? parseDeviceTable(reader, offset + yDeviceOffset)
            : undefined;

        // アンカーにデバイステーブルを追加
        if (xDeviceTable || yDeviceTable) {
            anchor.deviceTable = {
                xDeviceTable: xDeviceTable,
                yDeviceTable: yDeviceTable
            };
        }
    }

    return anchor;
}

/**
 * 座標テーブルを解析する
 */
function parseBaseCoordTable(reader: DataReader, offset: number): BaseCoordTable {
    reader.seek(offset);

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

        coordinateRecords.push(record);
    }

    return {
        defaultCoordinate,
        coordinateRecords: coordinateRecords.length > 0 ? coordinateRecords : undefined
    };
}

/**
 * 軸テーブルを解析する
 */
function parseBaseAxisTable(reader: DataReader, offset: number): BaseAxisTable {
    reader.seek(offset);

    const baseCoordOffset = reader.readUInt16();
    const minCoordOffset = reader.readUInt16();
    const maxCoordOffset = reader.readUInt16();

    const baseCoordTable = parseBaseCoordTable(reader, offset + baseCoordOffset);

    const axisTable: BaseAxisTable = {
        baseCoordTable
    };

    // 最小座標テーブルがある場合
    if (minCoordOffset !== 0) {
        axisTable.minCoordTable = parseBaseCoordTable(reader, offset + minCoordOffset);
    }

    // 最大座標テーブルがある場合
    if (maxCoordOffset !== 0) {
        axisTable.maxCoordTable = parseBaseCoordTable(reader, offset + maxCoordOffset);
    }

    return axisTable;
}

/**
 * スクリプトテーブルを解析する
 */
function parseBaseScriptTable(reader: DataReader, offset: number): BaseScriptTable {
    reader.seek(offset);

    const defaultBaselineTag = reader.readTag() as BaselineTag;
    const baselineRecordCount = reader.readUInt16();
    const baselineRecords: BaselineRecord[] = [];

    for (let i = 0; i < baselineRecordCount; i++) {
        const baselineTag = reader.readTag() as BaselineTag;
        const baselineAnchorOffset = reader.readUInt16();

        baselineRecords.push({
            baselineTag,
            baselineAnchor: parseBaseAnchor(reader, offset + baselineAnchorOffset)
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
    // テーブルのサブリーダーを作成
    reader.seek(entry.offset);
    const tableReader = reader.createSubReader(entry.length);

    // BASEテーブルヘッダーを読み込む
    const version = tableReader.readUInt32() as BaseVersion;
    const scriptListOffset = tableReader.readUInt16();
    const horizAxisOffset = tableReader.readUInt16();
    const vertAxisOffset = tableReader.readUInt16();

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