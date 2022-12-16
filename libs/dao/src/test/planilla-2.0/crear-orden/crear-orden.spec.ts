import xlsx from 'node-xlsx';
import { dataSource, Local, Producto, UnidadNegocio } from '../../..';

import { Cliente } from '../../../lib/entity/cliente.entity';
import { OrdenCompra } from '../../../lib/entity/orden-compra.entity';
import { ProcesadorPlanilla } from '../../../lib/parser-2.0/ProcesadorPlanilla';
import { config } from '../columnas-parametricas/config-campos-cenco';
import { OrdenCreator } from '../../../lib/parser-2.0/OrdenCreator';

beforeAll(async () => {
  if (!dataSource.isInitialized) await dataSource.initialize();
  const repoProd = dataSource.getRepository(Producto);
  await repoProd.save(
    repoProd.create({
      codCenco: '1647753',
      codigo: 'KP-TOOTH -1.6*65MM',
      nombre: 'Bolsa mondadientes 100un',
      peso: 1,
    })
  );
});
beforeEach(async () => {
  await dataSource.getRepository(OrdenCompra).clear();
  await dataSource.getRepository(Local).clear();
  await dataSource.getRepository(UnidadNegocio).clear();
  await dataSource.getRepository(Cliente).clear();
});

describe('Usando el procesador de planillas crea toda la estructura', () => {
  it('crea la orden', async () => {
    const ws = xlsx.parse(`fixtures/orden-una-linea.xls`);

    const procesador = new ProcesadorPlanilla(config);

    const result = await procesador.procesar(ws[0]);
    const { ordenes } = await OrdenCreator.fromProcesador(result);

    expect(ordenes[0].numero).toBe('5575426472');
  });
  it('le asigna el cliente', async () => {
    const ws = xlsx.parse(`fixtures/orden-una-linea.xls`);

    const procesador = new ProcesadorPlanilla(config);

    const result = await procesador.procesar(ws[0]);
    const { ordenes } = await OrdenCreator.fromProcesador(result);
    expect(ordenes[0].cliente).toBeTruthy();
    expect(ordenes[0].cliente.identLegal).toBe('C001');
    expect(ordenes[0].cliente.nombre).toBe('CENCOSUD RETAIL S.A.');
  });
  it('crea unidad de negocio ', async () => {
    const ws = xlsx.parse(`fixtures/orden-una-linea.xls`);
    const procesador = new ProcesadorPlanilla(config);
    const result = await procesador.procesar(ws[0]);

    const { ordenes } = await OrdenCreator.fromProcesador(result);
    expect(ordenes[0].cliente.unidades[0].nombre).toBe('Sisa');
  });
  it('crea la unidad con su local', async () => {
    const ws = xlsx.parse(`fixtures/orden-una-linea.xls`);
    const procesador = new ProcesadorPlanilla(config);
    const result = await procesador.procesar(ws[0]);

    const { ordenes } = await OrdenCreator.fromProcesador(result);
    expect(ordenes[0].cliente.unidades[0].locales[0].codigo).toBe('N524');
  });
  it('datos de la orden: emision', async () => {
    const ws = xlsx.parse(`fixtures/orden-una-linea.xls`);
    const procesador = new ProcesadorPlanilla(config);
    const result = await procesador.procesar(ws[0]);

    const { ordenes } = await OrdenCreator.fromProcesador(result);
    expect(ordenes[0].emision).toBe('15-09-2022');
  });
  it('datos de la orden: entrega', async () => {
    const ws = xlsx.parse(`fixtures/orden-una-linea.xls`);
    const procesador = new ProcesadorPlanilla(config);
    const result = await procesador.procesar(ws[0]);

    const { ordenes } = await OrdenCreator.fromProcesador(result);
    expect(ordenes[0].entrega).toBe('22-09-2022');
  });
});

describe('Usando el procesador de planillas crea toda la estructura', () => {
  it('campos líneas de detalle: cantidad', async () => {
    const ws = xlsx.parse(`fixtures/orden-una-linea.xls`);
    const procesador = new ProcesadorPlanilla(config);
    const result = await procesador.procesar(ws[0]);

    const { ordenes } = await OrdenCreator.fromProcesador(result);
    const linea = ordenes[0].lineas[0];
    expect(linea.cantidad).toBe(1);
  });
  it('si no hemos creado el producto el creador manda errores', async () => {
    await dataSource.getRepository(Producto).clear();
    const ws = xlsx.parse(`fixtures/orden-una-linea.xls`);
    const procesador = new ProcesadorPlanilla(config);
    const result = await procesador.procesar(ws[0]);

    const { errores } = await OrdenCreator.fromProcesador(result);
    expect(errores.length).toBe(1);
  });
});
