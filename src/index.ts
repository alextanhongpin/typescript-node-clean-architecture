import Auth, { AuthMiddleware } from './models/auth';
import Koa, { Context } from 'koa';
import Router from 'koa-router';
import _ from './globals'
import http from 'http';
import koaBody from 'koa-body';
import opsService from './service/ops';
import mathService from './service/math';
import uuid from 'uuid/v4';
import { ErrorMiddleware } from './models/error'

async function main(): Promise < void > {
  const host = process.env.HOST || 'localhost'
  const port = process.env.PORT || 4040;
  const secret = process.env.SECRET || 'secret';
  const credential: string = process.env.CREDENTIAL || 'hashed credentials';
  const auth = Auth(secret);
  const app = new Koa();
  const server: http.Server = http.createServer(app.callback())
  gracefulShutdown(server)

  // This must be the first middleware.
  app.use(ErrorMiddleware());
  app.use(koaBody());
  app.use(requestId);

  mathService(app, AuthMiddleware(auth));
  const opsRouter = opsService({ credential, signer: auth }).createRouter();
  serveRoutes(app)(opsRouter);

  app.on('error', (err: Error, _ctx: Context) => {
    // Log requests and errors.
    console.error(err.message);
  });

  server.listen({
    port,
    host
  }, function() {
    console.log(`listening to port ${host}:${port}. press ctrl + c to cancel.`);
  })
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

function gracefulShutdown(server: http.Server, forceTimeout = 15 * 1000) {
  function shutdown() {
    console.log('shutting down')
    setTimeout(() => {
      console.log('could not close connection in time, forcefully terminating')
      process.exit(1)
    }, forceTimeout)
    server.close(() => {
      console.log('graceful shutdown')
      process.exit(0)
    })
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}
