/**
 * OpenType フォント関連の型定義
 */

/**
 * テーブルメタデータ情報
 */
export interface TableMetaData {

	/**
	 * テーブル名（4文字のタグ）
	 */
	tag: string;

	/**
	 * テーブルのチェックサム
	 */
	checksum: number;

	/**
	 * テーブルのオフセット
	 */
	offset: number;

	/**
	 * テーブルの長さ
	 */
	length: number;

	/**
	 * チェックサムが有効かどうか
	 */
	checksumValid?: boolean;
}

/**
 * フォントテーブルのデータと詳細情報を含む結合インターフェース
 */
export interface FontTable {
	/**
	 * テーブルの詳細データ
	 */
	table: any;

	/**
	 * テーブルのメタデータ
	 */
	meta: TableMetaData;
}

/**
 * テーブルディレクトリエントリ
 */
export interface TableDirectoryEntry {
	/**
	 * テーブル名（4文字のタグ）
	 */
	tag: string;

	/**
	 * チェックサム
	 */
	checksum: number;

	/**
	 * ファイル内のテーブルへのオフセット
	 */
	offset: number;

	/**
	 * テーブルの長さ（バイト単位）
	 */
	length: number;
}

/**
 * OpenTypeフォントの基本インターフェース
 */
export interface Font {
	/**
	 * フォントのバージョン
	 */
	version: string;

	/**
	 * テーブルの数
	 */
	numTables: number;

	/**
	 * サーチレンジ（2の累乗）
	 */
	searchRange: number;

	/**
	 * エントリーセレクタ（log2(searchRange/16)）
	 */
	entrySelector: number;

	/**
	 * レンジシフト（numTables*16-searchRange）
	 */
	rangeShift: number;

	/**
	 * テーブルディレクトリエントリ
	 */
	tableDirectory: TableDirectoryEntry[];

	/**
	 * ロードされたテーブル
	 */
	tables: { [tableName: string]: FontTable };
}

/**
 * TrueType Collection (TTC) ヘッダー
 */
export interface TTCHeader {
	/**
	 * TTCのバージョン
	 */
	version: string;

	/**
	 * コレクション内のフォントの数
	 */
	numFonts: number;

	/**
	 * 各フォントのオフセット
	 */
	offsets: number[];
}

/**
 * フォントコレクション
 */
export interface FontCollection {
	/**
	 * コレクションのヘッダー
	 */
	header: TTCHeader;

	/**
	 * コレクション内のフォント
	 */
	fonts: Font[];
}