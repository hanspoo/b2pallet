import {
  BodyGenPallets,
  ICajaConsolidada,
  IPalletConsolidado,
} from '@flash-ws/api-interfaces';
import {
  Box,
  dataSource,
  Empresa,
  inicializarCencosud,
  obtainToken,
  OrdenCompra,
  Pallet,
  ProtoPallet,
} from '@flash-ws/dao';
import { crearOrdenHelper } from '@flash-ws/dao';
import request = require('supertest');
import { app } from '../app/index';

let orden: OrdenCompra;
const box1 = Box.from({ largo: 121.92, ancho: 101.6, alto: 170 });

let proto1 = new ProtoPallet();
proto1.box = box1;
proto1.nombre = 'Pallet Estandard';
let token: string;

beforeAll(async () => {
  await inicializarCencosud();
  token = await obtainToken();
  await dataSource.getRepository(ProtoPallet).clear();
  const e = await dataSource
    .getRepository(Empresa)
    .findOne({ where: { nombre: 'b2pallet' } });
  proto1.empresa = e;
  proto1 = await dataSource.getRepository(ProtoPallet).save(proto1);
});
beforeEach(async () => {
  await dataSource.getRepository(OrdenCompra).clear();
  await dataSource.getRepository(Pallet).clear();
  orden = await crearOrdenHelper();

  // OrdenCompra.expandirCajas(orden);
});

describe('generación de pallets', () => {
  it('una orden una línea, un pallet, proto pallet valido', async () => {
    const res = await request(app)
      .post(`/api/ordenes/${orden.id}/gen-pallets`)
      .set('Authorization', `Basic ${token}`)
      .send({ protoID: proto1.id })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
    const o = <IPalletConsolidado[]>res.body;
    expect(o.length).toBe(1);
  });
  it('asigna desde la hu entregada', async () => {
    const body: BodyGenPallets = { protoID: proto1.id, nextHU: 10000 };
    const res = await request(app)
      .post(`/api/ordenes/${orden.id}/gen-pallets`)
      .set('Authorization', `Basic ${token}`)
      .send(body)
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
    const o = <IPalletConsolidado[]>res.body;
    expect(o.length).toBe(1);
    expect(o[0].hu).toBe(10000);
  });
  it('pallet no existe debe dar 404', async () => {
    const res = await request(app).get(`/api/pallets/123456789`);
    expect(res.status).toBe(404);
  });
});
