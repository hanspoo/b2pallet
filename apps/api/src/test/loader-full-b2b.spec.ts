// process.env.NODE_ENV = 'dev';
import { LoaderPostBody } from '@flash-ws/api-interfaces';
import {
  Archivo,
  dataSource,
  Empresa,
  inicializarSistema,
  obtainToken,
  OrdenCompra,
  ProductoService,
} from '@flash-ws/dao';
import request from 'supertest';
import { app } from '../app';

let token: string;
let archValido: Archivo;

const repoArchivo = dataSource.getRepository(Archivo);
beforeAll(async () => {
  const empresa = await inicializarSistema();
  token = await obtainToken();

  const archivo = {
    originalname: 'b2b.xls',
    mimetype: 'application/vnd.ms-excel',
    destination: '/home/julian/embarcadero/uploads',
    filename: '5d3b12762f0a5879d7e6be12d62c4154',
    path: '/home/julian/embarcadero/b2b-alone/fixtures/b2b.xls',
    size: 665088,
  };

  archValido = await repoArchivo.save({ ...archivo });

  const service = new ProductoService(empresa);
  await service.cargarPlanilla(
    '/home/julian/embarcadero/b2b-alone/fixtures/productos.xlsx'
  );
});

describe('loader nuevo de ordenes', () => {
  it('planilla válida, crea la orden (1)', async () => {
    const data: LoaderPostBody = {
      idArchivo: archValido.id,
    };
    const res = await request(app)
      .post('/api/loader/subir')
      .send(data)
      .set('Authorization', `Basic ${token}`);
    expect(res.status).toBe(200);
    const repoOrdenes = dataSource.getRepository(OrdenCompra);
    const ordenes = await repoOrdenes.find({});
    expect(ordenes.length).toBe(2);
  });
});
