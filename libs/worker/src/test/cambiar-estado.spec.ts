/**
 * @group integ
 */

import { EstadoLinea } from '@flash-ws/api-interfaces';
import { dataSource, LineaDetalle, OrdenCompra, Producto } from '@flash-ws/dao';

import { Cliente, inicializarCencosud, UnidadNegocio } from '@flash-ws/dao';
import { crearOrdenHelper } from '@flash-ws/test-utils';

import { ServicioCambioEstado } from '../lib/ServicioCambioEstado';

let cliente: Cliente;
let sisa: UnidadNegocio;

beforeAll(async () => {
  cliente = await inicializarCencosud();
  sisa = await cliente.unidades.find((u) => (u.nombre = 'Sisa'));
});
beforeEach(async () => {
  await dataSource.getRepository(OrdenCompra).clear();
});
describe('cambiar estado lineas', () => {
  it.skip('por defecto las líneas estan en estado Nada', () => {
    const orden: OrdenCompra = {
      id: 15,
      unidad: sisa,
      numero: '5575426472',
      emision: '15-09-2022',
      entrega: '22-09-2022',
      lineas: [],
      pallets: [],
    };
    orden.lineas = [];
    orden.lineas.push(new LineaDetalle());
    expect(orden.lineas[0].estado).toBe(EstadoLinea.Nada);
  });
  it('el servicio las cambia a Aprobado', async () => {
    const orden = await crearOrdenHelper();

    const servicio = new ServicioCambioEstado();
    await servicio.loadOrden(orden.id);
    const nueva = await servicio.cambiar(
      [orden.lineas[0].id],
      EstadoLinea.Aprobada
    );

    expect(nueva.lineas[0].estado).toBe(EstadoLinea.Aprobada);
  });
});
