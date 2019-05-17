import http from 'http';
import Koa, { Context } from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';

import Config, { IConfig } from './config';

import requestId from '../middleware/request-id';
import gracefulShutdown from '../middleware/graceful-shutdown';

import Auth, { Signer } from '../models/auth';
import { ErrorMiddleware } from '../models/error';

export interface IInfra {
  createApp(): Koa;
  createServer(app: Koa): http.Server;
  createConfig(): IConfig;
  createSigner(): Signer;
  serveRoutes(app: Koa): (...routers: Router[]) => void;
}

class Infra {
  createApp(): Koa {
    const app = new Koa(); // This must be the first middleware.
    app.use(ErrorMiddleware());
    app.use(koaBody());
    app.use(requestId);

    app.on('error', (err: Error, _ctx: Context) => {
      // Log requests and errors.
      console.error(err.message);
    });
    return app;
  }

  createServer(app: Koa): http.Server {
    const server: http.Server = http.createServer(app.callback());
    // Register graceful shutdown.
    gracefulShutdown(server);
    return server;
  }

  createConfig(): IConfig {
    return Config();
  }

  createSigner(): Signer {
    const { secret } = this.createConfig();
    return Auth(secret);
  }

  serveRoutes(app: Koa) {
    return (...routers: Router[]) => {
      for (let router of routers) {
        app.use(router.routes()).use(router.allowedMethods());
      }
    };
  }
}

export default () => new Infra();
