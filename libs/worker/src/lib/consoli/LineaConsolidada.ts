import { EstadoLinea } from '@flash-ws/api-interfaces';
import { LineaDetalle } from '@flash-ws/core';

export class LineaConsolidada {
  cantidad: number;
  lineas: Array<LineaDetalle>;
  productoId: number;
  estado: EstadoLinea;
  constructor() {
    this.cantidad = 1;
  }
}
