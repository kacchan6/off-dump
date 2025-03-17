/**
 * CFF2 の型定義
 * 参考:
 * - https://learn.microsoft.com/en-us/typography/opentype/spec/cff2
 * - https://adobe-type-tools.github.io/font-tech-notes/pdfs/5176.CFF.pdf
 * - https://adobe-type-tools.github.io/font-tech-notes/pdfs/5177.Type2.pdf
 */

import {
	Card16,
	Card8,
	DictIndex,
	FDSelect,
	Offset,
	PrivateDictCommon,
	SubrIndex,
	VariationStore
} from "../common";

export { VariationStore } from "../common";

// CFF2ヘッダー
export interface CFF2Header {
	major: Card8;           // フォーマットメジャーバージョン (常に2)
	minor: Card8;           // フォーマットマイナーバージョン (常に0)
	hdrSize: Card8;         // ヘッダーサイズ (バイト)
	topDictLength: Card16;  // Top DICTの長さ
}

// Top DICT 項目
export interface TopDict2Entry {
	key: number;            // 演算子コード
	value: number | number[]; // オペランド (単一または配列)
}

// Top DICT (CFF2)
export interface TopDict2 {
	fontMatrix?: number[];  // フォント行列 [a b c d e f]
	fontBBox?: number[];    // フォントのバウンディングボックス [xMin yMin xMax yMax]
	varStore?: Offset;      // バリエーションストアのオフセット
	maxstack?: number;      // 最大スタックの深さ
	charStrings?: Offset;   // 文字列のオフセット
	fdArray?: Offset;       // FDアレイのオフセット
	fdSelect?: Offset;      // FD選択のオフセット
	vstore?: Offset;        // バリエーションストアのオフセット
	private?: [number, Offset]; // [サイズ, オフセット] - CFF2パーサーで必要
}

// Private DICT (CFF2)
export interface PrivateDict2 extends PrivateDictCommon {
	vsindex?: number;       // バリエーションストアインデックス
	blend?: number[];       // ブレンド値
	localSubrIndex?: SubrIndex; // パーサーによって追加されるローカルサブルーチンインデックス
}

// CFF2全体の構造
export interface Cff2Table {
	header: CFF2Header;
	topDict: TopDict2;
	globalSubrIndex: SubrIndex;
	charStringsIndex: DictIndex;
	privateDicts: PrivateDict2[];
	localSubrIndices?: SubrIndex[];
	fdArray?: DictIndex;     // CIDフォントのみ
	fdSelect?: FDSelect;     // CIDフォントのみ
	varStore?: VariationStore; // バリエーションストアデータ
}