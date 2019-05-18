import Koa from 'koa';
import uuid from 'uuid/v4';

export const requestIdProvider = async (
  ctx: Koa.Context,
  next: () => Promise<any>,
) => {
  // Passing data through koa context.
  ctx.locals = ctx.locals || {};
  ctx.locals.id = ctx.get('X-Request-ID') || uuid();
  ctx.set('X-Request-ID', ctx.locals.id);
  await next();
};

export type requestIdProvider = ReturnType<typeof requestIdProvider>;
