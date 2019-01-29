import { NginxUpstreamConfig, NginxServer } from './types'
import { indent, mapIndent, combineIndent, block } from './indent'
import { existOrEmptyString } from './existOr'


const weightStringify = existOrEmptyString((weight: number) => `weight=${weight}`)
const maxFailTimesStringify = existOrEmptyString((times: number) => `max_fails=${times}`)
const failTimeoutStringify = existOrEmptyString((timeout: number) => `fail_timeout=${timeout}`)


const serverStringify = indent((config: NginxServer) => [
  `server ${config.host} ${weightStringify(config.weight)} ${maxFailTimesStringify(config.failTimeout)} ${failTimeoutStringify(config.failTimeout)};`
])


export const stringify = combineIndent((config: NginxUpstreamConfig) => [
  `upstream ${config.name} {`,
  mapIndent(config.servers, serverStringify),
  '}',
])

