const enum RewriteMode {
  Permanent = 'permanent',
  Last = 'last',
  Break = 'break',
  Redirect = 'redirect',
}

const enum FuzzyBoolean {
  Default = 'default',
  On = 'on',
  Off = 'off'
}

interface RewriteRule {
  from: string,
  to: string,
  mode: RewriteMode,
}

interface Header {
  key: string,
  value: string,
}

export interface Location {
  path: string,
  alias?: string,
  tryFiles?: string,
  rewrite?: RewriteRule,
  sendFile?: FuzzyBoolean,
  proxySetHeader?: Header[],
  proxyPass?: string,
}

const aligsStringify = (path?: string): string => path ? `alias ${path};` : ''
const tryFilesStringify = (rule?: string): string => rule ? `try_files ${rule}` : ''
const rewriteStringify = (rule?: RewriteRule): string => {
  if (!rule) return ''

  return `rewrite ${rule.from} ${rule.to} ${rule.mode};`
}
const sendFileStringify = (on?: FuzzyBoolean): string => {
  if (on === FuzzyBoolean.Off) return 'sendfile off;'
  else if (on === FuzzyBoolean.On) return 'sendfile on;'
  else return ''
}
const proxySetHeaderStringify = (headers?: Header[]): string => {
  if (!headers || !headers.length) return ''

  return headers
    .map(header => `proxy_set_header ${header.key} ${header.value};`)
    .join('\n')
}
const proxyPassStringify = (address?: string): string => address ? `proxy_pass ${address}` : ''

const locationStringify = (location: Location): string => `
location ${location.path} {
  ${aligsStringify(location.alias)}
  ${tryFilesStringify(location.tryFiles)}
  ${rewriteStringify(location.rewrite)}
  ${sendFileStringify(location.sendFile)}
  ${proxySetHeaderStringify(location.proxySetHeader)}
  ${proxyPassStringify(location.proxyPass)}
}
`
export const stringify = (location?: Location[]): string => {
  if (!location) return ''

  return location
    .map(locationStringify)
    .join('\n')
}
