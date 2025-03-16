/**
 * cmap - 文字コードマッピングテーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/cmap
 */

import { Font, TableDirectoryEntry } from '../types/font';
import {
	CmapTable, CmapHeader, CmapEncodingRecord, CmapSubtable,
	CmapFormat, CmapFormat0Subtable, CmapFormat4Subtable,
	CmapFormat6Subtable, CmapFormat12Subtable, CmapFormat14Subtable,
	CmapVariationSelectorRecord, CmapDefaultUVSTable, CmapNonDefaultUVSTable,
	CmapUnicodeValueRange, CmapUVSMapping, CmapFormat12Group,
	CmapFormat13Group,
	CmapFormat13Subtable,
	CmapFormat10Subtable,
	CmapFormat8Subtable,
	CmapFormat2Subtable,
	CmapFormat2SubHeader,
	CmapFormat8Group
} from '../types/tables/cmap';
import { DataReader } from '../utils/data-reader';

/**
 * フォーマット0のサブテーブルをパースする（バイトエンコーディング）
 * 
 * @param reader データリーダー
 * @returns フォーマット0のサブテーブル
 */
function parseFormat0Subtable(reader: DataReader): CmapFormat0Subtable {
	const format = reader.readUInt16();
	const length = reader.readUInt16();
	const language = reader.readUInt16();

	// 256エントリの配列を読み込む
	const glyphIdArray: number[] = [];
	for (let i = 0; i < 256; i++) {
		glyphIdArray.push(reader.readUInt8());
	}

	return {
		format: CmapFormat.BYTE_ENCODING,
		language,
		glyphIdArray
	};
}

/**
 * フォーマット4のサブテーブルをパースする（セグメントマッピング）
 * 
 * @param reader データリーダー
 * @returns フォーマット4のサブテーブル
 */
function parseFormat4Subtable(reader: DataReader): CmapFormat4Subtable {
	const format = reader.readUInt16();
	const length = reader.readUInt16();
	const language = reader.readUInt16();
	const segCountX2 = reader.readUInt16();
	const searchRange = reader.readUInt16();
	const entrySelector = reader.readUInt16();
	const rangeShift = reader.readUInt16();

	const segCount = segCountX2 / 2;

	// endCode配列を読み込む
	const endCode: number[] = [];
	for (let i = 0; i < segCount; i++) {
		endCode.push(reader.readUInt16());
	}

	// reservedPad（常に0）
	const reservedPad = reader.readUInt16();

	// startCode配列を読み込む
	const startCode: number[] = [];
	for (let i = 0; i < segCount; i++) {
		startCode.push(reader.readUInt16());
	}

	// idDelta配列を読み込む
	const idDelta: number[] = [];
	for (let i = 0; i < segCount; i++) {
		idDelta.push(reader.readInt16());
	}

	// idRangeOffset配列を読み込む
	const idRangeOffset: number[] = [];
	const idRangeOffsetPosition = reader.getOffset();
	for (let i = 0; i < segCount; i++) {
		idRangeOffset.push(reader.readUInt16());
	}

	// 残りのバイトをglyphIdArrayとして読み込む
	const glyphIdArray: number[] = [];
	const remainingBytes = length - (reader.getOffset() - idRangeOffsetPosition + segCountX2 * 2);
	const glyphIdCount = remainingBytes / 2;

	for (let i = 0; i < glyphIdCount; i++) {
		glyphIdArray.push(reader.readUInt16());
	}

	return {
		format: CmapFormat.SEGMENT_MAPPING,
		language,
		segCountX2,
		searchRange,
		entrySelector,
		rangeShift,
		endCode,
		reservedPad,
		startCode,
		idDelta,
		idRangeOffset,
		glyphIdArray
	};
}

/**
 * フォーマット6のサブテーブルをパースする（トリムテーブルマッピング）
 * 
 * @param reader データリーダー
 * @returns フォーマット6のサブテーブル
 */
function parseFormat6Subtable(reader: DataReader): CmapFormat6Subtable {
	const format = reader.readUInt16();
	const length = reader.readUInt16();
	const language = reader.readUInt16();
	const firstCode = reader.readUInt16();
	const entryCount = reader.readUInt16();

	// グリフIDの配列を読み込む
	const glyphIdArray: number[] = [];
	for (let i = 0; i < entryCount; i++) {
		glyphIdArray.push(reader.readUInt16());
	}

	return {
		format: CmapFormat.TRIMMED_TABLE_MAPPING,
		language,
		firstCode,
		entryCount,
		glyphIdArray
	};
}

/**
 * フォーマット12のサブテーブルをパースする（セグメントカバレッジ）
 * 
 * @param reader データリーダー
 * @returns フォーマット12のサブテーブル
 */
function parseFormat12Subtable(reader: DataReader): CmapFormat12Subtable {
	const format = reader.readUInt16();
	const reserved = reader.readUInt16();
	const length = reader.readUInt32();
	const language = reader.readUInt32();
	const numGroups = reader.readUInt32();

	// グループの配列を読み込む
	const groups: CmapFormat12Group[] = [];
	for (let i = 0; i < numGroups; i++) {
		groups.push({
			startCharCode: reader.readUInt32(),
			endCharCode: reader.readUInt32(),
			startGlyphID: reader.readUInt32()
		});
	}

	return {
		format: CmapFormat.SEGMENTED_COVERAGE,
		reserved,
		length,
		language,
		numGroups,
		groups
	};
}

/**
 * フォーマット2のサブテーブルをパースする（高バイトマッピング）
 * 
 * @param reader データリーダー
 * @returns フォーマット2のサブテーブル
 */
function parseFormat2Subtable(reader: DataReader): CmapFormat2Subtable {
	const format = reader.readUInt16();
	const length = reader.readUInt16();
	const language = reader.readUInt16();

	// subHeaderKeysの配列（256要素）を読み込む
	const subHeaderKeys: number[] = [];
	for (let i = 0; i < 256; i++) {
		subHeaderKeys.push(reader.readUInt16());
	}

	// サブヘッダの実際の数を計算
	// （各subHeaderKeysエントリは/8で割ることでサブヘッダインデックスを示す）
	const maxSubHeaderIndex = Math.max(...subHeaderKeys) / 2;
	const subHeaders: CmapFormat2SubHeader[] = [];

	// サブヘッダを読み込む
	for (let i = 0; i <= maxSubHeaderIndex; i++) {
		const subHeader: CmapFormat2SubHeader = {
			firstCode: reader.readUInt16(),
			entryCount: reader.readUInt16(),
			idDelta: reader.readInt16(),
			idRangeOffset: reader.readUInt16(),
			glyphIdArrayIndex: 0 // 後で計算
		};

		// glyphIdArrayOffsetを計算
		// これはidRangeOffsetの位置からの相対オフセット
		if (subHeader.idRangeOffset !== 0) {
			// idRangeOffsetの位置からのバイト数
			const currentOffset = reader.getOffset();
			const idRangeOffsetPosition = currentOffset - 2; // 2バイト前がidRangeOffset
			// glyphIdArrayの位置
			subHeader.glyphIdArrayIndex = (idRangeOffsetPosition + subHeader.idRangeOffset) / 2;
		}

		subHeaders.push(subHeader);
	}

	// 残りのデータをglyphIdArrayとして読み込む
	const remainingBytes = length - reader.getOffset();
	const glyphIdCount = remainingBytes / 2;
	const glyphIdArray: number[] = [];

	for (let i = 0; i < glyphIdCount; i++) {
		glyphIdArray.push(reader.readUInt16());
	}

	return {
		format: CmapFormat.HIGH_BYTE_MAPPING,
		language,
		subHeaderKeys,
		subHeaders,
		glyphIdArray
	};
}

/**
 * フォーマット8のサブテーブルをパースする（混合16/32ビットマッピング）
 * 
 * @param reader データリーダー
 * @returns フォーマット8のサブテーブル
 */
function parseFormat8Subtable(reader: DataReader): CmapFormat8Subtable {
	const format = reader.readUInt16();
	const reserved = reader.readUInt16();
	const length = reader.readUInt32();
	const language = reader.readUInt32();

	// is32ビットフィールドの読み込み（8192バイト = 8192 * 8ビット）
	// 65536（0x0000〜0xFFFF）のコードポイント領域
	const is32Bytes = reader.readBytes(8192);

	const numGroups = reader.readUInt32();
	const groups: CmapFormat8Group[] = [];

	// グループの配列を読み込む
	for (let i = 0; i < numGroups; i++) {
		groups.push({
			startCharCode: reader.readUInt32(),
			endCharCode: reader.readUInt32(),
			startGlyphID: reader.readUInt32()
		});
	}

	return {
		format: CmapFormat.MIXED_16_32_BIT_MAPPING,
		reserved,
		length,
		language,
		is32: is32Bytes,
		numGroups,
		groups
	};
}

/**
 * フォーマット10のサブテーブルをパースする（トリム配列）
 * 
 * @param reader データリーダー
 * @returns フォーマット10のサブテーブル
 */
function parseFormat10Subtable(reader: DataReader): CmapFormat10Subtable {
	const format = reader.readUInt16();
	const reserved = reader.readUInt16();
	const length = reader.readUInt32();
	const language = reader.readUInt32();
	const startCharCode = reader.readUInt32();
	const numChars = reader.readUInt32();

	// グリフインデックス配列を読み込む
	const glyphs: number[] = [];
	for (let i = 0; i < numChars; i++) {
		glyphs.push(reader.readUInt16());
	}

	return {
		format: CmapFormat.TRIMMED_ARRAY,
		reserved,
		length,
		language,
		startCharCode,
		numChars,
		glyphs
	};
}

/**
 * フォーマット13のサブテーブルをパースする（多対一範囲マッピング）
 * 
 * @param reader データリーダー
 * @returns フォーマット13のサブテーブル
 */
function parseFormat13Subtable(reader: DataReader): CmapFormat13Subtable {
	const format = reader.readUInt16();
	const reserved = reader.readUInt16();
	const length = reader.readUInt32();
	const language = reader.readUInt32();
	const numGroups = reader.readUInt32();

	// グループの配列を読み込む
	const groups: CmapFormat13Group[] = [];
	for (let i = 0; i < numGroups; i++) {
		groups.push({
			startCharCode: reader.readUInt32(),
			endCharCode: reader.readUInt32(),
			glyphID: reader.readUInt32()
		});
	}

	return {
		format: CmapFormat.MANY_TO_ONE_RANGE_MAPPINGS,
		reserved,
		length,
		language,
		numGroups,
		groups
	};
}

/**
 * フォーマット14のサブテーブルをパースする（バリエーションセレクタ）
 * 
 * @param reader データリーダー
 * @returns フォーマット14のサブテーブル
 */
function parseFormat14Subtable(reader: DataReader): CmapFormat14Subtable {
	const startOffset = reader.getOffset();
	const format = reader.readUInt16();
	const length = reader.readUInt32();
	const numVarSelectorRecords = reader.readUInt32();

	// バリエーションセレクタレコードの配列を読み込む
	const varSelectors: CmapVariationSelectorRecord[] = [];

	// 最初にすべてのレコードのヘッダーを読み込む
	const varSelectorHeaders: {
		varSelector: number,
		defaultUVSOffset: number,
		nonDefaultUVSOffset: number
	}[] = [];

	for (let i = 0; i < numVarSelectorRecords; i++) {
		varSelectorHeaders.push({
			varSelector: reader.readUInt24(),
			defaultUVSOffset: reader.readUInt32(),
			nonDefaultUVSOffset: reader.readUInt32()
		});
	}

	// 各レコードのUVSテーブルを解析する
	for (const header of varSelectorHeaders) {
		const record: CmapVariationSelectorRecord = {
			varSelector: header.varSelector,
			defaultUVSOffset: header.defaultUVSOffset,
			nonDefaultUVSOffset: header.nonDefaultUVSOffset
		};

		// デフォルトUVSテーブルが存在する場合
		if (header.defaultUVSOffset !== 0) {
			// 現在の位置を保存
			reader.save();

			// テーブルの先頭からの絶対位置に移動
			reader.seek(startOffset + header.defaultUVSOffset);

			const numUnicodeValueRanges = reader.readUInt32();
			const ranges: CmapUnicodeValueRange[] = [];

			for (let j = 0; j < numUnicodeValueRanges; j++) {
				ranges.push({
					startUnicodeValue: reader.readUInt24(),
					additionalCount: reader.readUInt8()
				});
			}

			record.defaultUVS = {
				numUnicodeValueRanges,
				ranges
			};

			// 保存した位置に戻る
			reader.restore();
		}

		// 非デフォルトUVSテーブルが存在する場合
		if (header.nonDefaultUVSOffset !== 0) {
			// 現在の位置を保存
			reader.save();

			// テーブルの先頭からの絶対位置に移動
			reader.seek(startOffset + header.nonDefaultUVSOffset);

			const numUVSMappings = reader.readUInt32();
			const uvsMappings: CmapUVSMapping[] = [];

			for (let j = 0; j < numUVSMappings; j++) {
				uvsMappings.push({
					unicodeValue: reader.readUInt24(),
					glyphID: reader.readUInt16()
				});
			}

			record.nonDefaultUVS = {
				numUVSMappings,
				uvsMappings
			};

			// 保存した位置に戻る
			reader.restore();
		}

		varSelectors.push(record);
	}

	return {
		format: CmapFormat.UNICODE_VARIATION_SEQUENCES,
		length,
		numVarSelectorRecords,
		varSelectors
	};
}

/**
 * サブテーブルをパースする
 * 
 * @param reader データリーダー
 * @returns パースされたサブテーブル
 */
function parseCmapSubtable(reader: DataReader): CmapSubtable {
	// 現在位置を保存
	reader.save();

	// フォーマットを読み取り（まだ消費しない）
	const format = reader.readUInt16();
	reader.skip(-2);  // 位置を戻す

	let subtable: CmapSubtable;

	switch (format) {
		case CmapFormat.BYTE_ENCODING:
			subtable = parseFormat0Subtable(reader);
			break;
		case CmapFormat.HIGH_BYTE_MAPPING:
			subtable = parseFormat2Subtable(reader);
			break;
		case CmapFormat.SEGMENT_MAPPING:
			subtable = parseFormat4Subtable(reader);
			break;
		case CmapFormat.TRIMMED_TABLE_MAPPING:
			subtable = parseFormat6Subtable(reader);
			break;
		case CmapFormat.MIXED_16_32_BIT_MAPPING:
			subtable = parseFormat8Subtable(reader);
			break;
		case CmapFormat.TRIMMED_ARRAY:
			subtable = parseFormat10Subtable(reader);
			break;
		case CmapFormat.SEGMENTED_COVERAGE:
			subtable = parseFormat12Subtable(reader);
			break;
		case CmapFormat.MANY_TO_ONE_RANGE_MAPPINGS:
			subtable = parseFormat13Subtable(reader);
			break;
		case CmapFormat.UNICODE_VARIATION_SEQUENCES:
			subtable = parseFormat14Subtable(reader);
			break;
		default:
			// サポートされていないフォーマットの場合
			console.warn(`Unsupported cmap subtable format: ${format}`);
			// 保存した位置に戻る
			reader.restore();
			return {
				format: format as CmapFormat,
			};
	}

	// 保存した位置に戻る
	reader.restore();
	return subtable;
}

/**
 * cmapテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたcmapテーブル詳細
 */
export function parseCmapTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): CmapTable {
	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// cmapヘッダーを読み込む
	const version = tableReader.readUInt16();
	const numTables = tableReader.readUInt16();

	const header: CmapHeader = {
		version,
		numTables
	};

	// エンコーディングレコードを読み込む
	const encodingRecords: CmapEncodingRecord[] = [];

	for (let i = 0; i < numTables; i++) {
		const platformID = tableReader.readUInt16();
		const encodingID = tableReader.readUInt16();
		const offset = tableReader.readUInt32();

		encodingRecords.push({
			platformID,
			encodingID,
			offset
		});
	}

	// 各エンコーディングレコードのサブテーブルを解析
	for (const record of encodingRecords) {
		// サブテーブルの位置にシーク
		tableReader.save();
		tableReader.seek(record.offset);

		// サブテーブルを解析
		try {
			record.subtable = parseCmapSubtable(tableReader);
		} catch (error) {
			console.warn(`Error parsing cmap subtable: ${error}`);
		}

		tableReader.restore();
	}

	return {
		header,
		encodingRecords
	};
}
