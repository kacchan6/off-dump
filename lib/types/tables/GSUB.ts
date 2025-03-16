/**
 * GSUB テーブル型定義
 * グリフ置換テーブル - テキストレイアウトのためのグリフ置換情報
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gsub
 */

import { ClassDefTable } from '../common';

/**
 * GSUB テーブルのバージョン
 */
export const enum GsubVersion {
	VERSION_1_0 = 0x00010000, // 1.0
	VERSION_1_1 = 0x00010001  // 1.1
}

/**
 * GSUBテーブルのヘッダー
 */
export interface GsubHeader {
	/**
	 * テーブルのバージョン
	 */
	version: GsubVersion;

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
 * GSUBテーブル全体
 */
export interface GsubTable {
	/**
	 * テーブルのヘッダー
	 */
	header: GsubHeader;

	/**
	 * スクリプトリスト
	 */
	scriptList: any[];

	/**
	 * 機能リスト
	 */
	featureList: any[];

	/**
	 * ルックアップリスト
	 */
	lookupList: GsubLookupTable[];

	/**
	 * 機能バリエーション（存在する場合）
	 */
	featureVariations?: any; // 必要に応じて型を定義
}

/**
 * GSUBのLookupタイプ
 */
export const enum GsubLookupType {
	SINGLE = 1,                      // 単一置換
	MULTIPLE = 2,                    // 複数置換
	ALTERNATE = 3,                   // 代替置換
	LIGATURE = 4,                    // 合字置換
	CONTEXTUAL = 5,                  // 文脈依存置換
	CHAINING_CONTEXTUAL = 6,         // 連鎖文脈依存置換
	EXTENSION_SUBSTITUTION = 7,      // 拡張置換
	REVERSE_CHAINING_CONTEXTUAL = 8  // 逆連鎖文脈依存単一置換
}

/**
 * GSUB Lookupテーブル
 */
export interface GsubLookupTable {
	/**
	 * ルックアップタイプ
	 */
	lookupType: GsubLookupType;

	/**
	 * ルックアップフラグ
	 */
	lookupFlag: number;

	/**
	 * サブテーブルの数
	 */
	subTableCount: number;

	/**
	 * マークフィルタリングセット（ルックアップフラグに依存）
	 */
	markFilteringSet?: number;

	/**
	 * サブテーブル
	 */
	subtables: GsubSubTable[];
}

/**
 * GSUBサブテーブル (タイプに応じたUnion型)
 */
export type GsubSubTable =
	| SingleSubstitutionSubtable
	| MultipleSubstitutionSubtable
	| AlternateSubstitutionSubtable
	| LigatureSubstitutionSubtable
	| ContextualSubstitutionSubtable
	| ChainingContextualSubstitutionSubtable
	| ExtensionSubstitutionSubtable
	| ReverseChainSingleSubstitutionSubtable;

// ============= ルックアップタイプ1: 単一置換 =============

/**
 * 単一置換サブテーブル (Lookup Type 1)
 */
export interface SingleSubstitutionSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GsubLookupType.SINGLE;

	/**
	 * 置換のフォーマット
	 */
	substFormat: 1 | 2;

	/**
	 * カバレッジテーブル（対象グリフを示す）
	 */
	coverage: number[];

	/**
	 * デルタ値（Format 1）
	 */
	deltaGlyphID?: number;

	/**
	 * 置換グリフID配列（Format 2）
	 */
	substitute?: number[];
}

// ============= ルックアップタイプ2: 複数置換 =============

/**
 * 複数置換サブテーブル (Lookup Type 2)
 */
export interface MultipleSubstitutionSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GsubLookupType.MULTIPLE;

	/**
	 * 置換のフォーマット（常に1）
	 */
	substFormat: 1;

	/**
	 * カバレッジテーブル（対象グリフを示す）
	 */
	coverage: number[];

	/**
	 * シーケンスの数
	 */
	sequenceCount: number;

	/**
	 * 置換シーケンス配列
	 */
	sequences: number[][];
}

// ============= ルックアップタイプ3: 代替置換 =============

/**
 * 代替置換サブテーブル (Lookup Type 3)
 */
export interface AlternateSubstitutionSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GsubLookupType.ALTERNATE;

	/**
	 * 置換のフォーマット（常に1）
	 */
	substFormat: 1;

	/**
	 * カバレッジテーブル（対象グリフを示す）
	 */
	coverage: number[];

	/**
	 * 代替セットの数
	 */
	alternateSetCount: number;

	/**
	 * 代替グリフセット配列
	 */
	alternateSets: number[][];
}

// ============= ルックアップタイプ4: 合字置換 =============

/**
 * 合字置換サブテーブル (Lookup Type 4)
 */
export interface LigatureSubstitutionSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GsubLookupType.LIGATURE;

	/**
	 * 置換のフォーマット（常に1）
	 */
	substFormat: 1;

	/**
	 * カバレッジテーブル（対象グリフを示す）
	 */
	coverage: number[];

	/**
	 * 合字セットの数
	 */
	ligatureSetCount: number;

	/**
	 * 合字セット配列
	 */
	ligatureSets: LigatureSet[];
}

/**
 * 合字セット
 */
export interface LigatureSet {
	/**
	 * 合字の数
	 */
	ligatureCount: number;

	/**
	 * 合字配列
	 */
	ligatures: Ligature[];
}

/**
 * 合字
 */
export interface Ligature {
	/**
	 * 合字グリフID
	 */
	ligatureGlyph: number;

	/**
	 * コンポーネントの数（最初のコンポーネントを除く）
	 */
	componentCount: number;

	/**
	 * コンポーネントグリフID配列（最初のコンポーネントを除く）
	 */
	componentGlyphIDs: number[];
}

// ============= ルックアップタイプ5: 文脈依存置換 =============

/**
 * 文脈依存置換サブテーブル (Lookup Type 5) の基本インターフェース
 */
export interface ContextualSubstitutionSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GsubLookupType.CONTEXTUAL;

	/**
	 * 置換のフォーマット (1, 2, 3のいずれか)
	 */
	substFormat: 1 | 2 | 3;
}

/**
 * 置換ルックアップレコード
 * 連鎖内の特定位置のグリフに適用される置換ルックアップを指定
 */
export interface SubstLookupRecord {
	/**
	 * 入力シーケンス内で置換が適用されるグリフの位置
	 * （0が最初の入力グリフ）
	 */
	sequenceIndex: number;

	/**
	 * 置換ルックアップテーブルのインデックス
	 */
	lookupListIndex: number;
}

/**
 * 置換ルール (Format 1)
 * 特定のグリフシーケンスに対するルール
 */
export interface SubRule {
	/**
	 * 入力グリフの数（最初のグリフを除く）
	 */
	glyphCount: number;

	/**
	 * 入力グリフIDの配列（最初のグリフを除く）
	 */
	inputSequence: number[];

	/**
	 * 置換の数
	 */
	substCount: number;

	/**
	 * 置換ルックアップレコード配列
	 */
	substLookupRecords: SubstLookupRecord[];
}

/**
 * 置換ルールセット
 * 特定の最初のグリフに対する全てのルールの集合
 */
export interface SubRuleSet {
	/**
	 * ルールの数
	 */
	subRuleCount: number;

	/**
	 * ルールの配列
	 */
	subRules: SubRule[];
}

/**
 * フォーマット1の文脈依存置換サブテーブル (グリフベース)
 */
export interface ContextualSubstitutionFormat1Subtable extends ContextualSubstitutionSubtable {
	/**
	 * 置換のフォーマット（常に1）
	 */
	substFormat: 1;

	/**
	 * カバレッジテーブル（このサブテーブルが適用される最初のグリフを定義）
	 */
	coverage: number[];

	/**
	 * 置換ルールセットの数
	 */
	subRuleSetCount: number;

	/**
	 * 置換ルールセット配列
	 */
	subRuleSets: SubRuleSet[];
}

/**
 * クラスルール
 * 特定のクラスシーケンスに対するルール
 */
export interface SubClassRule {
	/**
	 * 入力クラスの数（最初のクラスを除く）
	 */
	glyphCount: number;

	/**
	 * 入力クラス配列（最初のクラスを除く）
	 */
	classSequence: number[];

	/**
	 * 置換の数
	 */
	substCount: number;

	/**
	 * 置換ルックアップレコード配列
	 */
	substLookupRecords: SubstLookupRecord[];
}

/**
 * クラスセット
 * 特定のクラスに対する全てのルールの集合
 */
export interface SubClassSet {
	/**
	 * クラスルールの数
	 */
	subClassRuleCount: number;

	/**
	 * クラスルールの配列
	 */
	subClassRules: SubClassRule[];
}

/**
 * フォーマット2の文脈依存置換サブテーブル (クラスベース)
 */
export interface ContextualSubstitutionFormat2Subtable extends ContextualSubstitutionSubtable {
	/**
	 * 置換のフォーマット（常に2）
	 */
	substFormat: 2;

	/**
	 * カバレッジテーブル（このサブテーブルが適用される最初のグリフを定義）
	 */
	coverage: number[];

	/**
	 * クラス定義テーブル
	 */
	classDef: ClassDefTable;

	/**
	 * クラスセットの数
	 */
	classSetCount: number;

	/**
	 * クラスセットの配列（nullの場合、そのクラスにはルールがない）
	 */
	classSet: (SubClassSet | null)[];
}

/**
 * フォーマット3の文脈依存置換サブテーブル (カバレッジベース)
 */
export interface ContextualSubstitutionFormat3Subtable extends ContextualSubstitutionSubtable {
	/**
	 * 置換のフォーマット（常に3）
	 */
	substFormat: 3;

	/**
	 * グリフの数
	 */
	glyphCount: number;

	/**
	 * カバレッジテーブルの配列
	 * 一連のカバレッジテーブルは入力シーケンスを定義する
	 */
	coverages: number[][];

	/**
	 * 置換の数
	 */
	substCount: number;

	/**
	 * 置換ルックアップレコード配列
	 */
	substLookupRecords: SubstLookupRecord[];
}

// ============= ルックアップタイプ6: 連鎖文脈依存置換 =============

/**
 * 連鎖文脈依存置換サブテーブル (Lookup Type 6) の基本インターフェース
 */
export interface ChainingContextualSubstitutionSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GsubLookupType.CHAINING_CONTEXTUAL;

	/**
	 * 置換のフォーマット (1, 2, 3のいずれか)
	 */
	substFormat: 1 | 2 | 3;
}

/**
 * チェーン置換ルール (Format 1)
 * 特定のグリフシーケンスに対するルール
 */
export interface ChainSubRule {
	/**
	 * バックトラックグリフの数
	 */
	backtrackGlyphCount: number;

	/**
	 * バックトラックグリフIDの配列（後ろから前に向かって）
	 */
	backtrackSequence: number[];

	/**
	 * 入力グリフの数（最初のグリフを除く）
	 */
	inputGlyphCount: number;

	/**
	 * 入力グリフIDの配列（最初のグリフを除く）
	 */
	inputSequence: number[];

	/**
	 * 先読みグリフの数
	 */
	lookAheadGlyphCount: number;

	/**
	 * 先読みグリフIDの配列
	 */
	lookAheadSequence: number[];

	/**
	 * 置換の数
	 */
	substCount: number;

	/**
	 * 置換ルックアップレコード配列
	 */
	substLookupRecords: SubstLookupRecord[];
}

/**
 * チェーン置換ルールセット
 * 特定の最初のグリフに対する全てのチェーン置換ルールの集合
 */
export interface ChainSubRuleSet {
	/**
	 * チェーンルールの数
	 */
	chainSubRuleCount: number;

	/**
	 * チェーンルールの配列
	 */
	chainSubRules: ChainSubRule[];
}

/**
 * フォーマット1の連鎖文脈依存置換サブテーブル (グリフベース)
 */
export interface ChainingContextualSubstitutionFormat1Subtable extends ChainingContextualSubstitutionSubtable {
	/**
	 * 置換のフォーマット（常に1）
	 */
	substFormat: 1;

	/**
	 * カバレッジテーブル（このサブテーブルが適用される最初のグリフを定義）
	 */
	coverage: number[];

	/**
	 * チェーン置換ルールセットの数
	 */
	chainSubRuleSetCount: number;

	/**
	 * チェーン置換ルールセット配列
	 */
	chainSubRuleSets: ChainSubRuleSet[];
}

/**
 * チェーンクラスルール (Format 2)
 * 特定の入力クラスシーケンスに対するルール
 */
export interface ChainSubClassRule {
	/**
	 * バックトラッククラスの数
	 */
	backtrackGlyphCount: number;

	/**
	 * バックトラッククラス配列（後ろから前に向かって）
	 */
	backtrackClassSequence: number[];

	/**
	 * 入力クラスの数（最初のクラスを除く）
	 */
	inputGlyphCount: number;

	/**
	 * 入力クラス配列（最初のクラスを除く）
	 */
	inputClassSequence: number[];

	/**
	 * 先読みクラスの数
	 */
	lookAheadGlyphCount: number;

	/**
	 * 先読みクラス配列
	 */
	lookAheadClassSequence: number[];

	/**
	 * 置換の数
	 */
	substCount: number;

	/**
	 * 置換ルックアップレコード配列
	 */
	substLookupRecords: SubstLookupRecord[];
}

/**
 * チェーンクラスセット
 * 特定の入力クラスに対する全てのチェーンクラスルールの集合
 */
export interface ChainSubClassSet {
	/**
	 * チェーンクラスルールの数
	 */
	chainSubClassRuleCount: number;

	/**
	 * チェーンクラスルールの配列
	 */
	chainSubClassRules: ChainSubClassRule[];
}

/**
 * フォーマット2の連鎖文脈依存置換サブテーブル (クラスベース)
 */
export interface ChainingContextualSubstitutionFormat2Subtable extends ChainingContextualSubstitutionSubtable {
	/**
	 * 置換のフォーマット（常に2）
	 */
	substFormat: 2;

	/**
	 * カバレッジテーブル（このサブテーブルが適用される最初のグリフを定義）
	 */
	coverage: number[];

	/**
	 * バックトラッククラス定義テーブル
	 */
	backtrackClassDef: ClassDefTable;

	/**
	 * 入力クラス定義テーブル
	 */
	inputClassDef: ClassDefTable;

	/**
	 * 先読みクラス定義テーブル
	 */
	lookAheadClassDef: ClassDefTable;

	/**
	 * チェーンクラスセットの数（入力クラスの数）
	 */
	chainSubClassSetCount: number;

	/**
	 * チェーンクラスセットの配列（nullの場合、そのクラスには連鎖ルールがない）
	 */
	chainSubClassSets: (ChainSubClassSet | null)[];
}

/**
 * フォーマット3の連鎖文脈依存置換サブテーブル (カバレッジベース)
 */
export interface ChainingContextualSubstitutionFormat3Subtable extends ChainingContextualSubstitutionSubtable {
	/**
	 * 置換のフォーマット（常に3）
	 */
	substFormat: 3;

	/**
	 * バックトラックカバレッジの数
	 */
	backtrackGlyphCount: number;

	/**
	 * バックトラックカバレッジテーブルの配列（後ろから前に向かって）
	 */
	backtrackCoverages: number[][];

	/**
	 * 入力カバレッジの数
	 */
	inputGlyphCount: number;

	/**
	 * 入力カバレッジテーブルの配列
	 */
	inputCoverages: number[][];

	/**
	 * 先読みカバレッジの数
	 */
	lookAheadGlyphCount: number;

	/**
	 * 先読みカバレッジテーブルの配列
	 */
	lookAheadCoverages: number[][];

	/**
	 * 置換の数
	 */
	substCount: number;

	/**
	 * 置換ルックアップレコードの配列
	 */
	substLookupRecords: SubstLookupRecord[];
}

// ============= ルックアップタイプ7: 拡張置換 =============

/**
 * 拡張置換サブテーブル (Lookup Type 7)
 */
export interface ExtensionSubstitutionSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GsubLookupType.EXTENSION_SUBSTITUTION;

	/**
	 * 置換のフォーマット（常に1）
	 */
	substFormat: 1;

	/**
	 * 拡張タイプ（ルックアップタイプ1〜6のいずれか）
	 */
	extensionLookupType: GsubLookupType;

	/**
	 * 拡張サブテーブルへのオフセット
	 */
	extensionOffset: number;

	/**
	 * 拡張サブテーブル（解析後）
	 */
	extensionSubtable?: GsubSubTable;
}

// ============= ルックアップタイプ8: 逆連鎖文脈依存単一置換 =============

/**
 * 逆連鎖文脈依存単一置換サブテーブル (Lookup Type 8)
 */
export interface ReverseChainSingleSubstitutionSubtable {
	/**
	 * サブテーブルタイプ識別子
	 */
	type: GsubLookupType.REVERSE_CHAINING_CONTEXTUAL;

	/**
	 * 置換のフォーマット（常に1）
	 */
	substFormat: 1;

	/**
	 * カバレッジテーブル（置換されるグリフを定義）
	 */
	coverage: number[];

	/**
	 * バックトラックカバレッジの数
	 */
	backtrackGlyphCount: number;

	/**
	 * バックトラックカバレッジテーブルの配列（後ろから前に向かって）
	 */
	backtrackCoverages: number[][];

	/**
	 * 先読みカバレッジの数
	 */
	lookAheadGlyphCount: number;

	/**
	 * 先読みカバレッジテーブルの配列
	 */
	lookAheadCoverages: number[][];

	/**
	 * 置換グリフの数
	 */
	glyphCount: number;

	/**
	 * 置換グリフID配列
	 */
	substituteGlyphIDs: number[];
}
