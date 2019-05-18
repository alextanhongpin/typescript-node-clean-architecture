import Koa from 'koa';
import Router from 'koa-router';
import { Signer } from '../module/signer';
import { HttpStatusUnauthorized } from '../module/http';

export function authorizer(signer: Signer): Router.IMiddleware {
  return async function requireAuthorization(
    ctx: Koa.Context,
    next: () => Promise<any>,
  ) {
    const authorization = ctx.get('Authorization');
    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer') {
      throw HttpStatusUnauthorized('invalid authorization header');
    }

    if (!token) {
      throw HttpStatusUnauthorized('invalid access token');
    }
    try {
      const user = await signer.verify(token);
      ctx.locals.user = user;
      await next();
    } catch (err) {
      throw HttpStatusUnauthorized(err.message);
    }
  };
}

export type authorizer = ReturnType<typeof authorizer>;
