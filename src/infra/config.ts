export const Config = () => {
  return {
    host: process.env.HOST || 'localhost',
    port: Number(process.env.PORT || 4040),
    secret: process.env.SECRET || 'secret',
    credential: process.env.CREDENTIAL || 'hashed credentials',
  };
};

export type Config = ReturnType<typeof Config>;
