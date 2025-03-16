/**
 * ArrayBufferの参照を保持するクラス
 * 元のバッファの一部を参照するために使用
 */
export class ArrayBufferRef {
	/**
	 * 元のArrayBuffer
	 */
	private buffer: ArrayBuffer;

	/**
	 * バッファ内のオフセット
	 */
	public readonly offset: number;

	/**
	 * データの長さ
	 */
	public readonly length: number;

	/**
	 * コンストラクタ
	 * 
	 * @param buffer 元のArrayBuffer
	 * @param offset 開始オフセット
	 * @param length 長さ
	 */
	constructor(buffer: ArrayBuffer, offset: number, length: number) {
		this.buffer = buffer;
		this.offset = offset;
		this.length = length;
	}

	/**
	 * 参照しているデータを取得
	 * 
	 * @returns ArrayBufferの指定部分のビュー
	 */
	getData(): Uint8Array {
		return new Uint8Array(this.buffer, this.offset, this.length);
	}

	/**
	 * 指定範囲のデータを取得
	 * 
	 * @param start 開始位置
	 * @param end 終了位置
	 * @returns 指定範囲のデータ
	 */
	getSlice(start: number, end: number): Uint8Array {
		const startOffset = Math.max(0, start);
		const endOffset = Math.min(this.length, end);
		return new Uint8Array(this.buffer, this.offset + startOffset, endOffset - startOffset);
	}

	/**
	 * 文字列表現
	 */
	toString(): string {
		const bytes = this.getData();
		let dataStr: string;

		if (bytes.length <= 32) {
			// 32バイト以下なら全て表示
			dataStr = Array.from(bytes).join(',');
		} else {
			// 32バイト超なら先頭16バイトと末尾16バイトを表示
			const headBytes = Array.from(bytes.slice(0, 16));
			const tailBytes = Array.from(bytes.slice(bytes.length - 16));
			dataStr = `${headBytes.join(',')}...${tailBytes.join(',')}`;
		}

		return `ArrayBufferRef(offset=${this.offset}, length=${this.length}, data=[${dataStr}])`;
	}
}
