import Router from 'koa-router';
import { Signer, ScopeMiddleware, AuthMiddleware } from '../../models/auth'
import Service from './service'
import Controller from './controller'

export interface Option {
  credential: string;
  signer: Signer;
}

export default function serviceFactory({
  credential,
  signer,
}: Option) {
	return Object.freeze({
		createRouter(): Router {
			const service = Service(credential, signer);
			const controller = Controller(service);
			const router = new Router({
				prefix: '/v1/ops',
			});
			router.post(
				'/authorize',
				AuthMiddleware(signer),
				ScopeMiddleware('ops'),
				controller.postAuthorize,
			);
			router.post('/register', controller.postRegister);
			router.get('/health', controller.getHealth);
			return router;
		}
	})
}


