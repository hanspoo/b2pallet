import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Empresa } from './auth/empresa.entity';
import { Pedido } from './pedido.entity';
import { UnidadNegocio } from './unidad-negocio.entity';

@Entity()
@Unique('en-misma-empresa-nombre-dup', ['nombre', 'empresa.id']) //
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  identLegal: string;

  // @OneToOne(() => Box, { cascade: ['insert'], onDelete: 'CASCADE' })

  @OneToMany(() => UnidadNegocio, (unidad) => unidad.cliente, { cascade: true })
  unidades: UnidadNegocio[];

  @ManyToOne(() => Empresa, (empresa) => empresa.clientes)
  empresa: Empresa;

  @OneToMany(() => Pedido, (pedido) => pedido.cliente)
  pedidos: Pedido[];
}
