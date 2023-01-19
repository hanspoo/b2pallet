import { EstadoLinea } from '@flash-ws/api-interfaces';
import { inicializarCencosud, obtainToken, OrdenCompra } from '@flash-ws/dao';
import { crearOrdenHelper } from '@flash-ws/dao';

// import { crearProducto, crerOrdenLocal } from '@flash-ws/worker';
import request = require('supertest');
import { app } from '../app';

let orden: OrdenCompra;
let token: string;
beforeAll(async () => {
  await inicializarCencosud();
  token = await obtainToken();
  orden = await crearOrdenHelper();
});
describe('cambia estado de producto en consolidada', () => {
  it('debe dar 400 con orden inválida', async () => {
    const res = await request(app)
      .post('/api/ordenes/cambiar-estado-consolidada/0')
      .set('Authorization', `Basic ${token}`)
      .send({
        producto: 1,
        mensaje: 'test is cool',
      });
    expect(res.statusCode).toEqual(400);
    // expect(res.body).toHaveProperty('post');
  });
  it('debe dar 200 con orden valida', async () => {
    const res = await request(app)
      .post('/api/ordenes/cambiar-estado-consolidada/' + orden.id)
      .set('Authorization', `Basic ${token}`)
      .send({
        productos: [1],
        estado: EstadoLinea.Aprobada,
        mensaje: 'test is cool',
      });
    expect(res.statusCode).toEqual(200);
    // expect(res.body).toHaveProperty('post');
  });
  it('debe dar 400 cuando no va producto', async () => {
    const res = await request(app)
      .post('/api/ordenes/cambiar-estado-consolidada/' + orden.id)
      .set('Authorization', `Basic ${token}`)
      .send({
        productos: undefined,
        mensaje: 'test is cool',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.text).toBe('Debe entregar los productos');
  });
  it('debe dar 400 con producto inválido', async () => {
    const res = await request(app)
      .post('/api/ordenes/cambiar-estado-consolidada/' + orden.id)
      .set('Authorization', `Basic ${token}`)
      .send({
        productos: [-1],
        estado: EstadoLinea.Aprobada,
        mensaje: 'test is cool',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.text).toBe('Productos inválidos: -1');
  });
  it('debe dar 400 sin estado', async () => {
    const res = await request(app)
      .post('/api/ordenes/cambiar-estado-consolidada/' + orden.id)
      .set('Authorization', `Basic ${token}`)
      .send({
        productos: [1],
        estado: undefined,
      });
    expect(res.statusCode).toEqual(400);
    expect(res.text).toBe('Debe entregar el estado');
  });
  it('debe dar 400 con estado inválido', async () => {
    const res = await request(app)
      .post('/api/ordenes/cambiar-estado-consolidada/' + orden.id)
      .set('Authorization', `Basic ${token}`)
      .send({
        productos: [1],
        estado: 'abcde',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.text).toBe('Estado abcde inválido');
  });
});
