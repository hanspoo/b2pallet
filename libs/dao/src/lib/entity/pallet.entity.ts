import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { OrdenCompra } from './orden-compra.entity';
import { Local } from './local.entity';

@Entity()
export class Pallet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrdenCompra, (orden) => orden.pallets, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  ordenCompra: OrdenCompra;

  @ManyToOne(() => Local, (local) => local.pallets, { nullable: false })
  local: Local;

  @Column()
  localId?: number;
}
