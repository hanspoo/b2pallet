import { Cliente, inicializarCencosud, UnidadNegocio } from '@flash-ws/dao';
import { LocalesService } from '../lib/LocalesService';
import { OrdenService } from '../lib/OrdenService';
import { FixtureBuilder } from '../lib/xls-utils/FixtureBuilder';

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
    expect(result.ordenes[0]).toBeTruthy();
    expect(result.ordenes[0].lineas).toBeTruthy();
    expect(result.ordenes[0].lineas.length).toBe(1);
  });
  it('archivo con dos ordenes', async () => {
    const service = new FixtureBuilder();
    service.addLine(service.getTemplate({ 'Número de Orden': 123 }));
    service.addLine(service.getTemplate({ 'Número de Orden': 678 }));

    const path = service.save();

    const result = await new OrdenService(sisa).crearOrden(path);
    expect(result.ordenes.length).toBe(2);
  });
  it('debe lanzar excepción en orden duplicada', async () => {
    const service = new FixtureBuilder();
    service.addLine(service.getTemplate({ 'Número de Orden': 123 }));

    const path = service.save();

    await new OrdenService(sisa).crearOrden(path);
    const f = async () => {
      await new OrdenService(sisa).crearOrden(path);
    };
    expect(f()).rejects.toThrow();
  });
});
