/**
 * GSUB ルックアップタイプ7 - 拡張置換サブテーブル
 * 32ビットオフセットを使用して他のサブテーブルを参照する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gsub#lookuptype-7-extension-substitution-subtable
 */

import { DataReader } from '../../utils/data-reader';
import {
	GsubLookupType,
	ExtensionSubstitutionSubtable
} from '../../types/tables/GSUB';
import { parseGsubSubtable } from './gsub';

/**
 * 拡張置換サブテーブル（ルックアップタイプ7）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns 拡張置換サブテーブル
 */
export function parseExtensionSubstitutionSubtable(
	reader: DataReader,
	offset: number
): ExtensionSubstitutionSubtable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// 基本情報を読み取る
		const substFormat = reader.readUInt16();
		if (substFormat !== 1) {
			throw new Error(`対応していない拡張置換フォーマット: ${substFormat}`);
		}

		const extensionLookupType = reader.readUInt16() as GsubLookupType;
		if (extensionLookupType === GsubLookupType.EXTENSION_SUBSTITUTION) {
			throw new Error('拡張サブテーブルが別の拡張サブテーブルを参照しています');
		}

		const extensionOffset = reader.readUInt32();

		// 拡張サブテーブルを解析
		// 注意: オフセットは現在の位置からの相対オフセットではなく、
		// 拡張サブテーブル自体の開始位置からの相対オフセット
		const extensionSubtable = parseGsubSubtable(reader, offset + extensionOffset, extensionLookupType);

		return {
			type: GsubLookupType.EXTENSION_SUBSTITUTION,
			substFormat: 1 as const, // Literal type '1'に合わせるための const アサーション
			extensionLookupType,
			extensionOffset,
			extensionSubtable
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}
