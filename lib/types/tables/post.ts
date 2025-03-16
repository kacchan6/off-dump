/**
 * post テーブル型定義
 * PostScriptグリフ名とその他の情報を格納するテーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/post
 */

/**
 * postテーブルの基本インターフェース
 * すべてのバージョンで共通のフィールドを含む
 */
export interface PostTable {
	/**
	 * フォーマットタイプ (1.0, 2.0, 2.5, 3.0, 4.0)
	 */
	format: number;

	/**
	 * イタリック角度（ラジアン単位）
	 */
	italicAngle: number;

	/**
	 * 推奨アンダーラインの位置（ベースラインからのオフセット）
	 */
	underlinePosition: number;

	/**
	 * 推奨アンダーラインの太さ
	 */
	underlineThickness: number;

	/**
	 * 固定ピッチフォントかどうか
	 */
	isFixedPitch: number;

	/**
	 * 最小のメモリ使用量（フォントがVMにロードされた時）
	 */
	minMemType42: number;

	/**
	 * 最大のメモリ使用量（フォントがVMにロードされた時）
	 */
	maxMemType42: number;

	/**
	 * Type 1フォントの最小メモリ使用量
	 */
	minMemType1: number;

	/**
	 * Type 1フォントの最大メモリ使用量
	 */
	maxMemType1: number;
}

/**
 * フォーマット 1.0 の拡張postテーブル
 * 標準のMacintoshグリフセットを使用
 */
export interface PostTableV1 extends PostTable {
	format: 1.0;
}

/**
 * フォーマット 2.0 の拡張postテーブル
 * カスタムグリフ名を持つ
 */
export interface PostTableV2 extends PostTable {
	format: 2.0;

	/**
	 * グリフの数
	 */
	numGlyphs: number;

	/**
	 * グリフインデックス配列
	 */
	glyphNameIndex: number[];

	/**
	 * Macintosh標準グリフセット以外のグリフ名
	 */
	names: string[];
}

/**
 * フォーマット 2.5 の拡張postテーブル
 * フォーマット2.0の最適化バージョン
 */
export interface PostTableV25 extends PostTable {
	format: 2.5;

	/**
	 * グリフの数
	 */
	numGlyphs: number;

	/**
	 * Macintosh標準名からのオフセット配列
	 * 各グリフのMacindexへのオフセット値を保持
	 */
	offset: number[];
}

/**
 * フォーマット 3.0 の拡張postテーブル
 * グリフ名を持たない
 */
export interface PostTableV3 extends PostTable {
	format: 3.0;
	// フォーマット3はグリフ名を持たないため、追加フィールドなし
}

/**
 * フォーマット 4.0 の拡張postテーブル
 * アップルの仕様のみ
 */
export interface PostTableV4 extends PostTable {
	format: 4.0;

	/**
	 * フォントのグリフに割り当てられたシングルバイトマッピング
	 */
	mapping: number[];
}

/**
 * 任意のpostテーブル型（型ガード用）
 */
export type AnyPostTable = PostTableV1 | PostTableV2 | PostTableV25 | PostTableV3 | PostTableV4;
