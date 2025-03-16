/**
 * GSUB共通定義と関数
 * 複数のルックアップタイプで共有される解析関数
 */

import { DataReader } from '../../utils/data-reader';
import {
	GsubLookupType, GsubSubTable, GsubLookupTable
} from '../../types/tables/GSUB';
import { parseSingleSubstitutionSubtable } from './gsub-lookup1';
import { parseMultipleSubstitutionSubtable } from './gsub-lookup2';
import { parseAlternateSubstitutionSubtable } from './gsub-lookup3';
import { parseLigatureSubstitutionSubtable } from './gsub-lookup4';
import { parseContextualSubstitutionSubtable } from './gsub-lookup5';
import { parseChainingContextualSubstitutionSubtable } from './gsub-lookup6';
import { parseExtensionSubstitutionSubtable } from './gsub-lookup7';
import { parseReverseChainSingleSubstitutionSubtable } from './gsub-lookup8';

/**
 * GSUBサブテーブルをルックアップタイプに基づいて解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @param lookupType ルックアップタイプ
 * @returns 解析されたサブテーブル
 */
export function parseGsubSubtable(
	reader: DataReader,
	offset: number,
	lookupType: GsubLookupType
): GsubSubTable {
	// 各ルックアップタイプに対応するパーサー関数を呼び出す
	switch (lookupType) {
		case GsubLookupType.SINGLE:
			return parseSingleSubstitutionSubtable(reader, offset);
		case GsubLookupType.MULTIPLE:
			return parseMultipleSubstitutionSubtable(reader, offset);
		case GsubLookupType.ALTERNATE:
			return parseAlternateSubstitutionSubtable(reader, offset);
		case GsubLookupType.LIGATURE:
			return parseLigatureSubstitutionSubtable(reader, offset);
		case GsubLookupType.CONTEXTUAL:
			return parseContextualSubstitutionSubtable(reader, offset);
		case GsubLookupType.CHAINING_CONTEXTUAL:
			return parseChainingContextualSubstitutionSubtable(reader, offset);
		case GsubLookupType.EXTENSION_SUBSTITUTION:
			return parseExtensionSubstitutionSubtable(reader, offset);
		case GsubLookupType.REVERSE_CHAINING_CONTEXTUAL:
			return parseReverseChainSingleSubstitutionSubtable(reader, offset);
		default:
			throw new Error(`対応していないGSUBルックアップタイプ: ${lookupType}`);
	}
}

/**
 * GSUB用のルックアップテーブル解析関数
 * 
 * @param reader データリーダー
 * @param offset ルックアップテーブルへのオフセット
 * @returns 解析されたルックアップテーブル
 */
export function parseGsubLookupTable(reader: DataReader, offset: number): GsubLookupTable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// ルックアップテーブルのフィールドを読み取る
		const lookupType = reader.readUInt16() as GsubLookupType;
		const lookupFlag = reader.readUInt16();
		const subTableCount = reader.readUInt16();

		// サブテーブルへのオフセット配列
		const subTableOffsets = [];
		for (let i = 0; i < subTableCount; i++) {
			subTableOffsets.push(reader.readUInt16() + offset);
		}

		// マークフィルタリングセット
		let markFilteringSet = undefined;

		// ルックアップフラグの8ビット目（0x0010）がセットされている場合
		if (lookupFlag & 0x0010) {
			markFilteringSet = reader.readUInt16();
		}

		// サブテーブルを解析
		const subtables = [];

		for (const subTableOffset of subTableOffsets) {
			subtables.push(parseGsubSubtable(reader, subTableOffset, lookupType));
		}

		return {
			lookupType,
			lookupFlag,
			subTableCount,
			markFilteringSet,
			subtables
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}