import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Empresa } from './auth/empresa.entity';
import { Box } from './box.entity';

@Entity()
export class ProtoPallet {
  constructor(box?: Box) {
    if (box) this.box = box;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @OneToOne(() => Box, { cascade: ['insert'], onDelete: 'CASCADE' })
  @JoinColumn()
  box: Box;

  @ManyToOne(() => Empresa, (empresa) => empresa.protoPallets, {
    nullable: false,
  })
  empresa: Empresa;

  get volumen(): number {
    return this.box.volumen;
  }
}
