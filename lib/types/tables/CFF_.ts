/**
 * CFF (Compact Font Format) の型定義
 * 参考:
 * - https://learn.microsoft.com/en-us/typography/opentype/spec/cff
 * - https://adobe-type-tools.github.io/font-tech-notes/pdfs/5176.CFF.pdf
 * - https://adobe-type-tools.github.io/font-tech-notes/pdfs/5177.Type2.pdf
 */

import {
	Card16,
	Card8,
	DictIndex,
	FDSelect,
	OffSize,
	Offset,
	PrivateDictCommon,
	SID,
	SubrIndex
} from "../common";

// CFFヘッダー
export interface CFFHeader {
	major: Card8;      // フォーマットメジャーバージョン (常に1)
	minor: Card8;      // フォーマットマイナーバージョン
	hdrSize: Card8;    // ヘッダーサイズ (バイト)
	offSize: OffSize;  // 絶対オフセットのサイズ
}

// 名前索引
export interface NameIndex {
	count: Card16;           // エントリー数
	offSize: OffSize;        // オフセットのサイズ
	offsets: Offset[];       // オフセット配列
	names: string[];         // フォント名の配列
}

// 文字列索引
export interface StringIndex {
	count: Card16;           // エントリー数
	offSize: OffSize;        // オフセットのサイズ
	offsets: Offset[];       // オフセット配列
	strings: string[];       // 文字列の配列
}

// Top DICT 項目
export interface TopDictEntry {
	key: number;            // 演算子コード
	value: number | number[]; // オペランド (単一または配列)
}

// Top DICT (CFF)
export interface TopDict {
	version?: SID;          // フォントバージョン
	notice?: SID;           // 通知
	copyright?: SID;        // 著作権
	fullName?: SID;         // フルネーム
	familyName?: SID;       // ファミリー名
	weight?: SID;           // ウェイト
	isFixedPitch?: boolean; // 固定ピッチか
	italicAngle?: number;   // イタリック角度
	underlinePosition?: number; // アンダーライン位置
	underlineThickness?: number; // アンダーライン厚さ
	paintType?: number;     // ペイントタイプ
	charstringType?: number; // 文字列タイプ(通常は2)
	fontMatrix?: number[];  // フォント行列 [a b c d e f]
	uniqueId?: number;      // 一意ID
	fontBBox?: number[];    // フォントのバウンディングボックス [xMin yMin xMax yMax]
	strokeWidth?: number;   // ストローク幅
	xuid?: number[];        // 拡張一意ID
	charset?: Offset;       // 文字セットのオフセット
	encoding?: Offset;      // エンコーディングのオフセット
	charStrings?: Offset;   // 文字列のオフセット
	private?: [number, Offset]; // [サイズ, オフセット]
	syntheticBase?: number; // 合成ベース
	postScript?: SID;       // PostScript名
	baseFontName?: SID;     // ベースフォント名
	baseFontBlend?: number[]; // ベースフォントブレンド
	ros?: [SID, SID, number]; // [Registry, Order, Supplement]
	cidFontVersion?: number; // CIDフォントバージョン
	cidFontRevision?: number; // CIDフォントリビジョン
	cidFontType?: number;   // CIDフォントタイプ
	cidCount?: number;      // CID数
	uidBase?: number;       // UIDベース
	fdArray?: Offset;       // FDアレイのオフセット
	fdSelect?: Offset;      // FD選択のオフセット
	fontName?: SID;         // フォント名
}

// Private DICT (CFF)
export interface PrivateDict extends PrivateDictCommon {
	// CFF1固有の項目があれば追加
	localSubrIndex?: SubrIndex; // パーサーによって追加されるローカルサブルーチンインデックス
}

// 文字セット形式
export enum CharsetFormat {
	Format0 = 0,
	Format1 = 1,
	Format2 = 2
}

// フォーマット0文字セット
export interface Charset0 {
	format: CharsetFormat.Format0;
	glyph: SID[];           // グリフIDごとのSID
}

// フォーマット1文字セット
export interface Charset1 {
	format: CharsetFormat.Format1;
	ranges: Array<{
		first: SID;           // 最初のSID
		nLeft: Card8;         // 残りのグリフ数
	}>;
}

// フォーマット2文字セット
export interface Charset2 {
	format: CharsetFormat.Format2;
	ranges: Array<{
		first: SID;           // 最初のSID
		nLeft: Card16;        // 残りのグリフ数
	}>;
}

// 文字セットのユニオン型
export type Charset = Charset0 | Charset1 | Charset2;

// エンコーディング形式
export enum EncodingFormat {
	Format0 = 0,
	Format1 = 1
}

// フォーマット0エンコーディング
export interface Encoding0 {
	format: EncodingFormat.Format0;
	nCodes: Card8;          // コード数
	codes: Card8[];         // コード配列
}

// フォーマット1エンコーディング
export interface Encoding1 {
	format: EncodingFormat.Format1;
	nRanges: Card8;         // 範囲数
	ranges: Array<{
		first: Card8;         // 最初のコード
		nLeft: Card8;         // 残りのコード数
	}>;
}

// エンコーディング補足
export interface EncodingSupplement {
	nSups: Card8;           // 補足数
	supplement: Array<{
		code: Card8;          // コード
		glyph: SID;           // グリフID
	}>;
}

// エンコーディングのユニオン型
export type Encoding = (Encoding0 | Encoding1) & {
	supplement?: EncodingSupplement;
};

// CFF全体の構造
export interface CffTable {
	header: CFFHeader;
	nameIndex: NameIndex;
	topDictIndex: DictIndex;
	stringIndex: StringIndex;
	globalSubrIndex: SubrIndex;
	charsetData?: Charset;
	encodingData?: Encoding;
	charStringsIndex: DictIndex;
	privateDicts: PrivateDict[];
	localSubrIndices?: SubrIndex[];
	fdArray?: DictIndex;     // CIDフォントのみ
	fdSelect?: FDSelect;     // CIDフォントのみ
}