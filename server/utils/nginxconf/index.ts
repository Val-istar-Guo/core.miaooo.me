import { stringify as locationStringify, Location } from './location'
import { stringify as sslStringify, SSLConf } from './ssl'

interface HttpConf {
  serviceName?: string[],
  location?: Location[],
}

interface HttpsConf {
  serviceName?: string[],
  location: Location[],
  ssl?: SSLConf,
}

interface NginxConf {
  upstream?: string,
  serviceName?: string[],

  http?: HttpConf,
  https?: HttpsConf,
}


const serverNameStringify = (names?: string[]): string => {
  if (!names || !names.length) return ''

  return `server_name: ${names.join(' ')}`
}

const httpStringify = (config: HttpConf): string => `
server {
  listen 80;
  ${serverNameStringify(config.serviceName)};
  ${locationStringify(config.location)}
}
`

const httpsStringify = (config: HttpsConf): string => `
server {
  listen 443 ssl;
  ${serverNameStringify(config.serviceName)};
  ${sslStringify(config.ssl)}
  ${locationStringify(config.location)}
}
`

export const stringify = (config: NginxConf): string => `
  ${config.http && httpStringify(config.http)}
  ${config.https && httpsStringify(config.https)}
`
