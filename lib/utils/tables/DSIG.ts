/**
 * DSIG（デジタル署名）テーブル関連のユーティリティ関数
 */

import { DsigTable, SignatureRecord } from '../../types/tables/DSIG';

/**
 * 署名のフォーマット名を取得する
 * 
 * @param format フォーマット番号
 * @returns フォーマットの説明
 */
export function getSignatureFormatName(format: number): string {
	switch (format) {
		case 1:
			return 'PKCS#7 signature';
		default:
			return `Unknown format (${format})`;
	}
}

/**
 * 署名レコードから署名日時を抽出する
 * ※注: これは概念的な実装であり、実際のPKCS#7署名データから正確なタイムスタンプを
 * 抽出するにはより複雑なASN.1解析が必要です
 * 
 * @param record 署名レコード
 * @returns 日時情報（抽出できない場合はnull）
 */
export function extractSignatureTimestamp(record: SignatureRecord): Date | null {
	// PKCS#7署名フォーマットの場合
	if (record.format === 1) {
		// この実装は簡易的なものです
		// 実際にはASN.1パーサーを使ってPKCS#7/CMS構造を解析する必要があります
		// ここではnullを返すだけにしておきます
		return null;
	}

	// サポートされていないフォーマット
	return null;
}

/**
 * DSIG情報の基本サマリーを取得する
 * 
 * @param dsig DSIGテーブル
 * @returns サマリー情報
 */
export function getDsigSummary(dsig: DsigTable): object {
	const signatureInfos = dsig.signatureRecords.map((record, index) => {
		return {
			index,
			format: getSignatureFormatName(record.format),
			size: record.length,
			id: record.signatureBlockId
		};
	});

	return {
		version: dsig.version,
		numSignatures: dsig.numSignatures,
		flags: {
			value: dsig.flags,
			signEntireFont: (dsig.flags & 1) !== 0
		},
		signatures: signatureInfos
	};
}

/**
 * フォントに署名があるかどうかをチェックする
 * 
 * @param dsig DSIGテーブル
 * @returns 署名があればtrue
 */
export function hasFontSignature(dsig: DsigTable): boolean {
	return dsig.numSignatures > 0 && dsig.signatureRecords.length > 0;
}

/**
 * 署名データを16進数表現で取得する
 * 
 * @param record 署名レコード
 * @param maxLength 最大文字数（省略可）
 * @returns 16進数文字列
 */
export function getSignatureHexDump(record: SignatureRecord, maxLength?: number): string {
	const data = record.signatureData;
	let hexString = '';

	// 最大表示長さを計算（デフォルトは全て表示）
	const length = maxLength !== undefined ? Math.min(data.length, maxLength) : data.length;

	// バイト配列を16進数に変換
	for (let i = 0; i < length; i++) {
		hexString += data[i].toString(16).padStart(2, '0');

		// 見やすさのために4バイトごとにスペースを入れる
		if ((i + 1) % 4 === 0 && i < length - 1) {
			hexString += ' ';
		}
	}

	// 表示を省略した場合は省略記号を付ける
	if (length < data.length) {
		hexString += '...';
	}

	return hexString;
}
