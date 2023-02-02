import { LoaderPostBody } from '@flash-ws/api-interfaces';
import { Archivo, inicializarSistema, obtainToken } from '@flash-ws/core';
import request, { Response } from 'supertest';
import { app } from '../app';
import { crearArchivoValido } from './utils';

let archivo: Archivo, token: string;
beforeAll(async () => {
  await inicializarSistema();
  archivo = await crearArchivoValido();
  token = await obtainToken();
});

describe('requiere mapper de campos', () => {
  it('postea sin maper da error 400', async () => {
    const body: LoaderPostBody = {
      idArchivo: archivo.id,
      idFieldsMapper: undefined,
    };

    const response: Response = await request(app)
      .post('/api/loader/subir')
      .set(`Authorization`, `Bearer ${token}`)
      .send(body);

    expect(response.body.msg).toBe('LDR011: No viene el id del fieldsMapper');
    expect(response.status).toBe(400);
  });
  it('postea con mapper inválido da error 400', async () => {
    const idFieldsMapper = 999;

    const body: LoaderPostBody = {
      idArchivo: archivo.id,
      idFieldsMapper,
    };

    const response: Response = await request(app)
      .post('/api/loader/subir')
      .set(`Authorization`, `Bearer ${token}`)
      .send(body);

    expect(response.body.msg).toBe(`LDR010: Fields mapper 999 no encontrado`);
    expect(response.status).toBe(400);
  });
});
