import { Entity, JoinColumn, Column, OneToOne, PrimaryColumn } from "typeorm";
import Service from './service'
import Proxy from './proxy'

@Entity()
class Application {
  @PrimaryColumn()
  key!: string

  @Column()
  name!: string

  @Column('datetime')
  createTime!: string

  // @Column()
  // lastModifyUser!: string


  @OneToOne(() => Service, 'application')
  @JoinColumn()
  service!: Service

  @OneToOne(() => Proxy, 'application')
  @JoinColumn()
  proxy!: Proxy
}


export default Application
