/**
 * maxpテーブル関連のユーティリティ関数
 */

import { AnyMaxpTable, MaxpTableV1 } from '../../types/tables/maxp';

/**
 * テーブルがMaxpTableV1型かどうかを判定する型ガード
 */
export function isMaxpTableV1(maxp: AnyMaxpTable): maxp is MaxpTableV1 {
	return maxp.version === 1.0;
}

/**
 * フォントがTrueTypeアウトラインを含むかどうかを判定する
 * 
 * @param maxp maxpテーブル
 * @returns TrueTypeならtrue
 */
export function hasTrueTypeOutlines(maxp: AnyMaxpTable): boolean {
	return maxp.version === 1.0;
}

/**
 * フォントがCFFアウトラインを含むかどうかを判定する
 * 
 * @param maxp maxpテーブル
 * @returns CFFならtrue
 */
export function hasCFFOutlines(maxp: AnyMaxpTable): boolean {
	return maxp.version === 0.5;
}

/**
 * TrueTypeフォントの複合グリフに関する情報を取得する
 * 
 * @param maxp maxpテーブル
 * @returns 複合グリフの情報（CFFフォントの場合はnull）
 */
export function getCompositeGlyphInfo(maxp: AnyMaxpTable): object | null {
	if (!isMaxpTableV1(maxp)) {
		return null;
	}

	return {
		maxCompositePoints: maxp.maxCompositePoints,
		maxCompositeContours: maxp.maxCompositeContours,
		maxComponentElements: maxp.maxComponentElements,
		maxComponentDepth: maxp.maxComponentDepth
	};
}

/**
 * TrueTypeフォントのヒント関連情報を取得する
 * 
 * @param maxp maxpテーブル
 * @returns ヒント関連の情報（CFFフォントの場合はnull）
 */
export function getHintingInfo(maxp: AnyMaxpTable): object | null {
	if (!isMaxpTableV1(maxp)) {
		return null;
	}

	return {
		maxZones: maxp.maxZones,
		maxTwilightPoints: maxp.maxTwilightPoints,
		maxStorage: maxp.maxStorage,
		maxFunctionDefs: maxp.maxFunctionDefs,
		maxInstructionDefs: maxp.maxInstructionDefs,
		maxStackElements: maxp.maxStackElements,
		maxSizeOfInstructions: maxp.maxSizeOfInstructions
	};
}

/**
 * maxpテーブルの基本情報を抽出する
 * 
 * @param maxp maxpテーブル
 * @returns テーブルの基本情報オブジェクト
 */
export function getMaxpTableInfo(maxp: AnyMaxpTable): object {
	// 基本情報
	const info: any = {
		version: maxp.version.toFixed(1),
		numGlyphs: maxp.numGlyphs,
		outlineFormat: maxp.version === 1.0 ? 'TrueType' : 'CFF'
	};

	// TrueTypeフォント固有の情報を追加
	if (isMaxpTableV1(maxp)) {
		info.maxPoints = maxp.maxPoints;
		info.maxContours = maxp.maxContours;
		info.compositeGlyphs = getCompositeGlyphInfo(maxp);
		info.hinting = getHintingInfo(maxp);
	}

	return info;
}
