/**
 * cmapテーブル関連のユーティリティ関数
 */

import {
	AnyCmapSubtable,
	CmapTable, CmapEncodingRecord, CmapFormat,
	CmapFormat0Subtable, CmapFormat4Subtable, CmapFormat6Subtable,
	CmapFormat12Subtable, CmapPlatformID, CmapWindowsEncodingID,
	CmapUnicodeEncodingID, CmapSubtable, CmapFormat14Subtable,
	CmapFormat13Subtable,
	CmapFormat10Subtable,
	CmapFormat8Subtable,
	CmapFormat2Subtable
} from '../../types/tables/cmap';

/**
 * サブテーブルがCmapFormat0Subtable型かどうかを判定する型ガード
 */
export function isCmapFormat0(subtable: AnyCmapSubtable): subtable is CmapFormat0Subtable {
	return subtable.format === CmapFormat.BYTE_ENCODING;
}

/**
 * サブテーブルがCmapFormat2Subtable型かどうかを判定する型ガード
 */
export function isCmapFormat2(subtable: AnyCmapSubtable): subtable is CmapFormat2Subtable {
	return subtable.format === CmapFormat.HIGH_BYTE_MAPPING;
}

/**
 * サブテーブルがCmapFormat4Subtable型かどうかを判定する型ガード
 */
export function isCmapFormat4(subtable: AnyCmapSubtable): subtable is CmapFormat4Subtable {
	return subtable.format === CmapFormat.SEGMENT_MAPPING;
}

/**
 * サブテーブルがCmapFormat6Subtable型かどうかを判定する型ガード
 */
export function isCmapFormat6(subtable: AnyCmapSubtable): subtable is CmapFormat6Subtable {
	return subtable.format === CmapFormat.TRIMMED_TABLE_MAPPING;
}

/**
 * サブテーブルがCmapFormat8Subtable型かどうかを判定する型ガード
 */
export function isCmapFormat8(subtable: AnyCmapSubtable): subtable is CmapFormat8Subtable {
	return subtable.format === CmapFormat.MIXED_16_32_BIT_MAPPING;
}

/**
 * サブテーブルがCmapFormat10Subtable型かどうかを判定する型ガード
 */
export function isCmapFormat10(subtable: AnyCmapSubtable): subtable is CmapFormat10Subtable {
	return subtable.format === CmapFormat.TRIMMED_ARRAY;
}

/**
 * サブテーブルがCmapFormat12Subtable型かどうかを判定する型ガード
 */
export function isCmapFormat12(subtable: AnyCmapSubtable): subtable is CmapFormat12Subtable {
	return subtable.format === CmapFormat.SEGMENTED_COVERAGE;
}

/**
 * サブテーブルがCmapFormat13Subtable型かどうかを判定する型ガード
 */
export function isCmapFormat13(subtable: AnyCmapSubtable): subtable is CmapFormat13Subtable {
	return subtable.format === CmapFormat.MANY_TO_ONE_RANGE_MAPPINGS;
}

/**
 * サブテーブルがCmapFormat14Subtable型かどうかを判定する型ガード
 */
export function isCmapFormat14(subtable: AnyCmapSubtable): subtable is CmapFormat14Subtable {
	return subtable.format === CmapFormat.UNICODE_VARIATION_SEQUENCES;
}

/**
 * 指定したプラットフォームIDとエンコーディングIDのエンコーディングレコードを取得
 * 
 * @param cmap cmapテーブル
 * @param platformID プラットフォームID
 * @param encodingID エンコーディングID
 */
export function getEncodingRecord(
	cmap: CmapTable,
	platformID: number,
	encodingID: number
): CmapEncodingRecord | undefined {
	return cmap.encodingRecords.find(record =>
		record.platformID === platformID &&
		record.encodingID === encodingID
	);
}

/**
 * 推奨されるUnicodeエンコーディングレコードを取得
 * フォーマット12（Unicode拡張）を優先し、次にフォーマット4（BMP）を選択
 * 
 * @param cmap cmapテーブル
 */
export function getPreferredUnicodeEncodingRecord(cmap: CmapTable): CmapEncodingRecord | undefined {
	// 優先順位：
	// 1. Windows Unicode フルレンジ (Platform ID 3, Encoding ID 10, Format 12)
	// 2. Unicode フルレンジ (Platform ID 0, Encoding ID 6, Format 12)
	// 3. Windows Unicode BMP (Platform ID 3, Encoding ID 1, Format 4)
	// 4. Unicode BMP (Platform ID 0, Encoding ID 3, Format 4)

	// Windows Unicode フルレンジ
	const winUnicodeFull = cmap.encodingRecords.find(record =>
		record.platformID === CmapPlatformID.WINDOWS &&
		record.encodingID === CmapWindowsEncodingID.UNICODE_FULL &&
		record.subtable?.format === CmapFormat.SEGMENTED_COVERAGE
	);
	if (winUnicodeFull) return winUnicodeFull;

	// Unicode フルレンジ
	const unicodeFull = cmap.encodingRecords.find(record =>
		record.platformID === CmapPlatformID.UNICODE &&
		record.encodingID === CmapUnicodeEncodingID.UNICODE_FULL &&
		record.subtable?.format === CmapFormat.SEGMENTED_COVERAGE
	);
	if (unicodeFull) return unicodeFull;

	// Windows Unicode BMP
	const winUnicodeBMP = cmap.encodingRecords.find(record =>
		record.platformID === CmapPlatformID.WINDOWS &&
		record.encodingID === CmapWindowsEncodingID.UNICODE_BMP &&
		record.subtable?.format === CmapFormat.SEGMENT_MAPPING
	);
	if (winUnicodeBMP) return winUnicodeBMP;

	// Unicode BMP
	const unicodeBMP = cmap.encodingRecords.find(record =>
		record.platformID === CmapPlatformID.UNICODE &&
		record.encodingID === CmapUnicodeEncodingID.UNICODE_2_0_BMP &&
		record.subtable?.format === CmapFormat.SEGMENT_MAPPING
	);
	if (unicodeBMP) return unicodeBMP;

	// どれにも当てはまらない場合は最初のUnicodeエンコーディングを返す
	return cmap.encodingRecords.find(record =>
		record.platformID === CmapPlatformID.UNICODE ||
		(record.platformID === CmapPlatformID.WINDOWS &&
			(record.encodingID === CmapWindowsEncodingID.UNICODE_BMP ||
				record.encodingID === CmapWindowsEncodingID.UNICODE_FULL))
	);
}

/**
 * サブテーブルから文字コードに対応するグリフIDを取得
 * 
 * @param subtable cmapサブテーブル
 * @param charCode 文字コード
 */
export function getGlyphIDFromSubtable(subtable: AnyCmapSubtable, charCode: number): number {
	switch (subtable.format) {
		case CmapFormat.BYTE_ENCODING:
			if (isCmapFormat0(subtable)) {
				if (charCode < 0 || charCode > 255) {
					return 0; // 範囲外の場合は.notdefを返す
				}
				return subtable.glyphIdArray[charCode];
			}
			break;

		case CmapFormat.HIGH_BYTE_MAPPING:
			if (isCmapFormat2(subtable)) {
				if (charCode < 0 || charCode > 0xFFFF) {
					return 0; // 範囲外の場合は.notdefを返す
				}

				// 高バイトと低バイトに分解
				const highByte = (charCode >> 8) & 0xFF;
				const lowByte = charCode & 0xFF;

				// 高バイトに対応するサブヘッダインデックスを取得
				const subHeaderIndex = subtable.subHeaderKeys[highByte] / 2;

				// サブヘッダが見つからない場合
				if (subHeaderIndex >= subtable.subHeaders.length) {
					return 0;
				}

				const subHeader = subtable.subHeaders[subHeaderIndex];

				// 高バイトがゼロの場合は特別な処理（ASCII領域）
				if (highByte === 0 && subHeaderIndex === 0) {
					// ASCII文字はサブヘッダを使わずに直接マップ
					if (lowByte < subHeader.firstCode || lowByte >= subHeader.firstCode + subHeader.entryCount) {
						return 0;
					}
					return subtable.glyphIdArray[lowByte];
				}

				// 低バイトが範囲外の場合
				if (lowByte < subHeader.firstCode || lowByte >= subHeader.firstCode + subHeader.entryCount) {
					return 0;
				}

				// 対応するグリフIDを計算
				const glyphIdIndex = subHeader.glyphIdArrayIndex + (lowByte - subHeader.firstCode);

				if (glyphIdIndex >= subtable.glyphIdArray.length) {
					return 0;
				}

				const glyphId = subtable.glyphIdArray[glyphIdIndex];

				if (glyphId === 0) {
					return 0;
				}

				return (glyphId + subHeader.idDelta) & 0xFFFF;
			}
			break;

		case CmapFormat.SEGMENT_MAPPING:
			if (isCmapFormat4(subtable)) {
				if (charCode < 0 || charCode > 65535) {
					return 0; // 範囲外の場合は.notdefを返す
				}

				// セグメントの数
				const segCount = subtable.segCountX2 / 2;

				// 二分探索でセグメントを見つける
				let left = 0;
				let right = segCount - 1;

				while (left <= right) {
					const mid = Math.floor((left + right) / 2);

					if (charCode > subtable.endCode[mid]) {
						left = mid + 1;
					} else if (charCode < subtable.startCode[mid]) {
						right = mid - 1;
					} else {
						// セグメントが見つかった

						// 最後のセグメントの0xFFFFは特別処理
						if (subtable.endCode[mid] === 0xFFFF && subtable.startCode[mid] === 0xFFFF) {
							return 0;
						}

						// 対応するグリフIDを計算
						if (subtable.idRangeOffset[mid] === 0) {
							// idDeltaを使用
							return (subtable.idDelta[mid] + charCode) & 0xFFFF;
						} else {
							// idRangeOffsetを使用
							const offset = (mid - segCount + subtable.idRangeOffset[mid] / 2) +
								(charCode - subtable.startCode[mid]);

							if (offset >= subtable.glyphIdArray.length) {
								return 0; // 範囲外
							}

							const glyphId = subtable.glyphIdArray[offset];

							if (glyphId === 0) {
								return 0;
							}

							return (glyphId + subtable.idDelta[mid]) & 0xFFFF;
						}
					}
				}

				return 0; // 見つからない場合は.notdefを返す
			}
			break;

		case CmapFormat.TRIMMED_TABLE_MAPPING:
			if (isCmapFormat6(subtable)) {
				const firstCode = subtable.firstCode;
				const entryCount = subtable.entryCount;

				if (charCode < firstCode || charCode >= firstCode + entryCount) {
					return 0; // 範囲外の場合は.notdefを返す
				}

				return subtable.glyphIdArray[charCode - firstCode];
			}
			break;

		case CmapFormat.MIXED_16_32_BIT_MAPPING:
			if (isCmapFormat8(subtable)) {
				// BMP範囲内の文字コードを処理
				if (charCode <= 0xFFFF) {
					// charCodeがBMP領域にあり、is32のビットが設定されていない場合は対応がない
					const byteIndex = Math.floor(charCode / 8);
					const bitIndex = charCode % 8;
					const is32Bit = (subtable.is32[byteIndex] & (1 << (7 - bitIndex))) !== 0;

					if (!is32Bit) {
						// この文字は32ビットではないため、グループ検索の対象外
						return 0;
					}
				}

				// 文字コードに対応するグループを検索
				for (const group of subtable.groups) {
					if (charCode >= group.startCharCode && charCode <= group.endCharCode) {
						const offset = charCode - group.startCharCode;
						return group.startGlyphID + offset;
					}
				}

				return 0; // 見つからない場合は.notdefを返す
			}
			break;

		case CmapFormat.TRIMMED_ARRAY:
			if (isCmapFormat10(subtable)) {
				const startCharCode = subtable.startCharCode;
				const endCharCode = startCharCode + subtable.numChars - 1;

				if (charCode < startCharCode || charCode > endCharCode) {
					return 0; // 範囲外の場合は.notdefを返す
				}

				const index = charCode - startCharCode;
				return subtable.glyphs[index];
			}
			break;

		case CmapFormat.SEGMENTED_COVERAGE:
			if (isCmapFormat12(subtable)) {
				// 二分探索でグループを見つける
				let left = 0;
				let right = subtable.numGroups - 1;

				while (left <= right) {
					const mid = Math.floor((left + right) / 2);
					const group = subtable.groups[mid];

					if (charCode < group.startCharCode) {
						right = mid - 1;
					} else if (charCode > group.endCharCode) {
						left = mid + 1;
					} else {
						// グループが見つかった
						const offset = charCode - group.startCharCode;
						return group.startGlyphID + offset;
					}
				}

				return 0; // 見つからない場合は.notdefを返す
			}
			break;

		case CmapFormat.MANY_TO_ONE_RANGE_MAPPINGS:
			if (isCmapFormat13(subtable)) {
				// 二分探索でグループを見つける
				let left = 0;
				let right = subtable.numGroups - 1;

				while (left <= right) {
					const mid = Math.floor((left + right) / 2);
					const group = subtable.groups[mid];

					if (charCode < group.startCharCode) {
						right = mid - 1;
					} else if (charCode > group.endCharCode) {
						left = mid + 1;
					} else {
						// グループが見つかった - このフォーマットでは範囲内の全文字が同じグリフIDにマップされる
						return group.glyphID;
					}
				}

				return 0; // 見つからない場合は.notdefを返す
			}
			break;

		case CmapFormat.UNICODE_VARIATION_SEQUENCES:
			// フォーマット14は基本的に変異セレクタのためのもので、直接文字コードからグリフIDへのマッピングではない
			return 0;
	}

	// フォールバック（未知のフォーマットや処理されなかった場合）
	return 0;
}

/**
 * フォーマット14のサブテーブルから変異セレクタに対応するグリフIDを取得
 * 
 * @param subtable フォーマット14のサブテーブル
 * @param baseChar 基本文字コード
 * @param varSelector 変異セレクタコード
 */
export function getGlyphIDForVariationFromFormat14(
	subtable: CmapFormat14Subtable,
	baseChar: number,
	varSelector: number
): number | null {
	// 変異セレクタのレコードを探す
	const record = subtable.varSelectors.find(vs => vs.varSelector === varSelector);

	if (!record) {
		return null; // 変異セレクタが見つからない
	}

	// 非デフォルトUVSテーブルがある場合、まずそこで検索
	if (record.nonDefaultUVS) {
		const mapping = record.nonDefaultUVS.uvsMappings.find(
			m => m.unicodeValue === baseChar
		);

		if (mapping) {
			return mapping.glyphID;
		}
	}

	// デフォルトUVSテーブルがある場合、範囲内にあるか確認
	if (record.defaultUVS) {
		const isInRange = record.defaultUVS.ranges.some(range =>
			baseChar >= range.startUnicodeValue &&
			baseChar <= range.startUnicodeValue + range.additionalCount
		);

		if (isInRange) {
			return null; // デフォルトグリフを使用（null=変更なし）
		}
	}

	return 0; // 対応するマッピングがない場合は.notdefを返す
}

/**
 * cmapテーブルから文字コードに対応するグリフIDを取得
 * 
 * @param cmap cmapテーブル
 * @param charCode 文字コード
 */
export function getGlyphID(cmap: CmapTable, charCode: number): number {
	// まず優先されるUnicodeエンコーディングを取得
	const preferredRecord = getPreferredUnicodeEncodingRecord(cmap);

	if (preferredRecord && preferredRecord.subtable) {
		const glyphID = getGlyphIDFromSubtable(preferredRecord.subtable, charCode);
		if (glyphID !== 0) {
			return glyphID;
		}
	}

	// 優先エンコーディングで見つからない場合、他のテーブルも検索
	for (const record of cmap.encodingRecords) {
		if (record === preferredRecord || !record.subtable) {
			continue;
		}

		const glyphID = getGlyphIDFromSubtable(record.subtable, charCode);
		if (glyphID !== 0) {
			return glyphID;
		}
	}

	return 0; // 見つからない場合は.notdefを返す
}

/**
 * 変異セレクタに対応するグリフIDを取得
 * 
 * @param cmap cmapテーブル
 * @param baseChar 基本文字コード
 * @param varSelector 変異セレクタコード
 */
export function getGlyphIDForVariation(
	cmap: CmapTable,
	baseChar: number,
	varSelector: number
): number {
	// まずFormat 14テーブルを見つける
	const format14Record = cmap.encodingRecords.find(record =>
		record.subtable?.format === CmapFormat.UNICODE_VARIATION_SEQUENCES
	);

	if (format14Record && format14Record.subtable) {
		if (isCmapFormat14(format14Record.subtable)) {
			const result = getGlyphIDForVariationFromFormat14(
				format14Record.subtable,
				baseChar,
				varSelector
			);

			if (result !== null) {
				return result;
			}
		}
	}

	// 変異が見つからない場合は基本文字のグリフIDを返す
	return getGlyphID(cmap, baseChar);
}

/**
 * プラットフォームIDの名前を取得
 * 
 * @param platformID プラットフォームID
 */
export function getPlatformName(platformID: number): string {
	switch (platformID) {
		case CmapPlatformID.UNICODE: return 'Unicode';
		case CmapPlatformID.MACINTOSH: return 'Macintosh';
		case CmapPlatformID.RESERVED: return 'Reserved';
		case CmapPlatformID.WINDOWS: return 'Windows';
		default: return `Unknown (${platformID})`;
	}
}

/**
 * エンコーディングIDの名前を取得
 * 
 * @param platformID プラットフォームID
 * @param encodingID エンコーディングID
 */
export function getEncodingName(platformID: number, encodingID: number): string {
	if (platformID === CmapPlatformID.UNICODE) {
		switch (encodingID) {
			case CmapUnicodeEncodingID.UNICODE_1_0: return 'Unicode 1.0';
			case CmapUnicodeEncodingID.UNICODE_1_1: return 'Unicode 1.1';
			case CmapUnicodeEncodingID.ISO_10646: return 'ISO/IEC 10646';
			case CmapUnicodeEncodingID.UNICODE_2_0_BMP: return 'Unicode 2.0 BMP';
			case CmapUnicodeEncodingID.UNICODE_2_0_FULL: return 'Unicode 2.0 Full';
			case CmapUnicodeEncodingID.UNICODE_VARIATION_SEQUENCES: return 'Unicode Variation Sequences';
			case CmapUnicodeEncodingID.UNICODE_FULL: return 'Unicode Full';
			default: return `Unknown (${encodingID})`;
		}
	} else if (platformID === CmapPlatformID.WINDOWS) {
		switch (encodingID) {
			case CmapWindowsEncodingID.SYMBOL: return 'Symbol';
			case CmapWindowsEncodingID.UNICODE_BMP: return 'Unicode BMP';
			case CmapWindowsEncodingID.SHIFT_JIS: return 'ShiftJIS';
			case CmapWindowsEncodingID.PRC: return 'PRC';
			case CmapWindowsEncodingID.BIG5: return 'Big5';
			case CmapWindowsEncodingID.WANSUNG: return 'Wansung';
			case CmapWindowsEncodingID.JOHAB: return 'Johab';
			case CmapWindowsEncodingID.UNICODE_FULL: return 'Unicode Full';
			default: return `Unknown (${encodingID})`;
		}
	}

	return `Encoding ${encodingID}`;
}

/**
 * フォーマットの名前を取得
 * 
 * @param format フォーマット
 */
export function getFormatName(format: CmapFormat): string {
	switch (format) {
		case CmapFormat.BYTE_ENCODING: return 'Byte Encoding (0)';
		case CmapFormat.HIGH_BYTE_MAPPING: return 'High Byte Mapping (2)';
		case CmapFormat.SEGMENT_MAPPING: return 'Segment Mapping (4)';
		case CmapFormat.TRIMMED_TABLE_MAPPING: return 'Trimmed Table Mapping (6)';
		case CmapFormat.MIXED_16_32_BIT_MAPPING: return 'Mixed 16/32-bit Mapping (8)';
		case CmapFormat.TRIMMED_ARRAY: return 'Trimmed Array (10)';
		case CmapFormat.SEGMENTED_COVERAGE: return 'Segmented Coverage (12)';
		case CmapFormat.MANY_TO_ONE_RANGE_MAPPINGS: return 'Many-to-one Range Mappings (13)';
		case CmapFormat.UNICODE_VARIATION_SEQUENCES: return 'Unicode Variation Sequences (14)';
		default: return `Unknown Format ${format}`;
	}
}

/**
 * エンコーディングレコードのサマリー情報を取得
 * 
 * @param record エンコーディングレコード
 */
export function getEncodingRecordSummary(record: CmapEncodingRecord): string {
	const platform = getPlatformName(record.platformID);
	const encoding = getEncodingName(record.platformID, record.encodingID);
	const format = record.subtable ? getFormatName(record.subtable.format) : 'Unknown Format';

	return `${platform}, ${encoding}, ${format}`;
}

/**
 * サブテーブルの文字コード範囲情報を取得
 * 
 * @param subtable cmapサブテーブル
 */
export function getSubtableCodepointRange(subtable: AnyCmapSubtable): { min: number, max: number } {
	switch (subtable.format) {
		case CmapFormat.BYTE_ENCODING:
			if (isCmapFormat0(subtable)) {
				return { min: 0, max: 255 };
			}
			break;

		case CmapFormat.HIGH_BYTE_MAPPING:
			if (isCmapFormat2(subtable)) {
				// フォーマット2の場合は最小・最大コードポイントを計算
				let min = 0xFFFF;
				let max = 0;

				for (let highByte = 0; highByte < 256; highByte++) {
					const subHeaderIndex = subtable.subHeaderKeys[highByte] / 2;
					if (subHeaderIndex >= subtable.subHeaders.length) continue;

					const subHeader = subtable.subHeaders[subHeaderIndex];
					if (subHeader.entryCount === 0) continue;

					const firstCode = (highByte << 8) | subHeader.firstCode;
					const lastCode = (highByte << 8) | (subHeader.firstCode + subHeader.entryCount - 1);

					if (firstCode < min) min = firstCode;
					if (lastCode > max) max = lastCode;
				}

				return { min, max };
			}
			break;

		case CmapFormat.SEGMENT_MAPPING:
			if (isCmapFormat4(subtable)) {
				let min = 0xFFFF;
				let max = 0;

				for (let i = 0; i < subtable.startCode.length; i++) {
					if (subtable.startCode[i] < min && subtable.startCode[i] !== 0xFFFF) {
						min = subtable.startCode[i];
					}
					if (subtable.endCode[i] > max && subtable.endCode[i] !== 0xFFFF) {
						max = subtable.endCode[i];
					}
				}

				return { min, max };
			}
			break;

		case CmapFormat.TRIMMED_TABLE_MAPPING:
			if (isCmapFormat6(subtable)) {
				return {
					min: subtable.firstCode,
					max: subtable.firstCode + subtable.entryCount - 1
				};
			}
			break;

		case CmapFormat.MIXED_16_32_BIT_MAPPING:
			if (isCmapFormat8(subtable)) {
				let min = 0xFFFFFFFF;
				let max = 0;

				for (const group of subtable.groups) {
					if (group.startCharCode < min) {
						min = group.startCharCode;
					}
					if (group.endCharCode > max) {
						max = group.endCharCode;
					}
				}

				return { min, max };
			}
			break;

		case CmapFormat.TRIMMED_ARRAY:
			if (isCmapFormat10(subtable)) {
				return {
					min: subtable.startCharCode,
					max: subtable.startCharCode + subtable.numChars - 1
				};
			}
			break;

		case CmapFormat.SEGMENTED_COVERAGE:
			if (isCmapFormat12(subtable)) {
				let min = 0xFFFFFFFF;
				let max = 0;

				for (const group of subtable.groups) {
					if (group.startCharCode < min) {
						min = group.startCharCode;
					}
					if (group.endCharCode > max) {
						max = group.endCharCode;
					}
				}

				return { min, max };
			}
			break;

		case CmapFormat.MANY_TO_ONE_RANGE_MAPPINGS:
			if (isCmapFormat13(subtable)) {
				let min = 0xFFFFFFFF;
				let max = 0;

				for (const group of subtable.groups) {
					if (group.startCharCode < min) {
						min = group.startCharCode;
					}
					if (group.endCharCode > max) {
						max = group.endCharCode;
					}
				}

				return { min, max };
			}
			break;

		default:
			return { min: 0, max: 0 };
	}

	// デフォルト値
	return { min: 0, max: 0 };
}

/**
 * cmapテーブルがサポートする文字の数を取得
 * 
 * @param cmap cmapテーブル
 */
export function getCharacterCount(cmap: CmapTable): number {
	// 優先されるエンコーディングを使用
	const record = getPreferredUnicodeEncodingRecord(cmap);
	if (!record || !record.subtable) {
		return 0;
	}

	const subtable = record.subtable;

	switch (subtable.format) {
		case CmapFormat.BYTE_ENCODING:
			if (isCmapFormat0(subtable)) {
				// 0でないグリフIDの数をカウント
				return subtable.glyphIdArray.filter(gid => gid !== 0).length;
			}
			break;

		case CmapFormat.HIGH_BYTE_MAPPING:
			if (isCmapFormat2(subtable)) {
				// 単純な推定: 各サブヘッダーのエントリー数の合計
				return subtable.subHeaders.reduce((count, subHeader) => {
					return count + subHeader.entryCount;
				}, 0);
			}
			break;

		case CmapFormat.SEGMENT_MAPPING:
			if (isCmapFormat4(subtable)) {
				let count = 0;

				for (let i = 0; i < subtable.startCode.length; i++) {
					if (subtable.endCode[i] !== 0xFFFF || subtable.startCode[i] !== 0xFFFF) {
						count += subtable.endCode[i] - subtable.startCode[i] + 1;
					}
				}

				return count;
			}
			break;

		case CmapFormat.TRIMMED_TABLE_MAPPING:
			if (isCmapFormat6(subtable)) {
				// 0でないグリフIDの数をカウント
				return subtable.glyphIdArray.filter(gid => gid !== 0).length;
			}
			break;

		case CmapFormat.MIXED_16_32_BIT_MAPPING:
			if (isCmapFormat8(subtable)) {
				let count = 0;

				for (const group of subtable.groups) {
					count += group.endCharCode - group.startCharCode + 1;
				}

				return count;
			}
			break;

		case CmapFormat.TRIMMED_ARRAY:
			if (isCmapFormat10(subtable)) {
				// 0でないグリフIDの数をカウント
				return subtable.glyphs.filter(gid => gid !== 0).length;
			}
			break;

		case CmapFormat.SEGMENTED_COVERAGE:
			if (isCmapFormat12(subtable)) {
				let count = 0;

				for (const group of subtable.groups) {
					count += group.endCharCode - group.startCharCode + 1;
				}

				return count;
			}
			break;

		case CmapFormat.MANY_TO_ONE_RANGE_MAPPINGS:
			if (isCmapFormat13(subtable)) {
				let count = 0;

				for (const group of subtable.groups) {
					count += group.endCharCode - group.startCharCode + 1;
				}

				return count;
			}
			break;
	}

	return 0;
}

/**
 * cmapテーブルの基本情報を取得
 * 
 * @param cmap cmapテーブル
 */
export function getCmapSummary(cmap: CmapTable): object {
	const encodings = cmap.encodingRecords.map(getEncodingRecordSummary);
	const characterCount = getCharacterCount(cmap);

	const preferredRecord = getPreferredUnicodeEncodingRecord(cmap);
	let codePointRange = { min: 0, max: 0 };

	if (preferredRecord && preferredRecord.subtable) {
		codePointRange = getSubtableCodepointRange(preferredRecord.subtable);
	}

	return {
		numEncodings: cmap.encodingRecords.length,
		encodings,
		characterCount,
		codePointRange: {
			min: `0x${codePointRange.min.toString(16).toUpperCase()}`,
			max: `0x${codePointRange.max.toString(16).toUpperCase()}`
		}
	};
}

/**
 * cmapテーブルからユニコードとグリフIDのマッピングを生成する
 * 
 * @param cmap cmapテーブル
 * @param codePointsRange 生成するコードポイントの範囲 (デフォルト: BMP全体)
 * @returns {Map<number, number>} ユニコードコードポイントからグリフIDへのマップ
 */
export function generateUnicodeToGlyphMap(
	cmap: CmapTable,
	codePointsRange: { start: number, end: number } = { start: 0, end: 0x10FFFF }
): Map<number, number> {
	const map = new Map<number, number>();

	// 開始と終了の範囲を確認
	const start = Math.max(0, codePointsRange.start);
	const end = Math.min(0x10FFFF, codePointsRange.end);

	// 優先エンコーディングを取得
	const preferredRecord = getPreferredUnicodeEncodingRecord(cmap);
	if (!preferredRecord || !preferredRecord.subtable) {
		return map; // 適切なサブテーブルがない場合は空のマップを返す
	}

	const subtable = preferredRecord.subtable;

	// コードポイントの種類によって処理を分ける
	switch (subtable.format) {
		case CmapFormat.BYTE_ENCODING:
			if (isCmapFormat0(subtable)) {
				// Format 0: 256エントリの単純なマッピング
				const maxCP = Math.min(255, end);

				for (let cp = Math.max(0, start); cp <= maxCP; cp++) {
					const glyphId = subtable.glyphIdArray[cp];
					if (glyphId !== 0) { // 0 はたいてい .notdef
						map.set(cp, glyphId);
					}
				}
			}
			break;

		case CmapFormat.HIGH_BYTE_MAPPING:
			if (isCmapFormat2(subtable)) {
				// Format 2: 2バイト文字エンコーディング
				const maxCP = Math.min(0xFFFF, end);

				for (let cp = Math.max(0, start); cp <= maxCP; cp++) {
					const glyphId = getGlyphIDFromSubtable(subtable, cp);
					if (glyphId !== 0) {
						map.set(cp, glyphId);
					}
				}
			}
			break;

		case CmapFormat.SEGMENT_MAPPING:
			if (isCmapFormat4(subtable)) {
				// Format 4: セグメントマッピング
				const maxCP = Math.min(0xFFFF, end);

				// 各セグメントを走査
				for (let i = 0; i < subtable.segCountX2 / 2; i++) {
					const startCode = subtable.startCode[i];
					const endCode = subtable.endCode[i];

					// 特殊な終了マーカーをスキップ
					if (startCode === 0xFFFF && endCode === 0xFFFF) continue;

					// 範囲内のコードポイントを処理
					const segStart = Math.max(startCode, start);
					const segEnd = Math.min(endCode, maxCP);

					for (let cp = segStart; cp <= segEnd; cp++) {
						const glyphId = getGlyphIDFromSubtable(subtable, cp);
						if (glyphId !== 0) {
							map.set(cp, glyphId);
						}
					}
				}
			}
			break;

		case CmapFormat.TRIMMED_TABLE_MAPPING:
			if (isCmapFormat6(subtable)) {
				// Format 6: トリムテーブルマッピング
				const firstCode = subtable.firstCode;
				const lastCode = firstCode + subtable.entryCount - 1;

				const tableStart = Math.max(firstCode, start);
				const tableEnd = Math.min(lastCode, end);

				for (let cp = tableStart; cp <= tableEnd; cp++) {
					const glyphId = getGlyphIDFromSubtable(subtable, cp);
					if (glyphId !== 0) {
						map.set(cp, glyphId);
					}
				}
			}
			break;

		case CmapFormat.MIXED_16_32_BIT_MAPPING:
			if (isCmapFormat8(subtable)) {
				// Format 8: 32ビットのコードポイントをサポート
				// 各グループを走査
				for (const group of subtable.groups) {
					const groupStart = Math.max(group.startCharCode, start);
					const groupEnd = Math.min(group.endCharCode, end);

					for (let cp = groupStart; cp <= groupEnd; cp++) {
						const glyphId = getGlyphIDFromSubtable(subtable, cp);
						if (glyphId !== 0) {
							map.set(cp, glyphId);
						}
					}
				}
			}
			break;

		case CmapFormat.TRIMMED_ARRAY:
			if (isCmapFormat10(subtable)) {
				// Format 10: トリム配列
				const startChar = subtable.startCharCode;
				const endChar = startChar + subtable.numChars - 1;

				const tableStart = Math.max(startChar, start);
				const tableEnd = Math.min(endChar, end);

				for (let cp = tableStart; cp <= tableEnd; cp++) {
					const glyphId = getGlyphIDFromSubtable(subtable, cp);
					if (glyphId !== 0) {
						map.set(cp, glyphId);
					}
				}
			}
			break;

		case CmapFormat.SEGMENTED_COVERAGE:
			if (isCmapFormat12(subtable)) {
				// Format 12: 32ビットのコードポイントをサポート
				// 各グループを走査
				for (const group of subtable.groups) {
					const groupStart = Math.max(group.startCharCode, start);
					const groupEnd = Math.min(group.endCharCode, end);

					for (let cp = groupStart; cp <= groupEnd; cp++) {
						const offset = cp - group.startCharCode;
						const glyphId = group.startGlyphID + offset;
						if (glyphId !== 0) {
							map.set(cp, glyphId);
						}
					}
				}
			}
			break;

		case CmapFormat.MANY_TO_ONE_RANGE_MAPPINGS:
			if (isCmapFormat13(subtable)) {
				// Format 13: 多対一マッピング
				// 各グループを走査
				for (const group of subtable.groups) {
					const groupStart = Math.max(group.startCharCode, start);
					const groupEnd = Math.min(group.endCharCode, end);

					if (group.glyphID !== 0) {
						for (let cp = groupStart; cp <= groupEnd; cp++) {
							map.set(cp, group.glyphID);
						}
					}
				}
			}
			break;
	}

	// バリエーションセレクタの処理（フォーマット14）
	const format14Record = cmap.encodingRecords.find(record =>
		record.subtable?.format === CmapFormat.UNICODE_VARIATION_SEQUENCES
	);

	if (format14Record && format14Record.subtable && isCmapFormat14(format14Record.subtable)) {
		// 変異セレクタに基づく追加マッピングの処理
		// この部分は実装が複雑なため、必要に応じて実装
	}

	return map;
}

/**
 * Unicode文字列とグリフIDのマッピングを生成する
 * 
 * @param cmap cmapテーブル
 * @param text マッピングを取得するテキスト
 * @returns {Map<string, number>} 文字からグリフIDへのマップ
 */
export function generateTextToGlyphMap(
	cmap: CmapTable,
	text: string
): Map<string, number> {
	const map = new Map<string, number>();

	// テキストの各文字をマッピング
	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		const cp = char.codePointAt(0);

		if (cp === undefined) continue;

		// サロゲートペアの処理
		if (cp > 0xFFFF) {
			i++; // サロゲートペアの2番目の文字をスキップ
		}

		const glyphId = getGlyphID(cmap, cp);
		if (glyphId !== 0) {
			map.set(char, glyphId);
		}
	}

	return map;
}

/**
 * cmapテーブルからユニコードマッピングのJSONオブジェクトを生成する
 * 
 * @param cmap cmapテーブル
 * @param options オプション
 * @returns JSONオブジェクト
 */
export function generateUnicodeMapObject(
	cmap: CmapTable,
	options: {
		start?: number;
		end?: number;
		format?: 'hex' | 'decimal';
	} = {}
): Record<string, number> {
	const mapping: Record<string, number> = {};
	const format = options.format || 'hex';

	// マッピングを取得
	const map = generateUnicodeToGlyphMap(cmap, {
		start: options.start || 0,
		end: options.end || 0x10FFFF
	});

	// マップの各エントリをJSONオブジェクトに変換
	for (const [cp, glyphId] of map.entries()) {
		const key = format === 'hex'
			? `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`
			: `${cp}`;

		mapping[key] = glyphId;
	}

	return mapping;
}