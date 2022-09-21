import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { OrdenCompra } from './orden-compra.entity';
import { Local } from './local.entity';
import { Producto } from './producto.entity';

@Entity()
export class LineaDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  cantidad: number;

  @ManyToOne(() => OrdenCompra, (orden) => orden.lineas)
  ordenCompra: OrdenCompra;

  @ManyToOne(() => Producto, (prod) => prod.lineas)
  producto: Producto;

  @ManyToOne(() => Local, (local) => local.lineas)
  local: Local;
}
