import { LocalesService } from '../lib/LocalesService';
import { Cliente, dataSource, UnidadNegocio } from '@flash-ws/dao';
import { OrdenService } from '../lib/OrdenService';

let cliente: Cliente;
let sisa: UnidadNegocio;

beforeAll(async () => {
  await dataSource.initialize();

  cliente = new Cliente();
  sisa = new UnidadNegocio();
  sisa.nombre = 'Sisa';
  sisa.locales = [];
  sisa.cliente = cliente;

  cliente.unidades = [sisa];
});

afterEach(async () => {
  // Fetch all the entities
  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name); // Get repository
    await repository.clear(); // Clear each entity table's content
  }
  sisa.locales = [];
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
  it('debe haber creado el local', async () => {
    await new LocalesService(sisa).crearLocalesNuevos(
      'libs/worker/src/test/fixtures/orden-una-linea.xls'
    );

    expect(sisa.locales.length).toBe(1);
  });
  it('debe haber creado el local', async () => {
    const result = await new OrdenService(sisa).crearOrden(
      'libs/worker/src/test/fixtures/orden-una-linea.xls'
    );

    expect(result.orden.unidad.locales.length).toBe(1);
  });
  it('dos lineas el mismo local => un local', async () => {
    const result = await new OrdenService(sisa).crearOrden(
      'libs/worker/src/test/fixtures/dos-lineas-mismo-local.xlsx'
    );

    expect(result.orden.unidad.locales.length).toBe(1);
  });
  it('el b2b debe generar 190 locales', async () => {
    const result = await new OrdenService(sisa).crearOrden(
      'libs/worker/src/test/fixtures/b2b.xls'
    );

    expect(result.orden.unidad.locales.length).toBe(190);
  });
});
