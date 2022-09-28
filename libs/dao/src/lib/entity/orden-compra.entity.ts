import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { LineaDetalle } from './linea-detalle.entity';
import { UnidadNegocio } from './unidad-negocio.entity';
import { Pedido } from './pedido.entity';

@Entity()
export class OrdenCompra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero: string;

  @Column()
  emision: string;

  @Column()
  entrega: string;

  @ManyToOne(() => UnidadNegocio, (unidad) => unidad.locales)
  unidad: UnidadNegocio;

  @OneToMany(() => LineaDetalle, (linea) => linea.ordenCompra, {
    cascade: true,
  })
  lineas: LineaDetalle[];

  @ManyToOne(() => Pedido, (pedido) => pedido.ordenes, { nullable: true })
  pedido: Pedido;
}
