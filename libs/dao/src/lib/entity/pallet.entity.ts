import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Box } from './box.entity';
import { Caja } from './caja.entity';
import { Local } from './local.entity';
import { OrdenCompra } from './orden-compra.entity';

@Entity()
export class Pallet {
  static volumenUsado(pallet: Pallet) {
    return pallet.cajas.reduce((acc, iter) => {
      return acc + iter.linea.producto.box.volumen;
    }, 0);
  }
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrdenCompra, (orden) => orden.pallets, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  ordenCompra: OrdenCompra;

  @OneToOne(() => Box, { cascade: ['insert'], onDelete: 'CASCADE' })
  @JoinColumn()
  box: Box;

  @ManyToOne(() => Local, (local) => local.pallets, { nullable: false })
  local: Local;

  @Column()
  localId?: number;

  @OneToMany(() => Caja, (caja) => caja.pallet, { onDelete: 'SET NULL' })
  cajas: Caja[];
}
