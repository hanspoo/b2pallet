import { IBox } from './ibox.entity';
import { ICaja } from './icaja.entity';
import { ILocal } from './ilocal.entity';
import { IOrdenCompra } from './iorden-compra.entity';

export interface IPallet {
  id: number;
  ordenCompra: IOrdenCompra;
  box: IBox;
  local: ILocal;
  localId?: number;
  cajas: ICaja[];
}
