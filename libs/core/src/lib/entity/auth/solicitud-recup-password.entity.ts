import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";

@Entity()
export class SolicitudRecupPassword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  cseg: number;

  @Column()
  vigente: boolean;

  @Column({ type: "bigint" })
  created_at: number;

  @BeforeInsert()
  updateDates() {
    this.created_at = new Date().getTime();
    this.vigente = true;
  }
}
