import { OrdenesResponseInvalid } from '@flash-ws/api-interfaces';
import {
  Cliente,
  dataSource,
  inicializarCencosud,
  Local,
  UnidadNegocio,
} from '@flash-ws/dao';
import { ClienteService } from '@flash-ws/worker';
import * as fs from 'fs';
import request = require('supertest');
import { app } from '../app/index';

const path = 'fixtures/orden-una-linea.xls';
const file = fs.readFileSync(path);

const unaLineaSinProducto = fs.readFileSync(
  'fixtures/prod-sin-codigo.xlsx'
);

beforeAll(async () => {
  await inicializarCencosud();
});

it('prueba join de cliente', async () => {
  const repoCliente = dataSource.getRepository(Cliente);
  const repoLocal = dataSource.getRepository(Local);
  const repoUnidad = dataSource.getRepository(UnidadNegocio);

  const local1 = new Local();
  local1.nombre = 'La picada';
  local1.codigo = '123456';
  // repoLocal.save(local1);

  const cliente = await ClienteService.findById(1);
  const jumbo = cliente.unidades.find((u) => u.nombre === 'Jumbo');
  jumbo.locales = [local1];

  const result = await repoUnidad.save(jumbo);
  // console.log(repoUnidad);

  const locales = await repoLocal
    .createQueryBuilder('local')
    .leftJoinAndSelect('local.unidad', 'unidad')
    .leftJoinAndSelect('unidad.cliente', 'cliente')
    .getMany();

  console.log(locales);

  expect(locales.length).toBe(1);
});

test.skip('POST file', (done) => {
  const form = new FormData();
  form.append('entry', new Blob([file]));
  request(app)
    .post('/api/v0/files/add')
    .attach('entry', form, 'readme.md')
    .expect(201, done);
});

it('Sube archivo con una orden sin errores', (done) => {
  request(app)
    .post('/api/ordenes/masivo')
    // .field('data', JSON.stringify({ name: 'coucou multipart' }))
    .field('unidad', '1')
    .attach('file', path) // Change to write handly picture path
    .set('Content-Type', 'multipart/form-data')
    .expect(200, done);
});
it('Sube orden una linea prod invalido', (done) => {
  request(app)
    .post('/api/ordenes/masivo')
    // .field('data', JSON.stringify({ name: 'coucou multipart' }))
    .field('unidad', '1')
    .attach(
      'file',
      'fixtures/orden-una-linea-prod-invalido.xls'
    ) // Change to write handly picture path
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
