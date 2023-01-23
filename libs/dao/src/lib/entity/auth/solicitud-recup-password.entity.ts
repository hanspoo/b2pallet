import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";

@Entity()
export class SolicitudRecupPassword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  cseg: number;

  @Column({ type: "bigint" })
  public created_at: number;

  @BeforeInsert()
  updateDates() {
    this.created_at = new Date().getTime();
  }
}
