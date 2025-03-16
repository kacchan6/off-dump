/**
 * OpenType共通テーブルのパーサー
 * GSUB/GPOSテーブルなどで共通して使用される構造のパーサー
 */

import { ClassDefTable, ClassRangeRecord, DeviceTable } from '../types/common';
import { DataReader } from '../utils/data-reader';

/**
 * カバレッジテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset カバレッジテーブルへのオフセット
 * @returns カバレッジ配列（グリフインデックスの配列）
 */
export function parseCoverageTable(reader: DataReader, offset: number): number[] {
    // 位置を保存
    reader.save();
    
    try {
        // オフセット位置に移動
        reader.seek(offset);
        
        // フォーマットを読み取る
        const coverageFormat = reader.readUInt16();
        
        if (coverageFormat === 1) {
            // フォーマット1: グリフインデックスの配列
            const glyphCount = reader.readUInt16();
            const glyphArray: number[] = [];
            
            for (let i = 0; i < glyphCount; i++) {
                glyphArray.push(reader.readUInt16());
            }
            
            return glyphArray;
        } else if (coverageFormat === 2) {
            // フォーマット2: 範囲レコードの配列
            const rangeCount = reader.readUInt16();
            const coverage: number[] = [];
            
            for (let i = 0; i < rangeCount; i++) {
                const startGlyphID = reader.readUInt16();
                const endGlyphID = reader.readUInt16();
                const startCoverageIndex = reader.readUInt16();
                
                // 範囲内の各グリフをカバレッジ配列に追加
                for (let glyphID = startGlyphID, j = 0; glyphID <= endGlyphID; glyphID++, j++) {
                    coverage[startCoverageIndex + j] = glyphID;
                }
            }
            
            return coverage;
        } else {
            throw new Error(`Unsupported coverage format: ${coverageFormat}`);
        }
    } finally {
        // 位置を復元
        reader.restore();
    }
}

/**
 * クラス定義テーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset クラス定義テーブルへのオフセット
 * @returns クラス定義テーブル
 */
export function parseClassDefTable(reader: DataReader, offset: number): ClassDefTable {
    // 位置を保存
    reader.save();
    
    try {
        // オフセット位置に移動
        reader.seek(offset);
        
        // フォーマットを読み取る
        const classFormat = reader.readUInt16();
        
        if (classFormat === 1) {
            // フォーマット1: 範囲内の連続するグリフに対するクラス値の配列
            const startGlyphID = reader.readUInt16();
            const glyphCount = reader.readUInt16();
            
            // クラス値の配列
            const classValueArray: number[] = [];
            for (let i = 0; i < glyphCount; i++) {
                classValueArray.push(reader.readUInt16());
            }
            
            return {
                classFormat,
                startGlyphID,
                glyphCount,
                classValueArray
            };
        } else if (classFormat === 2) {
            // フォーマット2: グリフ範囲のレコード配列
            const rangeCount = reader.readUInt16();
            
            // クラス範囲レコードの配列
            const classRangeRecords: ClassRangeRecord[] = [];
            for (let i = 0; i < rangeCount; i++) {
                classRangeRecords.push({
                    startGlyphID: reader.readUInt16(),
                    endGlyphID: reader.readUInt16(),
                    class: reader.readUInt16()
                });
            }
            
            return {
                classFormat,
                classRangeRecords
            };
        } else {
            throw new Error(`Unsupported class definition format: ${classFormat}`);
        }
    } finally {
        // 位置を復元
        reader.restore();
    }
}

/**
 * デバイステーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset デバイステーブルへのオフセット
 * @returns デバイステーブル
 */
export function parseDeviceTable(reader: DataReader, offset: number): DeviceTable | null {
    if (offset === 0) {
        return null;
    }
    
    // 位置を保存
    reader.save();
    
    try {
        // オフセット位置に移動
        reader.seek(offset);
        
        // 開始サイズ、終了サイズ、フォーマットを読み取る
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
            throw new Error(`Unsupported device table format: ${deltaFormat}`);
        }
        
        return {
            startSize,
            endSize,
            deltaFormat,
            deltaValues
        };
    } finally {
        // 位置を復元
        reader.restore();
    }
}

/**
 * スクリプトリストテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset スクリプトリストテーブルへのオフセット
 * @returns スクリプトテーブルの配列
 */
export function parseScriptListTable(reader: DataReader, offset: number) {
    // 位置を保存
    reader.save();
    
    try {
        // オフセット位置に移動
        reader.seek(offset);
        
        // スクリプトレコードの数
        const scriptCount = reader.readUInt16();
        
        // スクリプトレコードの配列
        const scriptRecords = [];
        
        // スクリプトレコードの情報を読み取る
        for (let i = 0; i < scriptCount; i++) {
            const scriptTag = reader.readTag();
            const scriptOffset = reader.readUInt16() + offset;
            scriptRecords.push({ scriptTag, scriptOffset });
        }
        
        // 各スクリプトテーブルを解析
        const scriptTables = [];
        
        for (const record of scriptRecords) {
            const scriptTable = parseScriptTable(reader, record.scriptOffset);
            scriptTable.scriptTag = record.scriptTag;
            scriptTables.push(scriptTable);
        }
        
        return scriptTables;
    } finally {
        // 位置を復元
        reader.restore();
    }
}

/**
 * スクリプトテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset スクリプトテーブルへのオフセット
 * @returns スクリプトテーブル
 */
export function parseScriptTable(reader: DataReader, offset: number) {
    // 位置を保存
    reader.save();
    
    try {
        // オフセット位置に移動
        reader.seek(offset);
        
        // デフォルト言語システムへのオフセット
        const defaultLangSysOffset = reader.readUInt16();
        
        // 言語システムレコードの数
        const langSysCount = reader.readUInt16();
        
        // 言語システムレコードの配列
        const langSysRecords = [];
        
        // 言語システムレコードの情報を読み取る
        for (let i = 0; i < langSysCount; i++) {
            const langSysTag = reader.readTag();
            const langSysOffset = reader.readUInt16() + offset;
            langSysRecords.push({ langSysTag, langSysOffset });
        }
        
        // デフォルト言語システムテーブルを解析
        let defaultLangSys = null;
        if (defaultLangSysOffset !== 0) {
            defaultLangSys = parseLangSysTable(reader, offset + defaultLangSysOffset);
        }
        
        // 言語システムテーブルを解析
        const langSysRecordsWithTables = [];
        
        for (const record of langSysRecords) {
            const langSys = parseLangSysTable(reader, record.langSysOffset);
            langSysRecordsWithTables.push({
                langSysTag: record.langSysTag,
                langSys: langSys
            });
        }
        
        return {
            scriptTag: '', // スクリプトタグは呼び出し元で設定する
            defaultLangSys,
            langSysRecords: langSysRecordsWithTables
        };
    } finally {
        // 位置を復元
        reader.restore();
    }
}

/**
 * 言語システムテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset 言語システムテーブルへのオフセット
 * @returns 言語システムテーブル
 */
export function parseLangSysTable(reader: DataReader, offset: number) {
    // 位置を保存
    reader.save();
    
    try {
        // オフセット位置に移動
        reader.seek(offset);
        
        // 言語システムテーブルのフィールドを読み取る
        const lookupOrder = reader.readUInt16();
        const requiredFeatureIndex = reader.readUInt16();
        const featureIndexCount = reader.readUInt16();
        
        // 機能インデックスの配列
        const featureIndices = [];
        for (let i = 0; i < featureIndexCount; i++) {
            featureIndices.push(reader.readUInt16());
        }
        
        return {
            lookupOrder,
            requiredFeatureIndex,
            featureIndexCount,
            featureIndices
        };
    } finally {
        // 位置を復元
        reader.restore();
    }
}

/**
 * 機能リストテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset 機能リストテーブルへのオフセット
 * @returns 機能テーブルの配列
 */
export function parseFeatureListTable(reader: DataReader, offset: number) {
    // 位置を保存
    reader.save();
    
    try {
        // オフセット位置に移動
        reader.seek(offset);
        
        // 機能レコードの数
        const featureCount = reader.readUInt16();
        
        // 機能レコードの配列
        const featureRecords = [];
        
        // 機能レコードの情報を読み取る
        for (let i = 0; i < featureCount; i++) {
            const featureTag = reader.readTag();
            const featureOffset = reader.readUInt16() + offset;
            featureRecords.push({ featureTag, featureOffset });
        }
        
        // 各機能テーブルを解析
        const featureTables = [];
        
        for (const record of featureRecords) {
            const featureTable = parseFeatureTable(reader, record.featureOffset);
            featureTable.featureTag = record.featureTag;
            featureTables.push(featureTable);
        }
        
        return featureTables;
    } finally {
        // 位置を復元
        reader.restore();
    }
}

/**
 * 機能テーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset 機能テーブルへのオフセット
 * @returns 機能テーブル
 */
export function parseFeatureTable(reader: DataReader, offset: number) {
    // 位置を保存
    reader.save();
    
    try {
        // オフセット位置に移動
        reader.seek(offset);
        
        // 機能テーブルのフィールドを読み取る
        const featureParamsOffset = reader.readUInt16();
        const lookupIndexCount = reader.readUInt16();
        
        // ルックアップインデックスの配列
        const lookupListIndices = [];
        for (let i = 0; i < lookupIndexCount; i++) {
            lookupListIndices.push(reader.readUInt16());
        }
        
        // 機能パラメータは機能タグによって異なる処理が必要なため、
        // ここでは単純にオフセットのみを返す
        return {
            featureTag: '', // 機能タグは呼び出し元で設定
            featureParamsOffset,
            lookupIndexCount,
            lookupListIndices
        };
    } finally {
        // 位置を復元
        reader.restore();
    }
}

/**
 * ルックアップリストテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset ルックアップリストテーブルへのオフセット
 * @param parseLookupSubtable サブテーブル解析関数（テーブル固有）
 * @returns ルックアップテーブルの配列
 */
export function parseLookupListTable(reader: DataReader, offset: number, parseLookupSubtable: Function) {
    // 位置を保存
    reader.save();
    
    try {
        // オフセット位置に移動
        reader.seek(offset);
        
        // ルックアップテーブルの数
        const lookupCount = reader.readUInt16();
        
        // ルックアップテーブルへのオフセット配列
        const lookupOffsets = [];
        for (let i = 0; i < lookupCount; i++) {
            lookupOffsets.push(reader.readUInt16() + offset);
        }
        
        // 各ルックアップテーブルを解析
        const lookupTables = [];
        
        for (const lookupOffset of lookupOffsets) {
            lookupTables.push(parseLookupTable(reader, lookupOffset, parseLookupSubtable));
        }
        
        return lookupTables;
    } finally {
        // 位置を復元
        reader.restore();
    }
}

/**
 * ルックアップテーブルを解析する
 * 
 * @param reader データリーダー
 * @param offset ルックアップテーブルへのオフセット
 * @param parseLookupSubtable サブテーブル解析関数（テーブル固有）
 * @returns ルックアップテーブル
 */
export function parseLookupTable(reader: DataReader, offset: number, parseLookupSubtable: Function) {
    // 位置を保存
    reader.save();
    
    try {
        // オフセット位置に移動
        reader.seek(offset);
        
        // ルックアップテーブルのフィールドを読み取る
        const lookupType = reader.readUInt16();
        const lookupFlag = reader.readUInt16();
        const subTableCount = reader.readUInt16();
        
        // サブテーブルへのオフセット配列
        const subTableOffsets = [];
        for (let i = 0; i < subTableCount; i++) {
            subTableOffsets.push(reader.readUInt16() + offset);
        }
        
        // マークフィルタリングセット
        let markFilteringSet = undefined;
        
        // ルックアップフラグの8ビット目（0x0100）がセットされている場合
        if (lookupFlag & 0x0010) {
            markFilteringSet = reader.readUInt16();
        }
        
        // サブテーブルを解析
        const subtables = [];
        
        for (const subTableOffset of subTableOffsets) {
            subtables.push(parseLookupSubtable(reader, subTableOffset, lookupType));
        }
        
        return {
            lookupType,
            lookupFlag,
            subTableCount,
            markFilteringSet,
            subtables
        };
    } finally {
        // 位置を復元
        reader.restore();
    }
}