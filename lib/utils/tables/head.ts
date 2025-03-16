/**
 * headテーブル関連のユーティリティ関数
 */

import { HeadTable, HeadFlags, MacStyle } from '../../types/tables/head';

/**
 * フォントがマクロスタイルのBold属性を持っているかチェック
 */
export function isHeadMacStyleBold(head: HeadTable) {
	return (head.macStyle & MacStyle.BOLD) !== 0;
}

/**
 * フォントがマクロスタイルのItalic属性を持っているかチェック
 */
export function isHeadMacStyleItalic(head: HeadTable) {
	return (head.macStyle & MacStyle.ITALIC) !== 0;
}

/**
 * フォントがマクロスタイルのUnderline属性を持っているかチェック
 */
export function isHeadMacStyleUnderline(head: HeadTable) {
	return (head.macStyle & MacStyle.UNDERLINE) !== 0;
}

/**
 * フォントがマクロスタイルのOutline属性を持っているかチェック
 */
export function isHeadMacStyleOutline(head: HeadTable) {
	return (head.macStyle & MacStyle.OUTLINE) !== 0;
}

/**
 * フォントがマクロスタイルのShadow属性を持っているかチェック
 */
export function isHeadMacStyleShadow(head: HeadTable) {
	return (head.macStyle & MacStyle.SHADOW) !== 0;
}

/**
 * フォントがマクロスタイルのCondensed属性を持っているかチェック
 */
export function isHeadMacStyleCondensed(head: HeadTable) {
	return (head.macStyle & MacStyle.CONDENSED) !== 0;
}

/**
 * フォントがマクロスタイルのExtended属性を持っているかチェック
 */
export function isHeadMacStyleExtended(head: HeadTable) {
	return (head.macStyle & MacStyle.EXTENDED) !== 0;
}

/**
 * headテーブルのフラグが特定のビットを持っているかチェック
 */
export function hasHeadFlag(head: HeadTable, flag: HeadFlags) {
	return (head.flags & flag) !== 0;
}

/**
 * ベースラインが0でY座標が上向きのフォントかチェック
 */
export function hasBaselineAt0(head: HeadTable) {
	return hasHeadFlag(head, HeadFlags.BASELINE_AT_0);
}

/**
 * 左サイドベアリングが0の位置にあるかチェック
 */
export function hasLeftSidebearingAt0(head: HeadTable) {
	return hasHeadFlag(head, HeadFlags.LEFT_SIDEBEARING_AT_0);
}

/**
 * インストラクションが点サイズに依存するかチェック
 */
export function hasInstructionsDependOnPointSize(head: HeadTable) {
	return hasHeadFlag(head, HeadFlags.INSTRUCTIONS_DEPEND_ON_POINT_SIZE);
}

/**
 * PPEMが整数値に強制されるかチェック
 */
export function hasForcePpemToInteger(head: HeadTable) {
	return hasHeadFlag(head, HeadFlags.FORCE_PPEM_TO_INTEGER);
}

/**
 * インストラクションが文字の幅を変更するかチェック
 */
export function hasInstructionsAlterAdvanceWidth(head: HeadTable) {
	return hasHeadFlag(head, HeadFlags.INSTRUCTIONS_ALTER_ADVANCE_WIDTH);
}

/**
 * フォントが圧縮や変換などにより元データから変更されていないかチェック
 */
export function hasLosslessFontData(head: HeadTable) {
	return hasHeadFlag(head, HeadFlags.LOSSLESS_FONT_DATA);
}

/**
 * フォントが他のフォーマットから変換されたものかチェック
 */
export function isConvertedFont(head: HeadTable) {
	return hasHeadFlag(head, HeadFlags.CONVERTED_FONT);
}

/**
 * フォントがClearType用に最適化されているかチェック
 */
export function isOptimizedForClearType(head: HeadTable) {
	return hasHeadFlag(head, HeadFlags.OPTIMIZED_FOR_CLEARTYPE);
}

/**
 * フォントがラストリゾートフォントかチェック
 */
export function isLastResortFont(head: HeadTable) {
	return hasHeadFlag(head, HeadFlags.LAST_RESORT_FONT);
}

/**
 * フォントのマジックナンバーが正しいかチェック
 */
export function hasValidMagicNumber(head: HeadTable) {
	return head.magicNumber === 0x5F0F3CF5;
}

/**
 * マクロスタイルのビットから文字列配列に変換
 */
export function macStyleToStrings(head: HeadTable) {
	const styles = [];

	if (isHeadMacStyleBold(head)) styles.push('Bold');
	if (isHeadMacStyleItalic(head)) styles.push('Italic');
	if (isHeadMacStyleUnderline(head)) styles.push('Underline');
	if (isHeadMacStyleOutline(head)) styles.push('Outline');
	if (isHeadMacStyleShadow(head)) styles.push('Shadow');
	if (isHeadMacStyleCondensed(head)) styles.push('Condensed');
	if (isHeadMacStyleExtended(head)) styles.push('Extended');

	return styles;
}

/**
 * ヘッドフラグからフラグ名の配列に変換
 */
export function headFlagsToStrings(head: HeadTable) {
	const flagNames = [];

	if (hasBaselineAt0(head)) flagNames.push('BaselineAt0');
	if (hasLeftSidebearingAt0(head)) flagNames.push('LeftSidebearingAt0');
	if (hasInstructionsDependOnPointSize(head)) flagNames.push('InstructionsDependOnPointSize');
	if (hasForcePpemToInteger(head)) flagNames.push('ForcePpemToInteger');
	if (hasInstructionsAlterAdvanceWidth(head)) flagNames.push('InstructionsAlterAdvanceWidth');
	if (hasLosslessFontData(head)) flagNames.push('LosslessFontData');
	if (isConvertedFont(head)) flagNames.push('ConvertedFont');
	if (isOptimizedForClearType(head)) flagNames.push('OptimizedForClearType');
	if (isLastResortFont(head)) flagNames.push('LastResortFont');

	return flagNames;
}
