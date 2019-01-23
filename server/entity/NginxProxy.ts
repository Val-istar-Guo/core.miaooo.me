import { Entity, OneToOne, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Application from './Application'
import Certificate from './Certificate'
import { NginxSSLProtocols, NginxSSLCiphers } from '../utils/nginx-config-parser'


@Entity()
class Proxy {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'simple-array', default: '' })
  domains!: string[]

  @Column({ default: false })
  enableHttp!: boolean

  @Column({ default: false })
  redirectHttps!: boolean

  @Column({ default: false })
  enableHttps!: boolean

  @Column({ default: '5m' })
  sslSessionTimeout!: string

  @Column({
    type: 'simple-array',
    default: [NginxSSLProtocols.TLSv1, NginxSSLProtocols.TLSv11, NginxSSLProtocols.TLSv12].join(),
    array: true,
  })
  sslProtocols!: NginxSSLProtocols[]

  @Column({
    type: 'simple-array',
    default: [
      NginxSSLCiphers.ECDHE_RSA_AES256_GCM_SHA384,
      NginxSSLCiphers.ECDHE_RSA_AES128_GCM_SHA256,
      NginxSSLCiphers.DHE_RSA_AES256_GCM_SHA384,
      NginxSSLCiphers.ECDHE_RSA_AES256_SHA384,
      NginxSSLCiphers.ECDHE_RSA_AES128_SHA256,
      NginxSSLCiphers.ECDHE_RSA_AES256_SHA,
      NginxSSLCiphers.ECDHE_RSA_AES128_SHA,
      NginxSSLCiphers.DHE_RSA_AES256_SHA,
      NginxSSLCiphers.DHE_RSA_AES128_SHA,
    ].join(','),
  })
  sslCiphers!: NginxSSLCiphers[]

  @Column({ default: 'shared:SSL:50m' })
  sslSessionCache!: string

  @Column({ default: true })
  sslPreferServerCiphers!: boolean

  @Column({ default: true })
  sslStapling!: boolean

  @ManyToOne(() => Certificate, 'nginxProxy')
  certificate!: Certificate

  @OneToOne(() => Application, 'nginxProxy')
  application!: Application
}

export default Proxy
