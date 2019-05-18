import jwt from 'jsonwebtoken';

export interface Signer {
  sign(obj: any, duration?: string): Promise<string>;
  verify(token: string): Promise<any>;
}

export function Signer(secret: string) {
  async function sign(obj: any, duration = '1h'): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        obj,
        secret,
        { expiresIn: duration },
        (err: Error, token: string) => {
          err ? reject(err) : resolve(token);
        },
      );
    });
  }

  async function verify(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err: Error, decoded: any) => {
        err ? reject(err) : resolve(decoded);
      });
    });
  }

  return Object.freeze({
    sign,
    verify,
  });
}
