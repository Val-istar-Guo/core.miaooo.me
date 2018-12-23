import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import Application from "./application";


const enum InformationType { uWSGI = 'uwsgi', proxy = 'proxy' }

interface Mechine {
  type: InformationType,
  enabled: boolean
  url: string,
}


@Entity()
class Service {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column('simple-json')
  mechines!: Mechine[]

  @OneToOne(() => Application, 'service')
  application!: Application
}

export default Service
