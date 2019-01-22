import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import Application from './Application'


export const enum CommunicationTypes { proxy = 'proxy' }
export const enum MechineType {
  // 端口机
  port = 'port',
  // 独立主机
  host = 'host'
}

@Entity()
class Mechine {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  type!: MechineType

  @Column()
  country!: string

  @Column()
  region!: string

  @Column()
  publicIp!: string

  @Column({ nullable: true })
  privateIp!: string

  @Column({ nullable: true })
  port!: number

  @Column()
  communication!: CommunicationTypes

  @Column({ default: false })
  disabled!: boolean

  @ManyToOne(() => Application, 'mechines')
  application!: Application
}

export default Mechine
