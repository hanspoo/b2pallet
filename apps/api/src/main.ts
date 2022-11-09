import * as dotenv from 'dotenv';
dotenv.config();
import { Box, dataSource, ProtoPallet } from '@flash-ws/dao';
import { app } from './app';

async function f() {
  await dataSource
    .initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .catch((err) => {
      console.error('Error during Data Source initialization:', err);
    });

  await inicializarProtoPallet();

  const port = process.env['NX_PORT'] || 3333;
  const server = app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/api');
  });
  server.on('error', console.error);
}

f();

async function inicializarProtoPallet() {
  const repo = dataSource.getRepository(ProtoPallet);
  const p = await repo.findOne({ where: { id: 1 } });
  if (!p) {
    const proto = new ProtoPallet();
    proto.box = Box.from({ largo: 100, ancho: 120, alto: 170 });
    proto.nombre = 'Standard Pallet';
    await repo.save(proto);
  }
}
