import { ILineaDetalle } from './ilinea-detalle.entity';
import { IPedido } from './ipedido.entity';
import { IUnidadNegocio } from './iunidad-negocio.entity';

export interface IOrdenCompra {
  id: number;
  numero: string;
  emision: string;
  entrega: string;
  unidad: IUnidadNegocio;
  lineas: ILineaDetalle[];
  pedido?: IPedido;
}
