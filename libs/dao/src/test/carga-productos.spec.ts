import {
  dataSource,
  Empresa,
  inicializarCencosud,
  ProductoService,
  SignupService,
} from '..';
import { StatusCode } from '../lib/StatusCode';

jest.setTimeout(20000);

let empresa;
beforeAll(async () => {
  await inicializarCencosud();
  empresa = await dataSource
    .getRepository(Empresa)
    .findOne({ where: { nombre: 'b2pallet' } });
});
beforeEach(async () => {
  await dataSource.query('delete from producto');
});

/*
Hay que alim
*/

describe('carga productos', () => {
  it('hay un producto, retorna una línea de status', async () => {
    const result = await new ProductoService(empresa).cargarPlanilla(
      'fixtures/producto-1647753.xlsx'
    );

    expect(result.length).toBe(1);
  });
  it('cada empresa tiene su propia base de datos de productos', async () => {
    await new ProductoService(empresa).cargarPlanilla(
      'fixtures/producto-1647753.xlsx'
    );

    const e2 = await crearEmpresaRandom();
    await new ProductoService(e2).cargarPlanilla(
      'fixtures/producto-1647753.xlsx'
    );

    expect(e2).not.toEqual(empresa);

    expect((await new ProductoService(empresa).findAll()).length).toBe(1);
    expect((await new ProductoService(e2).findAll()).length).toBe(1);
  });
  it('hay un producto valido, retorna una línea de status valido', async () => {
    const result = await new ProductoService(empresa).cargarPlanilla(
      'fixtures/producto-1647753.xlsx'
    );

    expect(result[0].codigo).toBe(StatusCode.OK);
  });
  it('hay un producto línea inválida sin código cenco, error', async () => {
    const result = await new ProductoService(empresa).cargarPlanilla(
      'fixtures/prod-sin-codigo.xlsx'
    );

    expect(result[0].codigo).toBe(StatusCode.ERROR);
  });
  it('producto sin alto en cm', async () => {
    const result = await new ProductoService(empresa).cargarPlanilla(
      'fixtures/producto-1647753-malo-sin-alto.xlsx'
    );

    expect(result[0].codigo).toBe(StatusCode.ERROR);
  });
  it('hay dos productos, retorna dos línea de status', async () => {
    const result = await new ProductoService(empresa).cargarPlanilla(
      'fixtures/dos-productos.xlsx'
    );

    expect(result.length).toBe(2);
  });
  it('crea un producto cuando es valido', async () => {
    let productos = await new ProductoService(empresa).findAll();
    expect(productos.length).toBe(0);

    const result = await new ProductoService(empresa).cargarPlanilla(
      'fixtures/producto-1647753.xlsx'
    );

    expect(result[0].codigo).toBe(StatusCode.OK);
    productos = await new ProductoService(empresa).findAll();
    expect(productos.length).toBe(1);
  });
  it('valida todos los campos del producto', async () => {
    let productos = await new ProductoService(empresa).findAll();
    expect(productos.length).toBe(0);

    const result = await new ProductoService(empresa).cargarPlanilla(
      'fixtures/producto-1647753.xlsx'
    );

    productos = await new ProductoService(empresa).findAll();
    const p = productos[0];

    expect(p.codigo).toBe('ELY-KP-MONDA*50');
    expect(p.codCenco).toBe('1647753');
    expect(p.nombre).toBe('MONDADIENTES');
    expect(p.peso).toBe(900);
    expect(p.box.largo).toBe(20);
    expect(p.box.ancho).toBe(20);
    expect(p.box.alto).toBe(9);
  });
  it('si se procesa de nuevo, se actualiza no crea dos', async () => {
    await new ProductoService(empresa).cargarPlanilla(
      'fixtures/producto-1647753.xlsx'
    );
    await new ProductoService(empresa).cargarPlanilla(
      'fixtures/producto-1647753.xlsx'
    );
    const productos = await new ProductoService(empresa).findAll();

    expect(productos.length).toBe(1);
  });
  it('carga los 136 productos', async () => {
    await new ProductoService(empresa).cargarPlanilla(
      'fixtures/productos.xlsx'
    );
    const productos = await new ProductoService(empresa).findAll();

    // hay dos sin código
    expect(productos.length).toBe(134);
  });
});
async function crearEmpresaRandom(): Promise<Empresa> {
  const nombre = 'abc',
    email = 'x@c.com',
    password = '123',
    identLegal = '19';
  const service = new SignupService({
    empresa,
    nombre,
    email,
    password,
    identLegal,
  });
  const e = await service.execute();

  return e;
}
