export class HttpError extends Error {
  constructor(props: any, public status = 400) {
    super(props);
  }
}

export function HttpStatusUnauthorized(message: string): HttpError {
  return new HttpError(message, 401);
}

export function HttpStatusBadRequest(message: string): HttpError {
  return new HttpError(message);
}
