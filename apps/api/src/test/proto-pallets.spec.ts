import { AddProtoPalletArgs } from '@flash-ws/api-interfaces';
import { inicializarCencosud, obtainToken } from '@flash-ws/core';
import request from 'supertest';
import { app } from '../app';

const proto: AddProtoPalletArgs = {
  nombre: 'My Pallet',
  box: { largo: 100, ancho: 140, alto: 180 },
};
let token: string;

beforeAll(async () => {
  await inicializarCencosud();
  token = await obtainToken();
});

describe('proto pallets', () => {
  it('existe el endpoint', async () => {
    const res = await request(app)
      .get('/api/proto-pallets')
      .set('Authorization', `Basic ${token}`);
    expect(res.status).toBe(200);
  });
  it('agrega proto pallet', async () => {
    const res = await request(app)
      .post('/api/proto-pallets')
      .send(proto)
      .set('Authorization', `Basic ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('My Pallet');
  });
});
