import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import Application from './Application'


export const enum CommunicationTypes { uWSGI = 'uwsgi', proxy = 'proxy' }

@Entity()
class Mechine {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  address!: string

  @Column()
  host!: string

  @Column()
  communication!: CommunicationTypes

  @Column({ default: false })
  disabled!: boolean

  @ManyToOne(() => Application, 'mechines')
  application!: Application
}

export default Mechine
