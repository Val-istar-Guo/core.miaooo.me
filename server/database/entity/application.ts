import { Entity, JoinColumn, Column, OneToOne, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import Service from './service'
import Proxy from './proxy'

@Entity()
class Application {
  @PrimaryColumn()
  key!: string

  @Column()
  name!: string

  @CreateDateColumn()
  createTime!: string

  @UpdateDateColumn()
  updateTime!: string

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
