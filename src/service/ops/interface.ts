import Koa from 'koa'

export interface IController {
  postRegister(ctx: Koa.Context): void;
  postAuthorize(ctx: Koa.Context): void;
	getHealth(ctx: Koa.Context): void
}

export interface IService {
  register(req: RegisterRequest): Promise<RegisterResponse>;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  accessToken: string;
}
