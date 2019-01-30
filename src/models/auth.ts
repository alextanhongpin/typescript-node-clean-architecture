import Koa from 'koa';
import Router from 'koa-router';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { HttpStatusUnauthorized } from './error';

export interface Signer {
  sign(obj: any, duration?: string): Promise<string>;
  verify(token: string): Promise<any>;
}

export default function Auth(secret: string) {
  async function sign(obj: any, duration = '1h'): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        obj,
        secret,
        { expiresIn: duration },
        (err: Error, token: string) => {
          err ? reject(err) : resolve(token);
        },
      );
    });
  }

  async function verify(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err: Error, decoded: any) => {
        err ? reject(err) : resolve(decoded);
      });
    });
  }

	return Object.freeze({
		sign,
		verify
	})
}

export function AuthMiddleware(signer: Signer): Router.IMiddleware {
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

export function ScopeMiddleware(...scopes: string[]): Router.IMiddleware {
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

export function sha256(ciphertext: string): string {
  // echo -n username:password | shasum -a 256
  return crypto
    .createHash('sha256')
    .update(ciphertext, 'utf8')
    .digest('hex');
}

