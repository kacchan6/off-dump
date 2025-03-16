/**
 * otf-dump
 * Development entry point
 */

import * as fs from 'fs';
import { FontLoader } from './font-loader';

/**
 * 値を適切な文字列表現に変換する
 */
function formatValue(value: any): string {
	if (value === null || value === undefined) {
		return String(value);
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	if (value instanceof ArrayBuffer) {
		return `[ArrayBuffer: ${value.byteLength} bytes]`;
	}

	if (value instanceof Uint8Array || value instanceof Uint16Array ||
		value instanceof Uint32Array || value instanceof Int8Array ||
		value instanceof Int16Array || value instanceof Int32Array) {
		return `[TypedArray: ${value.length} elements]`;
	}

	if (typeof value === 'object') {
		return `[Object]`;
	}

	return String(value);
}

/**
 * オブジェクトの階層的な表示
 */
function displayObject(
	obj: any,
	indent = 0,
	maxDepth = 10,
	path = '',
	visitedObjects = new Set()
) {
	// 最大深さチェック
	if (indent > maxDepth) {
		console.log(`${' '.repeat(indent * 2)}... (max depth reached)`);
		return;
	}

	// nullまたはundefinedの場合
	if (obj === null || obj === undefined) {
		console.log(`${' '.repeat(indent * 2)}${formatValue(obj)}`);
		return;
	}

	// 循環参照チェック
	if (typeof obj === 'object' && obj !== null) {
		if (visitedObjects.has(obj)) {
			console.log(`${' '.repeat(indent * 2)}[Circular reference to ${path}]`);
			return;
		}
		visitedObjects.add(obj);
	}

	// プリミティブ値の場合
	if (typeof obj !== 'object' || obj === null) {
		console.log(`${' '.repeat(indent * 2)}${formatValue(obj)}`);
		return;
	}

	// ArrayBufferやTypedArrayの場合
	if (obj instanceof ArrayBuffer ||
		obj instanceof Uint8Array || obj instanceof Uint16Array ||
		obj instanceof Uint32Array || obj instanceof Int8Array ||
		obj instanceof Int16Array || obj instanceof Int32Array) {
		console.log(`${' '.repeat(indent * 2)}${formatValue(obj)}`);
		return;
	}

	// Dateオブジェクトの場合
	if (obj instanceof Date) {
		console.log(`${' '.repeat(indent * 2)}${formatValue(obj)}`);
		return;
	}

	// 配列の場合
	if (Array.isArray(obj)) {
		if (obj.length === 0) {
			console.log(`${' '.repeat(indent * 2)}[]`);
			return;
		}

		console.log(`${' '.repeat(indent * 2)}[`);
		obj.forEach((item, index) => {
			const itemPath = `${path}[${index}]`;
			// 単純な値は同じ行に、オブジェクトは階層的に表示
			if (typeof item !== 'object' || item === null || item instanceof Date ||
				item instanceof ArrayBuffer || item instanceof Uint8Array) {
				console.log(`${' '.repeat((indent + 1) * 2)}${formatValue(item)},`);
			} else {
				console.log(`${' '.repeat((indent + 1) * 2)}${index}: `);
				displayObject(item, indent + 2, maxDepth, itemPath, visitedObjects);
			}
		});
		console.log(`${' '.repeat(indent * 2)}]`);
		return;
	}

	// 通常のオブジェクトの場合
	const entries = Object.entries(obj);
	if (entries.length === 0) {
		console.log(`${' '.repeat(indent * 2)}{}`);
		return;
	}

	if (indent === 0) {
		// トップレベルのオブジェクトはそのまま表示
		entries.forEach(([key, value]) => {
			const valuePath = path ? `${path}.${key}` : key;
			console.log(`${' '.repeat((indent + 1) * 2)}${key}: `);
			displayObject(value, indent + 2, maxDepth, valuePath, visitedObjects);
		});
	} else {
		// 入れ子オブジェクトは階層的に表示
		console.log(`${' '.repeat(indent * 2)}{`);
		entries.forEach(([key, value]) => {
			const valuePath = path ? `${path}.${key}` : key;

			// 単純な値は同じ行に、オブジェクトは階層的に表示
			if (typeof value !== 'object' || value === null || value instanceof Date ||
				value instanceof ArrayBuffer || value instanceof Uint8Array) {
				console.log(`${' '.repeat((indent + 1) * 2)}${key}: ${formatValue(value)},`);
			} else {
				console.log(`${' '.repeat((indent + 1) * 2)}${key}: `);
				displayObject(value, indent + 2, maxDepth, valuePath, visitedObjects);
			}
		});
		console.log(`${' '.repeat(indent * 2)}},`);
	}
}

/**
 * テーブルの詳細を表示
 */
function displayTableDetails(tableTag: string, fontTable: any) {
	// テーブルが未解析かどうか確認
	const isUnknownTable = 'data' in fontTable.table;

	// テーブルの表示名
	const tableDisplayName = isUnknownTable
		? `${tableTag} Table Details (未解析のテーブル)`
		: `${tableTag} Table Details`;

	console.log(`\n  ${tableDisplayName}:`);

	// メタデータ表示
	console.log('  meta:');
	displayObject(fontTable.meta, 2);

	// テーブル詳細表示
	console.log('  table:');
	displayObject(fontTable.table, 2);
}

/**
 * 開発用メイン関数
 * フォントファイルを読み込んでダンプする
 */
function devMain(): void {
	const args = process.argv.slice(2);
	if (args.length === 0) {
		console.error('Usage: node dist/dev.js <font-file>');
		process.exit(1);
	}

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

		// 各フォントの情報を表示
		fonts.forEach((font, index) => {
			console.log(`\nFont #${index + 1}:`);
			console.log(`  Version: ${font.version}`);
			console.log(`  Number of tables: ${font.numTables}`);

			// テーブル一覧を表示
			console.log('\n  Tables:');
			Object.entries(font.tables).forEach(([tag, table]) => {
				console.log(`    ${tag}: ${table.meta.length} bytes`);
			});

			// 各テーブルの詳細を表示
			Object.entries(font.tables).forEach(([tag, table]) => {
				displayTableDetails(tag, table);
			});
		});

	} catch (error) {
		console.error('Error parsing font:', error);
		process.exit(1);
	}
}

// 開発用メイン関数を実行
devMain();
