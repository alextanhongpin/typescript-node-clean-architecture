export interface IConfig {
  host: string;
  port: number;
  secret: string;
  credential: string;
}

const Config = (): IConfig => {
  return {
    host: process.env.HOST || 'localhost',
    port: Number(process.env.PORT || 4040),
    secret: process.env.SECRET || 'secret',
    credential: process.env.CREDENTIAL || 'hashed credentials',
  };
};

export default Config;
