import Koa, { Context } from 'koa';
import koaBody from 'koa-body';
import http from 'http';
import mathService from './service/math';
import opsService from './service/ops';
import uuid from 'uuid/v4';
import Auth, { AuthMiddleware, ScopeMiddleware } from './models/auth';

async function main(): Promise<void> {
  const port = process.env.PORT || 3000;
  const secret = process.env.SECRET || 'secret';
  const credential = process.env.CREDENTIAL;

  const auth = Auth(secret);

  const app = new Koa();
  app.use(koaBody());
  app.use(requestId);

  // This must be the first middleware.
  app.use(async (ctx, next) => {
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
  });

  mathService(app, AuthMiddleware(auth));

  opsService({
    app,
    requireAuthorization: AuthMiddleware(auth),
    config: { credential },
    signer: auth,
    scopeMiddleware: ScopeMiddleware,
  });

  app.on('error', (err: Error, _ctx: Context) => {
    // Log requests and errors.
    console.error(err.message);
  });

  console.log(`listening to port *:${port}. press ctrl + c to cancel.`);
  http.createServer(app.callback()).listen(port);
}

main().catch(console.error);

async function requestId(ctx: Context, next: () => Promise<any>) {
  // Passing data through koa context.
  ctx.locals = ctx.locals || {};
  ctx.locals.id = ctx.get('X-Request-ID') || uuid();
  ctx.set('X-Request-ID', ctx.locals.id);
  await next();
}
