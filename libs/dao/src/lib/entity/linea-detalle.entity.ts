import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { OrdenCompra } from './orden-compra.entity';
import { Local } from './local.entity';
import { Producto } from './producto.entity';

@Entity()
export class LineaDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cantidad: number;

  @ManyToOne(() => OrdenCompra, (orden) => orden.lineas, { nullable: false })
  ordenCompra: OrdenCompra;

  @ManyToOne(() => Producto, (prod) => prod.lineas, { nullable: false })
  producto: Producto;

  @ManyToOne(() => Local, (local) => local.lineas, { nullable: false })
  local: Local;
}
