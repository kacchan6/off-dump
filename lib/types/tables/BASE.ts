/**
 * BASE テーブル型定義
 * 基本スクリプトのベースライン情報を提供する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/base
 */

import { DeviceTable } from '../common';

/**
 * BASEテーブルのバージョン
 */
export enum BaseVersion {
	VERSION_1_0 = 0x00010000, // バージョン1.0
	VERSION_1_1 = 0x00010001, // バージョン1.1
}

/**
 * ベースラインテーブルのタグ
 */
export enum BaselineTag {
	ROMAN = 'romn',        // ラテン文字のベースライン
	HANGING = 'hang',      // ぶら下げベースライン
	IDEOGRAPHIC = 'ideo',  // 漢字などのイデオグラフィックベースライン
	MATHEMATICAL = 'math', // 数学記号のベースライン
}

/**
 * アンカーテーブル
 */
export interface BaseAnchor {
	/**
	 * アンカーのフォーマット
	 */
	format: number;

	/**
	 * X座標
	 */
	xCoordinate: number;

	/**
	 * Y座標
	 */
	yCoordinate: number;

	/**
	 * アンカーポイント（フォーマット2の場合）
	 */
	anchorPoint?: number;

	/**
	 * デバイステーブル（フォーマット3の場合）
	 */
	deviceTable?: {
		xDeviceTable?: DeviceTable;
		yDeviceTable?: DeviceTable;
	};
}

/**
 * ベースライン値テーブル
 */
export interface BaseValuesTable {
	/**
	 * デフォルトベースラインタグのインデックス
	 */
	defaultIndex: number;

	/**
	 * ベースラインの数
	 */
	baseCoordCount: number;

	/**
	 * ベースライン座標テーブル（各ベースラインのオフセット）
	 */
	baseCoords: BaseCoordTable[];
}

/**
 * 最小/最大ベースライン値テーブル
 */
export interface MinMaxTable {
	/**
	 * 最小ベースライン値のオフセット
	 */
	minCoord?: BaseCoordTable;

	/**
	 * 最大ベースライン値のオフセット
	 */
	maxCoord?: BaseCoordTable;

	/**
	 * 機能変異インデックスのオフセット（バージョン1.1の場合）
	 */
	featMinMaxRecord?: FeatMinMaxRecord[];
}

/**
 * 機能変異レコード
 */
export interface FeatMinMaxRecord {
	/**
	 * 機能タグ
	 */
	featureTableTag: string;

	/**
	 * 最小座標テーブル（オプション）
	 */
	minCoord?: BaseCoordTable;

	/**
	 * 最大座標テーブル（オプション）
	 */
	maxCoord?: BaseCoordTable;
}

/**
 * 座標テーブル
 */
export interface BaseCoordTable {
	/**
	 * 座標フォーマット
	 */
	baseCoordFormat: number;

	/**
	 * 座標値
	 */
	coordinate: number;

	/**
	 * 参照ポイント（フォーマット2の場合）
	 */
	referenceGlyph?: number;

	/**
	 * ベースラインポイント（フォーマット2の場合）
	 */
	baselineIndex?: number;

	/**
	 * デバイステーブル（フォーマット3の場合）
	 */
	deviceTable?: DeviceTable;
}

/**
 * スクリプトテーブル
 */
export interface BaseScriptTable {
	/**
	 * ベースライン値テーブル（オプション）
	 */
	baseValues?: BaseValuesTable;

	/**
	 * デフォルト最小/最大テーブル（オプション）
	 */
	defaultMinMax?: MinMaxTable;

	/**
	 * 言語システムテーブル（オプション）
	 */
	baseLangSysRecords?: BaseLangSysRecord[];
}

/**
 * 言語システムレコード
 */
export interface BaseLangSysRecord {
	/**
	 * 言語システムタグ
	 */
	baseLangSysTag: string;

	/**
	 * 最小/最大テーブル
	 */
	minMax: MinMaxTable;
}

/**
 * スクリプトレコード
 */
export interface BaseScriptRecord {
	/**
	 * スクリプトタグ
	 */
	baseScriptTag: string;

	/**
	 * スクリプトテーブル
	 */
	baseScript: BaseScriptTable;
}

/**
 * タグリストテーブル
 */
export interface BaseTagListTable {
	/**
	 * ベースラインタグの数
	 */
	baseTagCount: number;

	/**
	 * ベースラインタグの配列
	 */
	baselineTags: BaselineTag[];
}

/**
 * 軸テーブル
 */
export interface BaseAxisTable {
	/**
	 * ベースラインタグリスト
	 */
	baseTagList: BaseTagListTable;

	/**
	 * スクリプトレコードのリスト
	 */
	baseScriptList: BaseScriptRecord[];
}

/**
 * BASEテーブル全体の構造
 */
export interface BaseTable {
	/**
	 * テーブルのバージョン
	 */
	version: BaseVersion;

	/**
	 * 水平軸テーブル（オプション）
	 */
	horizAxis?: BaseAxisTable;

	/**
	 * 垂直軸テーブル（オプション）
	 */
	vertAxis?: BaseAxisTable;

	/**
	 * バリエーションストアへのオフセット（バージョン1.1の場合のみ）
	 */
	itemVarStoreOffset?: number;
}
