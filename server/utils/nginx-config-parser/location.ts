import { NginxRewriteRule, NginxFuzzyBoolean, NginxHeader, NginxLocation } from './types'


const aligsStringify = (path?: string): string => path ? `alias ${path};` : ''
const tryFilesStringify = (rule?: string): string => rule ? `try_files ${rule}` : ''
const rewriteStringify = (rule?: NginxRewriteRule): string => {
  if (!rule) return ''

  return `rewrite ${rule.from} ${rule.to} ${rule.mode};`
}
const sendFileStringify = (on?: NginxFuzzyBoolean): string => {
  if (on === NginxFuzzyBoolean.Off) return 'sendfile off;'
  else if (on === NginxFuzzyBoolean.On) return 'sendfile on;'
  else return ''
}
const proxySetHeaderStringify = (headers?: NginxHeader[]): string => {
  if (!headers || !headers.length) return ''

  return headers
    .map(header => `proxy_set_header ${header.key} ${header.value};`)
    .join('\n')
}
const proxyPassStringify = (address?: string): string => address ? `proxy_pass ${address}` : ''

const locationStringify = (location: NginxLocation): string => `
location ${location.path} {
  ${aligsStringify(location.alias)}
  ${tryFilesStringify(location.tryFiles)}
  ${rewriteStringify(location.rewrite)}
  ${sendFileStringify(location.sendFile)}
  ${proxySetHeaderStringify(location.proxySetHeader)}
  ${proxyPassStringify(location.proxyPass)}
}
`
export const stringify = (location?: NginxLocation[]): string => {
  if (!location) return ''

  return location
    .map(locationStringify)
    .join('\n')
}
