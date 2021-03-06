import _ from './globals';

import { Infra } from './infra';

import { authorizer } from './middleware/authorizer';

import opsService from './service/ops';
import mathService from './service/math';

async function main(): Promise<void> {
  const infra = Infra();

  const { credential, port, host } = infra.createConfig();

  const app = infra.createApp();
  const server = infra.createServer(app);
  const signer = infra.createSigner();

  mathService(app, authorizer(signer));
  const opsRouter = opsService({ credential, signer }).createRouter();

  infra.serveRoutes(app)(opsRouter);

  server.listen(
    {
      port,
      host,
    },
    function() {
      console.log(
        `listening to port ${host}:${port}. press ctrl + c to cancel.`,
      );
    },
  );
}

main().catch(console.error);
