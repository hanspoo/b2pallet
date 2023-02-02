/**
 * aunque ligado al dao, el consolidador es independiente de la persistencia, aunque se requiere que la administre
 * la pieza principal es la LineaProducto, que consolida varias líneas de detalle para facilitar la
 * asignación de estado a las líneas, por ejemplo, si marco como aprobado el consolidado, todas las líneas de detalle quedan
 * en este estado. Lo mismo con rechazado.
 * El problema es cuando es mixto, y tengo productos sólo para algunas líneas que finalmente son de algunos locales.
 * Por el momento no hemos considerado modificar la cantidad de la línea original, pero el consolidador no la ve.
 */

import { EstadoLinea } from '@flash-ws/api-interfaces';
import { LineaDetalle, Producto } from '@flash-ws/core';
import { Consolidado } from '../lib/consoli/Consolidado';

describe('el estado de la consolidada', () => {
  it('una linea en Nada, la consolidada debe estar en Nada', async () => {
    const l1 = new LineaDetalle();
    l1.estado = EstadoLinea.Nada;
    const p1 = new Producto();
    p1.id = 1;
    l1.producto = p1;
    l1.cantidad = 2;
    const c = new Consolidado([l1]);
    await c.calcular();
    expect(c.lineas[0].estado).toBe(EstadoLinea.Nada);
  });
  it('una linea Aprobada, la consolidada debe estar Aprobada', async () => {
    const l1 = new LineaDetalle();
    l1.estado = EstadoLinea.Aprobada;
    const p1 = new Producto();
    p1.id = 1;
    l1.producto = p1;
    l1.cantidad = 2;
    const c = new Consolidado([l1]);
    await c.calcular();
    expect(c.lineas[0].estado).toBe(EstadoLinea.Aprobada);
  });
  it('una linea Aprobada otra en Nada, la consolidada debe estar Multiple', async () => {
    const l1 = conLinea(EstadoLinea.Nada);
    const l2 = conLinea(EstadoLinea.Aprobada);
    const c = new Consolidado([l1, l2]);
    await c.calcular();

    expect(c.lineas[0].estado).toBe(EstadoLinea.Multiple);
  });
  it('dos lineas Aprobadas, la consolidada debe estar Aprobada', async () => {
    const l1 = conLinea(EstadoLinea.Aprobada);
    const l2 = conLinea(EstadoLinea.Aprobada);
    const c = new Consolidado([l1, l2]);

    await c.calcular();
    expect(c.lineas[0].estado).toBe(EstadoLinea.Aprobada);
  });
  it('dos lineas p1 Aprobadas y Nada, linea p2 Rechazada, l1: Multiple, l2: Rechazada', async () => {
    const l1 = new LineaBuilder()
      .conEstado(EstadoLinea.Aprobada)
      .conProductoId(1)
      .build();
    const l2 = new LineaBuilder()
      .conEstado(EstadoLinea.Rechazada)
      .conProductoId(1)
      .build();
    const l3 = new LineaBuilder()
      .conEstado(EstadoLinea.Rechazada)
      .conProductoId(2)
      .build();

    const c = new Consolidado([l1, l2, l3]);
    await c.calcular();
    expect(c.lineas.length).toBe(2);
    expect(c.lineas[0].estado).toBe(EstadoLinea.Multiple);
    expect(c.lineas[1].estado).toBe(EstadoLinea.Rechazada);
  });
});

class LineaBuilder {
  conProductoId(idProd: number) {
    const p1 = new Producto();
    p1.id = idProd;
    this.linea.producto = p1;
    this.linea.productoId = idProd;
    return this;
  }
  linea = new LineaDetalle();
  conEstado(estado: EstadoLinea) {
    this.linea.estado = estado;
    return this;
  }

  build() {
    return this.linea;
  }
}

function conLinea(estado: EstadoLinea) {
  const l1 = new LineaDetalle();
  l1.estado = estado;
  const p1 = new Producto();
  p1.id = 1;
  l1.producto = p1;
  l1.cantidad = 2;
  return l1;
}
