/**
 * maxp テーブル型定義
 * 最大プロファイルテーブル - フォントのリソース要件に関する情報を格納する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/maxp
 */

/**
 * maxpテーブルの基本インターフェース
 * すべてのバージョンで共通のフィールドを含む
 */
export interface MaxpTable {
	/**
	 * テーブルのバージョン
	 * 0x00010000 (1.0) - TrueTypeフォントの完全なテーブル
	 * 0x00005000 (0.5) - CFFフォントの簡易版
	 */
	version: number;

	/**
	 * フォント内のグリフの数
	 */
	numGlyphs: number;
}

/**
 * バージョン0.5のmaxpテーブル（CFFフォント用）
 */
export interface MaxpTableV05 extends MaxpTable {
	version: 0.5;
}

/**
 * バージョン1.0のmaxpテーブル（TrueTypeフォント用）
 */
export interface MaxpTableV1 extends MaxpTable {
	version: 1.0;

	/**
	 * 一つのグリフに含まれるポイントの最大数
	 */
	maxPoints: number;

	/**
	 * 一つのグリフに含まれる輪郭の最大数
	 */
	maxContours: number;

	/**
	 * コンポジットグリフに含まれるポイントの最大数
	 */
	maxCompositePoints: number;

	/**
	 * コンポジットグリフに含まれる輪郭の最大数
	 */
	maxCompositeContours: number;

	/**
	 * ゾーンの最大数（通常は2）
	 */
	maxZones: number;

	/**
	 * 参照されるポイントの最大数
	 */
	maxTwilightPoints: number;

	/**
	 * フォント内の一つのグリフのストレージエリアの最大サイズ
	 */
	maxStorage: number;

	/**
	 * フォント内の一つのグリフの関数定義の最大数
	 */
	maxFunctionDefs: number;

	/**
	 * フォント内の一つのグリフの命令定義の最大数
	 */
	maxInstructionDefs: number;

	/**
	 * フォント内の一つのグリフのスタック要素の最大数
	 */
	maxStackElements: number;

	/**
	 * フォント内の一つのグリフの命令サイズの最大バイト数
	 */
	maxSizeOfInstructions: number;

	/**
	 * コンポジットグリフ内のコンポーネントの最大数
	 */
	maxComponentElements: number;

	/**
	 * コンポーネントの深さ（ネスト）の最大レベル
	 */
	maxComponentDepth: number;
}

/**
 * 任意のmaxpテーブル型（型ガード用）
 */
export type AnyMaxpTable = MaxpTableV05 | MaxpTableV1;
