import 'reflect-metadata';
import path from "path";
import { ArtusApplication, Scanner } from "@artus/core";
import { mergePluginsConfig, getMergedPluginConfig, getPluginsConfig, eggApplication } from './src/loader/index';

export async function main() {
  const scanner = new Scanner({
    needWriteFile: false,
    loaderListGenerator: (defaultLoaderList: string[]) => {
      const configIndex = defaultLoaderList.indexOf('config');
      defaultLoaderList.splice(configIndex + 1, 0, 'egg-plugin');
      return defaultLoaderList;
    },
    excluded: ['dist']
  });
  const manifest = await scanner.scan(path.resolve(__dirname, './'));
  // console.log(`[pid] ${process.pid}, manifest:`, manifest.default);

  for (const item of manifest.default.items) {
    if (item.loader === 'egg-plugin') {
      await mergePluginsConfig(item);
    }
  }
  const eggPluginsConfig = getPluginsConfig(getMergedPluginConfig());
  for (const [, config] of Object.entries(eggPluginsConfig)) {
    const scanner = new Scanner({
      configDir: 'config',
      needWriteFile: false,
    });
    const { default: { items: pluginItems } } = await scanner.scan(config.path)
    pluginItems.forEach(item => item.loader === 'module' && (item.loader = 'egg-plugin') && (item.unitName = config.path));
    manifest.default.items = pluginItems.concat(manifest.default.items);
  }

  const app = new ArtusApplication();
  const container = app.getContainer();
  container.set({ id: 'EGG_APPLICATION', value: eggApplication });
  await app.load(manifest.default);

  // 测试使用 egg-redis 写入
  await (eggApplication as any).redis.set('test-key', 'redis init succeed');

  await app.run();
  return app;
}

main();
