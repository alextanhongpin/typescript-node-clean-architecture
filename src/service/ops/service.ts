import { Signer, sha256 } from '../../models/auth'
import { HttpStatusUnauthorized } from '../../models/error'
import { RegisterRequest, RegisterResponse } from './interface'

// If the service is a class, it can extend the EventEmitter.
export default function Service(credential: string, signer: Signer) {

  async function register({ username, password }: RegisterRequest)
		: Promise<RegisterResponse> {
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

