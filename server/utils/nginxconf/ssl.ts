const enum SSLProtocols { TLSv1 = 'TLSv1', TLSv11 = 'TLSv1.1', TLSv12 = 'TLSv1.2' }
const enum SSLCiphers {
  ECDHE_RSA_AES256_GCM_SHA384 = "ECDHE-RSA-AES256-GCM-SHA384",
  ECDHE_RSA_AES128_GCM_SHA256 = "ECDHE-RSA-AES128-GCM-SHA256",
  DHE_RSA_AES256_GCM_SHA384 = "DHE-RSA-AES256-GCM-SHA384",
  ECDHE_RSA_AES256_SHA384 = "ECDHE-RSA-AES256-SHA384",
  ECDHE_RSA_AES128_SHA256 = "ECDHE-RSA-AES128-SHA256",
  ECDHE_RSA_AES256_SHA = "ECDHE-RSA-AES256-SHA",
  ECDHE_RSA_AES128_SHA = "ECDHE-RSA-AES128-SHA",
  DHE_RSA_AES256_SHA = "DHE-RSA-AES256-SHA",
  DHE_RSA_AES128_SHA = "DHE-RSA-AES128-SHA"
}

export interface SSLConf {
  certificate: string,
  certificateKey: string,
  sessionTimeout: string,
  protocols: SSLProtocols[],
  ciphers: SSLCiphers[]
  sessionCache: string,
  preferServerCiphers: boolean,
  stapling: boolean,
}

const sslStringify = (ssl: SSLConf) => `
ssl_certificate ${ssl.certificate};
ssl_certificate_key ${ssl.certificateKey};
ssl_session_timeout ${ssl.protocols};
ssl_protocols ${ssl.protocols.join(' ')};
ssl_ciphers ${ssl.ciphers.join(':')};
ssl_session_cache ${ssl.sessionCache}
ssl_prefer_server_ciphers ${ssl.preferServerCiphers ? 'on' : 'off'};
ssl_stapling ${ssl.stapling ? 'on' : 'off'};
`

export const stringify = (ssl?: SSLConf) => ssl ? sslStringify(ssl) : ''
