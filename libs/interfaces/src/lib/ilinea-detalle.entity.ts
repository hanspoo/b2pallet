
export interface ILineaDetalle {
    id: number;
  cantidad: number;
  ordenCompra: IOrdenCompra;
  producto: IProducto;
  productoId?: number;
  local: ILocal;
  localId?: number;
  estado: IEstadoLinea = EstadoLinea.Nada;
  cajas: ICaja[];
}    
    