
export interface IProducto {
    id: number;
  nombre: string;
  codigo: string;
  peso: number;
  codCenco: string;
  vigente: boolean;
  lineas?: ILineaDetalle[];
  box: IBox;
  empresa: IEmpresa;
}    
    