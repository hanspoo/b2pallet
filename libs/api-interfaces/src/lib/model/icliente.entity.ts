import { IPedido } from './ipedido.entity';
import { IUnidadNegocio } from './iunidad-negocio.entity';

export interface ICliente {
  id: number;
  nombre: string;
  unidades: IUnidadNegocio[];
  pedidos: IPedido[];
}
