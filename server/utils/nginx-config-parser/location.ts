import { NginxRewriteRule, NginxFuzzyBoolean, NginxHeader, NginxLocation } from './types'
import { indent, blockIndent, mapIndent } from './indent'
import { existOrEmptyArray } from './existOr';


const aligsStringify = indent((path: string) => `alias ${path};`)
const tryFilesStringify = indent((rule: string) => `try_files ${rule};`)
const rewriteStringify = indent((rule: NginxRewriteRule) => (
  `rewrite ${rule.from} ${rule.to} ${rule.mode};`
))
const sendFileStringify = indent((on: NginxFuzzyBoolean) => {
  if (on === NginxFuzzyBoolean.Off) return 'sendfile off;'
  else if (on === NginxFuzzyBoolean.On) return 'sendfile on;'
  return ''
})

const proxySetHeaderStringify = indent((headers: NginxHeader[]) => headers
  .map(header => `proxy_set_header ${header.key} ${header.value};`))

const proxyPassStringify = indent((address?: string) => `proxy_pass ${address};`)

const locationStringify = blockIndent((location: NginxLocation) => [
  `location ${location.path} {`,
  aligsStringify(location.alias),
  tryFilesStringify(location.tryFiles),
  rewriteStringify(location.rewrite),
  sendFileStringify(location.sendFile),
  proxySetHeaderStringify(location.proxySetHeader),
  proxyPassStringify(location.proxyPass),
  '}',
])

export const stringify = existOrEmptyArray((location: NginxLocation[]) => {
  return mapIndent(location, locationStringify)
})
