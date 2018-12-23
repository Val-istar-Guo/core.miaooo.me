import { Entity, PrimaryColumn, Column, OneToOne, OneToMany } from "typeorm";
import Proxy from "./proxy";


const enum CA { LetsEncrypt = 'LetsEncrypt' }

@Entity()
class Certificate {
  @PrimaryColumn()
  name!: string

  @Column()
  ca!: CA

  @Column()
  key!: string

  @Column()
  crt!: string

  @OneToMany(() => Proxy, 'certificate')
  proxy!: Proxy
}


export default Certificate
