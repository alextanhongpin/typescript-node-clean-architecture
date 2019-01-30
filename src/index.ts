import _ from './globals'
import Auth, { AuthMiddleware } from './models/auth';
import Koa, { Context } from 'koa';
import Router from 'koa-router';
import createOpsRouter from './service/ops';
import http from 'http';
import koaBody from 'koa-body';
import mathService from './service/math';
import uuid from 'uuid/v4';
import { ErrorMiddleware } from './models/error'

async function main(): Promise<void> {
  const port = process.env.PORT || 3000;
  const secret = process.env.SECRET || 'secret';
  const credential: string = process.env.CREDENTIAL || 'hashed credentials';

  const auth = Auth(secret);

  const app = new Koa();

  // This must be the first middleware.
  app.use(ErrorMiddleware());
  app.use(koaBody());
  app.use(requestId);

  mathService(app, AuthMiddleware(auth));

  const opsRouter = createOpsRouter({ credential, signer: auth });

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

async function requestId(ctx: Context, next: Next) {
  // Passing data through koa context.
  ctx.locals = ctx.locals || {};
  ctx.locals.id = ctx.get('X-Request-ID') || uuid();
  ctx.set('X-Request-ID', ctx.locals.id);
  await next();
}
