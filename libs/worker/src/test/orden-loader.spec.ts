import { Cliente, inicializarCencosud, UnidadNegocio } from '@flash-ws/dao';
import { LocalesService } from '../lib/LocalesService';
import { OrdenService } from '../lib/OrdenService';
import { PrevalidacionService } from '../lib/PrevalidacionService';

let cliente: Cliente;
let sisa: UnidadNegocio;

beforeAll(async () => {
  cliente = await inicializarCencosud();
  sisa = cliente.unidades.find((u) => (u.nombre = 'Sisa'));
});

describe('crear ordenes', () => {
  it('crea orden', async () => {
    await new LocalesService(sisa).crearLocalesNuevos(
      'libs/worker/src/test/fixtures/orden-una-linea.xls'
    );

    const result = await new OrdenService(sisa).crearOrden(
      'libs/worker/src/test/fixtures/orden-una-linea.xls'
    );
    expect(result.orden).toBeTruthy();
    expect(result.orden.lineas).toBeTruthy();
    expect(result.orden.lineas.length).toBe(1);
  });
});
