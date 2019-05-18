import crypto from 'crypto';

export function sha256(ciphertext: string): string {
  // echo -n username:password | shasum -a 256
  return crypto
    .createHash('sha256')
    .update(ciphertext, 'utf8')
    .digest('hex');
}
