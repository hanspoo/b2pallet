import { inicializarCencosud } from '@flash-ws/dao';
import { crearOrdenHelper } from '@flash-ws/test-utils';

// import { crearProducto, crerOrdenLocal } from '@flash-ws/worker';
import request = require('supertest');
import { app } from '../app';

beforeAll(async () => {
  await inicializarCencosud();
  await crearOrdenHelper();
});
it('prueba api res de cambio de estado de lineas', (done) => {
  request(app)
    .post(`/api/ordenes/cambiar-estado/1`)
    .send({
      ids: [1, 2, 3],
      estado: 'Aprobado',
    })
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(200)
    .end(function (err, res) {
      if (err) throw err;
      done();
    });
});
