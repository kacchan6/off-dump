/**
 * DataReader
 * OpenType フォントファイルを解析するためのユーティリティクラス
 * 
 * Microsoft OpenType 仕様に準拠: https://learn.microsoft.com/ja-jp/typography/opentype/spec/
 */

/**
 * エンディアンの種類
 */
export enum Endian {
	BIG = 'big-endian',
	LITTLE = 'little-endian'
}

/**
 * OpenType フォントデータを解析するためのデータリーダークラス
 * スタックベースの位置保存/復元とさまざまなデータ型の読み取りをサポート
 */
export class DataReader {
	/** 元のバッファ */
	private buffer: ArrayBuffer;
	/** バッファビュー */
	private view: DataView;
	/** 現在の読み取り位置 */
	private offset = 0;
	/** 位置のスタック */
	private offsetStack: number[] = [];
	/** バッファのサイズ */
	private size: number;
	/** リーダーの開始オフセット (サブリーダー用) */
	private startOffset = 0;
	/** リーダーの終了オフセット (サブリーダー用) */
	private endOffset: number;
	/** 現在のエンディアン */
	private endian = Endian.BIG;

	/**
	 * DataReader のコンストラクタ
	 * 
	 * @param buffer 解析する ArrayBuffer
	 * @param offset 開始オフセット (デフォルト: 0)
	 * @param length バッファの長さ (デフォルト: バッファの全長)
	 * @param endian 初期エンディアン (デフォルト: ビッグエンディアン)
	 */
	constructor(
		buffer: ArrayBuffer,
		offset = 0,
		length?: number,
		endian = Endian.BIG
	) {
		this.buffer = buffer;
		this.view = new DataView(buffer);
		this.startOffset = offset;
		this.offset = offset;
		this.size = buffer.byteLength;
		this.endOffset = length !== undefined
			? Math.min(offset + length, this.size)
			: this.size;
		this.endian = endian;
	}

	/**
	 * エンディアンを設定
	 */
	setEndian(endian: Endian) {
		this.endian = endian;
		return this;
	}

	/**
	 * 現在のエンディアンを取得
	 */
	getEndian() {
		return this.endian;
	}

	/**
	 * エンディアンを反転
	 */
	toggleEndian() {
		this.endian = this.endian === Endian.BIG ? Endian.LITTLE : Endian.BIG;
		return this;
	}

	/**
	 * 現在位置をスタックに保存
	 * @returns this (メソッドチェーン用)
	 */
	save(): DataReader {
		this.offsetStack.push(this.offset);
		return this;
	}

	/**
	 * スタックから位置を復元
	 * @returns this (メソッドチェーン用)
	 * @throws スタックが空の場合にエラー
	 */
	restore(): DataReader {
		if (this.offsetStack.length === 0) {
			throw new Error('Cannot restore offset: stack is empty');
		}

		this.offset = this.offsetStack.pop()!;
		return this;
	}

	/**
	 * 指定位置にシーク
	 * 
	 * @param offset 新しい絶対位置
	 * @returns this (メソッドチェーン用)
	 * @throws 範囲外の場合にエラー
	 */
	seek(offset: number): DataReader {
		const newOffset = this.startOffset + offset;
		if (newOffset < this.startOffset || newOffset > this.endOffset) {
			throw new Error(`Seek position out of bounds: ${offset} (valid range: 0-${this.endOffset - this.startOffset})`);
		}

		this.offset = newOffset;
		return this;
	}

	/**
	 * 現在位置から相対的に移動
	 * 
	 * @param relativeOffset 相対オフセット
	 * @returns this (メソッドチェーン用)
	 * @throws 範囲外の場合にエラー
	 */
	skip(relativeOffset: number): DataReader {
		const newOffset = this.offset + relativeOffset;
		if (newOffset < this.startOffset || newOffset > this.endOffset) {
			throw new Error(`Skip position out of bounds: ${this.offset} + ${relativeOffset}`);
		}

		this.offset = newOffset;
		return this;
	}

	/**
	 * 現在位置を取得
	 * 
	 * @returns 現在の絶対位置
	 */
	getOffset(): number {
		return this.offset - this.startOffset;
	}

	/**
	 * 読み込み可能な残りバイト数を取得
	 * 
	 * @returns 残りバイト数
	 */
	getRemainingBytes(): number {
		return this.endOffset - this.offset;
	}

	/**
	 * 現在位置がEOFに達したかどうかを確認
	 * 
	 * @returns EOFならtrue
	 */
	isEOF(): boolean {
		return this.offset >= this.endOffset;
	}

	/**
	 * サイズ指定でサブリーダーを作成
	 * 
	 * @param length サブリーダーのサイズ
	 * @throws 範囲外の場合にエラー
	 */
	createSubReader(length: number) {
		if (this.offset + length > this.endOffset) {
			throw new Error(`SubReader exceeds boundary: ${this.offset} + ${length} > ${this.endOffset}`);
		}

		const subReader = new DataReader(this.buffer, this.offset, length, this.endian);
		this.offset += length;
		return subReader;
	}

	/**
	 * 現在のオフセットから末尾までのサブリーダーを作成
	 */
	createRemainingSubReader() {
		return this.createSubReader(this.getRemainingBytes());
	}

	/**
	 * 8ビット符号付き整数を読み込む
	 * 
	 * @returns 8ビット符号付き整数
	 * @throws EOFに達した場合にエラー
	 */
	readInt8(): number {
		this.checkEOF(1);
		const value = this.view.getInt8(this.offset);
		this.offset += 1;
		return value;
	}

	/**
	 * 8ビット符号なし整数を読み込む
	 * 
	 * @returns 8ビット符号なし整数
	 * @throws EOFに達した場合にエラー
	 */
	readUInt8(): number {
		this.checkEOF(1);
		const value = this.view.getUint8(this.offset);
		this.offset += 1;
		return value;
	}

	/**
	 * 16ビット符号付き整数を読み込む
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readInt16() {
		this.checkEOF(2);
		const isLittleEndian = this.endian === Endian.LITTLE;
		const value = this.view.getInt16(this.offset, isLittleEndian);
		this.offset += 2;
		return value;
	}

	/**
	 * 16ビット符号なし整数を読み込む
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readUInt16() {
		this.checkEOF(2);
		const isLittleEndian = this.endian === Endian.LITTLE;
		const value = this.view.getUint16(this.offset, isLittleEndian);
		this.offset += 2;
		return value;
	}

	/**
	 * 24ビット符号なし整数を読み込む
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readUInt24() {
		this.checkEOF(3);
		let value = 0;

		if (this.endian === Endian.BIG) {
			const byte1 = this.view.getUint8(this.offset);
			const byte2 = this.view.getUint8(this.offset + 1);
			const byte3 = this.view.getUint8(this.offset + 2);
			value = (byte1 << 16) | (byte2 << 8) | byte3;
		} else {
			const byte1 = this.view.getUint8(this.offset);
			const byte2 = this.view.getUint8(this.offset + 1);
			const byte3 = this.view.getUint8(this.offset + 2);
			value = byte1 | (byte2 << 8) | (byte3 << 16);
		}

		this.offset += 3;
		return value;
	}

	/**
	 * 32ビット符号付き整数を読み込む
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readInt32() {
		this.checkEOF(4);
		const isLittleEndian = this.endian === Endian.LITTLE;
		const value = this.view.getInt32(this.offset, isLittleEndian);
		this.offset += 4;
		return value;
	}

	/**
	 * 32ビット符号なし整数を読み込む
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readUInt32() {
		this.checkEOF(4);
		const isLittleEndian = this.endian === Endian.LITTLE;
		const value = this.view.getUint32(this.offset, isLittleEndian);
		this.offset += 4;
		return value;
	}

	/**
	 * 32ビット浮動小数点数を読み込む
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readFloat32() {
		this.checkEOF(4);
		const isLittleEndian = this.endian === Endian.LITTLE;
		const value = this.view.getFloat32(this.offset, isLittleEndian);
		this.offset += 4;
		return value;
	}

	/**
	 * 64ビット浮動小数点数を読み込む
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readFloat64() {
		this.checkEOF(8);
		const isLittleEndian = this.endian === Endian.LITTLE;
		const value = this.view.getFloat64(this.offset, isLittleEndian);
		this.offset += 8;
		return value;
	}

	/**
	 * Fixed形式（16.16）の32ビット浮動小数点数を読み込む
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readFixed() {
		const value = this.readInt32();
		return value / 65536.0;
	}

	/**
	 * F2DOT14形式の16ビット浮動小数点数を読み込む
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readF2DOT14() {
		const value = this.readInt16();
		return value / 16384.0;
	}

	/**
	 * FWORD形式の16ビット符号付き整数を読み込む
	 * (表のy座標などのフォント座標値)
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readFWORD() {
		return this.readInt16();
	}

	/**
	 * UFWORD形式の16ビット符号なし整数を読み込む
	 * (表のx座標などのフォント座標値)
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readUFWORD() {
		return this.readUInt16();
	}

	/**
	 * OFFSET形式の16ビット符号なし整数を読み込む
	 * (16ビットオフセット値)
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readOFFSET16() {
		return this.readUInt16();
	}

	/**
	 * OFFSET形式の24ビット符号なし整数を読み込む
	 * (24ビットオフセット値)
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readOFFSET24() {
		return this.readUInt24();
	}

	/**
	 * OFFSET形式の32ビット符号なし整数を読み込む
	 * (32ビットオフセット値)
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readOFFSET32() {
		return this.readUInt32();
	}

	/**
	 * CFF Index形式のカウント値を読み込む
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readCFFIndexCount() {
		return this.readUInt16();
	}

	/**
	 * CFF2 Index形式のカウント値を読み込む (32ビット)
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readCFF2IndexCount() {
		return this.readUInt32();
	}

	/**
	 * CFF/CFF2のカードを読み込む (可変長整数)
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readCard() {
		// 最初の1バイトを読む
		const b0 = this.readUInt8();

		// 0-246: 値はバイト自体
		if (b0 <= 246) {
			return b0;
		}

		// 247-250: 値は (b0-247)*256 + 次のバイト + 108
		if (b0 <= 250) {
			const b1 = this.readUInt8();
			return ((b0 - 247) * 256) + b1 + 108;
		}

		// 251-254: 値は -(b0-251)*256 - 次のバイト - 108
		if (b0 <= 254) {
			const b1 = this.readUInt8();
			return -((b0 - 251) * 256) - b1 - 108;
		}

		// 255: 32ビット整数が続く
		return this.readInt32();
	}

	/**
	 * CFF2の可変長整数 (blend演算用など)を読み込む
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readCFF2VariableInt() {
		// 最初のバイトで可変長整数の長さを判断
		const firstByte = this.readUInt8();

		// 32ビット整数の場合
		if (firstByte === 28) {
			return this.readInt16();
		}

		// バイト自体で値を表現
		if (firstByte >= 32 && firstByte <= 246) {
			return firstByte - 139;
		}

		// 2バイト整数の場合
		if (firstByte >= 247 && firstByte <= 250) {
			const b1 = this.readUInt8();
			return ((firstByte - 247) * 256) + b1 + 108;
		}

		// 2バイト負の整数の場合
		if (firstByte >= 251 && firstByte <= 254) {
			const b1 = this.readUInt8();
			return -((firstByte - 251) * 256) - b1 - 108;
		}

		// 255の場合は、後続4バイトを使用する32ビット整数
		if (firstByte === 255) {
			return this.readInt32();
		}

		throw new Error(`Invalid CFF2 variable-length integer first byte: ${firstByte}`);
	}

	/**
	 * LONGDATETIME形式の64ビットタイムスタンプを読み込む
	 * （Mac時間から1904年1月1日からの秒数）
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readLongDateTime() {
		this.checkEOF(8);

		const isLittleEndian = this.endian === Endian.LITTLE;

		// JavaScriptのbigintを使用して64ビット整数を読み込む
		let high, low;

		if (isLittleEndian) {
			low = BigInt(this.view.getUint32(this.offset, true));
			high = BigInt(this.view.getUint32(this.offset + 4, true));
		} else {
			high = BigInt(this.view.getUint32(this.offset, false));
			low = BigInt(this.view.getUint32(this.offset + 4, false));
		}

		this.offset += 8;

		const secondsSince1904 = (high << 32n) | low;

		// Mac時間（1904年1月1日）からUNIX時間（1970年1月1日）への変換
		// 1904年1月1日から1970年1月1日までの秒数: 2082844800
		const secondsSince1970 = secondsSince1904 - 2082844800n;

		// ミリ秒に変換してDateオブジェクトを作成
		return new Date(Number(secondsSince1970 * 1000n));
	}

	/**
	 * 4バイトのタグ（識別子）を読み込む
	 * 注: タグはエンディアンに影響されない
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readTag() {
		this.checkEOF(4);

		const tag = String.fromCharCode(
			this.view.getUint8(this.offset),
			this.view.getUint8(this.offset + 1),
			this.view.getUint8(this.offset + 2),
			this.view.getUint8(this.offset + 3)
		);

		this.offset += 4;
		return tag;
	}

	/**
	 * パスカル文字列（長さプレフィックス付き）を読み込む
	 * 
	 * @returns 文字列
	 * @throws EOFに達した場合にエラー
	 */
	readPascalString(): string {
		const length = this.readUInt8();
		return this.readString(length);
	}

	/**
	 * CFFエンコード文字列を読み込む
	 * (Standard StringsをインデックスするためのIDまたは実際の文字列)
	 * 
	 * @param stringIndex Standard Strings配列
	 * @throws EOFに達した場合にエラー
	 */
	readCFFString(stringIndex: string[]): string {
		// SIDを読み取る
		const sid = this.readUInt16();

		// Standard StringsのインデックスにSIDがある場合
		if (sid < stringIndex.length) {
			return stringIndex[sid];
		}

		// Standard Stringsに含まれない場合はエラー
		throw new Error(`String ID ${sid} not found in Standard Strings`);
	}

	/**
	 * CFFディクショナリを読み込む
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readCFFDict() {
		const dict: { [key: number]: any[] } = {};

		while (!this.isEOF()) {
			const b0 = this.readUInt8();

			// オペレータ (オペレータ = b0)
			if (b0 < 22) {
				// 2バイトオペレータのチェック
				let op = b0;
				if (b0 === 12) {
					const b1 = this.readUInt8();
					op = (op << 8) | b1;
				}

				// ディクショナリエントリを終了
				if (dict[op] === undefined) {
					dict[op] = [];
				}
				continue;
			}

			// オペレータではない場合は1バイト戻る
			this.skip(-1);

			// オペランド (可変長整数、実数など)
			const operand = this.readCFF2VariableInt();

			// 最後に見たオペレータに値を追加
			const lastOp = Object.keys(dict).length > 0
				? Math.max(...Object.keys(dict).map(Number))
				: -1;

			if (lastOp >= 0) {
				dict[lastOp].push(operand);
			}
		}

		return dict;
	}

	/**
	 * 指定された長さの文字列を読み込む
	 * 
	 * @param length 文字列の長さ
	 * @returns 文字列
	 * @throws EOFに達した場合にエラー
	 */
	readString(length: number): string {
		this.checkEOF(length);

		const bytes = new Uint8Array(this.buffer, this.offset, length);
		let result = '';

		// ASCII文字列として解釈
		for (let i = 0; i < bytes.length; i++) {
			result += String.fromCharCode(bytes[i]);
		}

		this.offset += length;
		return result;
	}

	/**
	 * NULL終端の文字列を読み込む
	 * 
	 * @param maxLength 最大長さ（オプション）
	 * @returns 文字列
	 * @throws EOFに達した場合にエラー
	 */
	readNullTerminatedString(maxLength?: number): string {
		const startOffset = this.offset;
		let length = 0;

		// NULL文字を見つけるか、最大長さに達するまで検索
		while (!this.isEOF() &&
			(maxLength === undefined || length < maxLength) &&
			this.view.getUint8(this.offset) !== 0) {
			this.offset++;
			length++;
		}

		// NULL文字をスキップ
		if (!this.isEOF() && this.view.getUint8(this.offset) === 0) {
			this.offset++;
		}

		// 文字列を抽出
		const bytes = new Uint8Array(this.buffer, startOffset, length);
		let result = '';

		for (let i = 0; i < bytes.length; i++) {
			result += String.fromCharCode(bytes[i]);
		}

		return result;
	}

	/**
	 * 指定されたバイト数だけバイナリデータを読み込む
	 * 
	 * @param length 読み込むバイト数
	 * @returns Uint8Array
	 * @throws EOFに達した場合にエラー
	 */
	readBytes(length: number): Uint8Array {
		this.checkEOF(length);

		const bytes = new Uint8Array(this.buffer.slice(this.offset, this.offset + length));
		this.offset += length;

		return bytes;
	}

	/**
	 * 現在の位置から残りのバイトをすべて読み込む
	 * 
	 * @returns Uint8Array
	 */
	readRemainingBytes(): Uint8Array {
		return this.readBytes(this.getRemainingBytes());
	}

	/**
	 * 座標値の配列を読み込む (典型的なOpenTypeの輪郭座標)
	 * 
	 * @param count 読み込む座標の数
	 * @throws EOFに達した場合にエラー
	 */
	readCoordinateArray(count: number) {
		const coords = [];

		for (let i = 0; i < count; i++) {
			coords.push({
				x: this.readFWORD(),
				y: this.readFWORD()
			});
		}

		return coords;
	}

	/**
	 * CFF2 CharStringのオペコードを読み込む
	 * 
	 * @throws EOFに達した場合にエラー
	 */
	readCFF2CharStringOp() {
		const b0 = this.readUInt8();

		// 1バイトオペコード
		if (b0 <= 21) {
			return b0;
		}

		// 2バイトオペコード
		if (b0 === 12) {
			const b1 = this.readUInt8();
			return (12 << 8) | b1;
		}

		// オペコードでない場合は1バイト戻す
		this.skip(-1);
		return null;
	}

	/**
	 * 元のバッファを取得する
	 * 
	 * @returns 元のArrayBuffer
	 */
	getBuffer(): ArrayBuffer {
		return this.buffer;
	}

	/**
	 * 必要なバイト数が利用可能かチェック
	 * 
	 * @param bytesNeeded 必要なバイト数
	 * @throws EOFに達した場合にエラー
	 */
	private checkEOF(bytesNeeded: number): void {
		if (this.offset + bytesNeeded > this.endOffset) {
			throw new Error(`Unexpected EOF: tried to read ${bytesNeeded} bytes at offset ${this.offset}, but only ${this.endOffset - this.offset} bytes available`);
		}
	}
}
