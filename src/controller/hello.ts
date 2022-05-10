import { HttpController, HttpMethod, HTTPMethodEnum } from '../decorator';
import { WithContext } from "@artus/core";
import { Context } from "@artus/pipeline";

@HttpController()
export default class Hello {
  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/home'
  })
  async home() {
    return `Artus Home`;
  }

  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/hello'
  })
  async hello() {
    return `Artus Hello`;
  }

  @HttpMethod({
    method: HTTPMethodEnum.GET,
    path: '/redis'
  })
  async setRedis(@WithContext() ctx: Context) {
    const { app } = ctx.input.params;
    const container = app.getContainer();
    const eggApplication = container.get('EGG_APPLICATION');
    return await eggApplication.redis.get('test-key');

  }
};
