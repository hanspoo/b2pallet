import { Cliente, inicializarCencosud, UnidadNegocio } from '@flash-ws/dao';
import { LocalesService } from '../lib/LocalesService';

let cliente: Cliente;
let sisa: UnidadNegocio;

beforeAll(async () => {
  cliente = await inicializarCencosud();
  sisa = cliente.unidades.find((u) => (u.nombre = 'Sisa'));
  // });
  // describe('Prueba fixture local', () => {
  //   it('Crea cliente', () => {
  //     expect(cliente).toBeTruthy();
  //   });
});

describe('LocalesService', () => {
  it('debe haber creado el local', async () => {
    await new LocalesService(sisa).crearLocalesNuevos(
      'libs/worker/src/test/fixtures/orden-una-linea.xls'
    );
    expect(sisa.locales.length).toBe(1);
  });
  it('debe haber creado los 190', async () => {
    await new LocalesService(sisa).crearLocalesNuevos(
      'libs/worker/src/test/fixtures/b2b.xls'
    );
    expect(sisa.locales.length).toBe(190);
  });
});
