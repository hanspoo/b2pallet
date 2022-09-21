import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UnidadNegocio } from './unidad-negocio.entity';
import { LineaDetalle } from './linea-detalle.entity';

@Entity()
export class Local {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @ManyToOne(() => UnidadNegocio, (unidad) => unidad.locales)
  unidad: UnidadNegocio;

  @OneToMany(() => LineaDetalle, (linea) => linea.local)
  lineas: LineaDetalle[];
}
