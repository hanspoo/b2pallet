import { Cliente, dataSource, UnidadNegocio } from '@flash-ws/dao';
import { ProductoService } from '../lib/ProductosService';
import { StatusCode } from '../lib/StatusCode';

jest.setTimeout(20000);

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

/*
Hay que alim
*/

describe('carga productos', () => {
  it('hay un producto, retorna una línea de status', async () => {
    const result = await new ProductoService().cargarPlanilla(
      'fixtures/producto-1647753.xlsx'
    );

    expect(result.length).toBe(1);
  });
  it('hay un producto valido, retorna una línea de status valido', async () => {
    const result = await new ProductoService().cargarPlanilla(
      'fixtures/producto-1647753.xlsx'
    );

    expect(result[0].codigo).toBe(StatusCode.OK);
  });
  it('hay un producto línea inválida sin código cenco, error', async () => {
    const result = await new ProductoService().cargarPlanilla(
      'fixtures/prod-sin-codigo.xlsx'
    );

    expect(result[0].codigo).toBe(StatusCode.ERROR);
  });
  it('producto sin alto en cm', async () => {
    const result = await new ProductoService().cargarPlanilla(
      'fixtures/producto-1647753-malo-sin-alto.xlsx'
    );

    expect(result[0].codigo).toBe(StatusCode.ERROR);
  });
  it('hay dos productos, retorna dos línea de status', async () => {
    const result = await new ProductoService().cargarPlanilla(
      'fixtures/dos-productos.xlsx'
    );

    expect(result.length).toBe(2);
  });
  it('crea un producto cuando es valido', async () => {
    let productos = await new ProductoService().findAll();
    expect(productos.length).toBe(0);

    const result = await new ProductoService().cargarPlanilla(
      'fixtures/producto-1647753.xlsx'
    );

    expect(result[0].codigo).toBe(StatusCode.OK);
    productos = await new ProductoService().findAll();
    expect(productos.length).toBe(1);
  });
  it('valida todos los campos del producto', async () => {
    let productos = await new ProductoService().findAll();
    expect(productos.length).toBe(0);

    const result = await new ProductoService().cargarPlanilla(
      'fixtures/producto-1647753.xlsx'
    );

    productos = await new ProductoService().findAll();
    const p = productos[0];

    expect(p.codigo).toBe('ELY-KP-MONDA*50');
    expect(p.codCenco).toBe('1647753');
    expect(p.nombre).toBe('MONDADIENTES');
    expect(p.peso).toBe(900);
    expect(p.box.largo).toBe(200);
    expect(p.box.ancho).toBe(200);
    expect(p.box.alto).toBe(90);
  });
  it('si se procesa de nuevo, se actualiza no crea dos', async () => {
    await new ProductoService().cargarPlanilla(
      'fixtures/producto-1647753.xlsx'
    );
    await new ProductoService().cargarPlanilla(
      'fixtures/producto-1647753.xlsx'
    );
    const productos = await new ProductoService().findAll();

    expect(productos.length).toBe(1);
  });
  it('carga los 136 productos', async () => {
    await new ProductoService().cargarPlanilla(
      'fixtures/productos.xlsx'
    );
    const productos = await new ProductoService().findAll();

    // hay dos sin código
    expect(productos.length).toBe(134);
  });
});
