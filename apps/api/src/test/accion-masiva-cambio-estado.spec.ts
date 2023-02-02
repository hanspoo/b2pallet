// process.env.NODE_ENV = 'dev';
import { CambiarEstadoBody, EstadoLinea } from '@flash-ws/api-interfaces';
import { inicializarCencosud, obtainToken, OrdenCompra } from '@flash-ws/core';
import { crearOrdenHelper } from '@flash-ws/core';

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
  const body: CambiarEstadoBody = {
    ids: [1, 2, 3],
    estado: EstadoLinea.Aprobada,
  };
  const response = await request(app)
    .post(`/api/ordenes/cambiar-estado/${orden.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send(body)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
  expect(response.status).toBe(200);
});
