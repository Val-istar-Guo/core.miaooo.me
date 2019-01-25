import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import NginxProxy from "./NginxProxy";
import { CATypes } from "../types";


@Entity()
class Certificate {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('simple-array')
  domains!: string[]

  @Column({ type: 'datetime', nullable: true })
  lastRefreshTime!: Date

  @Column()
  ca!: CATypes

  @Column({ nullable: true })
  crtKey!: string

  @Column({ nullable: true })
  crt!: string

  @OneToMany(() => NginxProxy, 'certificate')
  nginxProxies!: NginxProxy[]
}


export default Certificate
