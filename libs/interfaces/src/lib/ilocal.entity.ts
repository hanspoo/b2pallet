
export interface ILocal {
    id: number;
  codigo: string;
  nombre: string;
  unidad: IUnidadNegocio;
  lineas: ILineaDetalle[];
  pallets: IPallet[];
}    
    