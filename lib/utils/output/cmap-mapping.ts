/**
 * cmapマッピング出力プラグイン
 */

import * as fs from 'fs';
import * as path from 'path';
import { Font } from '../../types/font';
import { CmapTable } from '../../types/tables/cmap';
import { generateUnicodeToGlyphMap } from '../tables/cmap';
import { OutputPlugin } from './plugin-interface';

/**
 * コードポイントを16進数と10進数の両方を含むフォーマットに変換する
 * 
 * @param codePoint Unicode コードポイント
 * @returns フォーマットされた文字列
 */
function formatCodePoint(codePoint: number): string {
    // 16進数表現
    const hexStr = `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
    
    // 10進数表現
    const decimalStr = codePoint.toString();
    
    // サロゲートペアかどうかを判定
    if (codePoint > 0xFFFF) {
        // サロゲートペアに変換
        const highSurrogate = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
        const lowSurrogate = ((codePoint - 0x10000) % 0x400) + 0xDC00;
        
        return `${hexStr}:${highSurrogate},${lowSurrogate}`;
    }
    
    return `${hexStr}:${decimalStr}`;
}

/**
 * cmapマッピング出力プラグイン
 */
export class CmapMappingPlugin implements OutputPlugin {
    /**
     * プラグイン名
     */
    name = 'cmap-mapping';

    /**
     * 優先度（低いほど先に実行）
     */
    priority = 10;

    /**
     * このプラグインがフォントに適用可能かを判定
     */
    isApplicable(font: Font): boolean {
        return font.tables['cmap'] !== undefined;
    }

    /**
     * マッピングデータを生成して出力
     */
    execute(font: Font, outputDir: string): boolean {
        try {
            const cmapTable = font.tables['cmap']?.table as CmapTable;
            if (!cmapTable || !cmapTable.encodingRecords || cmapTable.encodingRecords.length === 0) {
                console.warn('CmapMappingPlugin: Invalid cmap table');
                return false;
            }

            // Unicode→グリフIDマッピングを生成
            const map = generateUnicodeToGlyphMap(cmapTable);
            
            // カスタムフォーマットでマッピングオブジェクトを生成
            const mappingObject: Record<string, number> = {};
            
            for (const [cp, glyphId] of map.entries()) {
                const key = formatCodePoint(cp);
                mappingObject[key] = glyphId;
            }
            
            // 出力ファイルパス
            const mapFilePath = path.join(outputDir, 'cmap_mapping.json');
            
            // ファイルに保存
            fs.writeFileSync(mapFilePath, JSON.stringify(mappingObject, null, 2));
            
            return true;
        } catch (error) {
            console.error('CmapMappingPlugin: Error generating mapping:', error);
            return false;
        }
    }
}
