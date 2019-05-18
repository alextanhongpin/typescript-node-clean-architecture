import Koa from 'koa';

export function errorHandler(): Koa.Middleware {
  return async function(ctx: Koa.Context, next: () => Promise<any>) {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = {
        error: err.message,
        // Only log the error code if the request is mutating the states of the
        // application (POST, PATCH, DELETE etc)
        // GET methods are usually free of side-effects.
        ...(ctx.request.method !== 'GET' ? { error_code: ctx.locals.id } : {}),
      };
      ctx.app.emit('error', err, ctx);
    }
  };
}

export type errorHandler = ReturnType<typeof errorHandler>;
