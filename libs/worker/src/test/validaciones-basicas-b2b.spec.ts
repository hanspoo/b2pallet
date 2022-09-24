import { Cliente, UnidadNegocio } from '@flash-ws/dao';
import { OrdenService } from '../lib/OrdenService';

// cada cliente tiene una columna de productos para hacer el match
// en el caso de Cencosud es codCenco de entidad productos.

let cliente: Cliente;
let sisa: UnidadNegocio;

beforeAll(() => {
  cliente = new Cliente();
  sisa = new UnidadNegocio();
  sisa.nombre = 'Sisa';
  sisa.locales = [];
  sisa.cliente = cliente;

  cliente.unidades = [sisa];
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
        'libs/worker/src/test/fixtures/b2b.xls'
      );
    });
    describe('excepciones archivo inválido ', () => {
      it('archivo vacio', async () => {
        const f = async () =>
          await new OrdenService(sisa).crearOrden(
            'libs/worker/src/test/fixtures/vacio.xls'
          );
        await expect(f()).rejects.toThrow('Archivo vacio');
      });
      it('archivo inválido', async () => {
        const f = async () =>
          await new OrdenService(sisa).crearOrden(
            'libs/worker/src/test/fixtures/invalido.xls'
          );
        await expect(f()).rejects.toThrow('Archivo no es excel');
      });
      it('archivo faltan columnas', async () => {
        const f = () =>
          new OrdenService(sisa).crearOrden(
            'libs/worker/src/test/fixtures/excel-vacio.xls'
          );
        await expect(f()).rejects.toThrow('Planilla inválida');
      });
      it('archivo sin datos en columnas', async () => {
        const f = () =>
          new OrdenService(sisa).crearOrden(
            'libs/worker/src/test/fixtures/sin-codigo-cenco.xls'
          );
        await expect(f()).rejects.toThrow('Planilla faltan datos críticos');
      });
      it('archivo sin local', async () => {
        const f = () =>
          new OrdenService(sisa).crearOrden(
            'libs/worker/src/test/fixtures/sin-local.xls'
          );
        await expect(f()).rejects.toThrow('Planilla faltan datos críticos');
      });
      it('archivo sin cantidad', async () => {
        const f = async () =>
          await new OrdenService(sisa).crearOrden(
            'libs/worker/src/test/fixtures/sin-cantidad.xls'
          );
        await expect(f()).rejects.toThrow(
          'No metadata for "Producto" was found.'
        );
      });
    });
  });
});
