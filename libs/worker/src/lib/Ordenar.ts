import { Producto, dataSource } from '@flash-ws/core';

interface ConIdProducto {
  productoId: number;
}
export async function ordenarPorNombreProducto(lineas: Array<ConIdProducto>) {
  const INICIAL: Record<number, Producto> = {};
  const productos: Array<Producto> = <Array<Producto>>(
    await dataSource.getRepository('producto').find({})
  );
  const mapa: Record<number, Producto> = productos.reduce(
    (acc: Record<number, Producto>, iter: Producto) => {
      acc[iter.id] = iter;
      return acc;
    },
    INICIAL
  );

  return lineas.sort((a: ConIdProducto, b: ConIdProducto) => {
    const p1 = mapa[a.productoId];
    const p2 = mapa[b.productoId];

    return p1.nombre.localeCompare(p2.nombre);
  });
}
