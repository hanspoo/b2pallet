// process.env.NODE_ENV = 'dev';
import { crearArchivoValido, crearArchivoInvalido } from './utils';
import { LoaderPostBody } from '@flash-ws/api-interfaces';
import {
  Archivo,
  crearProductoPrueba,
  dataSource,
  inicializarSistema,
  obtainToken,
  OrdenCompra,
  Producto,
} from '@flash-ws/core';
import request from 'supertest';
import { app } from '../app';

let token: string;

let archValido: Archivo;
let archInvalido: Archivo;

beforeAll(async () => {
  await inicializarSistema();
  await crearProductoPrueba();
  archValido = await crearArchivoValido();
  archInvalido = await crearArchivoInvalido();
  token = await obtainToken();
});

describe('loader nuevo de ordenes', () => {
  it('exige estar logeado', async () => {
    const res = await request(app).post('/api/loader/subir');
    expect(res.status).toBe(401);
  });
  it('archivo no viene o inválido lanza error 400', async () => {
    const data: LoaderPostBody = {
      idArchivo: null,
      idFieldsMapper: 1,
    };
    const res = await request(app)
      .post('/api/loader/subir')
      .send(data)
      .set('Authorization', `Basic ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.msg).toContain('LDR001');
  });
  it('archivo id inválido lanza error 400', async () => {
    const data: LoaderPostBody = {
      idArchivo: 9999999,
      idFieldsMapper: 1,
    };
    const res = await request(app)
      .post('/api/loader/subir')
      .send(data)
      .set('Authorization', `Basic ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.msg).toContain('LDR002');
  });
  it('archivo inválido lanza error 400', async () => {
    const data: LoaderPostBody = {
      idArchivo: archInvalido.id,
      idFieldsMapper: 1,
    };
    const res = await request(app)
      .post('/api/loader/subir')
      .send(data)
      .set('Authorization', `Basic ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.msg).toContain('LDR003');
  });
  it('planilla válida, crea la orden (2)', async () => {
    const data: LoaderPostBody = {
      idArchivo: archValido.id,
      idFieldsMapper: 1,
    };
    const res = await request(app)
      .post('/api/loader/subir')
      .send(data)
      .set('Authorization', `Basic ${token}`);
    expect(res.status).toBe(200);
    const repoOrdenes = dataSource.getRepository(OrdenCompra);
    const ordenes = await repoOrdenes.find({});
    expect(ordenes.length).toBe(1);
  });
});
