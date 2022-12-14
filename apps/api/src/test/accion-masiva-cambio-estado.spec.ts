import { inicializarCencosud, obtainToken, OrdenCompra } from '@flash-ws/dao';
import { crearOrdenHelper } from '@flash-ws/dao';

// import { crearProducto, crerOrdenLocal } from '@flash-ws/worker';
import request = require('supertest');
import { app } from '../app';

let orden: OrdenCompra;
let token: string;

beforeAll(async () => {
  await inicializarCencosud();
  token = await obtainToken();
  orden = await crearOrdenHelper(3);
});
it('prueba api res de cambio de estado de lineas', async () => {
  const response = await request(app)
    .post(`/api/ordenes/cambiar-estado/${orden.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      ids: [1, 2, 3],
      estado: 'Aprobado',
    })
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
  expect(response.status).toBe(200);
});
