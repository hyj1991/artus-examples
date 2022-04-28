import { HttpController, HttpMethod, HTTPMethodEnum } from '../decorator';

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
};
