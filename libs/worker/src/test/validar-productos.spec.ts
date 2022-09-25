/*

La prevalidación es que todos los productos deben existir

*/

import { Cliente, inicializarCencosud, UnidadNegocio } from '@flash-ws/dao';
import { PrevalidacionService } from '../lib/PrevalidacionService';

let cliente: Cliente;
let sisa: UnidadNegocio;

beforeAll(async () => {
  cliente = await inicializarCencosud();
  sisa = cliente.unidades.find((u) => (u.nombre = 'Sisa'));
});

describe('Pre validar planilla', () => {
  it('debe enviar error si producto no existe', async () => {
    const invalidos: Array<string> = await new PrevalidacionService(
      sisa
    ).validarExcel(
      'libs/worker/src/test/fixtures/orden-una-linea-prod-invalido.xls'
    );
    expect(invalidos.length).toBe(1);
  });
  it('productos validos debe haber cero', async () => {
    const invalidos: Array<string> = await new PrevalidacionService(
      sisa
    ).validarExcel('libs/worker/src/test/fixtures/orden-una-linea.xls');
    expect(invalidos.length).toBe(0);
  });
});
