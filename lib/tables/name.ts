/**
 * name - フォント名前テーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/name
 */

import { Font, TableDirectoryEntry } from '../types/font';
import { LangTagRecord, NameRecord, NameTable } from '../types/tables/name';
import { DataReader } from '../utils/data-reader';

/**
 * 文字列をデコードする
 */
function decodeNameString(data: Uint8Array, platformID: number, encodingID: number): string {
	// Unicode
	if (platformID === 0 || (platformID === 3 && encodingID === 1)) {
		// UTF-16BE
		if (data.length % 2 !== 0) {
			// データが偶数バイトでない場合は無効
			return '';
		}

		// UTF-16BE形式をデコード
		let result = '';
		for (let i = 0; i < data.length; i += 2) {
			const charCode = (data[i] << 8) | data[i + 1];
			result += String.fromCharCode(charCode);
		}
		return result;
	}

	// Macintosh Roman
	if (platformID === 1 && encodingID === 0) {
		// MacRoman エンコーディング
		// 簡易的な実装: ASCIIのみサポート
		return String.fromCharCode.apply(null, Array.from(data));
	}

	// Windows Unicode (UTF-16BE)
	if (platformID === 3) {
		if (data.length % 2 !== 0) {
			return '';
		}

		let result = '';
		for (let i = 0; i < data.length; i += 2) {
			const charCode = (data[i] << 8) | data[i + 1];
			result += String.fromCharCode(charCode);
		}
		return result;
	}

	// その他のエンコーディング（未サポート）
	// データをそのまま ASCII として解釈
	try {
		return String.fromCharCode.apply(null, Array.from(data));
	} catch (e) {
		return '';
	}
}

/**
 * nameテーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたnameテーブル詳細
 */
export function parseNameTable(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): NameTable {
	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// nameテーブルのヘッダーを読み込む
	const format = tableReader.readUInt16();
	const count = tableReader.readUInt16();
	const stringOffset = tableReader.readUInt16();

	// 名前レコードを読み込む
	const nameRecords: NameRecord[] = [];

	for (let i = 0; i < count; i++) {
		const platformID = tableReader.readUInt16();
		const encodingID = tableReader.readUInt16();
		const languageID = tableReader.readUInt16();
		const nameID = tableReader.readUInt16();
		const length = tableReader.readUInt16();
		const offset = tableReader.readUInt16();

		// 現在位置を保存
		tableReader.save();

		// 文字列データの位置に移動
		tableReader.seek(stringOffset + offset);

		// 文字列データを読み込む
		const stringData = tableReader.readBytes(length);

		// 文字列をデコード
		const string = decodeNameString(stringData, platformID, encodingID);

		// 保存した位置に戻る
		tableReader.restore();

		// 名前レコードを追加
		nameRecords.push({
			platformID,
			encodingID,
			languageID,
			nameID,
			length,
			offset,
			string
		});
	}

	// フォーマット1の場合は言語タグレコードも読み込む
	if (format === 1) {
		const langTagCount = tableReader.readUInt16();
		const langTagRecords: LangTagRecord[] = [];

		// 言語タグレコードを読み込む
		for (let i = 0; i < langTagCount; i++) {
			const length = tableReader.readUInt16();
			const offset = tableReader.readUInt16();

			// 現在位置を保存
			tableReader.save();

			// 言語タグ文字列の位置に移動
			tableReader.seek(stringOffset + offset);

			// 言語タグ文字列を読み込む
			const tagData = tableReader.readBytes(length);

			// UTF-16BEとしてデコード
			let tag = '';
			for (let j = 0; j < tagData.length; j += 2) {
				const charCode = (tagData[j] << 8) | tagData[j + 1];
				tag += String.fromCharCode(charCode);
			}

			// 保存した位置に戻る
			tableReader.restore();

			// 言語タグレコードを追加
			langTagRecords.push({
				length,
				offset,
				tag
			});
		}

		return {
			format,
			count,
			stringOffset,
			nameRecords,
			langTagCount,
			langTagRecords
		};
	}

	// フォーマット0の場合
	return {
		format,
		count,
		stringOffset,
		nameRecords
	};
}
