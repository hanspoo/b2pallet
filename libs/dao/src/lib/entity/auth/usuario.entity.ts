import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Empresa } from './empresa.entity';
import { Token } from './token.entity';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @ManyToOne(() => Empresa, (e: Empresa) => e.usuarios)
  empresa: Empresa;

  @OneToMany(
    () => Token,
    (s: Token) => {
      s.usuario;
    }
  )
  sesiones: Token[];

  @Column({ type: 'boolean', default: false })
  esAdmin: boolean;
}
