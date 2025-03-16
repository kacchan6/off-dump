/**
 * DSIG テーブル型定義
 * デジタル署名テーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/dsig
 */

/**
 * 署名レコード
 */
export interface SignatureRecord {
	/**
	 * フォーマットタイプ
	 * 現在は1のみ定義されている（PKCS#7署名）
	 */
	format: number;

	/**
	 * レコードの長さ
	 */
	length: number;

	/**
	 * 署名ID
	 */
	signatureBlockId: number;

	/**
	 * 署名データ
	 */
	signatureData: Uint8Array;
}

/**
 * DSIGテーブル
 */
export interface DsigTable {
	/**
	 * バージョン（現在は1のみ）
	 */
	version: number;

	/**
	 * 署名の数
	 */
	numSignatures: number;

	/**
	 * フラグ（現在は常に1 - 署名は全テーブルを対象）
	 */
	flags: number;

	/**
	 * 署名レコードの配列
	 */
	signatureRecords: SignatureRecord[];
}
