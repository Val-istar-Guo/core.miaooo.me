import { stringify as locationStringify } from './location'
import { stringify as sslStringify } from './ssl'
import { stringify as upstreamStringify } from './upstream'
import { NginxHttpConfig, NginxHttpsConfig, NginxConfig } from './types'
import { indent, combineIndent, block } from './indent'


const serverNameStringify = indent((names: string[]) => `server_name ${names.join(' ')};`)
const httpsPortStringify = indent((http2: boolean = false) => {
  if (http2) return `listen 443 ssl http2;`
  else return `listen 443 ssl;`
})

const httpStringify = block(combineIndent((config: NginxHttpConfig) => [
  'server {',
  '  listen 80;',
  serverNameStringify(config.serviceName),
  locationStringify(config.location),
  '}',
]))

const httpsStringify = block(combineIndent((config: NginxHttpsConfig) => [
  `server {`,
  httpsPortStringify(config.http2),
  serverNameStringify(config.serviceName),
  sslStringify(config.ssl),
  locationStringify(config.location),
 `}`
]))

const stringifyNginxConfig = combineIndent((config: NginxConfig) => [
  upstreamStringify(config.upstream),
  httpStringify(config.http),
  httpsStringify(config.https),
])

export const stringify = (config: NginxConfig) => stringifyNginxConfig(config).join('\n')
