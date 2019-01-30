import Koa from 'koa'

export class HttpError extends Error {
  constructor(props: any, public status = 400) {
    super(props);
  }
}

export function HttpStatusUnauthorized(message: string): HttpError {
  return new HttpError(message, 401);
}

export function HttpStatusBadRequest(message: string): HttpError {
  return new HttpError(message);
}

export function ErrorMiddleware(): Koa.Middleware {
	return async function(ctx: Koa.Context, next: Next) {
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
}
