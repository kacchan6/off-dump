/**
 * CFF/CFF2共通パーサー関数
 * CFFおよびCFF2フォーマットで共通して使用されるパース関数を提供する
 * 
 * 参照:
 * - https://learn.microsoft.com/en-us/typography/opentype/spec/cff
 * - https://learn.microsoft.com/en-us/typography/opentype/spec/cff2
 * - https://adobe-type-tools.github.io/font-tech-notes/pdfs/5176.CFF.pdf
 * - https://adobe-type-tools.github.io/font-tech-notes/pdfs/5177.Type2.pdf
 */

import {
	Card8,
	CharStringCommand, CharStringOperator, CharStringProgram,
	DictIndex,
	FDSelect,
	FDSelect0, FDSelect3, FDSelect4,
	FDSelectFormat,
	OffSize, Offset, SubrIndex
} from '../../types/common';
import { DataReader } from '../../utils/data-reader';

/**
 * インデックステーブルをパースする
 * 
 * @param reader データリーダー
 * @param offset インデックステーブルの開始オフセット
 * @returns 解析されたDictIndexオブジェクト
 */
export function parseDictIndex(reader: DataReader, offset: number): DictIndex {
	// オフセット位置に移動
	reader.seek(offset);

	// エントリー数を読み取る
	const count = reader.readUInt16();

	// カウントが0の場合は空のインデックステーブルを返す
	if (count === 0) {
		return {
			count: 0,
			offSize: 0,
			offsets: [],
			data: []
		};
	}

	// オフセットサイズを読み取る（1〜4バイト）
	const offSize = reader.readUInt8() as OffSize;
	if (offSize < 1 || offSize > 4) {
		throw new Error(`無効なoffSize: ${offSize}`);
	}

	// オフセット配列を読み取る (count + 1 個のオフセット)
	const offsets: Offset[] = [];
	for (let i = 0; i <= count; i++) {
		let value = 0;
		for (let j = 0; j < offSize; j++) {
			value = (value << 8) | reader.readUInt8();
		}
		offsets.push(value);
	}

	// 各データエントリを読み取る
	const data: Uint8Array[] = [];
	const dataStart = reader.getOffset();

	for (let i = 0; i < count; i++) {
		const entryOffset = dataStart + offsets[i] - 1; // オフセットは1からなので調整
		const entryLength = offsets[i + 1] - offsets[i];

		reader.save();
		reader.seek(entryOffset);
		data.push(reader.readBytes(entryLength));
		reader.restore();
	}

	return {
		count,
		offSize,
		offsets,
		data
	};
}

/**
 * サブルーチンインデックスをパースする
 * 
 * @param reader データリーダー
 * @param offset サブルーチンインデックスの開始オフセット
 * @returns 解析されたSubrIndexオブジェクト
 */
export function parseSubrIndex(reader: DataReader, offset: number): SubrIndex {
	// オフセット位置に移動
	reader.seek(offset);

	// エントリー数を読み取る
	const count = reader.readUInt16();

	// カウントが0の場合は空のインデックステーブルを返す
	if (count === 0) {
		return {
			count: 0,
			offSize: 0,
			offsets: [],
			subrs: []
		};
	}

	// オフセットサイズを読み取る（1〜4バイト）
	const offSize = reader.readUInt8() as OffSize;
	if (offSize < 1 || offSize > 4) {
		throw new Error(`無効なoffSize: ${offSize}`);
	}

	// オフセット配列を読み取る (count + 1 個のオフセット)
	const offsets: Offset[] = [];
	for (let i = 0; i <= count; i++) {
		let value = 0;
		for (let j = 0; j < offSize; j++) {
			value = (value << 8) | reader.readUInt8();
		}
		offsets.push(value);
	}

	// 各サブルーチンデータを読み取る
	const subrs: Uint8Array[] = [];
	const dataStart = reader.getOffset();

	for (let i = 0; i < count; i++) {
		const entryOffset = dataStart + offsets[i] - 1; // オフセットは1からなので調整
		const entryLength = offsets[i + 1] - offsets[i];

		reader.save();
		reader.seek(entryOffset);
		subrs.push(reader.readBytes(entryLength));
		reader.restore();
	}

	return {
		count,
		offSize,
		offsets,
		subrs
	};
}

/**
 * FDSelectをパースする
 * 
 * @param reader データリーダー
 * @param offset FDSelectの開始オフセット
 * @param numGlyphs グリフの数
 * @returns 解析されたFDSelectオブジェクト
 */
export function parseFDSelect(reader: DataReader, offset: number, numGlyphs: number): FDSelect {
	// オフセット位置に移動
	reader.seek(offset);

	// フォーマットを読み取る
	const format = reader.readUInt8();

	// フォーマット0：各グリフにFDインデックスを関連付ける配列
	if (format === FDSelectFormat.Format0) {
		const fds: Card8[] = [];
		for (let i = 0; i < numGlyphs; i++) {
			fds.push(reader.readUInt8());
		}
		return {
			format: FDSelectFormat.Format0,
			fds
		} as FDSelect0;
	}

	// フォーマット3：範囲によるFDインデックスのマッピング
	else if (format === FDSelectFormat.Format3) {
		const nRanges = reader.readUInt16();
		const ranges = [];

		for (let i = 0; i < nRanges; i++) {
			ranges.push({
				first: reader.readUInt16(),
				fd: reader.readUInt8()
			});
		}

		const sentinel = reader.readUInt16();
		if (sentinel !== numGlyphs) {
			console.warn(`FDSelect Format 3: センチネル値(${sentinel})がnumGlyphs(${numGlyphs})と一致しません`);
		}

		return {
			format: FDSelectFormat.Format3,
			nRanges,
			ranges,
			sentinel
		} as FDSelect3;
	}

	// フォーマット4：範囲によるFDインデックスのマッピング（32ビットオフセット版）
	else if (format === FDSelectFormat.Format4) {
		const nRanges = reader.readUInt32();
		const ranges = [];

		for (let i = 0; i < nRanges; i++) {
			ranges.push({
				first: reader.readUInt32(),
				fd: reader.readUInt16()
			});
		}

		const sentinel = reader.readUInt32();
		if (sentinel !== numGlyphs) {
			console.warn(`FDSelect Format 4: センチネル値(${sentinel})がnumGlyphs(${numGlyphs})と一致しません`);
		}

		return {
			format: FDSelectFormat.Format4,
			nRanges,
			ranges,
			sentinel
		} as FDSelect4;
	}

	throw new Error(`対応していないFDSelectフォーマット: ${format}`);
}

/**
 * CFF/CFF2辞書内の演算子-オペランドのペアをパースする
 * 
 * @param data 辞書データバイト配列
 * @returns 解析された[key, value]のペア配列
 */
export function parseDict(data: Uint8Array): [number, number | number[]][] {
	const result: [number, number | number[]][] = [];
	const operands: number[] = [];
	let i = 0;

	while (i < data.length) {
		const b0 = data[i];

		// オペランド（数値）
		if (b0 <= 21) {
			// 演算子
			const operator = b0;
			i++;

			// 2バイト演算子
			let finalOperator = operator;
			if (operator === 12) {
				if (i >= data.length) {
					throw new Error('ESCAPEオペレータの後に不完全なデータ');
				}
				finalOperator = (operator << 8) | data[i];
				i++;
			}

			// キー/値ペアを結果に追加
			if (operands.length === 1) {
				result.push([finalOperator, operands[0]]);
			} else if (operands.length > 1) {
				result.push([finalOperator, [...operands]]);
			} else {
				result.push([finalOperator, []]);
			}

			// オペランドリストをクリア
			operands.length = 0;
		}
		else if (b0 === 28) {
			// 2バイト整数
			if (i + 2 >= data.length) {
				throw new Error('2バイト整数のデータが不足しています');
			}
			const value = (data[i + 1] << 8) | data[i + 2];
			operands.push(value);
			i += 3;
		}
		else if (b0 === 29) {
			// 4バイト整数
			if (i + 4 >= data.length) {
				throw new Error('4バイト整数のデータが不足しています');
			}
			const value = (data[i + 1] << 24) | (data[i + 2] << 16) | (data[i + 3] << 8) | data[i + 4];
			operands.push(value);
			i += 5;
		}
		else if (b0 === 30) {
			// 実数
			i++;
			let realStr = '';
			let done = false;

			while (!done && i < data.length) {
				const b = data[i++];
				const nibble1 = (b >> 4) & 0xF;
				const nibble2 = b & 0xF;

				for (const nibble of [nibble1, nibble2]) {
					if (nibble <= 9) {
						realStr += nibble.toString();
					} else if (nibble === 0xA) {
						realStr += '.';
					} else if (nibble === 0xB) {
						realStr += 'E';
					} else if (nibble === 0xC) {
						realStr += 'E-';
					} else if (nibble === 0xD) {
						// 予約済み
					} else if (nibble === 0xE) {
						realStr += '-';
					} else if (nibble === 0xF) {
						done = true;
						break;
					}
				}
			}

			operands.push(parseFloat(realStr));
		}
		else if (b0 >= 32 && b0 <= 246) {
			// 1バイト整数
			operands.push(b0 - 139);
			i++;
		}
		else if (b0 >= 247 && b0 <= 250) {
			// 2バイト正の整数
			if (i + 1 >= data.length) {
				throw new Error('2バイト正の整数のデータが不足しています');
			}
			const value = (b0 - 247) * 256 + data[i + 1] + 108;
			operands.push(value);
			i += 2;
		}
		else if (b0 >= 251 && b0 <= 254) {
			// 2バイト負の整数
			if (i + 1 >= data.length) {
				throw new Error('2バイト負の整数のデータが不足しています');
			}
			const value = -(b0 - 251) * 256 - data[i + 1] - 108;
			operands.push(value);
			i += 2;
		}
		else {
			// 未知のバイト
			i++;
		}
	}

	return result;
}

/**
 * CharStringプログラムをパースする
 * 
 * @param data CharStringデータバイト配列
 * @returns 解析されたCharStringCommandの配列
 */
export function parseCharString(data: Uint8Array): CharStringProgram {
	const program: CharStringCommand[] = [];
	const operands: number[] = [];
	let i = 0;

	while (i < data.length) {
		const b0 = data[i];

		if (b0 <= 31 && b0 !== 28) {
			// 演算子
			let operator = b0;
			i++;

			// 2バイト演算子
			if (operator === 12) {
				if (i >= data.length) {
					throw new Error('ESCAPEオペレータの後に不完全なデータ');
				}
				const b1 = data[i++];
				operator = ((operator as number) << 8) | b1;
			}

			program.push({
				operator: operator as CharStringOperator,
				operands: [...operands]
			});

			// オペランドリストをクリア
			operands.length = 0;
		}
		else if (b0 === 28) {
			// 2バイト整数
			if (i + 2 >= data.length) {
				throw new Error('2バイト整数のデータが不足しています');
			}
			const value = ((data[i + 1] << 8) | data[i + 2]) << 16 >> 16; // 符号付き16ビット整数に変換
			operands.push(value);
			i += 3;
		}
		else if (b0 >= 32 && b0 <= 246) {
			// 1バイト整数
			operands.push(b0 - 139);
			i++;
		}
		else if (b0 >= 247 && b0 <= 250) {
			// 2バイト正の整数
			if (i + 1 >= data.length) {
				throw new Error('2バイト正の整数のデータが不足しています');
			}
			const value = (b0 - 247) * 256 + data[i + 1] + 108;
			operands.push(value);
			i += 2;
		}
		else if (b0 >= 251 && b0 <= 254) {
			// 2バイト負の整数
			if (i + 1 >= data.length) {
				throw new Error('2バイト負の整数のデータが不足しています');
			}
			const value = -(b0 - 251) * 256 - data[i + 1] - 108;
			operands.push(value);
			i += 2;
		}
		else {
			// 未知のバイト
			i++;
		}
	}

	// 終了コマンドが明示的になくても、残りのオペランドがあれば追加
	if (operands.length > 0) {
		program.push({
			operator: CharStringOperator.ENDCHAR,
			operands: [...operands]
		});
	}

	return program;
}
