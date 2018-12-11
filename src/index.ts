import Koa from 'koa'
import koaBody from 'koa-body'
import http from 'http'
import {endpoint} from './service/math'

async function main(): Promise<void> {
	const app = new Koa()
	app.use(koaBody())

	endpoint(app)
	// const mathEndpoint = endpoint()
	// app.use(mathEndpoint.routes())
	// .use(mathEndpoint.allowedMethods())

	console.log('listening to port *:3000. press ctrl + c to cancel.')
	http.createServer(app.callback()).listen(3000)
}

main().catch(console.error)
