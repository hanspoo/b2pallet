import {
  Box,
  inicializarCencosud,
  OrdenCompra,
  Producto,
  ProtoPallet,
} from '@flash-ws/dao';

import { crearOrdenHelper } from '@flash-ws/dao';
import { Ordenar, Distribuir } from '@flash-ws/api-interfaces';
import { PalletRobot } from '../lib/PalletRobot';

let orden: OrdenCompra;
const chica = new Box();
chica.largo = 10;
chica.ancho = 12;
chica.alto = 17;

const grande = new Box();
grande.largo = 20;
grande.ancho = 22;
grande.alto = 27;

const proto = new ProtoPallet();

const medio = new Box();
medio.largo = 50;
medio.ancho = 100;
medio.alto = 100;

const box = new Box();
box.largo = 100;
box.ancho = 100;
box.alto = 100;
proto.box = box;

beforeAll(async () => {
  await inicializarCencosud();
  orden = await crearOrdenHelper(4);

  const template = orden.lineas[0].producto;

  for (let i = 0; i < 4; i++) {
    const p: Producto = JSON.parse(JSON.stringify(template));
    p.nombre = 'p' + i;
    p.box = medio;
    p.peso = 100 * i;

    orden.lineas[i].producto = p;
  }
});

describe('ordenar por distribución', () => {
  it('vertical', () => {
    const robot = new PalletRobot(orden, {
      ordenar: Ordenar.PESO,
      distribuir: Distribuir.VERTICAL,
    });
    const pallets = robot.generarPalletsPorLocal(1, proto, orden.lineas);
    expect(pallets[0].cajas[0].linea.producto.nombre).toBe('p3');
    expect(pallets[0].cajas[1].linea.producto.nombre).toBe('p2');
    expect(pallets[1].cajas[0].linea.producto.nombre).toBe('p1');
    expect(pallets[1].cajas[1].linea.producto.nombre).toBe('p0');
  });
  it('horizontal', () => {
    const robot = new PalletRobot(orden, {
      ordenar: Ordenar.PESO,
      distribuir: Distribuir.HORIZONTAL,
    });
    const pallets = robot.generarPalletsPorLocal(1, proto, orden.lineas);
    expect(pallets[0].cajas[0].linea.producto.nombre).toBe('p3');
    expect(pallets[1].cajas[0].linea.producto.nombre).toBe('p2');
    expect(pallets[0].cajas[1].linea.producto.nombre).toBe('p1');
    expect(pallets[1].cajas[1].linea.producto.nombre).toBe('p0');
  });
});
