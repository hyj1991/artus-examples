'use strict';

import path from 'path';
import { ConfigurationHandler, ManifestItem } from '@artus/core'
import { EggCore, EggLoader, EggLoaderOptions } from 'egg-core';
import Singleton from "./singleTon";

const configHandle = new ConfigurationHandler();
const baseDir = path.join(__dirname, '../../../');

class ArtusEggLoader extends EggLoader {
  constructor(options: EggLoaderOptions) {
    super(options);
  }

  loadAll() {
    this.loadPlugin();
    // TODO: use artus config instead
    this.loadConfig();
    this.loadApplicationExtend();
    this.loadAgentExtend();
    this.loadRequestExtend();
    this.loadResponseExtend();
    this.loadContextExtend();
    this.loadHelperExtend();
    this.loadService();
  }
}

class ArtusEgg extends EggCore {
  constructor(options) {
    super(options);
  }

  addPlugins(plugins) {
    this.loader.options.plugins = plugins;
  }

  get [Symbol.for('egg#eggPath')]() {
    return __dirname;
  }

  get [Symbol.for('egg#loader')]() {
    return ArtusEggLoader;
  }

  get coreLogger() {
    return console;
  }

  load() {
    (this.loader as unknown as ArtusEggLoader).loadAll();
  }

  addSingleton(name, create) {
    const options: any = {};
    options.name = name;
    options.create = create;
    options.app = this;
    const singleton = new Singleton(options);
    const initPromise = singleton.init();
    if (initPromise) {
      this.beforeStart(async () => {
        await initPromise;
      });
    }
  }
};

export const eggApplication = new ArtusEgg({ baseDir, plugins: {} });

export function getPluginsConfig(plugins) {
  eggApplication.addPlugins(plugins);
  eggApplication.load();
  return eggApplication.loader.plugins;
}

export async function mergePluginsConfig(item: ManifestItem) {
  await configHandle.setConfigByFile(item);
}

export function getMergedPluginConfig(env?: string) {
  return configHandle.getMergedConfig(env);
}