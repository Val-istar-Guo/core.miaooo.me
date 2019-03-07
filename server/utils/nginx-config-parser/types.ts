export const enum NginxRewriteMode {
  Permanent = 'permanent',
  Last = 'last',
  Break = 'break',
  Redirect = 'redirect',
}

export const enum NginxFuzzyBoolean {
  Default = 'default',
  On = 'on',
  Off = 'off'
}

export interface NginxRewriteRule {
  from: string,
  to: string,
  mode: NginxRewriteMode,
}

export interface NginxHeader {
  key: string,
  value: string,
}

export interface NginxLocation {
  path: string,
  alias?: string,
  tryFiles?: string,
  rewrite?: NginxRewriteRule,
  sendFile?: NginxFuzzyBoolean,
  proxySetHeader?: NginxHeader[],
  proxyPass?: string,
}

export const enum NginxSSLProtocols { TLSv1 = 'TLSv1', TLSv11 = 'TLSv1.1', TLSv12 = 'TLSv1.2' }
export const enum NginxSSLCiphers {
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

export interface NginxSSLConfig {
  certificate: string,
  certificateKey: string,
  sessionTimeout: string,
  protocols: NginxSSLProtocols[],
  ciphers: NginxSSLCiphers[]
  sessionCache: string,
  preferServerCiphers: boolean,
  stapling: boolean,
}

export interface NginxHttpConfig {
  serviceName?: string[],
  location?: NginxLocation[],
}

export interface NginxHttpsConfig {
  serviceName?: string[],
  http2: boolean,
  location?: NginxLocation[],
  ssl?: NginxSSLConfig,
}

export interface NginxServer {
  host: string,
  weight?: number,
  maxFails?: number,
  failTimeout?: number,
}

export interface NginxUpstreamConfig {
  name: string,
  servers: NginxServer[],
}

export interface NginxConfig {
  upstream?: NginxUpstreamConfig,
  serviceName?: string[],

  http?: NginxHttpConfig,
  https?: NginxHttpsConfig,
}
