/**
 * OS/2 - OS/2と Windows メトリクステーブル
 * 
 * 参照: https://learn.microsoft.com/ja-jp/typography/opentype/spec/os2
 */

import { DataReader } from '../utils/data-reader';
import { Font, TableDirectoryEntry } from '../types/font';
import { OS2Table, OS2TableV0, OS2TableV1, OS2TableV2, OS2TableV4, OS2TableV5 } from '../types/tables/OS_2';

/**
 * OS/2テーブルをパースする
 * 
 * @param reader データリーダー
 * @param entry テーブルディレクトリエントリ
 * @param font 現在のフォント情報（パース済みテーブルを含む）
 * @returns パースされたOS/2テーブル詳細
 */
export function parseOS2Table(
	reader: DataReader,
	entry: TableDirectoryEntry,
	font: Font
): OS2Table {
	// テーブルのサブリーダーを作成
	reader.seek(entry.offset);
	const tableReader = reader.createSubReader(entry.length);

	// バージョンを読み取り
	const version = tableReader.readUInt16();

	// 共通フィールド（バージョン0）
	const table: OS2TableV0 = {
		version,
		xAvgCharWidth: tableReader.readInt16(),
		usWeightClass: tableReader.readUInt16(),
		usWidthClass: tableReader.readUInt16(),
		fsType: tableReader.readUInt16(),
		ySubscriptXSize: tableReader.readInt16(),
		ySubscriptYSize: tableReader.readInt16(),
		ySubscriptXOffset: tableReader.readInt16(),
		ySubscriptYOffset: tableReader.readInt16(),
		ySuperscriptXSize: tableReader.readInt16(),
		ySuperscriptYSize: tableReader.readInt16(),
		ySuperscriptXOffset: tableReader.readInt16(),
		ySuperscriptYOffset: tableReader.readInt16(),
		yStrikeoutSize: tableReader.readInt16(),
		yStrikeoutPosition: tableReader.readInt16(),
		sFamilyClass: {
			class: tableReader.readUInt8(),
			subclass: tableReader.readUInt8()
		},
		panose: tableReader.readBytes(10),
		ulUnicodeRange1: tableReader.readUInt32(),
		ulUnicodeRange2: tableReader.readUInt32(),
		ulUnicodeRange3: tableReader.readUInt32(),
		ulUnicodeRange4: tableReader.readUInt32(),
		achVendID: tableReader.readString(4),
		fsSelection: tableReader.readUInt16(),
		usFirstCharIndex: tableReader.readUInt16(),
		usLastCharIndex: tableReader.readUInt16(),
		sTypoAscender: tableReader.readInt16(),
		sTypoDescender: tableReader.readInt16(),
		sTypoLineGap: tableReader.readInt16(),
		usWinAscent: tableReader.readUInt16(),
		usWinDescent: tableReader.readUInt16()
	};

	// バージョン1以上の追加フィールド
	if (version >= 1) {
		const tableV1 = table as OS2TableV1;
		tableV1.ulCodePageRange1 = tableReader.readUInt32();
		tableV1.ulCodePageRange2 = tableReader.readUInt32();

		// バージョン2以上の追加フィールド
		if (version >= 2) {
			const tableV2 = tableV1 as OS2TableV2;
			tableV2.sxHeight = tableReader.readInt16();
			tableV2.sCapHeight = tableReader.readInt16();
			tableV2.usDefaultChar = tableReader.readUInt16();
			tableV2.usBreakChar = tableReader.readUInt16();
			tableV2.usMaxContext = tableReader.readUInt16();

			// バージョン4以上の追加フィールド
			if (version >= 4) {
				const tableV4 = tableV2 as OS2TableV4;
				tableV4.usLowerOpticalPointSize = tableReader.readUInt16();
				tableV4.usUpperOpticalPointSize = tableReader.readUInt16();

				// バージョン5以上の追加フィールド
				if (version >= 5) {
					const tableV5 = tableV4 as OS2TableV5;
					tableV5.usReserved = tableReader.readUInt16();
					return tableV5;
				}
				return tableV4;
			}
			return tableV2;
		}
		return tableV1;
	}

	return table;
}
