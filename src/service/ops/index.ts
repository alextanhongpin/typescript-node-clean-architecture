import Router from 'koa-router';
import { Signer } from '../../module/signer';
import { authorizer } from '../../middleware/authorizer';
import { scopeChecker } from '../../middleware/scope-checker';

import { Service } from './service';
import { Controller } from './controller';

export interface Option {
  credential: string;
  signer: Signer;
}

export default function serviceFactory({ credential, signer }: Option) {
  return Object.freeze({
    createRouter(): Router {
      const service = Service(credential, signer);
      const controller = Controller(service);
      const router = new Router({
        prefix: '/v1/ops',
      });
      router.post(
        '/authorize',
        authorizer(signer),
        scopeChecker('ops'),
        controller.postAuthorize,
      );
      router.post('/register', controller.postRegister);
      router.get('/health', controller.getHealth);
      return router;
    },
  });
}
