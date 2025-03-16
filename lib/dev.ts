/**
 * otf-dump
 * Development entry point
 * JSONダンプ機能
 */

import * as fs from 'fs';
import * as path from 'path';
import { FontLoader } from './font-loader';
import * as rimraf from 'rimraf';
import { ArrayBufferRef } from './utils/array-buffer-ref';
import { generateUnicodeMapObject } from './utils/tables/cmap';
import { CmapTable } from './types/tables/cmap';

/**
 * 特殊なデータ型を変換してJSON化可能にする
 */
function jsonReplacer(key: string, value: any): any {
	if (value instanceof ArrayBufferRef) {
		// ArrayBufferRefをその文字列表現に変換
		return value.toString();
	} else if (value instanceof ArrayBuffer) {
		// 通常のArrayBufferは型情報のみを出力
		return {
			type: 'ArrayBuffer',
			byteLength: value.byteLength
		};
	} else if (value instanceof Uint8Array ||
		value instanceof Uint16Array ||
		value instanceof Uint32Array ||
		value instanceof Int8Array ||
		value instanceof Int16Array ||
		value instanceof Int32Array) {

		// TypedArrayは型情報のみを出力
		return {
			type: value.constructor.name,
			length: value.length
		};
	} else if (value instanceof Date) {
		// 日付をISO文字列に変換
		return value.toISOString();
	}

	return value;
}

/**
 * テーブル名を有効なファイル名に変換する
 * スペースや記号をアンダースコアに置換
 */
function sanitizeTableName(tableName: string): string {
	return tableName.replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * 開発用メイン関数
 * フォントファイルを読み込んでJSONでダンプする
 */
function devMain(): void {
	const args = process.argv.slice(2);
	if (args.length === 0) {
		console.error('Usage: node dist/dev.js <font-file>');
		process.exit(1);
	}

	// フォントファイルパスを取得
	const fontPath = args[0];
	console.log(`Opening font file: ${fontPath}`);

	try {
		// フォントファイルを読み込む
		const buffer = fs.readFileSync(fontPath);

		// Node.jsのBufferからArrayBufferを正しく取得
		const arrayBuffer = buffer.buffer.slice(
			buffer.byteOffset,
			buffer.byteOffset + buffer.byteLength
		);

		// フォントを解析
		console.log('Parsing font...');
		const loader = new FontLoader(arrayBuffer);
		const fonts = loader.load();

		console.log(`Loaded ${fonts.length} font(s)`);

		// 出力ディレクトリを作成
		const fontBaseName = path.basename(fontPath, path.extname(fontPath));
		const outputDir = path.join(process.cwd(), 'out', fontBaseName);

		if (fs.existsSync(outputDir)) {
			rimraf.sync(outputDir);
		}
		fs.mkdirSync(outputDir, { recursive: true });

		// フォント情報の抽出
		fonts.forEach((font, fontIndex) => {
			// フォント情報をfont.jsonに出力（複数フォントの場合はインデックスを追加）
			const fontFileName = fonts.length > 1 ? `font_${fontIndex + 1}.json` : 'font.json';
			const fontFilePath = path.join(outputDir, fontFileName);

			// フォント自体の基本情報を抽出
			const fontInfo = {
				version: font.version,
				numTables: font.numTables,
				searchRange: font.searchRange,
				entrySelector: font.entrySelector,
				rangeShift: font.rangeShift,
				tableDirectory: font.tableDirectory
			};

			fs.writeFileSync(fontFilePath, JSON.stringify(fontInfo, jsonReplacer, 2));
			console.log(`Saved font information to ${fontFilePath}`);

			// 各テーブルを個別のJSONファイルに出力
			for (const [tableName, tableData] of Object.entries(font.tables)) {
				const tableFileName = `${sanitizeTableName(tableName)}.json`;
				const tableFilePath = path.join(outputDir, tableFileName);

				fs.writeFileSync(tableFilePath, JSON.stringify(tableData, jsonReplacer, 2));
				console.log(`Saved table '${tableName}' to ${tableFilePath}`);
			}
		});

		console.log(`Successfully exported font data to ${outputDir}/`);

	} catch (error) {
		console.error('Error parsing font:', error);
		process.exit(1);
	}
}

// 開発用メイン関数を実行
devMain();
