import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from "typeorm";
import NginxProxy from "./NginxProxy";
import { CATypes } from "../types";


@Entity()
class Certificate {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column('simple-array')
  domains!: string[]

  @Column('datetime')
  lastRefreshTime!: Date

  @Column()
  ca!: CATypes

  @Column()
  crtKey!: string

  @Column()
  crt!: string

  @OneToMany(() => NginxProxy, 'certificate')
  nginxProxy!: NginxProxy
}


export default Certificate
