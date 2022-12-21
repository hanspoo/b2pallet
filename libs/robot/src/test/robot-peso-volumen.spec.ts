import { Ordenar } from '@flash-ws/api-interfaces';
import {
  Box,
  inicializarCencosud,
  OrdenCompra,
  Producto,
  ProtoPallet,
} from '@flash-ws/dao';

import { crearOrdenHelper } from '@flash-ws/dao';
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

/**
 *
 * Creamos dos productos:
 * p1: liviano pero grande
 * p2: pesado pero pequeño
 */
beforeAll(async () => {
  await inicializarCencosud();
  orden = await crearOrdenHelper(2);

  const template = orden.lineas[0].producto;

  const p1: Producto = JSON.parse(JSON.stringify(template));
  p1.nombre = 'p1';
  p1.box = grande;
  p1.peso = 100;

  orden.lineas[0].producto = p1;

  const p2: Producto = JSON.parse(JSON.stringify(template));
  p2.nombre = 'p2';
  p2.box = chica;
  p2.peso = 200;
  orden.lineas[1].producto = p2;
});

const proto = new ProtoPallet();

const box = new Box();
box.largo = 100;
box.ancho = 120;
box.alto = 170;
proto.box = box;

describe('ordenar por peso o volumen', () => {
  it('si ordena por peso, p2 debe estar primero que p1', () => {
    const robot = new PalletRobot(orden, { ordenar: Ordenar.PESO });
    const pallets = robot.generarPalletsPorLocal(1, proto, orden.lineas);
    expect(pallets[0].cajas[0].linea.producto.nombre).toBe('p2');
  });
  it('si ordena por volumen, p1 debe estar primero que p2', () => {
    const robot = new PalletRobot(orden, { ordenar: Ordenar.VOLUMEN });
    const pallets = robot.generarPalletsPorLocal(1, proto, orden.lineas);
    expect(pallets[0].cajas[0].linea.producto.nombre).toBe('p1');
  });
});
