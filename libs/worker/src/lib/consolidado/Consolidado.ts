import { EstadoLinea } from '@flash-ws/api-interfaces';
import { LineaDetalle } from '@flash-ws/dao';

import { LineaConsolidada } from './LineaConsolidada';

export class Consolidado {
  lineas: Array<LineaConsolidada> = [];
  constructor(public lineasDetalle: Array<LineaDetalle>) {
    if (!lineasDetalle) throw Error('Deben venir las líneas de detalle');

    // Agrupar por producto con un reducer
    const initial: Array<LineaConsolidada> = [];
    const porProducto: Array<LineaConsolidada> = lineasDetalle.reduce(
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
    this.lineas = porProducto.map((lc) => ({
      ...lc,
      estado: calcularEstado(lc),
    }));
  }
}

function calcularEstado(lc: LineaConsolidada): EstadoLinea {
  const INITIAL: Record<EstadoLinea, number> = {
    Nada: 0,
    Multiple: 0,
    Aprobada: 0,
    Rechazada: 0,
    Pendiente: 0,
  };

  const estados = lc.lineas
    .map((linea) => linea.estado)
    .reduce((acc, iter) => {
      acc[iter] = acc[iter] + 1;
      return acc;
    }, INITIAL);

  const activos = Object.keys(estados)
    .filter((estado) => estados[estado] > 0)
    .map((estado) => estado as EstadoLinea);

  if (activos.length > 1) return EstadoLinea.Multiple;
  if (activos.length === 0) throw Error('No hay estados en lineas');

  return activos[0];
}
