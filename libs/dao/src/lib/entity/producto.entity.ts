import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { LineaDetalle } from './linea-detalle.entity';

@Entity()
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  codigo: string;

  @Column()
  codCenco: string;

  @Column()
  vigente: boolean;

  @OneToMany(() => LineaDetalle, (linea) => linea.producto)
  lineas: LineaDetalle[];
}
