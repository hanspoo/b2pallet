import { dataSource, inicializarCencosud, OrdenCompra } from '@flash-ws/dao';
import request = require('supertest');
import { app } from '../app';

beforeAll(async () => {
  await inicializarCencosud();
});

describe('file upload', () => {
  it('debe dar 400 si no mandamos archivo', async () => {
    const response = await request(app)
      .post('/api/archivos')
      .send({ file: undefined });
    expect(response.status).toEqual(400);
  });
  //   it('debe dar 400 si no mandamos archivo', async () => {
  //     const response = await request(app)
  //       .post('/api/archivos')
  //       .send({ file: undefined });
  //     expect(response.status).toEqual(404);
  //   });
});
