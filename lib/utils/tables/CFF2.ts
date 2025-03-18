/**
 * CFF2 (Compact Font Format 2) テーブル固有のユーティリティ関数
 */

import { Font } from '../../types/font';
import { Cff2Table, TopDict2, PrivateDict2, VariationStore } from '../../types/tables/CFF2';
import { hasCff2Table, getPrivateDictSummary, getDictIndexSummary } from '../cff/utils';

/**
 * TopDict2の概要情報を取得
 * 
 * @param topDict TopDict2
 * @returns 概要情報
 */
export function getTopDict2Summary(topDict: TopDict2): object {
	const info: Record<string, any> = {};

	// 基本プロパティを追加
	if (topDict.fontMatrix) info.fontMatrix = topDict.fontMatrix;
	if (topDict.fontBBox) info.fontBBox = topDict.fontBBox;
	if (topDict.maxstack !== undefined) info.maxstack = topDict.maxstack;

	// オフセット情報
	const offsets: Record<string, number> = {};
	if (topDict.charStrings !== undefined) offsets.charStrings = topDict.charStrings;
	if (topDict.fdArray !== undefined) offsets.fdArray = topDict.fdArray;
	if (topDict.fdSelect !== undefined) offsets.fdSelect = topDict.fdSelect;
	if (topDict.vstore !== undefined) offsets.vstore = topDict.vstore;

	if (Object.keys(offsets).length > 0) {
		info.offsets = offsets;
	}

	return info;
}

/**
 * PrivateDict2の概要情報を取得（CFF2固有の属性を含む）
 * 
 * @param dict PrivateDict2
 * @returns 概要情報
 */
export function getPrivateDict2Summary(dict: PrivateDict2): object {
	const info = getPrivateDictSummary(dict);

	// CFF2固有の属性を追加
	if (dict.vsindex !== undefined) {
		(info as any).vsindex = dict.vsindex;
	}

	if (dict.blend) {
		(info as any).hasBlendData = true;
		(info as any).blendCount = dict.blend.length;
	}

	return info;
}

/**
 * VariationStoreの概要情報を取得
 * 
 * @param varStore VariationStore
 * @returns 概要情報
 */
export function getVariationStoreSummary(varStore: VariationStore): object {
	return {
		format: varStore.format,
		regionList: {
			axisCount: varStore.regionList.axisCount,
			regionCount: varStore.regionList.regionCount,
			regions: varStore.regionList.regions.slice(0, 5)
		},
		dataList: {
			itemCount: varStore.dataList.itemCount,
			itemSamples: varStore.dataList.itemVariationData.slice(0, 3).map(item => ({
				regionIndexCount: item.regionIndexCount,
				shortDeltaCount: item.shortDeltaCount,
				itemCount: item.itemCount
			}))
		}
	};
}

/**
 * CFF2テーブルの概要情報を取得
 * 
 * @param cff2 CFF2テーブル
 * @returns 概要情報
 */
export function getCff2TableSummary(cff2: Cff2Table): object {
	const info: Record<string, any> = {
		version: `${cff2.header.major}.${cff2.header.minor}`,
		topDict: getTopDict2Summary(cff2.topDict),
		charStrings: getDictIndexSummary(cff2.charStringsIndex),
		globalSubrs: {
			count: cff2.globalSubrIndex.count
		}
	};

	// PrivateDict情報
	if (cff2.privateDicts && cff2.privateDicts.length > 0) {
		info.privateDicts = cff2.privateDicts.map(dict => getPrivateDict2Summary(dict));
	}

	// CIDフォント情報
	if (cff2.fdArray) {
		info.fdArray = getDictIndexSummary(cff2.fdArray);
	}

	if (cff2.fdSelect) {
		info.hasFDSelect = true;
		info.fdSelectFormat = cff2.fdSelect.format;
	}

	// VariationStore情報
	if (cff2.varStore) {
		info.varStore = getVariationStoreSummary(cff2.varStore);
	}

	return info;
}

/**
 * フォントからCFF2テーブルの概要情報を取得
 * 
 * @param font フォントオブジェクト
 * @returns 概要情報（CFF2テーブルが存在しない場合はnull）
 */
export function getCff2Summary(font: Font): object | null {
	if (!hasCff2Table(font)) {
		return null;
	}

	const cff2 = font.tables['CFF2']?.table as Cff2Table;
	if (!cff2) {
		return null;
	}

	return getCff2TableSummary(cff2);
}

/**
 * フォントのCFF2データをエクスポート（概要情報）
 * 
 * @param font フォントオブジェクト
 * @returns CFF2データ（CFF2テーブルが存在しない場合はnull）
 */
export function exportCff2Data(font: Font): object | null {
	if (!hasCff2Table(font)) {
		return null;
	}

	const summary = getCff2Summary(font);
	if (!summary) {
		return null;
	}

	const info: Record<string, any> = {
		summary,
		isVariableFont: !!(font.tables['CFF2']?.table.varStore),
	};

	// 可変フォントの情報
	if (info.isVariableFont) {
		// fvarテーブルからの軸情報も含めると良い（ここでは省略）
		info.hasVariationStore = true;
	}

	return info;
}

/**
 * CFF2テーブルがCIDフォントかどうか判定
 * 
 * @param cff2 CFF2テーブル
 * @returns CIDフォントの場合はtrue
 */
export function isCff2CidKeyed(cff2: Cff2Table): boolean {
	// CFF2では、FDArrayとFDSelectの存在でCIDフォントを判定
	return !!(cff2.fdArray && cff2.fdSelect);
}

/**
 * CFF2テーブルが可変フォントかどうか判定
 * 
 * @param cff2 CFF2テーブル
 * @returns 可変フォントの場合はtrue
 */
export function isCff2VariableFont(cff2: Cff2Table): boolean {
	return !!cff2.varStore;
}

/**
 * フォントがCFF2の可変フォントかどうか判定
 * 
 * @param font フォントオブジェクト
 * @returns CFF2可変フォントの場合はtrue
 */
export function isVariableCff2Font(font: Font): boolean {
	if (!hasCff2Table(font)) {
		return false;
	}

	const cff2 = font.tables['CFF2']?.table as Cff2Table;
	return isCff2VariableFont(cff2);
}
