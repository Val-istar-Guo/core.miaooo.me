import { Entity, PrimaryColumn, Column, OneToOne, OneToMany } from "typeorm";
import Proxy from "./proxy";


const enum CA { LetsEncrypt = 'LetsEncrypt' }

@Entity()
class Certificate {
  @PrimaryColumn()
  key!: string

  @Column()
  name!: string

  @Column('simple-array')
  domains!: string[]

  @Column()
  ca!: CA

  @Column()
  crtKey!: string

  @Column()
  crt!: string

  @OneToMany(() => Proxy, 'certificate')
  proxy!: Proxy
}


export default Certificate
