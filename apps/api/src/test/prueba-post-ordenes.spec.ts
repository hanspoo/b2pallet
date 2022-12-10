import { OrdenesResponseInvalid } from '@flash-ws/api-interfaces';
import { inicializarCencosud, obtainToken } from '@flash-ws/dao';
import * as fs from 'fs';
import request = require('supertest');
import { app } from '../app/index';

const path = 'fixtures/orden-una-linea.xls';

let token: string;

beforeAll(async () => {
  await inicializarCencosud();
  token = await obtainToken();
});

it('Sube archivo con una orden sin errores', (done) => {
  request(app)
    .post('/api/ordenes/masivo')
    .set('Authorization', `Basic ${token}`)
    // .field('data', JSON.stringify({ name: 'coucou multipart' }))
    .field('unidad', '1')
    .attach('file', path) // Change to write handly picture path
    .set('Content-Type', 'multipart/form-data')
    .expect(200, done);
});
it('Sube orden una linea prod invalido', (done) => {
  request(app)
    .post('/api/ordenes/masivo')
    .set('Authorization', `Basic ${token}`)
    // .field('data', JSON.stringify({ name: 'coucou multipart' }))
    .field('unidad', '1')
    .attach('file', 'fixtures/orden-una-linea-prod-invalido.xls') // Change to write handly picture path
    .set('Content-Type', 'multipart/form-data')
    // .expect(400, done)
    .then((response) => {
      const { msg, productosNoEncontrados } =
        response.body as unknown as OrdenesResponseInvalid;
      expect(msg).toBe('Hay información inválida');
      expect(productosNoEncontrados.length).toBe(1);
      done();
    });
});
