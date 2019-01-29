import Koa from 'koa';
import Router from 'koa-router';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { HttpError } from './error';

const internal = new WeakMap();

export interface Signer {
  sign(obj: any, duration?: string): Promise<string>;
  verify(token: string): Promise<any>;
}

class Auth {
  constructor(secret: string) {
    internal.set(this, { secret });
  }

  sign(obj: any, duration = '1h'): Promise<string> {
    const { secret } = internal.get(this);
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

  verify(token: string): Promise<any> {
    const { secret } = internal.get(this);
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err: Error, decoded: any) => {
        err ? reject(err) : resolve(decoded);
      });
    });
  }
}

export function AuthMiddleware(signer: Signer): Router.IMiddleware {
  return async function requireAuthorization(
    ctx: Koa.Context,
    next: () => Promise<any>,
  ) {
    const authorization = ctx.get('Authorization');
    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer') {
      throw new HttpError('invalid authorization header', 401);
    }

    if (!token) {
      throw new HttpError('invalid access token', 401);
    }
    try {
      const user = await signer.verify(token);
      ctx.locals.user = user;
      await next();
    } catch (err) {
      throw new HttpError(err.message, 401);
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
      throw new Error(`scope "${scope}" is invalid`);
    }
    if (!scopes.includes(scope)) {
      throw new Error(`scope "${scope}" is invalid`);
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

export default (secret: string): Signer => {
  const auth = new Auth(secret);
  return Object.freeze(auth);
};
