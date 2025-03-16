/**
 * 出力プラグインのエクスポート
 */

export * from './plugin-interface';
import { CmapMappingPlugin } from './cmap-mapping';
import { registerPlugin } from './plugin-interface';

registerPlugin(new CmapMappingPlugin());
