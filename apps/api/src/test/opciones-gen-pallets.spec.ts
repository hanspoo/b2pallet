import {
  BodyGenPallets,
  ICajaConsolidada,
  IPalletConsolidado,
} from '@flash-ws/api-interfaces';
import {
  Box,
  dataSource,
  inicializarCencosud,
  OrdenCompra,
  Pallet,
  ProtoPallet,
} from '@flash-ws/dao';
import { crearOrdenHelper } from '@flash-ws/test-utils';
import request = require('supertest');
import { app } from '../app/index';

let orden: OrdenCompra;
const box1 = Box.from({ largo: 121.92, ancho: 101.6, alto: 170 });
const proto1 = new ProtoPallet();
proto1.box = box1;
proto1.nombre = 'Pallet Estandard';

beforeAll(async () => {
  await inicializarCencosud();
  await dataSource.getRepository(ProtoPallet).clear();
  await dataSource.getRepository(ProtoPallet).save(proto1);
});
beforeEach(async () => {
  await dataSource.getRepository(OrdenCompra).clear();
  await dataSource.getRepository(Pallet).clear();
  orden = await crearOrdenHelper();

  // OrdenCompra.expandirCajas(orden);
});

describe('opciones generación de pallets', () => {
  describe('ordenar por peso', () => {
    it('producto pesado y producto grande, sale primero el pesado  ', async () => {
      const res = await request(app)
        .post(`/api/ordenes/${orden.id}/gen-pallets`)
        .send({ protoID: 1 })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(200);
      const o = <IPalletConsolidado[]>res.body;
      expect(o.length).toBe(1);
    });
  });
});
