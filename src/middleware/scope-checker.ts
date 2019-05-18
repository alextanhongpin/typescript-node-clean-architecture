import Koa from 'koa';
import Router from 'koa-router';

import { HttpStatusUnauthorized } from '../module/http';

export function scopeChecker(...scopes: string[]): Router.IMiddleware {
  return async function requireScopes(
    ctx: Koa.Context,
    next: () => Promise<any>,
  ) {
    const scope = ctx.locals.user && ctx.locals.user.scope;
    if (!scope) {
      throw HttpStatusUnauthorized(`scope "${scope}" is invalid`);
    }
    if (!scopes.includes(scope)) {
      throw HttpStatusUnauthorized(`scope "${scope}" is invalid`);
    }
    await next();
  };
}

export type scopeChecker = ReturnType<typeof scopeChecker>;
