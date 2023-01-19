// process.env.NODE_ENV = 'dev';
import {
  Archivo,
  crearOrdenHelper,
  inicializarCencosud,
  OrdenCompra,
} from '@flash-ws/dao';
import request from 'supertest';
import { app } from '../app';

let token: string;

let archValido: Archivo;
let archInvalido: Archivo;

let orden: OrdenCompra;

beforeAll(async () => {
  await inicializarCencosud();
  orden = await crearOrdenHelper();
});

describe('pdf con etiquetas de pallets', () => {
  it('sin token debe dar 401', async () => {
    const url = '/api/ordenes/f793cad5-490a-41ef-9d9f-bec34737f868/etiquetas';
    const res = await request(app).get(url);

    expect(res.status).toBe(401);
  });
  describe('etiquetas de productos', () => {
    it('etiquetas de productos responde ok', async () => {
      const url = `/api/files/${orden.id}/etiquetas/1`;
      const res = await request(app).get(url);

      expect(res.status).toBe(200);
    });
  });
});
