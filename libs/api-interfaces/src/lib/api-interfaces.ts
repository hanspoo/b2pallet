export interface Message {
  message: string;
}

export type OrdenesResponseInvalid = {
  msg: string;
  ordenesDuplicadas: string[];
  productosNoEncontrados: string[];
};
