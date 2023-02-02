/**
 * @group integ
 */
import {
  Cliente,
  inicializarCencosud,
  UnidadNegocio,
  dataSource,
} from '@flash-ws/core';
import { LocalesService } from '../lib/LocalesService';
import { ClienteService } from '../lib/ClienteService';

let cliente: Cliente;

beforeAll(async () => {
  await inicializarCencosud();

  // });
  // describe('Prueba fixture local', () => {
  //   it('Crea cliente', () => {
  //     expect(cliente).toBeTruthy();
  //   });
});

describe('LocalesService', () => {
  it('debe haber creado el local', async () => {
    const sisa = await dameSisa();
    expect(sisa.locales.length).toBe(0);

    await new LocalesService(sisa).crearLocalesNuevos(
      'fixtures/orden-una-linea.xls'
    );
    const service = new ClienteService(cliente);
    expect((await service.findLocales()).length).toBe(1);
  });
  it('debe haber creado los 190', async () => {
    const sisa = await dameSisa();
    await new LocalesService(sisa).crearLocalesNuevos('fixtures/b2b.xls');
    expect((await dameSisa()).locales.length).toBe(190);
  });
});
function dameSisa() {
  return dataSource.getRepository(UnidadNegocio).findOne({
    where: { nombre: 'Sisa' },
    relations: {
      cliente: true,
    },
  });
}
