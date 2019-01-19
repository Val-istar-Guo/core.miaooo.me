import { Entity, JoinColumn, Column, OneToOne, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import Service from './Service'
import NginxProxy from './NginxProxy'
import Mechine from './Mechine'


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


  @OneToMany(() => Mechine, 'application')
  mechines!: Mechine[]

  @OneToMany(() => Service, 'application')
  services!: Service[]

  @OneToOne(() => NginxProxy, 'application')
  @JoinColumn()
  nginxProxy!: NginxProxy
}


export default Application
