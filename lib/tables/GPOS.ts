/**
 * GPOS - グリフ配置テーブル
 * 高度なテキストレイアウトのためのグリフ位置調整情報を提供する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gpos
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import { GposTable, GposHeader, GposVersion } from '../types/tables/GPOS';
import {
  parseScriptListTable, parseFeatureListTable, parseLookupListTable
} from './gposgsub/common';

// GPOSルックアップ解析関数をインポート
import { parseGposLookupTable } from './gposgsub/gpos-common';

/**
 * GPOSテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたGPOSテーブル詳細
 */
export function parseGposTable(
  reader: DataReader,
  entry: TableDirectoryEntry,
  font: Font
): GposTable {
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
  if (version === GposVersion.VERSION_1_1) {
    featureVariationsOffset = tableReader.readUInt16();
  }
  
  // ヘッダーオブジェクトを作成
  const header: GposHeader = {
    version: version as GposVersion,
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
    parseGposLookupTable
  );
  
  // 機能バリエーションを解析（現在は未実装）
  // let featureVariations = undefined;
  // if (featureVariationsOffset !== 0) {
  //    featureVariations = parseFeatureVariationsTable(reader, tableStart + featureVariationsOffset);
  // }
  
  // GPOSテーブルを返す
  return {
    header,
    scriptList,
    featureList,
    lookupList
  };
}