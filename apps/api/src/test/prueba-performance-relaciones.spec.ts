'debe devolver sólo las líneas de detalle modificadas';
import {
  dataSource,
  inicializarCencosud,
  obtainToken,
  OrdenCompra,
} from '@flash-ws/core';
import { crearOrdenHelper } from '@flash-ws/core';
import request = require('supertest');
import { app } from '../app';

let token: string;

beforeAll(async () => {
  await inicializarCencosud();
  token = await obtainToken();
});
// ('una orden con dos líneas, sólo debe devolver la modificada');

it.skip('Prueba de performance join en relaciones', async function () {
  const orden = await crearOrdenHelper(5000);
  const response = await request(app)
    .post('/api/ordenes/cambiar-estado/1')
    .set('Authorization', `Basic ${token}`)
    .send({ ids: [1], estado: 'Rechazada' });

  await (async () => {
    const d1 = new Date();
    await dataSource
      .getRepository(OrdenCompra)
      .findOne({ where: { id: orden.id } });
    const d2 = new Date();
    console.log('sola ' + (d2.getTime() - d1.getTime()) / 1000);
  })();

  await (async () => {
    const d1 = new Date();
    await dataSource.getRepository(OrdenCompra).findOne({
      where: { id: orden.id },
      relations: { lineas: true, unidad: false },
    });
    const d2 = new Date();
    console.log('con lineas ' + (d2.getTime() - d1.getTime()) / 1000);
  })();
  await (async () => {
    const d1 = new Date();
    await dataSource.getRepository(OrdenCompra).findOne({
      where: { id: orden.id },
      relations: { lineas: true, unidad: true },
    });
    const d2 = new Date();
    console.log('con lineas y unidad ' + (d2.getTime() - d1.getTime()) / 1000);
  })();

  expect(response.status).toEqual(200);
});
