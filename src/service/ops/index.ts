import Koa from 'koa';
import _koaBody from 'koa-body';
import Router from 'koa-router';
import { Signer, sha256 } from '../../models/auth';

export interface Option {
  app: Koa;
  config: any;
  signer: Signer;
  requireAuthorization: Router.IMiddleware;
  scopeMiddleware: (...scopes: string[]) => Router.IMiddleware;
}

export default function createService({
  config,
  signer,
  requireAuthorization,
  scopeMiddleware,
}: Option): Router {
  const service = Service(config.credential, signer);
  const controller = Controller(service);

  const router = new Router({
    prefix: '/v1/ops',
  });

  router.post(
    '/authorize',
    requireAuthorization,
    scopeMiddleware('ops'),
    controller.postAuthorize,
  );
  router.post('/register', controller.postRegister);
  return router;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  accessToken: string;
}

export interface IController {
  postRegister(ctx: Koa.Context): void;
  postAuthorize(ctx: Koa.Context): void;
}

export function Controller(service: IService): IController {
  async function postRegister(ctx: Koa.Context) {
    const { username, password } = ctx.request.body;
    ctx.body = await service.register({ username, password });
  }

  function postAuthorize(ctx: Koa.Context) {
    ctx.body = { success: true };
  }

  return Object.freeze({
    postRegister,
    postAuthorize,
  });
}

export interface IService {
  register(req: RegisterRequest): Promise<RegisterResponse>;
}

// If the service is a class, it can extend the EventEmitter.
export function Service(credential: string, signer: Signer) {
  async function register({
    username,
    password,
  }: RegisterRequest): Promise<RegisterResponse> {
    const hashed = sha256([username, password].join(':'));
    if (credential !== hashed) {
      throw new Error('username or password is incorrect');
    }
    return {
      accessToken: await signer.sign({ scope: 'ops' }),
    };
  }

  return Object.freeze({
    register,
  });
}
