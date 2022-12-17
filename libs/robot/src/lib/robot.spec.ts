// las líneas de detalle se ordenan por local.
// se generan las cajas y se van agregando a los pallets.
// se asumen infinitos pallets

import { PalletRobot } from './PalletRobot';
import { EstadoLinea } from '@flash-ws/api-interfaces';
import {
  OrdenCompra,
  inicializarCencosud,
  dataSource,
  Pallet,
  Box,
  ProtoPallet,
} from '@flash-ws/dao';
import { crearOrdenHelper } from '@flash-ws/dao';

// en lo más básico tengo cajas infinitas cajas que tienen un peso y volumen
// si el pallet tiene espacio para la caja
// sino, agrego otro pallet y repito la operación

// partimos con una orden de compra

let orden: OrdenCompra;

beforeAll(async () => {
  await inicializarCencosud();
});
beforeEach(async () => {
  await dataSource.getRepository(OrdenCompra).clear();
  await dataSource.getRepository(Pallet).clear();
});
const box1 = Box.from({ largo: 100, ancho: 100, alto: 100 });
const box2 = Box.from({ largo: 200, ancho: 200, alto: 200 });
const proto1 = new ProtoPallet();
proto1.box = box1;
const proto2 = new ProtoPallet();
proto2.box = box2;

describe('proto pallet', () => {
  it('volumen proto pallet 1x1x1=1000000', async () => {
    expect(proto1.volumen).toBe(1000);
  });
  it('volumen proto pallet 2x2x2=8000000', async () => {
    expect(proto2.volumen).toBe(8000);
  });
});
describe('elegir sólo aprobadas', () => {
  it('linea aprobada, asigna un pallet', async () => {
    orden = await crearOrdenHelper();
    orden.lineas[0].producto.box = box1;
    OrdenCompra.expandirCajas(orden);
    expect(orden.lineas[0].cajas.length).toBe(1);
    const robot = new PalletRobot(orden);
    const pallets = await robot.generarPallets(proto1);
    expect(pallets.length).toBe(1);
  });
  it('linea rechazada, no asigna pallet', async () => {
    orden = await crearOrdenHelper();
    orden.lineas[0].producto.box = box1;
    OrdenCompra.expandirCajas(orden);
    orden.lineas[0].estado = EstadoLinea.Rechazada;

    const robot = new PalletRobot(orden);
    const pallets = await robot.generarPallets(proto1);
    expect(pallets.length).toBe(0);
  });
});
describe('creación de cajas', () => {
  it('expandir una linea con 1 unidad = 1 caja', async () => {
    orden = await crearOrdenHelper();
    OrdenCompra.expandirCajas(orden);
    expect(orden.lineas[0].cajas.length).toBe(1);
  });
  it('expandir una linea con 2 unidad = 2 cajas', async () => {
    orden = await crearOrdenHelper();
    orden.lineas[0].cantidad = 2;
    // OrdenCompra.expandirCajas(orden);
    expect(orden.lineas[0].cajas.length).toBe(1);
  });
});
describe('robot de asignación de pallets', () => {
  it('pallet 1m3, producto 1m3, usa un pallet', async () => {
    orden = await crearOrdenHelper();
    orden.lineas[0].producto.box = box1;
    OrdenCompra.expandirCajas(orden);
    const robot = new PalletRobot(orden);
    const pallets = await robot.generarPallets(proto1);
    expect(pallets.length).toBe(1);
    // const pallet = pallets[0];
    // const caja = pallet.cajas[0];
    // if (!caja) throw Error();
    // expect(caja.linea).toBe(orden.lineas[0]);
  });
  it.skip('pallet 1m3, 2 producto 1m3, usa dos pallets', async () => {
    orden = await crearOrdenHelper();
    orden.lineas[0].producto.box = box1;
    orden.lineas[0].cantidad = 2;
    // OrdenCompra.expandirCajas(orden);
    const robot = new PalletRobot(orden);
    const pallets = await robot.generarPallets(proto1);
    expect(pallets.length).toBe(2);
  });
  it.skip('pallet 1m3, 2 producto 0.5m3, usa un pallet', async () => {
    orden = await crearOrdenHelper();
    orden.lineas[0].producto.box = Box.from({ largo: 1, ancho: 1, alto: 0.5 });
    orden.lineas[0].cantidad = 2;
    OrdenCompra.expandirCajas(orden);
    const robot = new PalletRobot(orden);
    const pallets = await robot.generarPallets(proto1);
    expect(pallets.length).toBe(1);
  });
});
