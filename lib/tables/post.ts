/**
 * post - PostScriptテーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/post
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import {
	AnyPostTable,
	PostTable,
	PostTableV1,
	PostTableV2,
	PostTableV25,
	PostTableV3,
	PostTableV4
} from '../types/tables/post';

/**
 * postテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたpostテーブル詳細
 */
export function parsePostTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): AnyPostTable {
	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// フォーマットバージョンを読み取る（Fixed形式）
	const format = tableReader.readFixed();

	// 共通フィールド（ベースバージョン）
	const baseTable: PostTable = {
		format: format,
		italicAngle: tableReader.readFixed(),
		underlinePosition: tableReader.readFWORD(),
		underlineThickness: tableReader.readFWORD(),
		isFixedPitch: tableReader.readUInt32(),
		minMemType42: tableReader.readUInt32(),
		maxMemType42: tableReader.readUInt32(),
		minMemType1: tableReader.readUInt32(),
		maxMemType1: tableReader.readUInt32()
	};

	// フォーマットに基づいて追加フィールドを解析
	if (format === 1.0) {
		// フォーマット1.0: 標準のMacintoshグリフセットを使用（追加フィールドなし）
		return baseTable as PostTableV1;
	} else if (format === 2.0) {
		// フォーマット2.0: カスタムグリフ名を持つ
		const numGlyphs = tableReader.readUInt16();
		const glyphNameIndex: number[] = [];

		// グリフインデックス配列を読み込む
		for (let i = 0; i < numGlyphs; i++) {
			glyphNameIndex.push(tableReader.readUInt16());
		}

		// 標準グリフ名以外の名前を読み込む
		const namesCount = glyphNameIndex.filter(index => index >= 258).length;
		const names: string[] = [];

		for (let i = 0; i < namesCount; i++) {
			// Pascal文字列：最初のバイトが長さを表す
			const length = tableReader.readUInt8();
			names.push(tableReader.readString(length));
		}

		const v2Table: PostTableV2 = {
			...baseTable,
			format: 2.0,
			numGlyphs,
			glyphNameIndex,
			names
		};

		return v2Table;
	} else if (format === 2.5) {
		// フォーマット2.5: フォーマット2.0の最適化バージョン
		const numGlyphs = tableReader.readUInt16();
		const offset: number[] = [];

		// オフセット配列を読み込む
		for (let i = 0; i < numGlyphs; i++) {
			offset.push(tableReader.readInt8());
		}

		const v25Table: PostTableV25 = {
			...baseTable,
			format: 2.5,
			numGlyphs,
			offset
		};

		return v25Table;
	} else if (format === 3.0) {
		// フォーマット3.0: グリフ名を持たない（追加フィールドなし）
		return { ...baseTable, format: 3.0 } as PostTableV3;
	} else if (format === 4.0) {
		// フォーマット4.0: アップル仕様のみ
		const mapping: number[] = [];

		// シングルバイトマッピングを読み込む
		while (tableReader.getRemainingBytes() > 0) {
			mapping.push(tableReader.readUInt8());
		}

		const v4Table: PostTableV4 = {
			...baseTable,
			format: 4.0,
			mapping
		};

		return v4Table;
	}

	// 未知のフォーマットの場合は基本テーブルのみを返す
	console.warn(`Unknown post table format: ${format}`);
	return baseTable as PostTableV1;
}
