import path from 'path';
import { ArtusApplication, ArtusInjectEnum, DefineLoader, LifecycleManager, Loader, LoaderCheckOptions, ManifestItem } from "@artus/core";
import { eggApplication } from "./eggLoader";
import { Container } from '@artus/injection';

let setted = false;

@DefineLoader('egg-plugin')
export default class EggPluginLoader implements Loader {
  private container: Container;

  constructor(container) {
    this.container = container;
  }

  async is(opts: LoaderCheckOptions) {
    const prefix = path.join(opts.baseDir, opts.configDir, 'egg_plugin');
    const file = path.join(opts.root, opts.filename);
    return file.includes(prefix);
  }

  async load(item: ManifestItem): Promise<void> {
    const lifecycleManager: LifecycleManager = this.container.get(ArtusInjectEnum.LifecycleManager);
    if (!setted) {
      lifecycleManager.registerHook('configDidLoad', args => {
        eggApplication.loader.config = (args.app as unknown as ArtusApplication).config;
      });
      setted = true;
    }

    if (path.join(item.unitName || '', 'app') === item.path ||
      path.join(item.unitName || '', 'agent') === item.path) {
      const appOrAgent = (await import(item.path)).default;
      if (typeof appOrAgent === 'function') {
        const fn = appOrAgent.bind(eggApplication, eggApplication);
        lifecycleManager.registerHook('configDidLoad', fn);
      }
    }
  }
}