import { LineaDetalle } from '@flash-ws/dao';
import { LineaConsolidada } from './LineaConsolidada';
import { calcularEstado } from './worker';

export class Consolidado {
  lineas: Array<LineaConsolidada> = [];

  constructor(public lineasDetalle: Array<LineaDetalle>) {
    if (!lineasDetalle) throw Error('Deben venir las líneas de detalle');
  }

  async calcular() {
    // Agrupar por producto con un reducer
    const initial: Array<LineaConsolidada> = [];
    const porProducto: Array<LineaConsolidada> = this.lineasDetalle.reduce(
      (acc: Array<LineaConsolidada>, iter: LineaDetalle) => {
        // recuperar la consolidada del producto
        const lc = acc.find((it) => it.productoId === iter.productoId);
        if (lc) {
          lc.lineas.push(iter);
          lc.cantidad = lc.cantidad + iter.cantidad;
        } else {
          const nueva = new LineaConsolidada();
          nueva.lineas = [iter];
          nueva.productoId = iter.productoId;
          nueva.cantidad = iter.cantidad;
          acc.push(nueva);
        }
        return acc;
      },
      initial
    );

    const promeses = porProducto.map((lc: LineaConsolidada) => {
      return Promise.resolve(calcularEstado(lc));
    });

    const estados = await Promise.all(promeses);

    this.lineas = porProducto.map((lc, i) => ({
      ...lc,
      estado: estados[i],
    }));
  }
}
