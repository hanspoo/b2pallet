/**
 * @group integ
 */
import {
  Cliente,
  dataSource,
  inicializarCencosud,
  OrdenCompra,
  UnidadNegocio,
} from '@flash-ws/dao';
import { LocalesService } from '../lib/LocalesService';
import { OrdenService } from '../lib/OrdenService';
import { FixtureBuilder } from './XLSFixtureBuilder';

let cliente: Cliente;
let sisa: UnidadNegocio;

beforeAll(async () => {
  cliente = await inicializarCencosud();
  sisa = await cliente.unidades.find((u) => (u.nombre = 'Sisa'));
});
beforeEach(async () => {
  await dataSource.getRepository(OrdenCompra).clear();
});

describe.skip('crear ordenes', () => {
  it('crea orden', async () => {
    await new LocalesService(sisa).crearLocalesNuevos(
      'fixtures/orden-una-linea.xls'
    );

    sisa = await findById(sisa.id);
    const result = await new OrdenService(sisa).crearOrden(
      'fixtures/orden-una-linea.xls'
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
  it.skip('debe lanzar excepción en orden duplicada', async () => {
    const service = new FixtureBuilder();
    service.addLine(service.getTemplate({ 'Número de Orden': 123 }));

    const path = service.save();

    const orden1 = await new OrdenService(sisa).crearOrden(path);

    const f = async () => {
      const orden2 = await new OrdenService(sisa).crearOrden(path);
    };
    expect(f()).rejects.toThrow();
  });
  it('carga correctamente la cantidad', async () => {
    const service = new FixtureBuilder();
    service.addLine(service.getTemplate({ 'Empaques Pedidos': 7 }));

    const path = service.save();

    const res = await new OrdenService(sisa).crearOrden(path);

    expect(res.ordenes[0].lineas[0].cantidad).toBe(7);
    expect(res.ordenes[0].lineas[0].cajas.length).toBe(7);
  });
});

function findById(id: number): Promise<UnidadNegocio> {
  return dataSource
    .getRepository(UnidadNegocio)
    .findOne({ where: { id }, relations: { ordenes: true, cliente: true } });
}
