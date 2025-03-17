/**
 * CFF - Compact Font Format パーサー
 * 
 * 参照:
 * - https://learn.microsoft.com/en-us/typography/opentype/spec/cff
 * - https://adobe-type-tools.github.io/font-tech-notes/pdfs/5176.CFF.pdf
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import {
	CffTable, CFFHeader, NameIndex, StringIndex, TopDict,
	Charset, CharsetFormat, Charset0, Charset1, Charset2,
	Encoding, EncodingFormat, Encoding0, Encoding1, EncodingSupplement,
	PrivateDict
} from '../types/tables/CFF_';
import {
	parseDictIndex, parseSubrIndex, parseFDSelect, parseDict
} from './common/cff';

/**
 * CFFヘッダーをパースする
 * 
 * @param reader データリーダー
 * @param offset CFFデータの開始オフセット
 * @returns 解析されたCFFHeaderオブジェクト
 */
function parseHeader(reader: DataReader, offset: number): CFFHeader {
	reader.seek(offset);

	const major = reader.readUInt8();
	const minor = reader.readUInt8();
	const hdrSize = reader.readUInt8();
	const offSize = reader.readUInt8();

	return {
		major,
		minor,
		hdrSize,
		offSize
	};
}

/**
 * 名前インデックスをパースする
 * 
 * @param reader データリーダー
 * @param offset 名前インデックスの開始オフセット
 * @returns 解析されたNameIndexオブジェクト
 */
function parseNameIndex(reader: DataReader, offset: number): NameIndex {
	// オフセット位置に移動
	reader.seek(offset);

	// エントリー数を読み取る
	const count = reader.readUInt16();

	// カウントが0の場合は空のインデックステーブルを返す
	if (count === 0) {
		return {
			count: 0,
			offSize: 0,
			offsets: [],
			names: []
		};
	}

	// オフセットサイズを読み取る（1〜4バイト）
	const offSize = reader.readUInt8();
	if (offSize < 1 || offSize > 4) {
		throw new Error(`無効なoffSize: ${offSize}`);
	}

	// オフセット配列を読み取る (count + 1 個のオフセット)
	const offsets: number[] = [];
	for (let i = 0; i <= count; i++) {
		let value = 0;
		for (let j = 0; j < offSize; j++) {
			value = (value << 8) | reader.readUInt8();
		}
		offsets.push(value);
	}

	// 各名前文字列を読み取る
	const names: string[] = [];
	const dataStart = reader.getOffset();

	for (let i = 0; i < count; i++) {
		const nameOffset = dataStart + offsets[i] - 1; // オフセットは1からなので調整
		const nameLength = offsets[i + 1] - offsets[i];

		reader.save();
		reader.seek(nameOffset);

		// 名前をUTF-8としてデコード
		const nameData = reader.readBytes(nameLength);
		names.push(new TextDecoder().decode(nameData));

		reader.restore();
	}

	return {
		count,
		offSize,
		offsets,
		names
	};
}

/**
 * 文字列インデックスをパースする
 * 
 * @param reader データリーダー
 * @param offset 文字列インデックスの開始オフセット
 * @returns 解析されたStringIndexオブジェクト
 */
function parseStringIndex(reader: DataReader, offset: number): StringIndex {
	// オフセット位置に移動
	reader.seek(offset);

	// エントリー数を読み取る
	const count = reader.readUInt16();

	// カウントが0の場合は空のインデックステーブルを返す
	if (count === 0) {
		return {
			count: 0,
			offSize: 0,
			offsets: [],
			strings: []
		};
	}

	// オフセットサイズを読み取る（1〜4バイト）
	const offSize = reader.readUInt8();
	if (offSize < 1 || offSize > 4) {
		throw new Error(`無効なoffSize: ${offSize}`);
	}

	// オフセット配列を読み取る (count + 1 個のオフセット)
	const offsets: number[] = [];
	for (let i = 0; i <= count; i++) {
		let value = 0;
		for (let j = 0; j < offSize; j++) {
			value = (value << 8) | reader.readUInt8();
		}
		offsets.push(value);
	}

	// 各文字列を読み取る
	const strings: string[] = [];
	const dataStart = reader.getOffset();

	for (let i = 0; i < count; i++) {
		const stringOffset = dataStart + offsets[i] - 1; // オフセットは1からなので調整
		const stringLength = offsets[i + 1] - offsets[i];

		reader.save();
		reader.seek(stringOffset);

		// 文字列をUTF-8としてデコード
		const stringData = reader.readBytes(stringLength);
		strings.push(new TextDecoder().decode(stringData));

		reader.restore();
	}

	return {
		count,
		offSize,
		offsets,
		strings
	};
}

/**
 * TopDictをパースする
 * 
 * @param dictData TopDict辞書データバイト配列
 * @returns パースされたTopDictオブジェクト
 */
function parseTopDict(dictData: Uint8Array): TopDict {
	const dict: TopDict = {};
	const entries = parseDict(dictData);

	for (const [key, value] of entries) {
		// CIDフォント ROS演算子
		if (key === 0x0C1E) {
			if (Array.isArray(value) && value.length === 3) {
				dict.ros = [value[0], value[1], value[2]];
			}
		}
		// charStringsオフセット
		else if (key === 17) {
			dict.charStrings = value as number;
		}
		// 文字セットオフセット
		else if (key === 15) {
			dict.charset = value as number;
		}
		// エンコーディングオフセット
		else if (key === 16) {
			dict.encoding = value as number;
		}
		// Privateオフセット
		else if (key === 18) {
			if (Array.isArray(value) && value.length === 2) {
				dict.private = [value[0], value[1]];
			}
		}
		// フォント行列
		else if (key === 0x0C07) {
			if (Array.isArray(value) && value.length === 6) {
				dict.fontMatrix = value;
			}
		}
		// フォントBBox
		else if (key === 5) {
			if (Array.isArray(value) && value.length === 4) {
				dict.fontBBox = value;
			}
		}
		// FDArrayオフセット (CIDフォント用)
		else if (key === 0x0C24) {
			dict.fdArray = value as number;
		}
		// FDSelectオフセット (CIDフォント用)
		else if (key === 0x0C25) {
			dict.fdSelect = value as number;
		}
		// 他の辞書エントリは必要に応じて追加
	}

	return dict;
}

/**
 * PrivateDictをパースする
 * 
 * @param dictData PrivateDict辞書データバイト配列
 * @returns パースされたPrivateDictオブジェクト
 */
function parsePrivateDict(dictData: Uint8Array): PrivateDict {
	const dict: PrivateDict = {};
	const entries = parseDict(dictData);

	for (const [key, value] of entries) {
		// Subroutinesオフセット
		if (key === 19) {
			dict.subrs = value as number;
		}
		// 他の辞書エントリは必要に応じて追加
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
 * 文字セットをパースする
 * 
 * @param reader データリーダー
 * @param offset 文字セットの開始オフセット
 * @param numGlyphs グリフの数
 * @returns 解析された文字セットオブジェクト
 */
function parseCharset(reader: DataReader, offset: number, numGlyphs: number): Charset {
	// オフセット位置に移動
	reader.seek(offset);

	// フォーマットを読み取る
	const format = reader.readUInt8() as CharsetFormat;

	// フォーマット0：グリフIDごとのSID
	if (format === CharsetFormat.Format0) {
		const glyph: number[] = [];

		// .notdefは含まれないので、残り(numGlyphs - 1)個のSIDを読み取る
		for (let i = 0; i < numGlyphs - 1; i++) {
			glyph.push(reader.readUInt16());
		}

		return {
			format: CharsetFormat.Format0,
			glyph
		} as Charset0;
	}
	// フォーマット1：SID範囲
	else if (format === CharsetFormat.Format1) {
		const ranges = [];
		let glyphIndex = 1; // .notdefの後から開始

		while (glyphIndex < numGlyphs) {
			const first = reader.readUInt16(); // 最初のSID
			const nLeft = reader.readUInt8(); // 範囲内の追加グリフ数

			ranges.push({ first, nLeft });
			glyphIndex += nLeft + 1; // 範囲内のグリフ数だけインデックスを進める
		}

		return {
			format: CharsetFormat.Format1,
			ranges
		} as Charset1;
	}
	// フォーマット2：拡張SID範囲
	else if (format === CharsetFormat.Format2) {
		const ranges = [];
		let glyphIndex = 1; // .notdefの後から開始

		while (glyphIndex < numGlyphs) {
			const first = reader.readUInt16(); // 最初のSID
			const nLeft = reader.readUInt16(); // 範囲内の追加グリフ数

			ranges.push({ first, nLeft });
			glyphIndex += nLeft + 1; // 範囲内のグリフ数だけインデックスを進める
		}

		return {
			format: CharsetFormat.Format2,
			ranges
		} as Charset2;
	}

	throw new Error(`対応していない文字セットフォーマット: ${format}`);
}

/**
 * エンコーディングをパースする
 * 
 * @param reader データリーダー
 * @param offset エンコーディングの開始オフセット
 * @returns 解析されたエンコーディングオブジェクト
 */
function parseEncoding(reader: DataReader, offset: number): Encoding {
	// オフセット位置に移動
	reader.seek(offset);

	// フォーマットを読み取る
	let format = reader.readUInt8();
	const hasSupplement = (format & 0x80) !== 0;
	format = format & 0x7F; // 上位ビットを取り除く

	// フォーマット0：コード配列
	if (format === EncodingFormat.Format0) {
		const nCodes = reader.readUInt8();
		const codes: number[] = [];

		for (let i = 0; i < nCodes; i++) {
			codes.push(reader.readUInt8());
		}

		let result: Encoding = {
			format: EncodingFormat.Format0,
			nCodes,
			codes
		} as Encoding0;

		// 補足エンコーディングを追加
		if (hasSupplement) {
			result = parseSupplement(reader, result);
		}

		return result;
	}
	// フォーマット1：範囲
	else if (format === EncodingFormat.Format1) {
		const nRanges = reader.readUInt8();
		const ranges = [];

		for (let i = 0; i < nRanges; i++) {
			ranges.push({
				first: reader.readUInt8(),
				nLeft: reader.readUInt8()
			});
		}

		let result: Encoding = {
			format: EncodingFormat.Format1,
			nRanges,
			ranges
		} as Encoding1;

		// 補足エンコーディングを追加
		if (hasSupplement) {
			result = parseSupplement(reader, result);
		}

		return result;
	}

	throw new Error(`対応していないエンコーディングフォーマット: ${format}`);
}

/**
 * 補足エンコーディングをパースする
 * 
 * @param reader データリーダー
 * @param encoding 基本エンコーディングオブジェクト
 * @returns 補足情報が追加されたエンコーディングオブジェクト
 */
function parseSupplement(reader: DataReader, encoding: Encoding): Encoding {
	const nSups = reader.readUInt8();
	const supplement: { code: number, glyph: number }[] = [];

	for (let i = 0; i < nSups; i++) {
		supplement.push({
			code: reader.readUInt8(),
			glyph: reader.readUInt16()
		});
	}

	encoding.supplement = {
		nSups,
		supplement
	};

	return encoding;
}

/**
 * CFFテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたCFFデータ
 */
export function parseCFFTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): CffTable {
	// テーブルのオフセットに移動
	const tableStart = entry.offset;
	reader.seek(tableStart);

	// ヘッダーを解析
	const header = parseHeader(reader, tableStart);

	// 次のテーブルの位置に移動（ヘッダーの長さだけ進める）
	reader.seek(tableStart + header.hdrSize);

	// 名前インデックスを解析
	const nameIndex = parseNameIndex(reader, reader.getOffset());

	// 名前インデックスの後のオフセットを計算
	let currentOffset = reader.getOffset();
	if (nameIndex.count > 0) {
		const lastOffset = nameIndex.offsets[nameIndex.offsets.length - 1];
		currentOffset += lastOffset - 1;
	}

	// Top DICTインデックスを解析
	const topDictIndex = parseDictIndex(reader, currentOffset);

	// Top DICTインデックスの後のオフセットを計算
	currentOffset = reader.getOffset();
	if (topDictIndex.count > 0) {
		const lastOffset = topDictIndex.offsets[topDictIndex.offsets.length - 1];
		currentOffset += lastOffset - 1;
	}

	// 文字列インデックスを解析
	const stringIndex = parseStringIndex(reader, currentOffset);

	// 文字列インデックスの後のオフセットを計算
	currentOffset = reader.getOffset();
	if (stringIndex.count > 0) {
		const lastOffset = stringIndex.offsets[stringIndex.offsets.length - 1];
		currentOffset += lastOffset - 1;
	}

	// グローバルサブルーチンインデックスを解析
	const globalSubrIndex = parseSubrIndex(reader, currentOffset);

	// Top DICTを解析（通常は1つのみ）
	const topDictData = topDictIndex.data[0];
	const topDict = parseTopDict(topDictData);

	// CharStringsインデックスを解析
	let charStringsIndex = undefined;
	if (topDict.charStrings !== undefined) {
		charStringsIndex = parseDictIndex(reader, tableStart + topDict.charStrings);
	} else {
		throw new Error('CFFフォントにCharStringsが見つかりません');
	}

	// 文字セットを解析（デフォルト以外の場合）
	let charsetData = undefined;
	if (topDict.charset !== undefined && topDict.charset !== 0) {
		const numGlyphs = charStringsIndex.count;
		charsetData = parseCharset(reader, tableStart + topDict.charset, numGlyphs);
	}

	// エンコーディングを解析（デフォルト以外の場合）
	let encodingData = undefined;
	if (topDict.encoding !== undefined && topDict.encoding !== 0) {
		encodingData = parseEncoding(reader, tableStart + topDict.encoding);
	}

	// PrivateDictを解析
	const privateDicts: PrivateDict[] = [];

	// 標準フォントの場合（単一のPrivateDict）
	if (topDict.private !== undefined) {
		const [privateSize, privateOffset] = topDict.private;

		reader.seek(tableStart + privateOffset);
		const privateData = reader.readBytes(privateSize);
		const privateDict = parsePrivateDict(privateData);

		// ローカルサブルーチンを解析（存在する場合）
		if (privateDict.subrs !== undefined) {
			privateDict.localSubrIndex = parseSubrIndex(reader, tableStart + privateOffset + privateDict.subrs);
		}

		privateDicts.push(privateDict);
	}

	// CIDフォントの場合（複数のPrivateDict）
	let fdArray = undefined;
	let fdSelect = undefined;

	if (topDict.fdArray !== undefined && topDict.fdSelect !== undefined) {
		// FDArrayを解析
		fdArray = parseDictIndex(reader, tableStart + topDict.fdArray);

		// 各FDエントリのPrivateDictを解析
		for (const fdData of fdArray.data) {
			const fdDict = parseTopDict(fdData);

			if (fdDict.private !== undefined) {
				const [privateSize, privateOffset] = fdDict.private;

				reader.seek(tableStart + privateOffset);
				const privateData = reader.readBytes(privateSize);
				const privateDict = parsePrivateDict(privateData);

				// ローカルサブルーチンを解析（存在する場合）
				if (privateDict.subrs !== undefined) {
					privateDict.localSubrIndex = parseSubrIndex(reader, tableStart + privateOffset + privateDict.subrs);
				}

				privateDicts.push(privateDict);
			}
		}

		// FDSelectを解析
		fdSelect = parseFDSelect(reader, tableStart + topDict.fdSelect, charStringsIndex.count);
	}

	// CFFデータオブジェクトを作成して返す
	return {
		header,
		nameIndex,
		topDictIndex,
		stringIndex,
		globalSubrIndex,
		charsetData,
		encodingData,
		charStringsIndex,
		privateDicts,
		fdArray,
		fdSelect
	};
}
