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
  Local,
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
  it('debe usar dos pallets si son de diferentes locales', async () => {
    orden = await crearOrdenHelper(2);
    orden.lineas[0].producto.box = Box.from({
      largo: 10,
      ancho: 10,
      alto: 10,
    });
    orden.lineas[0].cantidad = 1;
    orden.lineas[0].local = Local.from(1, 'Jumbo Tobalaba');
    orden.lineas[0].localId = 1;
    orden.lineas[1].producto.box = Box.from({
      largo: 10,
      ancho: 10,
      alto: 10,
    });
    orden.lineas[1].cantidad = 1;
    orden.lineas[1].local = Local.from(2, 'Jumbo Bilbao');
    orden.lineas[1].localId = 2;
    OrdenCompra.expandirCajas(orden);
    const robot = new PalletRobot(orden);
    process.env['DEBUG'] = '1';
    const pallets = await robot.generarPallets(proto1);
    expect(pallets.length).toBe(2);
  });
});
