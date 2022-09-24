import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Box {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  largo: number;

  @Column()
  ancho: number;

  @Column()
  alto: number;
}
