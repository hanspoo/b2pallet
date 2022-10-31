import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { LineaDetalle } from './linea-detalle.entity';
import { Pallet } from './pallet.entity';
import { UnidadNegocio } from './unidad-negocio.entity';
import { Pedido } from './pedido.entity';

@Entity()
@Unique(['numero', 'unidad'])
export class OrdenCompra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero: string;

  @Column()
  emision: string;

  @Column()
  entrega: string;

  @ManyToOne(() => UnidadNegocio, (unidad) => unidad.ordenes)
  unidad: UnidadNegocio;

  @OneToMany(() => LineaDetalle, (linea) => linea.ordenCompra, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  lineas: LineaDetalle[];

  @OneToMany(() => Pallet, (pallet) => pallet.ordenCompra, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  pallets: Pallet[];

  @ManyToOne(() => Pedido, (pedido) => pedido.ordenes, { nullable: true })
  pedido?: Pedido;
}
