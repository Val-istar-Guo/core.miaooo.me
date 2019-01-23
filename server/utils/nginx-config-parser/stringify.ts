import { stringify as locationStringify } from './location'
import { stringify as sslStringify } from './ssl'
import { stringify as upstreamStringify } from './upstream'
import { NginxHttpConfig, NginxHttpsConfig, NginxConfig } from './types'


const serverNameStringify = (names?: string[]): string => {
  if (!names || !names.length) return ''

  return `server_name: ${names.join(' ')};`
}

const httpStringify = (config: NginxHttpConfig): string => `
server {
  listen 80;
  ${serverNameStringify(config.serviceName)}
  ${locationStringify(config.location)}
}
`

const httpsStringify = (config: NginxHttpsConfig): string => `
server {
  listen 443 ssl;
  ${serverNameStringify(config.serviceName)};
  ${sslStringify(config.ssl)}
  ${locationStringify(config.location)}
}
`


export const stringify = (config: NginxConfig): string => `
  ${upstreamStringify(config.upstream)}
  ${config.http ? httpStringify(config.http) : ''}
  ${config.https ? httpsStringify(config.https) : ''}
`
