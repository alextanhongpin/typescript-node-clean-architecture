import Koa from 'koa';
import Router from 'koa-router';

export function endpoint(app: Koa) {
  const router = new Router();
  router.get('/sum', getMathBuilder(sum));
  router.get('/error', async function(_ctx: Koa.Context) {
    throw new Error('invalid request');
  });
  app.use(router.routes()).use(router.allowedMethods());
}

function getMathBuilder(svc: SumService): Router.IMiddleware {
  return async function getMath(ctx: Koa.Context) {
    const { a, b } = ctx.query;
    const req = { a: Number(a), b: Number(b) };
    const res = await svc(req);
    ctx.body = res;
  };
}

interface SumRequest {
  a: number;
  b: number;
}

interface SumResponse {
  sum: number;
}

interface SumService {
  (req: SumRequest): Promise<SumResponse>;
}

async function sum(req: SumRequest): Promise<SumResponse> {
  return {
    sum: req.a + req.b,
  };
}
