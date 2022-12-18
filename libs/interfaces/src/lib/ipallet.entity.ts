
export interface IPallet {
    id: number;
  hu?: number;
  ordenCompra: IOrdenCompra;
  ordenCompraId?: string;
  box: IBox;
  local: ILocal;
  localId?: number;
  cajas: ICaja[];
}    
    