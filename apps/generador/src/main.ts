import { Cliente, dataSource, Producto, UnidadNegocio } from '@flash-ws/core';

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

  const repo = await dataSource.getRepository(Cliente);

  const cencosud = new Cliente();

  cencosud.nombre = 'Cencosud';

  const jumbo = new UnidadNegocio();
  jumbo.cliente = cencosud;
  jumbo.nombre = 'jumbo';

  const sisa = new UnidadNegocio();
  sisa.cliente = cencosud;
  sisa.nombre = 'Sisa';

  cencosud.unidades = [jumbo, sisa];

  repo.save(cencosud);
  repo.save(sisa);
  repo.save(jumbo);
}

f();
