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
	VERSION_1_0 = 0x00010000 // バージョン1.0
}

/**
 * ベースラインテーブルのタグ
 */
export enum BaselineTag {
	ROMAN = 'romn',        // ラテン文字のベースライン
	HANGING = 'hang',      // ぶら下げベースライン
	IDEOGRAPHIC = 'ideo',  // 漢字などのイデオグラフィックベースライン
	MATHEMATICAL = 'math'  // 数学記号のベースライン
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
	 * デバイステーブル（オプション）
	 */
	deviceTable?: DeviceTable;
}

/**
 * スクリプトベースラインテーブル
 */
export interface BaseScriptTable {
	/**
	 * デフォルトベースラインタグ
	 */
	defaultBaselineTag: BaselineTag;

	/**
	 * ベースラインレコード
	 */
	baselineRecords: BaselineRecord[];
}

/**
 * ベースラインレコード
 */
export interface BaselineRecord {
	/**
	 * ベースラインタグ
	 */
	baselineTag: BaselineTag;

	/**
	 * ベースラインアンカー
	 */
	baselineAnchor: BaseAnchor;
}

/**
 * 座標マップテーブル
 */
export interface BaseCoordTable {
	/**
	 * デフォルト座標値
	 */
	defaultCoordinate: number;

	/**
	 * 座標レコード（特定のスクリプトやランゲージの座標）
	 */
	coordinateRecords?: BaseCoordinateRecord[];
}

/**
 * 座標レコード
 */
export interface BaseCoordinateRecord {
	/**
	 * スクリプトタグ
	 */
	scriptTag: string;

	/**
	 * ランゲージタグ（オプション）
	 */
	languageTag?: string;

	/**
	 * 座標値
	 */
	coordinate: number;

	/**
	 * デバイステーブル（オプション）
	 */
	deviceTable?: DeviceTable;
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
	 * スクリプトリストオフセット
	 */
	scriptListOffset: number;

	/**
	 * 水平座標オフセット
	 */
	horizAxisOffset?: number;

	/**
	 * 垂直座標オフセット
	 */
	vertAxisOffset?: number;

	/**
	 * スクリプトリスト
	 */
	scriptList: BaseScriptTable[];

	/**
	 * 水平座標テーブル（オプション）
	 */
	horizAxis?: BaseAxisTable;

	/**
	 * 垂直座標テーブル（オプション）
	 */
	vertAxis?: BaseAxisTable;
}

/**
 * BASEテーブルの軸情報
 */
export interface BaseAxisTable {
	/**
	 * ベースコードテーブル
	 */
	baseCoordTable: BaseCoordTable;

	/**
	 * 最小座標テーブル（オプション）
	 */
	minCoordTable?: BaseCoordTable;

	/**
	 * 最大座標テーブル（オプション）
	 */
	maxCoordTable?: BaseCoordTable;
}
