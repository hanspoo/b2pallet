import { LocalesService } from '../lib/LocalesService';
import { Cliente, dataSource, UnidadNegocio } from '@flash-ws/dao';
import { OrdenService } from '../lib/OrdenService';
import { ProductoService } from '../lib/ProductosService';

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
  it('archivo de una orden la crea correctamente', async () => {
    const result = await new OrdenService(sisa).crearOrden(
      'libs/worker/src/test/fixtures/orden-una-linea.xls'
    );

    expect(result.orden.lineas.length).toBe(1);
  });
  it('carga código producto', async () => {
    await new ProductoService().cargarPlanilla(
      'libs/worker/src/test/fixtures/producto-1647753.xlsx'
    );

    const result = await new OrdenService(sisa).crearOrden(
      'libs/worker/src/test/fixtures/orden-una-linea.xls'
    );

    const linea = result.orden.lineas[0];
    expect(linea.producto.codCenco).toBe('1647753');
  });
});
