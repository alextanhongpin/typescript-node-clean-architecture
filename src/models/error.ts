export class HttpError extends Error {
  constructor(props: any, public status = 400) {
    super(props);
  }
}
