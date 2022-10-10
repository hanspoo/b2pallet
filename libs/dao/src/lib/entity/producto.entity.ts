import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { LineaDetalle } from './linea-detalle.entity';
import { Box } from './box.entity';

@Entity()
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  codigo: string;

  @Column()
  peso: number;

  @Column()
  codCenco: string;

  @Column({ type: 'boolean', default: true })
  vigente: boolean;

  @OneToMany(() => LineaDetalle, (linea) => linea.producto)
  lineas?: LineaDetalle[];

  @OneToOne(() => Box, { cascade: ['insert'], onDelete: 'CASCADE' })
  @JoinColumn()
  box: Box;
}
