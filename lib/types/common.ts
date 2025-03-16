/**
 * OpenType共通テーブル型定義
 * GSUB/GPOSテーブルなどで共通して使用される型
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/chapter2
 */

/**
 * スクリプトテーブル
 */
export interface ScriptTable {
	/**
	 * スクリプトタグ (例: 'latn', 'arab')
	 */
	scriptTag: string;

	/**
	 * デフォルト言語システム
	 */
	defaultLangSys?: LangSysTable;

	/**
	 * 言語システムレコード
	 */
	langSysRecords: LangSysRecord[];
}

/**
 * 言語システムレコード
 */
export interface LangSysRecord {
	/**
	 * 言語タグ (例: 'ENG ', 'JPN ')
	 */
	langSysTag: string;

	/**
	 * 言語システムテーブル
	 */
	langSys: LangSysTable;
}

/**
 * 言語システムテーブル
 */
export interface LangSysTable {
	/**
	 * ルックアップ順序 (予約済み、0)
	 */
	lookupOrder: number;

	/**
	 * 必須機能インデックス (0xFFFF=なし)
	 */
	requiredFeatureIndex: number;

	/**
	 * 機能インデックスの数
	 */
	featureIndexCount: number;

	/**
	 * 機能インデックス配列
	 */
	featureIndices: number[];
}

/**
 * 機能テーブル
 */
export interface FeatureTable {
	/**
	 * 機能タグ (例: 'kern', 'liga')
	 */
	featureTag: string;

	/**
	 * 代替機能へのオフセット (0=なし)
	 */
	featureParamsOffset: number;

	/**
	 * ルックアップインデックスの数
	 */
	lookupIndexCount: number;

	/**
	 * ルックアップインデックス配列
	 */
	lookupListIndices: number[];

	/**
	 * 機能パラメータ (存在する場合)
	 */
	featureParams?: any;  // 必要に応じて型を定義
}

/**
 * ルックアップテーブル
 */
export interface LookupTable {
	/**
	 * ルックアップタイプ
	 * 値の範囲はテーブルによって異なる (GSUB vs GPOS)
	 */
	lookupType: number;

	/**
	 * ルックアップフラグ
	 */
	lookupFlag: number;

	/**
	 * サブテーブルの数
	 */
	subTableCount: number;

	/**
	 * マークフィルタリングセット (ルックアップフラグの8ビット目がセットされていれば設定)
	 */
	markFilteringSet?: number;
}

/**
 * ルックアップフラグのビット定義
 */
export enum LookupFlag {
	RIGHT_TO_LEFT = 0x0001,               // 右から左へのテキスト処理
	IGNORE_BASE_GLYPHS = 0x0002,          // ベースグリフを無視
	IGNORE_LIGATURES = 0x0004,            // 合字を無視
	IGNORE_MARKS = 0x0008,                // マークを無視
	USE_MARK_FILTERING_SET = 0x0010,      // マークフィルタリングセットを使用
	MARK_ATTACHMENT_TYPE_MASK = 0xFF00    // マーク接続タイプ (上位8ビット)
}

/**
 * カバレッジテーブル
 */
export interface CoverageTable {
	/**
	 * カバレッジフォーマット
	 */
	coverageFormat: number;

	/**
	 * グリフインデックス配列 (フォーマット1)
	 */
	glyphs?: number[];

	/**
	 * 範囲レコード配列 (フォーマット2)
	 */
	rangeRecords?: RangeRecord[];
}

/**
 * 範囲レコード
 */
export interface RangeRecord {
	/**
	 * 開始グリフID
	 */
	startGlyphID: number;

	/**
	 * 終了グリフID
	 */
	endGlyphID: number;

	/**
	 * 開始カバレッジインデックス
	 */
	startCoverageIndex: number;
}

/**
 * クラス定義テーブル
 */
export interface ClassDefTable {
	/**
	 * クラス定義フォーマット
	 */
	classFormat: number;

	/**
	 * 開始グリフID (フォーマット1)
	 */
	startGlyphID?: number;

	/**
	 * グリフの数 (フォーマット1)
	 */
	glyphCount?: number;

	/**
	 * クラス値配列 (フォーマット1)
	 */
	classValueArray?: number[];

	/**
	 * クラス範囲レコード配列 (フォーマット2)
	 */
	classRangeRecords?: ClassRangeRecord[];
}

/**
 * クラス範囲レコード
 */
export interface ClassRangeRecord {
	/**
	 * 開始グリフID
	 */
	startGlyphID: number;

	/**
	 * 終了グリフID
	 */
	endGlyphID: number;

	/**
	 * クラス値
	 */
	class: number;
}

/**
 * 装置テーブル - 特定のポイントサイズでの調整値
 */
export interface DeviceTable {
	/**
	 * 開始ポイントサイズ
	 */
	startSize: number;

	/**
	 * 終了ポイントサイズ
	 */
	endSize: number;

	/**
	 * フォーマット
	 */
	deltaFormat: number;

	/**
	 * デルタ値配列
	 */
	deltaValues: number[];
}

/**
 * ローカル可変フォントテーブル - 可変フォントのバリエーション
 */
export interface VariationIndexTable {
	/**
	 * 外部デルタセットへのオフセット
	 */
	deltaSetOuterOffset: number;

	/**
	 * 内部デルタセットへのオフセット
	 */
	deltaSetInnerOffset: number;

	/**
	 * デルタフォーマット
	 */
	deltaFormat: number;
}
