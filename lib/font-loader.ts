/**
 * OpenType フォントローダー
 * フォントファイルの読み込みと解析を行う
 */

import { parseTable } from './tables';
import { Font, FontTable, TableDirectoryEntry, TableMetaData } from './types/font';
import { DataReader } from './utils/data-reader';

/**
 * フォントタイプ
 */
enum FontType {
	UNKNOWN = 0,
	TTC = 1,
	TRUETYPE = 2,
	OPENTYPE = 3
}

/**
 * フォントのバージョンからフォントタイプを判定する
 * 
 * @param version フォントのバージョン
 * @returns フォントタイプ
 */
function determineFontType(version: string): FontType {
	switch (version) {
		case 'ttcf':
			return FontType.TTC;
		case '1.0':
		case 'true':
			return FontType.TRUETYPE;
		case 'OTTO':
			return FontType.OPENTYPE;
		default:
			return FontType.UNKNOWN;
	}
}

/**
 * テーブルデータのチェックサムを計算する
 */
function calculateChecksum(reader: DataReader, offset: number, length: number) {
	// 現在位置を保存
	reader.save();

	try {
		reader.seek(offset);

		// 32ビット単位に切り上げたバイト数を計算
		const paddedLength = (length + 3) & ~3;

		let sum = 0;

		// 32ビットの整数として読み取り、合計
		for (let i = 0; i < paddedLength; i += 4) {
			if (i + 4 <= length) {
				sum = (sum + reader.readUInt32()) >>> 0; // 符号なし32ビット整数として扱う
			} else {
				// テーブル末尾の部分的なデータ（パディング含む）
				const remainingBytes = length - i;
				let value = 0;

				for (let j = 0; j < remainingBytes; j++) {
					value = (value << 8) | reader.readUInt8();
				}

				// 残りは0でパディング
				for (let j = remainingBytes; j < 4; j++) {
					value = (value << 8);
				}

				sum = (sum + value) >>> 0;
			}
		}

		return sum;
	} finally {
		// 元の位置に戻す
		reader.restore();
	}
}

/**
 * テーブルのチェックサムを検証する
 */
function verifyChecksum(reader: DataReader, entry: TableDirectoryEntry) {
	// headテーブルは特別な処理が必要
	if (entry.tag === 'head') {
		// headテーブルのcheckSumAdjustmentフィールドを一時的に0に設定したチェックサムを計算する必要がある
		reader.save();
		try {
			const calculatedSum = calculateChecksum(reader, entry.offset, entry.length);

			// checkSumAdjustmentの位置（headテーブルの開始から8バイト）に移動
			reader.seek(entry.offset + 8);

			// 現在の調整値を読み取る
			const checkSumAdjustment = reader.readUInt32();

			// 調整値を差し引いて検証
			return ((calculatedSum - checkSumAdjustment) & 0xFFFFFFFF) === entry.checksum;
		} finally {
			reader.restore();
		}
	} else {
		// 通常のテーブル
		const calculatedSum = calculateChecksum(reader, entry.offset, entry.length);
		return calculatedSum === entry.checksum;
	}
}

/**
 * フォントローダークラス
 */
export class FontLoader {
	/**
	 * フォントデータを読み込むためのリーダー
	 */
	private reader: DataReader;

	/**
	 * 生のフォントデータ
	 */
	private fontData: ArrayBuffer;

	/**
	 * フォントタイプ
	 */
	private fontType: FontType = FontType.UNKNOWN;

	/**
	 * TrueType Collectionの場合は複数、その他は1つだけフォントを持つ
	 */
	private fonts: Font[] = [];

	/**
	 * FontLoaderのコンストラクタ
	 */
	constructor(fontData: ArrayBuffer) {
		this.fontData = fontData;
		this.reader = new DataReader(fontData);
	}

	/**
	 * フォントをロードする
	 */
	load() {
		// バージョンタグを読み取る
		const version = this.reader.readTag();
		this.fontType = determineFontType(version);

		if (this.fontType === FontType.TTC) {
			// TrueType Collectionの場合
			return this.loadTTC();
		} else {
			// 単一フォントの場合
			this.reader.seek(0); // バージョンを再度読み取るために先頭に戻る
			const font = this.loadSingleFont();
			this.fonts = [font];
			return this.fonts;
		}
	}

	/**
	 * テーブルを読み込む
	 */
	private loadTable(entry: TableDirectoryEntry, font: Font) {
		// チェックサムを検証
		const isValid = verifyChecksum(this.reader, entry);
		if (!isValid) {
			console.warn(`Warning: Checksum verification failed for table '${entry.tag}'`);
		}

		// テーブル詳細データをパース
		const tableDetail = parseTable(this.reader, entry, font);

		// メタデータを作成
		const tableMeta: TableMetaData = {
			tag: entry.tag,
			checksum: entry.checksum,
			offset: entry.offset,
			length: entry.length,
			checksumValid: isValid
		};

		// テーブルと詳細情報を結合したオブジェクトを返す
		return {
			table: tableDetail,
			meta: tableMeta
		} as FontTable;
	}

	/**
	 * 単一のフォントを読み込む
	 */
	private loadSingleFont() {
		// フォントヘッダーを読み込む
		const version = this.reader.readTag();
		const numTables = this.reader.readUInt16();
		const searchRange = this.reader.readUInt16();
		const entrySelector = this.reader.readUInt16();
		const rangeShift = this.reader.readUInt16();

		// テーブルディレクトリを読み込む
		const tableDirectory: TableDirectoryEntry[] = [];
		for (let i = 0; i < numTables; i++) {
			const tag = this.reader.readTag();
			const checksum = this.reader.readUInt32();
			const offset = this.reader.readUInt32();
			const length = this.reader.readUInt32();

			tableDirectory.push({ tag, checksum, offset, length });
		}

		// フォントオブジェクトを作成
		const font: Font = {
			version,
			numTables,
			searchRange,
			entrySelector,
			rangeShift,
			tableDirectory,
			tables: {}
		};

		// テーブルをロードする順序を決定
		// 依存関係を考慮して、特定のテーブルを先にロードする
		const priorityTables = ['head', 'maxp', 'OS/2'];
		const remainingTables = tableDirectory.filter(
			entry => !priorityTables.includes(entry.tag)
		);

		const loadingOrder = [
			...tableDirectory.filter(entry => priorityTables.includes(entry.tag)),
			...remainingTables
		];

		// 各テーブルを読み込む
		for (const entry of loadingOrder) {
			const table = this.loadTable(entry, font);
			font.tables[entry.tag] = table;
		}

		return font;
	}

	/**
	 * TrueType Collectionを読み込む
	 */
	private loadTTC() {
		// TTCヘッダーの読み込み
		const majorVersion = this.reader.readUInt16();
		const minorVersion = this.reader.readUInt16();
		const numFonts = this.reader.readUInt32();

		// フォントオフセットの配列を読み込む
		const offsets = [];
		for (let i = 0; i < numFonts; i++) {
			offsets.push(this.reader.readUInt32());
		}

		// 各フォントを読み込む
		this.fonts = [];
		for (const offset of offsets) {
			this.reader.seek(offset);
			const font = this.loadSingleFont();
			this.fonts.push(font);
		}

		return this.fonts;
	}

	/**
	 * フォントコレクションとしてデータを取得する
	 */
	getCollection() {
		if (this.fontType !== FontType.TTC) {
			throw new Error('Not a TrueType Collection');
		}

		// TTCヘッダーを再読み込み
		this.reader.seek(4); // 'ttcf'タグをスキップ
		const majorVersion = this.reader.readUInt16();
		const minorVersion = this.reader.readUInt16();
		const numFonts = this.reader.readUInt32();

		// フォントオフセットの配列を再読み込み
		const offsets = [];
		for (let i = 0; i < numFonts; i++) {
			offsets.push(this.reader.readUInt32());
		}

		return {
			header: {
				version: `${majorVersion}.${minorVersion}`,
				numFonts,
				offsets
			},
			fonts: this.fonts
		};
	}

	/**
	 * フォントタイプを取得する
	 */
	getType() {
		return this.fontType;
	}

	/**
	 * ロードされたフォントを取得する
	 */
	getFonts() {
		return this.fonts;
	}
}