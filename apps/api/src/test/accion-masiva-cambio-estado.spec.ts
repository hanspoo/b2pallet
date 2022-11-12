import { inicializarCencosud, OrdenCompra } from '@flash-ws/dao';
import { crearOrdenHelper } from '@flash-ws/test-utils';

// import { crearProducto, crerOrdenLocal } from '@flash-ws/worker';
import request = require('supertest');
import { app } from '../app';

let orden: OrdenCompra;

beforeAll(async () => {
  await inicializarCencosud();
  orden = await crearOrdenHelper(3);
});
it.skip('prueba api res de cambio de estado de lineas', async () => {
  const response = await request(app)
    .post(`/api/ordenes/cambiar-estado/${orden.id}`)
    .send({
      ids: [1, 2, 3],
      estado: 'Aprobado',
    })
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
  expect(response.status).toBe(200);
});
