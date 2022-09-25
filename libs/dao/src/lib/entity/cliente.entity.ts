import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Pedido } from './pedido.entity';
import { UnidadNegocio } from './unidad-negocio.entity';

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  // @OneToOne(() => Box, { cascade: ['insert'], onDelete: 'CASCADE' })

  @OneToMany(() => UnidadNegocio, (unidad) => unidad.cliente, { cascade: true })
  unidades: UnidadNegocio[];

  @OneToMany(() => Pedido, (pedido) => pedido.cliente)
  pedidos: Pedido[];
}
