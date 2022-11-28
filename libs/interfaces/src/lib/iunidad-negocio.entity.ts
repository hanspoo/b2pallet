
export interface IUnidadNegocio {
    id: number;
  nombre: string;
  cliente: ICliente;
  locales: ILocal[];
  ordenes: IOrdenCompra[];
}    
    