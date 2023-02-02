import { Cliente, UnidadNegocio, inicializarCencosud } from '@flash-ws/core';
import { OrdenService } from '../lib/OrdenService';
import { ClienteService } from '../lib/ClienteService';

// cada cliente tiene una columna de productos para hacer el match
// en el caso de Cencosud es codCenco de entidad productos.

let sisa: UnidadNegocio;

beforeAll(async () => {
  await inicializarCencosud();
  const cliente = await ClienteService.findById(1);
  sisa = cliente.unidades.find((u) => u.nombre === 'Sisa');
});
describe('worker', () => {
  describe('cargador de ordenes ', () => {
    it('lanza excepción si archivo no existe ', async () => {
      const f = async () => {
        await new OrdenService(sisa).crearOrden('/tmp/a.xls');
      };
      expect(f()).rejects.toThrow('Archivo no existe');
    });
    it.skip('sin excepción con archivo valido ', () => {
      new OrdenService(sisa).crearOrden(
        'fixtures/b2b.xls'
      );
    });
    describe('excepciones archivo inválido ', () => {
      it('archivo vacio', async () => {
        const f = async () =>
          await new OrdenService(sisa).crearOrden(
            'fixtures/vacio.xls'
          );
        await expect(f()).rejects.toThrow('Archivo vacio');
      });
      it('archivo inválido', async () => {
        const f = async () =>
          await new OrdenService(sisa).crearOrden(
            'fixtures/invalido.xls'
          );
        await expect(f()).rejects.toThrow('Archivo no es excel');
      });
      it('archivo faltan columnas', async () => {
        const f = () =>
          new OrdenService(sisa).crearOrden(
            'fixtures/excel-vacio.xls'
          );
        await expect(f()).rejects.toThrow('Planilla inválida');
      });
      it('archivo sin datos en columnas', async () => {
        const f = () =>
          new OrdenService(sisa).crearOrden(
            'fixtures/sin-codigo-cenco.xls'
          );
        await expect(f()).rejects.toThrow('Planilla faltan datos críticos');
      });
      it('archivo sin local', async () => {
        const f = () =>
          new OrdenService(sisa).crearOrden(
            'fixtures/sin-local.xls'
          );
        await expect(f()).rejects.toThrow('Planilla faltan datos críticos');
      });
      it('archivo sin cantidad', async () => {
        const f = async () =>
          await new OrdenService(sisa).crearOrden(
            'fixtures/sin-cantidad.xls'
          );
        await expect(f()).rejects.toThrow('Planilla faltan datos críticos');
      });
    });
  });
});
