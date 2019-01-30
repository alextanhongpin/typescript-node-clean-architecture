import Koa from 'koa'
import _ from 'koa-body'
import { IService, IController } from './interface'

export default function Controller(service: IService): IController {
  async function postRegister(ctx: Koa.Context) {
    const { username, password } = ctx.request.body;
    ctx.body = await service.register({ username, password });
  }

  function postAuthorize(ctx: Koa.Context) {
    ctx.body = { success: true };
  }

  function getHealth(ctx: Koa.Context) {
    ctx.body = { success: true };
  }

  return Object.freeze({
    postRegister,
    postAuthorize,
		getHealth
  });
}

