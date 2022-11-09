import { EstadoLinea } from './EstadoLinea';

export interface BodyCambioEstadoProdConsolidada {
  estado: EstadoLinea;
  productoID?: number;
  productos?: Array<number>;
}
