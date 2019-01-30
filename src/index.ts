import Koa, { Context } from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';
import http from 'http';
import mathService from './service/math';
import createOpsRouter from './service/ops';
import uuid from 'uuid/v4';
import Auth, { AuthMiddleware, ScopeMiddleware } from './models/auth';

async function main(): Promise<void> {
  const port = process.env.PORT || 3000;
  const secret = process.env.SECRET || 'secret';
  const credential = process.env.CREDENTIAL;

  const auth = Auth(secret);

  const app = new Koa();
  // This must be the first middleware.
  app.use(errorMiddleware);
  app.use(koaBody());
  app.use(requestId);

  mathService(app, AuthMiddleware(auth));

  const opsRouter = createOpsRouter({
    app,
    requireAuthorization: AuthMiddleware(auth),
    config: { credential },
    signer: auth,
    scopeMiddleware: ScopeMiddleware,
  });

  serveRoutes(app)(opsRouter);

  app.on('error', (err: Error, _ctx: Context) => {
    // Log requests and errors.
    console.error(err.message);
  });

  console.log(`listening to port *:${port}. press ctrl + c to cancel.`);
  http.createServer(app.callback()).listen(port);
}

main().catch(console.error);

function serveRoutes(app: Koa) {
  return function(...routers: Router[]) {
    for (let router of routers) {
      app.use(router.routes()).use(router.allowedMethods());
    }
  };
}

async function requestId(ctx: Context, next: () => Promise<any>) {
  // Passing data through koa context.
  ctx.locals = ctx.locals || {};
  ctx.locals.id = ctx.get('X-Request-ID') || uuid();
  ctx.set('X-Request-ID', ctx.locals.id);
  await next();
}

interface Next {
  (): Promise<any>;
}

async function errorMiddleware(ctx: Context, next: Next) {
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
}
