import Koa from 'koa'
import Router from 'koa-router'

export function endpoint(app: Koa){
	const router = new Router()

	router.get('/sum', getMathBuilder(sum))

	app
	.use(router.routes())
	.use(router.allowedMethods())
}

function getMathBuilder(svc: SumService): Router.IMiddleware {
	return async function getMath(ctx: Koa.Context) {
		const {a, b} = ctx.query
		const req = {a: Number(a), b: Number(b)}
		const res = svc(req)
		ctx.body = res
	}
}

interface SumRequest {
	a: number;
	b: number;
}

interface SumResponse {
	sum: number;
}

interface SumService {
	(req: SumRequest): SumResponse;
}

function sum(req: SumRequest): SumResponse {
	return {
		sum: req.a + req.b 
	}
}
