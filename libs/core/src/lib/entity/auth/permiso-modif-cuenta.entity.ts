import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";

@Entity()
export class PermisoModifCuenta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  token: string;

  @Column()
  vigente: boolean;

  @Column({ type: "bigint" })
  created_at: number;

  @Column({ type: "bigint", nullable: true })
  fechaUso: number;

  @BeforeInsert()
  updateDates() {
    this.created_at = new Date().getTime();
    this.vigente = true;
  }
}
