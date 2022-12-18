import {
  crearArchivoValido,
  crearArchivoInvalido,
  getProtoPallet,
} from './utils';
import { LoaderPostBody } from '@flash-ws/api-interfaces';
import { Archivo, inicializarCencosud, obtainToken } from '@flash-ws/dao';
import request from 'supertest';
import { app } from '../app';

let token: string;

let archValido: Archivo;
let archInvalido: Archivo;

beforeAll(async () => {
  await inicializarCencosud();
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
    };
    const res = await request(app)
      .post('/api/loader/subir')
      .send(data)
      .set('Authorization', `Basic ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.msg).toContain('LDR003');
  });
  it('planilla válida, crea la orden', async () => {
    const data: LoaderPostBody = {
      idArchivo: archValido.id,
    };
    const res = await request(app)
      .post('/api/loader/subir')
      .send(data)
      .set('Authorization', `Basic ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.ordenes.length).toBe(1);
  });
});
