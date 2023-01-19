import {
  BodyGenPallets,
  Distribuir,
  IPalletConsolidado,
  Ordenar,
} from '@flash-ws/api-interfaces';
import {
  Box,
  dataSource,
  Empresa,
  inicializarCencosud,
  obtainToken,
  OrdenCompra,
  Pallet,
  Producto,
  ProtoPallet,
} from '@flash-ws/dao';
import { crearOrdenHelper } from '@flash-ws/dao';

import supertest from 'supertest';
import { app } from '../app';
/**
 * API REST de parámetros para generación de pallets
 */

// public config?: { ordenar?: Ordenar; distribuir?: Distribuir }

/**
 * Nuestro fixture son dos productos que cada uno ocupa un pallet.
 */
let orden: OrdenCompra;
let proto: ProtoPallet;

const grande = new Box({
  largo: 100,
  ancho: 120,
  alto: 170,
});
const chica = new Box({
  largo: 99,
  ancho: 120,
  alto: 170,
});

const pesado = {
  id: 1,
  nombre: 'Bandeja Diseño Ely Chica',
  codigo: 'CT-01005430',
  peso: 1950,
  codCenco: '1651844',
  vigente: true,
  box: chica,
};

const liviano = {
  id: 2,
  nombre: 'Piñata Ely',
  codigo: 'ELY-20013',
  peso: 500,
  codCenco: '282480',
  vigente: true,
  box: grande,
};

let token: string;

beforeAll(async () => {
  await inicializarCencosud();
  token = await obtainToken();
  orden = await crearOrdenHelper(2);
  const box = new Box({
    largo: 100,
    ancho: 120,
    alto: 170,
  });

  const e = await dataSource
    .getRepository(Empresa)
    .findOne({ where: { nombre: 'b2pallet' } });

  const p = new ProtoPallet(box);
  p.empresa = e;

  p.nombre = 'Pallet Standard';
  proto = await dataSource.getRepository(ProtoPallet).save(p);

  const prod1 = await dataSource.getRepository(Producto).save(pesado);
  const prod2 = await dataSource.getRepository(Producto).save(liviano);

  orden.lineas[0].producto = prod1;
  orden.lineas[1].producto = prod2;

  orden = await dataSource.getRepository(OrdenCompra).save(orden);
});

describe('parámetros generacion pallets', () => {
  describe('ordenar', () => {
    it('funciona sin caer', async () => {
      const params: BodyGenPallets = {
        protoID: proto.id,
        ordenar: Ordenar.PESO,
        distribuir: Distribuir.HORIZONTAL,
      };
      const response = await supertest(app)
        .post(`/api/ordenes/${orden.id}/gen-pallets`)
        .set('Authorization', `Basic ${token}`)
        .send(params);
      expect(response.status).toEqual(200);
    });
    it('criterio de orden peso, caja más pesadas primero', async () => {
      // process.env['DEBUG'] = '1';
      const params: BodyGenPallets = {
        protoID: proto.id,
        ordenar: Ordenar.PESO,
        distribuir: Distribuir.HORIZONTAL,
      };
      const response = await supertest(app)
        .post(`/api/ordenes/${orden.id}/gen-pallets`)
        .set('Authorization', `Basic ${token}`)
        .send(params);

      const pallets: IPalletConsolidado[] = response.body;
      expect(pallets.length).toBe(2);

      const primerPallet = await dataSource.getRepository(Pallet).findOne({
        where: { id: pallets[0].palletid },
        relations: ['cajas', 'cajas.linea', 'cajas.linea.producto'],
      });
      expect(primerPallet.cajas.length).toBe(1);
      expect(primerPallet.cajas[0].linea.producto.peso).toBe(1950);
    });
    it('criterio de orden volumen, caja más grandes primero', async () => {
      process.env['DEBUG'] = '1';
      const params: BodyGenPallets = {
        protoID: proto.id,
        ordenar: Ordenar.VOLUMEN,
        distribuir: Distribuir.HORIZONTAL,
      };
      const response = await supertest(app)
        .post(`/api/ordenes/${orden.id}/gen-pallets`)
        .set('Authorization', `Basic ${token}`)
        .send(params);

      const pallets: IPalletConsolidado[] = response.body;
      expect(pallets.length).toBe(2);

      const primerPallet = await dataSource.getRepository(Pallet).findOne({
        where: { id: pallets[0].palletid },
        relations: ['cajas', 'cajas.linea', 'cajas.linea.producto'],
      });
      expect(primerPallet.cajas.length).toBe(1);
      expect(primerPallet.cajas[0].linea.producto.peso).toBe(500);
    });
  });
});
