import { NginxUpstreamConfig, NginxServer } from "./types";


const weightStringify = (weight?: number): string => weight ? `weight=${weight}` : ''
const maxFailTimesStringify = (times?: number): string => times ? `max_fails=${times}` : ''
const failTimeoutStringify = (timeout?: number): string => timeout ? `fail_timeout=${timeout}` : ''

const serverStringify = (config: NginxServer): string => `
  server ${config.host} ${weightStringify(config.weight)} ${maxFailTimesStringify(config.failTimeout)} ${failTimeoutStringify(config.failTimeout)};
`

const upstreamStringify = (config: NginxUpstreamConfig): string => `
upstream ${config.name} {
${config.servers.map(serverStringify)}
}
`

export const stringify = (config?: NginxUpstreamConfig): string => config ? upstreamStringify(config) : ''
