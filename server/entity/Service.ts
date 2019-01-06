import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne } from "typeorm";
import Application from "./Application";


@Entity()
class Service {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  check!: string

  @ManyToOne(() => Application, 'services')
  application!: Application
}

export default Service
