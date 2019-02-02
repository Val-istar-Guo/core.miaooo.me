import { NginxSSLConfig } from './types'
import { indent } from './indent';
import { existOrEmptyString } from './existOr';

const crtStringify = existOrEmptyString((crt: string) => `ssl_certificate ${crt};`)
const crtKeyStringify = existOrEmptyString((key: string) => `ssl_certificate_key ${key};`)

export const stringify = indent((ssl: NginxSSLConfig) => ([
  crtKeyStringify(ssl.certificate),
  crtKeyStringify(ssl.certificateKey),
  `ssl_session_timeout ${ssl.sessionTimeout};`,
  `ssl_protocols ${ssl.protocols.join(' ')};`,
  `ssl_ciphers ${ssl.ciphers.join(':')};`,
  `ssl_session_cache ${ssl.sessionCache};`,
  `ssl_prefer_server_ciphers ${ssl.preferServerCiphers ? 'on' : 'off'};`,
  `ssl_stapling ${ssl.stapling ? 'on' : 'off'};`,
]))
