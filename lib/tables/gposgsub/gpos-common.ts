/**
 * GPOS共通定義と関数
 * 複数のルックアップタイプで共有される解析関数
 */

import { DataReader } from '../../utils/data-reader';
import {
	GposLookupType, GposSubTable, GposLookupTable,
	ValueRecord, ValueFormat,
	AnchorPoint
} from '../../types/tables/GPOS';

/**
 * 値レコードを解析する
 * 
 * @param reader データリーダー
 * @param valueFormat 値フォーマット
 * @returns 値レコード
 */
export function parseValueRecord(reader: DataReader, valueFormat: number): ValueRecord {
	const record: ValueRecord = {};

	// 各ビットが設定されている場合、対応する値を読み取る
	if (valueFormat & ValueFormat.X_PLACEMENT) {
		record.xPlacement = reader.readInt16();
	}
	if (valueFormat & ValueFormat.Y_PLACEMENT) {
		record.yPlacement = reader.readInt16();
	}
	if (valueFormat & ValueFormat.X_ADVANCE) {
		record.xAdvance = reader.readInt16();
	}
	if (valueFormat & ValueFormat.Y_ADVANCE) {
		record.yAdvance = reader.readInt16();
	}
	if (valueFormat & ValueFormat.X_PLACEMENT_DEVICE) {
		record.xPlaDeviceOffset = reader.readUInt16();
	}
	if (valueFormat & ValueFormat.Y_PLACEMENT_DEVICE) {
		record.yPlaDeviceOffset = reader.readUInt16();
	}
	if (valueFormat & ValueFormat.X_ADVANCE_DEVICE) {
		record.xAdvDeviceOffset = reader.readUInt16();
	}
	if (valueFormat & ValueFormat.Y_ADVANCE_DEVICE) {
		record.yAdvDeviceOffset = reader.readUInt16();
	}

	return record;
}

/**
 * 値レコードのサイズを計算する
 * 
 * @param valueFormat 値フォーマット
 * @returns サイズ（バイト単位）
 */
export function getValueRecordSize(valueFormat: number): number {
	let size = 0;

	// 各ビットが設定されている場合、対応するフィールドのサイズを加算
	if (valueFormat & ValueFormat.X_PLACEMENT) size += 2;
	if (valueFormat & ValueFormat.Y_PLACEMENT) size += 2;
	if (valueFormat & ValueFormat.X_ADVANCE) size += 2;
	if (valueFormat & ValueFormat.Y_ADVANCE) size += 2;
	if (valueFormat & ValueFormat.X_PLACEMENT_DEVICE) size += 2;
	if (valueFormat & ValueFormat.Y_PLACEMENT_DEVICE) size += 2;
	if (valueFormat & ValueFormat.X_ADVANCE_DEVICE) size += 2;
	if (valueFormat & ValueFormat.Y_ADVANCE_DEVICE) size += 2;

	return size;
}

/**
 * アンカーポイントを解析する
 * 
 * @param reader データリーダー
 * @param offset アンカーテーブルへのオフセット（0の場合はundefinedを返す）
 * @returns アンカーポイント
 */
export function parseAnchorTable(reader: DataReader, offset: number): AnchorPoint | undefined {
	if (offset === 0) {
		return undefined;
	}

	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// アンカータイプを読み取る
		const anchorFormat = reader.readUInt16();
		const xCoordinate = reader.readInt16();
		const yCoordinate = reader.readInt16();

		// 基本的なアンカー情報
		const anchor = {
			anchorFormat,
			xCoordinate,
			yCoordinate
		};

		// フォーマット2: コントロールポイントを含む
		if (anchorFormat === 2) {
			return {
				...anchor,
				anchorPoint: reader.readUInt16()
			};
		}

		// フォーマット3: デバイステーブルを含む
		if (anchorFormat === 3) {
			const xDeviceTableOffset = reader.readUInt16();
			const yDeviceTableOffset = reader.readUInt16();

			const result = {
				...anchor,
				xDeviceTableOffset,
				yDeviceTableOffset
			};

			return result;
		}

		return anchor;
	} finally {
		// 位置を復元
		reader.restore();
	}
}

/**
 * GPOSサブテーブルをルックアップタイプに基づいて解析する
 * 
 * @param reader データリーダー
 * @param offset サブテーブルへのオフセット
 * @param lookupType ルックアップタイプ
 * @returns 解析されたサブテーブル
 */
export function parseGposSubtable(
	reader: DataReader,
	offset: number,
	lookupType: GposLookupType
): GposSubTable {
	// 各ルックアップタイプに対応するパーサー関数をインポート
	switch (lookupType) {
		case GposLookupType.SINGLE_ADJUSTMENT:
			return require('./gpos-lookup1').parseSingleAdjustmentSubtable(reader, offset);
		case GposLookupType.PAIR_ADJUSTMENT:
			return require('./gpos-lookup2').parsePairAdjustmentSubtable(reader, offset);
		case GposLookupType.CURSIVE_ATTACHMENT:
			return require('./gpos-lookup3').parseCursiveAttachmentSubtable(reader, offset);
		case GposLookupType.MARK_TO_BASE_ATTACHMENT:
			return require('./gpos-lookup4').parseMarkToBaseAttachmentSubtable(reader, offset);
		case GposLookupType.MARK_TO_LIGATURE_ATTACHMENT:
			return require('./gpos-lookup5').parseMarkToLigatureAttachmentSubtable(reader, offset);
		case GposLookupType.MARK_TO_MARK_ATTACHMENT:
			return require('./gpos-lookup6').parseMarkToMarkAttachmentSubtable(reader, offset);
		case GposLookupType.CONTEXTUAL_POSITIONING:
			return require('./gpos-lookup7').parseContextualPositioningSubtable(reader, offset);
		case GposLookupType.CHAINED_CONTEXTUAL_POSITIONING:
			return require('./gpos-lookup8').parseChainedContextualPositioningSubtable(reader, offset);
		case GposLookupType.EXTENSION_POSITIONING:
			return require('./gpos-lookup9').parseExtensionPositioningSubtable(reader, offset);
		default:
			throw new Error(`対応していないGPOSルックアップタイプ: ${lookupType}`);
	}
}

/**
 * GPOS用のルックアップテーブル解析関数
 * 
 * @param reader データリーダー
 * @param offset ルックアップテーブルへのオフセット
 * @returns 解析されたルックアップテーブル
 */
export function parseGposLookupTable(reader: DataReader, offset: number): GposLookupTable {
	// 位置を保存
	reader.save();

	try {
		// オフセット位置に移動
		reader.seek(offset);

		// ルックアップテーブルのフィールドを読み取る
		const lookupType = reader.readUInt16() as GposLookupType;
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
			subtables.push(parseGposSubtable(reader, subTableOffset, lookupType));
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
