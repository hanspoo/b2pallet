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
    const p1 = new ProtoPallet();
    p1.box = Box.from({ largo: 100, ancho: 120, alto: 170 });
    p1.nombre = 'Standard Pallet';
    await repo.save(p1);
    const p2 = new ProtoPallet();
    p2.box = Box.from({ largo: 100, ancho: 100, alto: 100 });
    p2.nombre = 'Pallet 1m3';
    await repo.save(p2);
  }
}
