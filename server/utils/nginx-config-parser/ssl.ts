import { NginxSSLConfig } from './types'

const sslStringify = (ssl: NginxSSLConfig) => `
ssl_certificate ${ssl.certificate};
ssl_certificate_key ${ssl.certificateKey};
ssl_session_timeout ${ssl.sessionTimeout};
ssl_protocols ${ssl.protocols.join(' ')};
ssl_ciphers ${ssl.ciphers.join(':')};
ssl_session_cache ${ssl.sessionCache}
ssl_prefer_server_ciphers ${ssl.preferServerCiphers ? 'on' : 'off'};
ssl_stapling ${ssl.stapling ? 'on' : 'off'};
`

export const stringify = (ssl?: NginxSSLConfig) => ssl ? sslStringify(ssl) : ''
