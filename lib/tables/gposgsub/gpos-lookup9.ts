/**
 * GPOS ルックアップタイプ9 - 拡張位置調整サブテーブル
 * 32ビットオフセットを使用して他のサブテーブルを参照する
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/gpos#lookuptype-9-extension-positioning
 */

import { DataReader } from '../../utils/data-reader';
import {
	GposLookupType,
	ExtensionPositioningSubtable
} from '../../types/tables/GPOS';
import { parseGposSubtable } from './gpos-common';

/**
 * 拡張位置調整サブテーブル（ルックアップタイプ9）を解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @returns 拡張位置調整サブテーブル
 */
export function parseExtensionPositioningSubtable(
	reader: DataReader,
	offset: number
): ExtensionPositioningSubtable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// 基本情報を読み取る
		const posFormat = reader.readUInt16();
		if (posFormat !== 1) {
			throw new Error(`対応していない拡張位置調整フォーマット: ${posFormat}`);
		}

		const extensionLookupType = reader.readUInt16() as GposLookupType;
		if (extensionLookupType === GposLookupType.EXTENSION_POSITIONING) {
			throw new Error('拡張サブテーブルが別の拡張サブテーブルを参照しています');
		}

		const extensionOffset = reader.readUInt32();

		// 拡張サブテーブルを解析
		// 注意: オフセットは現在の位置からの相対オフセットではなく、
		// 拡張サブテーブル自体の開始位置からの相対オフセット
		const extensionSubtable = parseGposSubtable(reader, offset + extensionOffset, extensionLookupType);

		return {
			type: GposLookupType.EXTENSION_POSITIONING,
			posFormat,
			extensionLookupType,
			extensionOffset,
			extensionSubtable
		};
	} finally {
		// 位置を復元
		reader.restore();
	}
}
