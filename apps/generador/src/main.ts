import { dataSource, Producto } from '@flash-ws/dao';

async function f() {
  await dataSource
    .initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .catch((err) => {
      console.error('Error during Data Source initialization:', err);
    });

  const prods = await dataSource.getRepository(Producto).find();
  const p = prods[0];
  const all = Object.keys(p).map((key) => ({
    title: key,
    dataIndex: key,
  }));

  console.log('[' + all.map((obj) => JSON.stringify(obj)).join(',') + ']');
}

f();
