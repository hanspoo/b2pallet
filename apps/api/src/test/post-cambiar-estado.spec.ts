'debe devolver sólo las líneas de detalle modificadas';
import {
  dataSource,
  inicializarCencosud,
  obtainToken,
  OrdenCompra,
} from '@flash-ws/dao';
import { crearOrdenHelper } from '@flash-ws/dao';
import { OrdenService } from '@flash-ws/worker';
import request = require('supertest');
import { app } from '../app';

let token: string;
beforeAll(async () => {
  await inicializarCencosud();
  token = await obtainToken();
  await dataSource.getRepository(OrdenCompra).clear();
});
// ('una orden con dos líneas, sólo debe devolver la modificada');

describe('POST /api/ordenes/cambiar-estado/1', function () {
  it('si la orden no existe debe dar 404', async function () {
    const response = await request(app)
      .post('/api/ordenes/cambiar-estado/16a15f00-b469-44f1-b7bc-d9fe2591d74b')
      .set('Authorization', `Basic ${token}`)
      .send({ ids: [1], estado: 'Rechazada' });
    expect(response.status).toEqual(404);
  });
  it('si insertamos la orden debe dar 200', async function () {
    const orden = await crearOrdenHelper(1);
    const response = await request(app)
      .post('/api/ordenes/cambiar-estado/' + orden.id)
      .set('Authorization', `Basic ${token}`)
      .send({ ids: [1], estado: 'Rechazada' });

    expect(response.status).toEqual(200);
  });
});
