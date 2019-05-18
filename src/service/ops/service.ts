import { sha256 } from '../../module/crypto';
import { Signer } from '../../module/signer';
import { HttpStatusUnauthorized } from '../../module/http';
import { RegisterRequest, RegisterResponse } from './interface';

// If the service is a class, it can extend the EventEmitter.
export function Service(credential: string, signer: Signer) {
  async function register({
    username,
    password,
  }: RegisterRequest): Promise<RegisterResponse> {
    const hashed = sha256([username, password].join(':'));
    if (credential !== hashed) {
      throw HttpStatusUnauthorized('username or password is incorrect');
    }
    return {
      accessToken: await signer.sign({ scope: 'ops' }),
    };
  }

  return Object.freeze({
    register,
  });
}

export type Service = ReturnType<typeof Service>;
