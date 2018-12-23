import { Entity, PrimaryGeneratedColumn, OneToOne, Column, ManyToOne } from 'typeorm'
import Application from './application'
import Certificate from './certificate'


@Entity()
class Proxy {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('simple-array')
  domains!: string[]

  @Column()
  enableHttp!: boolean

  @Column()
  enableHttps!: boolean

  @ManyToOne(() => Certificate, 'proxy')
  certificate!: Certificate

  @OneToOne(() => Application, 'proxy')
  application!: Application
}

export default Proxy
