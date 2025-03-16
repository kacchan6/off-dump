/**
 * 出力プラグインのインタフェース定義
 */

import { Font } from '../../types/font';

/**
 * 出力プラグインの基本インタフェース
 */
export interface OutputPlugin {
	/**
	 * プラグインの名前
	 */
	name: string;

	/**
	 * プラグインの実行優先度（低いほど先に実行）
	 */
	priority: number;

	/**
	 * プラグインが有効かどうかを判定する
	 * 
	 * @param font フォントデータ
	 * @returns プラグインが有効な場合はtrue
	 */
	isApplicable(font: Font): boolean;

	/**
	 * プラグインを実行してデータを生成する
	 * 
	 * @param font フォントデータ
	 * @param outputDir 出力ディレクトリパス
	 * @returns 成功した場合はtrue
	 */
	execute(font: Font, outputDir: string): boolean;
}

/**
 * 登録済みのプラグイン配列
 */
const registeredPlugins: OutputPlugin[] = [];

/**
 * プラグインを登録する
 * 
 * @param plugin 登録するプラグイン
 */
export function registerPlugin(plugin: OutputPlugin): void {
	registeredPlugins.push(plugin);
	// 優先度順にソート
	registeredPlugins.sort((a, b) => a.priority - b.priority);
}

/**
 * 登録済みの全プラグインを実行する
 * 
 * @param font フォントデータ
 * @param outputDir 出力ディレクトリパス
 * @returns 成功したプラグインの数
 */
export function executePlugins(font: Font, outputDir: string): number {
	let successCount = 0;

	for (const plugin of registeredPlugins) {
		if (plugin.isApplicable(font)) {
			try {
				const success = plugin.execute(font, outputDir);
				if (success) {
					successCount++;
					console.log(`Plugin '${plugin.name}' executed successfully.`);
				}
			} catch (error) {
				console.error(`Error executing plugin '${plugin.name}':`, error);
			}
		}
	}

	return successCount;
}

/**
 * 登録済みプラグインのリストを取得する
 */
export function getRegisteredPlugins(): OutputPlugin[] {
	return [...registeredPlugins];
}
