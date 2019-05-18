import Koa from 'koa';
import _ from 'koa-body';
import { Service } from './service';

export function Controller(service: Service) {
  async function postRegister(ctx: Koa.Context) {
    const { username, password } = ctx.request.body;
    // Errors will be captured!
    ctx.body = await service.register({ username, password });
  }

  async function postAuthorize(ctx: Koa.Context) {
    ctx.body = { success: true };
  }

  async function getHealth(ctx: Koa.Context) {
    ctx.body = { success: true };
  }

  return Object.freeze({
    postRegister,
    postAuthorize,
    getHealth,
  });
}

export type Controller = ReturnType<typeof Controller>;
