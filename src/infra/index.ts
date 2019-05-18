import http from 'http';
import Koa, { Context } from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';

import { Config } from './config';

import { requestIdProvider } from '../middleware/request-id-provider';
import gracefulShutdown from '../module/graceful-shutdown';

import { Signer } from '../module/signer';
import { errorHandler } from '../middleware/error-handler';

export function Infra() {
  function createApp(): Koa {
    const app = new Koa(); // This must be the first middleware.
    app.use(errorHandler());
    app.use(koaBody());
    app.use(requestIdProvider);

    app.on('error', (err: Error, _ctx: Context) => {
      // Log requests and errors.
      console.error(err.message);
    });
    return app;
  }

  function createServer(app: Koa): http.Server {
    const server: http.Server = http.createServer(app.callback());
    // Register graceful shutdown.
    gracefulShutdown(server);
    return server;
  }

  function createConfig(): Config {
    return Config();
  }

  function createSigner(): Signer {
    const { secret } = createConfig();
    return Signer(secret);
  }

  function serveRoutes(app: Koa) {
    return (...routers: Router[]) => {
      for (let router of routers) {
        app.use(router.routes()).use(router.allowedMethods());
      }
    };
  }
  return Object.freeze({
    createApp,
    createServer,
    createConfig,
    createSigner,
    serveRoutes,
  });
}

export type Infra = ReturnType<typeof Infra>;
