/**
 * CFF2 - Compact Font Format 2 パーサー
 * 
 * 参照:
 * - https://learn.microsoft.com/en-us/typography/opentype/spec/cff2
 * - https://adobe-type-tools.github.io/font-tech-notes/pdfs/5176.CFF.pdf
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import {
	Cff2Table, CFF2Header, TopDict2, PrivateDict2, VariationStore
} from '../types/tables/CFF2';
import {
	parseDictIndex, parseSubrIndex, parseFDSelect, parseDict
} from './common/cff';

/**
 * CFF2ヘッダーをパースする
 * 
 * @param reader データリーダー
 * @param offset CFF2データの開始オフセット
 * @returns 解析されたCFF2Headerオブジェクト
 */
function parseHeader(reader: DataReader, offset: number): CFF2Header {
	reader.seek(offset);

	const major = reader.readUInt8();
	const minor = reader.readUInt8();
	const hdrSize = reader.readUInt8();
	const topDictLength = reader.readUInt16();

	// CFF2のメジャーバージョンは常に2、マイナーバージョンは0であることを確認
	if (major !== 2) {
		throw new Error(`CFF2メジャーバージョンが無効です: ${major} (期待値: 2)`);
	}

	return {
		major,
		minor,
		hdrSize,
		topDictLength
	};
}

/**
 * TopDict2をパースする
 * 
 * @param reader データリーダー
 * @param offset TopDict2の開始オフセット
 * @param length TopDict2の長さ
 * @returns パースされたTopDict2オブジェクト
 */
function parseTopDict2(reader: DataReader, offset: number, length: number): TopDict2 {
	reader.seek(offset);
	const dictData = reader.readBytes(length);

	const dict: TopDict2 = {};
	const entries = parseDict(dictData);

	for (const [key, value] of entries) {
		// CharStringsオフセット
		if (key === 17) {
			dict.charStrings = value as number;
		}
		// FontMatrixオペレータ
		else if (key === 0x0C07) {
			if (Array.isArray(value) && value.length === 6) {
				dict.fontMatrix = value;
			}
		}
		// FontBBoxオペレータ
		else if (key === 5) {
			if (Array.isArray(value) && value.length === 4) {
				dict.fontBBox = value;
			}
		}
		// FDArrayオフセット
		else if (key === 0x0C24) {
			dict.fdArray = value as number;
		}
		// FDSelectオフセット
		else if (key === 0x0C25) {
			dict.fdSelect = value as number;
		}
		// 変数ストアオフセット
		else if (key === 24) {
			dict.vstore = value as number;
		}
		// 最大スタック深さ
		else if (key === 0x0C17) {
			dict.maxstack = value as number;
		}
	}

	return dict;
}

/**
 * PrivateDict2をパースする
 * 
 * @param dictData PrivateDict2辞書データバイト配列
 * @returns パースされたPrivateDict2オブジェクト
 */
function parsePrivateDict2(dictData: Uint8Array): PrivateDict2 {
	const dict: PrivateDict2 = {};
	const entries = parseDict(dictData);

	for (const [key, value] of entries) {
		// Subroutinesオフセット
		if (key === 19) {
			dict.subrs = value as number;
		}
		// vsindexオペレータ
		else if (key === 22) {
			dict.vsindex = value as number;
		}
		// blendオペレータ
		else if (key === 23) {
			if (Array.isArray(value)) {
				dict.blend = value;
			}
		}
		// 他の辞書エントリは必要に応じて追加（CFF1と共通のエントリ）
		else if (key === 6) {
			if (Array.isArray(value)) {
				dict.blueValues = value;
			}
		}
		else if (key === 7) {
			if (Array.isArray(value)) {
				dict.otherBlues = value;
			}
		}
		else if (key === 8) {
			if (Array.isArray(value)) {
				dict.familyBlues = value;
			}
		}
		else if (key === 9) {
			if (Array.isArray(value)) {
				dict.familyOtherBlues = value;
			}
		}
		else if (key === 0x0C09) {
			dict.blueScale = value as number;
		}
		else if (key === 0x0C0A) {
			dict.blueShift = value as number;
		}
		else if (key === 0x0C0B) {
			dict.blueFuzz = value as number;
		}
		else if (key === 10) {
			dict.stdHW = value as number;
		}
		else if (key === 11) {
			dict.stdVW = value as number;
		}
		else if (key === 0x0C0C) {
			if (Array.isArray(value)) {
				dict.stemSnapH = value;
			}
		}
		else if (key === 0x0C0D) {
			if (Array.isArray(value)) {
				dict.stemSnapV = value;
			}
		}
		else if (key === 0x0C0E) {
			dict.forceBold = value === 1;
		}
		else if (key === 0x0C11) {
			dict.languageGroup = value as number;
		}
		else if (key === 0x0C12) {
			dict.expansionFactor = value as number;
		}
		else if (key === 0x0C13) {
			dict.initialRandomSeed = value as number;
		}
		else if (key === 20) {
			dict.defaultWidthX = value as number;
		}
		else if (key === 21) {
			dict.nominalWidthX = value as number;
		}
	}

	return dict;
}

/**
 * 変数データストアをパースする
 * 
 * @param reader データリーダー
 * @param offset 変数データストアの開始オフセット
 * @returns パースされた変数データストア
 */
function parseVarStore(reader: DataReader, offset: number): VariationStore {
	reader.seek(offset);

	// フォーマット (常に1)
	const format = reader.readUInt16();
	if (format !== 1) {
		throw new Error(`対応していない変数データストアフォーマット: ${format}`);
	}

	// 領域リスト
	const axisCount = reader.readUInt16();
	const regionCount = reader.readUInt16();

	const regions = [];
	for (let i = 0; i < regionCount; i++) {
		const regionAxes = [];
		for (let j = 0; j < axisCount; j++) {
			regionAxes.push({
				startCoord: reader.readF2DOT14(),
				peakCoord: reader.readF2DOT14(),
				endCoord: reader.readF2DOT14()
			});
		}
		regions.push({ regionAxes });
	}

	const regionList = {
		axisCount,
		regionCount,
		regions
	};

	// アイテム変異データリスト
	const itemCount = reader.readUInt16();
	const itemVariationData = [];

	for (let i = 0; i < itemCount; i++) {
		const itemVariationDataOffset = reader.readUInt32();

		// 現在の位置を保存
		reader.save();

		// アイテム変異データの位置に移動
		reader.seek(offset + itemVariationDataOffset);

		// アイテム変異データを読み取る
		const itemCount = reader.readUInt16();
		const shortDeltaCount = reader.readUInt16();
		const regionIndexCount = reader.readUInt16();

		// 領域インデックス配列
		const regionIndices = [];
		for (let j = 0; j < regionIndexCount; j++) {
			regionIndices.push(reader.readUInt16());
		}

		// デルタセット配列
		const deltaSet = [];
		for (let j = 0; j < itemCount; j++) {
			const deltas = [];

			// 短い(16ビット)デルタ値
			for (let k = 0; k < shortDeltaCount; k++) {
				deltas.push(reader.readInt16());
			}

			// 長い(32ビット)デルタ値
			for (let k = 0; k < regionIndexCount - shortDeltaCount; k++) {
				deltas.push(reader.readInt32());
			}

			deltaSet.push(deltas);
		}

		itemVariationData.push({
			itemCount,
			shortDeltaCount,
			regionIndexCount,
			regionIndices,
			deltaSet
		});

		// 保存した位置に戻る
		reader.restore();
	}

	const dataList = {
		itemCount,
		itemVariationData
	};

	return {
		format,
		regionList,
		dataList
	};
}

/**
 * CFF2テーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたCFF2データ
 */
export function parseCFF2Table(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): Cff2Table {
	// テーブルのオフセットに移動
	const tableStart = entry.offset;
	reader.seek(tableStart);

	// ヘッダーを解析
	const header = parseHeader(reader, tableStart);

	// TopDictを解析 (ヘッダーの直後に配置)
	const topDictOffset = tableStart + header.hdrSize;
	const topDict = parseTopDict2(reader, topDictOffset, header.topDictLength);

	// TopDictの後のオフセットを計算
	const currentOffset = topDictOffset + header.topDictLength;

	// グローバルサブルーチンインデックスを解析
	const globalSubrIndex = parseSubrIndex(reader, currentOffset);

	// CharStringsインデックスを解析
	let charStringsIndex = undefined;
	if (topDict.charStrings !== undefined) {
		charStringsIndex = parseDictIndex(reader, tableStart + topDict.charStrings);
	} else {
		throw new Error('CFF2フォントにCharStringsが見つかりません');
	}

	// PrivateDictを解析
	const privateDicts: PrivateDict2[] = [];

	// ローカルサブルーチンインデックスを格納する配列
	const localSubrIndices = [];

	// FDArrayとFDSelectを解析（CIDフォントの場合）
	let fdArray = undefined;
	let fdSelect = undefined;

	if (topDict.fdArray !== undefined && topDict.fdSelect !== undefined) {
		// FDArrayを解析
		fdArray = parseDictIndex(reader, tableStart + topDict.fdArray);

		// 各FDエントリのPrivateDictを解析
		for (const fdData of fdArray.data) {
			const fdDict = parseTopDict2(reader, topDictOffset, fdData.length);

			if (fdDict.private !== undefined) {
				const [privateSize, privateOffset] = fdDict.private;

				reader.seek(tableStart + privateOffset);
				const privateData = reader.readBytes(privateSize);
				const privateDict = parsePrivateDict2(privateData);

				// ローカルサブルーチンを解析（存在する場合）
				if (privateDict.subrs !== undefined) {
					const localSubrIndex = parseSubrIndex(reader, tableStart + privateOffset + privateDict.subrs);
					localSubrIndices.push(localSubrIndex);
				}

				privateDicts.push(privateDict);
			}
		}

		// FDSelectを解析
		fdSelect = parseFDSelect(reader, tableStart + topDict.fdSelect, charStringsIndex.count);
	}

	// 変数データストアを解析（存在する場合）
	let varStore = undefined;
	if (topDict.vstore !== undefined) {
		varStore = parseVarStore(reader, tableStart + topDict.vstore);
	}

	// CFF2データオブジェクトを作成して返す
	return {
		header,
		topDict,
		globalSubrIndex,
		charStringsIndex,
		privateDicts,
		localSubrIndices,
		fdArray,
		fdSelect,
		varStore
	};
}