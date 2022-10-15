import { EstadoLinea } from './EstadoLinea';

export interface Message {
  message: string;
}

export type OrdenesResponseInvalid = {
  msg: string;
  ordenesDuplicadas: string[];
  productosNoEncontrados: string[];
};

export interface CambiarEstadoBody {
  ids: number[];
  estado: EstadoLinea;
}
