import { Context } from 'koa';
import uuid from 'uuid/v4';

const requestId = async (ctx: Context, next: Next) => {
  // Passing data through koa context.
  ctx.locals = ctx.locals || {};
  ctx.locals.id = ctx.get('X-Request-ID') || uuid();
  ctx.set('X-Request-ID', ctx.locals.id);
  await next();
};

export default requestId;
