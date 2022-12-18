
export interface ICliente {
    id: number;
  nombre: string;
  identLegal: string;
  unidades: IUnidadNegocio[];
  ordenes: IOrdenCompra[];
  empresa: IEmpresa;
  pedidos: IPedido[];
}    
    