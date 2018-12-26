import { Entity, OneToOne, Column, ManyToOne, PrimaryColumn } from 'typeorm'
import Application from './application'
import Certificate from './certificate'


@Entity()
class Proxy {
  @PrimaryColumn()
  key!: number

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
