import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { OrdenCompra } from './orden-compra.entity';
import { Local } from './local.entity';
import { Producto } from './producto.entity';
import { EstadoLinea } from '@flash-ws/api-interfaces';

@Entity()
export class LineaDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cantidad: number;

  @ManyToOne(() => OrdenCompra, (orden) => orden.lineas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  ordenCompra: OrdenCompra;

  @ManyToOne(() => Producto, (prod) => prod.lineas, {
    nullable: false,
  })
  producto: Producto;

  @Column()
  productoId?: number;

  @ManyToOne(() => Local, (local) => local.lineas, { nullable: false })
  local: Local;

  @Column()
  localId?: number;

  @Column('varchar')
  estado: EstadoLinea = EstadoLinea.Nada;
}
