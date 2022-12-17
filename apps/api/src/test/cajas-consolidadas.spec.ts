import { IConsolidadoCajas } from '@flash-ws/api-interfaces';
import {
  dataSource,
  inicializarCencosud,
  obtainToken,
  OrdenCompra,
} from '@flash-ws/dao';
import { crearOrdenHelper } from '@flash-ws/dao';
import request = require('supertest');
import { app } from '../app/index';

let orden: OrdenCompra;

let token: string;
beforeAll(async () => {
  await inicializarCencosud();
  token = await obtainToken();
});
beforeEach(async () => {
  await dataSource.getRepository(OrdenCompra).clear();
  orden = await crearOrdenHelper();
});

describe('cajas consolidadas', () => {
  it('una orden una línea, un pallet, proto pallet valido', async () => {
    const res = await request(app)
      .get(`/api/ordenes/${orden.id}/pallets-cajas`)
      .set('Authorization', `Basic ${token}`)
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
    const o = <IConsolidadoCajas[]>res.body;
    expect(o.length).toBe(0);
  });
});
