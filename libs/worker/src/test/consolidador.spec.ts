/**
 * aunque ligado al dao, el consolidador es independiente de la persistencia, aunque se requiere que la administre
 * la pieza principal es la LineaProducto, que consolida varias líneas de detalle para facilitar la
 * asignación de estado a las líneas, por ejemplo, si marco como aprobado el consolidado, todas las líneas de detalle quedan
 * en este estado. Lo mismo con rechazado.
 * El problema es cuando es mixto, y tengo productos sólo para algunas líneas que finalmente son de algunos locales.
 * Por el momento no hemos considerado modificar la cantidad de la línea original, pero el consolidador no la ve.
 */

import { LineaDetalle, Producto } from '@flash-ws/dao';
import { Consolidado } from '../lib/consoli/Consolidado';

describe('consolidador de lineas', () => {
  it('consolidar una línea una linea consolidada con una unidad', async () => {
    const l = new LineaDetalle();
    l.producto = new Producto();
    l.cantidad = 1;
    const c = new Consolidado([l]);
    await c.calcular();
    expect(c.lineas.length).toBe(1);
    expect(c.lineas[0].cantidad).toBe(1);
  });
  it('consolidar dos lineas iguales una linea con dos productos', async () => {
    const l = new LineaDetalle();
    l.producto = new Producto();
    l.cantidad = 1;
    const c = new Consolidado([l, l]);
    await c.calcular();

    expect(c.lineas.length).toBe(1);
    expect(c.lineas[0].cantidad).toBe(2);
  });
  it('consolidar dos líneas con productos separados, dos lineas', async () => {
    const l1 = new LineaDetalle();
    const p1 = new Producto();
    p1.id = 1;
    l1.producto = p1;
    l1.productoId = 1;
    l1.cantidad = 2;
    const l2 = new LineaDetalle();
    const p2 = new Producto();
    p2.id = 2;
    l2.producto = p2;
    l2.productoId = 2;
    l2.cantidad = 3;
    const c = new Consolidado([l1, l2]);
    await c.calcular();
    expect(c.lineas.length).toBe(2);
    expect(
      c.lineas.reduce((acc, iter) => {
        return acc + iter.cantidad;
      }, 0)
    ).toBe(5);
  });
});
