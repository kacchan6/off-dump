/**
 * GPOS テーブル型定義
 * グリフ配置テーブル - テキストレイアウトのためのグリフ位置調整情報
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gpos
 */

import { ScriptTable, FeatureTable, LookupTable } from '../common';

/**
 * GPOS テーブルのバージョン
 */
export enum GposVersion {
	VERSION_1_0 = 0x00010000, // 1.0
	VERSION_1_1 = 0x00010001  // 1.1
}

/**
 * GPOSテーブルのヘッダー
 */
export interface GposHeader {
	/**
	 * テーブルのバージョン
	 */
	version: GposVersion;

	/**
	 * ScriptListテーブルへのオフセット
	 */
	scriptListOffset: number;

	/**
	 * FeatureListテーブルへのオフセット
	 */
	featureListOffset: number;

	/**
	 * LookupListテーブルへのオフセット
	 */
	lookupListOffset: number;

	/**
	 * 機能バリエーションテーブルへのオフセット
	 * バージョン1.1以降で存在
	 */
	featureVariationsOffset?: number;
}

/**
 * GPOSテーブル全体
 */
export interface GposTable {
	/**
	 * テーブルのヘッダー
	 */
	header: GposHeader;

	/**
	 * スクリプトリスト
	 */
	scriptList: ScriptTable[];

	/**
	 * 機能リスト
	 */
	featureList: FeatureTable[];

	/**
	 * ルックアップリスト
	 */
	lookupList: GposLookupTable[];

	/**
	 * 機能バリエーション（存在する場合）
	 */
	featureVariations?: any; // 必要に応じて型を定義
}

/**
 * GPOSのLookupタイプ
 */
export enum GposLookupType {
	SINGLE_ADJUSTMENT = 1,     // 単一位置調整
	PAIR_ADJUSTMENT = 2,       // ペア位置調整
	CURSIVE_ATTACHMENT = 3,    // 筆記体接続
	MARK_TO_BASE_ATTACHMENT = 4,    // マークとベースの接続
	MARK_TO_LIGATURE_ATTACHMENT = 5, // マークと合字の接続
	MARK_TO_MARK_ATTACHMENT = 6,     // マーク同士の接続
	CONTEXTUAL_POSITIONING = 7,      // 文脈依存配置
	CHAINED_CONTEXTUAL_POSITIONING = 8, // 連鎖文脈依存配置
	EXTENSION_POSITIONING = 9        // 拡張配置
}

/**
 * GPOS Lookupテーブル
 */
export interface GposLookupTable extends LookupTable {
	/**
	 * ルックアップタイプ
	 */
	lookupType: GposLookupType;

	/**
	 * サブテーブル
	 */
	subtables: GposSubTable[];
}

/**
 * GPOSサブテーブル (タイプに応じたUnion型)
 */
export type GposSubTable =
	| SingleAdjustmentSubtable
	| PairAdjustmentSubtable
	| CursiveAttachmentSubtable
	| MarkToBaseAttachmentSubtable
	| MarkToLigatureAttachmentSubtable
	| MarkToMarkAttachmentSubtable
	| ContextualPositioningSubtable
	| ChainedContextualPositioningSubtable
	| ExtensionPositioningSubtable;

/**
 * 値レコード - グリフ位置調整値
 */
export interface ValueRecord {
	/**
	 * X方向の位置調整
	 */
	xPlacement?: number;

	/**
	 * Y方向の位置調整
	 */
	yPlacement?: number;

	/**
	 * X方向の前進幅調整
	 */
	xAdvance?: number;

	/**
	 * Y方向の前進幅調整
	 */
	yAdvance?: number;

	/**
	 * X方向の位置調整装置へのオフセット
	 */
	xPlaDeviceOffset?: number;

	/**
	 * Y方向の位置調整装置へのオフセット
	 */
	yPlaDeviceOffset?: number;

	/**
	 * X方向の前進幅調整装置へのオフセット
	 */
	xAdvDeviceOffset?: number;

	/**
	 * Y方向の前進幅調整装置へのオフセット
	 */
	yAdvDeviceOffset?: number;
}

/**
 * 値フォーマット - 有効な値レコードフィールドを示すビットマスク
 */
export enum ValueFormat {
	X_PLACEMENT = 0x0001,         // xPlacement
	Y_PLACEMENT = 0x0002,         // yPlacement
	X_ADVANCE = 0x0004,           // xAdvance
	Y_ADVANCE = 0x0008,           // yAdvance
	X_PLACEMENT_DEVICE = 0x0010,  // xPlaDeviceOffset
	Y_PLACEMENT_DEVICE = 0x0020,  // yPlaDeviceOffset
	X_ADVANCE_DEVICE = 0x0040,    // xAdvDeviceOffset
	Y_ADVANCE_DEVICE = 0x0080     // yAdvDeviceOffset
}

/**
 * アンカーポイント - グリフの接続位置を示す座標
 */
export interface AnchorPoint {
	/**
	 * アンカータイプ
	 */
	anchorFormat: number;

	/**
	 * X座標
	 */
	xCoordinate: number;

	/**
	 * Y座標
	 */
	yCoordinate: number;

	/**
	 * アンカーポイントのコントロールポイントインデックス（フォーマット2）
	 */
	anchorPoint?: number;

	/**
	 * X座標調整装置テーブルへのオフセット（フォーマット3）
	 */
	xDeviceTableOffset?: number;

	/**
	 * Y座標調整装置テーブルへのオフセット（フォーマット3）
	 */
	yDeviceTableOffset?: number;
}

/**
 * 単一位置調整サブテーブル (Lookup Type 1)
 */
export interface SingleAdjustmentSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GposLookupType.SINGLE_ADJUSTMENT;

	/**
	 * 位置調整のフォーマット
	 */
	posFormat: number;

	/**
	 * カバレッジテーブル（対象グリフを示す）
	 */
	coverage: number[];

	/**
	 * 値フォーマット
	 */
	valueFormat: number;

	/**
	 * 単一の値レコード（フォーマット1）
	 */
	valueRecord?: ValueRecord;

	/**
	 * 複数の値レコード（フォーマット2）
	 */
	valueRecords?: ValueRecord[];
}

/**
 * ペア位置調整サブテーブル (Lookup Type 2)
 */
export interface PairAdjustmentSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GposLookupType.PAIR_ADJUSTMENT;

	/**
	 * 位置調整のフォーマット
	 */
	posFormat: number;

	/**
	 * カバレッジテーブル（対象グリフを示す）
	 */
	coverage: number[];

	/**
	 * 最初のグリフの値フォーマット
	 */
	valueFormat1: number;

	/**
	 * 二番目のグリフの値フォーマット
	 */
	valueFormat2: number;

	/**
	 * ペアセット（フォーマット1）
	 */
	pairSets?: PairSetTable[];

	/**
	 * クラス定義テーブル1（フォーマット2）
	 */
	classDef1?: number[];

	/**
	 * クラス定義テーブル2（フォーマット2）
	 */
	classDef2?: number[];

	/**
	 * クラス1の数（フォーマット2）
	 */
	class1Count?: number;

	/**
	 * クラス2の数（フォーマット2）
	 */
	class2Count?: number;

	/**
	 * クラスペア値レコード（フォーマット2）
	 */
	classPairValueRecords?: ClassPairValueRecord[][];
}

/**
 * ペアセットテーブル
 */
export interface PairSetTable {
	/**
	 * ペアセット内のペア値レコードの数
	 */
	pairValueCount: number;

	/**
	 * ペア値レコード配列
	 */
	pairValueRecords: PairValueRecord[];
}

/**
 * ペア値レコード
 */
export interface PairValueRecord {
	/**
	 * 二番目のグリフID
	 */
	secondGlyph: number;

	/**
	 * 最初のグリフの値レコード
	 */
	value1: ValueRecord;

	/**
	 * 二番目のグリフの値レコード
	 */
	value2: ValueRecord;
}

/**
 * クラスペア値レコード
 */
export interface ClassPairValueRecord {
	/**
	 * 最初のグリフの値レコード
	 */
	value1: ValueRecord;

	/**
	 * 二番目のグリフの値レコード
	 */
	value2: ValueRecord;
}

/**
 * 筆記体接続サブテーブル (Lookup Type 3)
 */
export interface CursiveAttachmentSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GposLookupType.CURSIVE_ATTACHMENT;

	/**
	 * 位置調整のフォーマット（常に1）
	 */
	posFormat: number;

	/**
	 * カバレッジテーブル（対象グリフを示す）
	 */
	coverage: number[];

	/**
	 * エントリーエグジットレコードの数
	 */
	entryExitCount: number;

	/**
	 * エントリーエグジットレコード
	 */
	entryExitRecords: EntryExitRecord[];
}

/**
 * エントリーエグジットレコード
 */
export interface EntryExitRecord {
	/**
	 * エントリーアンカーポイント
	 */
	entryAnchor?: AnchorPoint;

	/**
	 * エグジットアンカーポイント
	 */
	exitAnchor?: AnchorPoint;
}

/**
 * マークとベースの接続サブテーブル (Lookup Type 4)
 */
export interface MarkToBaseAttachmentSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GposLookupType.MARK_TO_BASE_ATTACHMENT;

	/**
	 * 位置調整のフォーマット（常に1）
	 */
	posFormat: number;

	/**
	 * マークカバレッジテーブル
	 */
	markCoverage: number[];

	/**
	 * ベースカバレッジテーブル
	 */
	baseCoverage: number[];

	/**
	 * マーククラスの数
	 */
	markClassCount: number;

	/**
	 * マークアレイ
	 */
	markArray: MarkArrayTable;

	/**
	 * ベースアレイ
	 */
	baseArray: BaseArrayTable;
}

/**
 * マークアレイテーブル
 */
export interface MarkArrayTable {
	/**
	 * マークレコードの数
	 */
	markCount: number;

	/**
	 * マークレコード配列
	 */
	markRecords: MarkRecord[];
}

/**
 * マークレコード
 */
export interface MarkRecord {
	/**
	 * マーククラス
	 */
	markClass: number;

	/**
	 * マークアンカー
	 */
	markAnchor: AnchorPoint;
}

/**
 * ベースアレイテーブル
 */
export interface BaseArrayTable {
	/**
	 * ベースレコードの数
	 */
	baseCount: number;

	/**
	 * ベースレコード配列
	 */
	baseRecords: BaseRecord[];
}

/**
 * ベースレコード
 */
export interface BaseRecord {
	/**
	 * ベースアンカー配列
	 * マーククラスごとに1つのアンカーを持つ
	 */
	baseAnchors: (AnchorPoint | null)[];
}

/**
 * マークと合字の接続サブテーブル (Lookup Type 5)
 */
export interface MarkToLigatureAttachmentSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GposLookupType.MARK_TO_LIGATURE_ATTACHMENT;

	/**
	 * 位置調整のフォーマット（常に1）
	 */
	posFormat: number;

	/**
	 * マークカバレッジテーブル
	 */
	markCoverage: number[];

	/**
	 * 合字カバレッジテーブル
	 */
	ligatureCoverage: number[];

	/**
	 * マーククラスの数
	 */
	markClassCount: number;

	/**
	 * マークアレイ
	 */
	markArray: MarkArrayTable;

	/**
	 * 合字アレイ
	 */
	ligatureArray: LigatureArrayTable;
}

/**
 * 合字アレイテーブル
 */
export interface LigatureArrayTable {
	/**
	 * 合字の数
	 */
	ligatureCount: number;

	/**
	 * 合字アタッチメントレコード配列
	 */
	ligatureAttachments: LigatureAttachTable[];
}

/**
 * 合字アタッチメントテーブル
 */
export interface LigatureAttachTable {
	/**
	 * 合字内のコンポーネント数
	 */
	componentCount: number;

	/**
	 * コンポーネントレコード配列
	 */
	componentRecords: ComponentRecord[];
}

/**
 * コンポーネントレコード
 */
export interface ComponentRecord {
	/**
	 * 合字コンポーネントのアンカー配列
	 * マーククラスごとに1つのアンカーを持つ
	 */
	ligatureAnchors: (AnchorPoint | null)[];
}

/**
 * マーク同士の接続サブテーブル (Lookup Type 6)
 */
export interface MarkToMarkAttachmentSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GposLookupType.MARK_TO_MARK_ATTACHMENT;

	/**
	 * 位置調整のフォーマット（常に1）
	 */
	posFormat: number;

	/**
	 * 最初のマークカバレッジテーブル
	 */
	mark1Coverage: number[];

	/**
	 * 二番目のマークカバレッジテーブル
	 */
	mark2Coverage: number[];

	/**
	 * マーククラスの数
	 */
	markClassCount: number;

	/**
	 * 最初のマークアレイ
	 */
	mark1Array: MarkArrayTable;

	/**
	 * 二番目のマークアレイ
	 */
	mark2Array: Mark2ArrayTable;
}

/**
 * マーク2アレイテーブル
 */
export interface Mark2ArrayTable {
	/**
	 * マーク2レコードの数
	 */
	mark2Count: number;

	/**
	 * マーク2レコード配列
	 */
	mark2Records: Mark2Record[];
}

/**
 * マーク2レコード
 */
export interface Mark2Record {
	/**
	 * マーク2アンカー配列
	 * マーククラスごとに1つのアンカーを持つ
	 */
	mark2Anchors: (AnchorPoint | null)[];
}

/**
 * 文脈依存配置サブテーブル (Lookup Type 7)
 */
export interface ContextualPositioningSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GposLookupType.CONTEXTUAL_POSITIONING;

	/**
	 * 位置調整のフォーマット
	 */
	posFormat: number;

	/**
	 * カバレッジテーブル
	 */
	coverage: number[];

	// フォーマットに応じたフィールド
	// TODO: 各フォーマットの詳細実装
}

/**
 * 連鎖文脈依存配置サブテーブル (Lookup Type 8)
 */
export interface ChainedContextualPositioningSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GposLookupType.CHAINED_CONTEXTUAL_POSITIONING;

	/**
	 * 位置調整のフォーマット
	 */
	posFormat: number;

	/**
	 * カバレッジテーブル
	 */
	coverage: number[];

	// フォーマットに応じたフィールド
	// TODO: 各フォーマットの詳細実装
}

/**
 * 拡張配置サブテーブル (Lookup Type 9)
 */
export interface ExtensionPositioningSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GposLookupType.EXTENSION_POSITIONING;

	/**
	 * 位置調整のフォーマット（常に1）
	 */
	posFormat: number;

	/**
	 * 拡張タイプ（ルックアップタイプ1〜8のいずれか）
	 */
	extensionLookupType: GposLookupType;

	/**
	 * 拡張サブテーブルへのオフセット
	 */
	extensionOffset: number;

	/**
	 * 拡張サブテーブル（解析後）
	 */
	extensionSubtable?: GposSubTable;
}
