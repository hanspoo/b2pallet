import { ILineaDetalle } from './ilinea-detalle.entity';
import { IUnidadNegocio } from './iunidad-negocio.entity';

export interface ILocal {
  id: number;
  codigo: string;
  nombre: string;
  unidad: IUnidadNegocio;
  lineas: ILineaDetalle[];
}
