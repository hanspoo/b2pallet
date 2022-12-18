
export interface IOrdenCompra {
    id: string;
  numero: string;
  emision: string;
  entrega: string;
  unidad: IUnidadNegocio;
  lineas: ILineaDetalle[];
  cliente: ICliente;
  pallets: IPallet[];
  pedido?: IPedido;
}    
    