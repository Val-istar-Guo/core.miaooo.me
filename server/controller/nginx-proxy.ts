import fs from 'fs-extra'
import { NginxProxy } from '../entity'
import { getRepository } from 'typeorm';
import ServerError from '../class/ServerError';
import { ErrorMessage } from '../constant';
import { join } from 'path';
import { NGINX_CONF_DIR } from '../constant/path';
import { stringify, NginxConfig, NginxRewriteMode, NginxFuzzyBoolean, NginxLocation, NginxSSLConfig, NginxUpstreamConfig } from '../utils/nginx-config-parser'
import { Path } from '../types';
import * as CA from './ca'
import * as childProcess from 'child_process'
import { promisify } from 'util'


const exec = promisify(childProcess.exec)
const validateId = id => typeof id === 'number' && id > 0;

/** 重载nginx配置 */
export const reloadNginxConfig = async () => {
  console.log('[Nginx Proxy:重载nginx配置]')
  const { stdout, stderr } = await exec('sudo nginx -s reload')

  if (stderr) console.log(stderr)
  if (stdout) console.log(stdout)
}

const getNginxConfigPath = (config: NginxProxy): Path => {
  const filename = `${config.id}`
  return join(NGINX_CONF_DIR, filename)
}


/** 使用此nginx代理的应用是否存在机器 */
const hasMechines = (proxy: NginxProxy): Boolean => !!(proxy.application && proxy.application.mechines)


const genServiceLocation = (upstreamName: string): NginxLocation => {
  const location: NginxLocation = { path: '/' }
  location.sendFile = NginxFuzzyBoolean.On
  location.proxySetHeader = [
    { key: 'X-Real-IP', value: '$remote_addr' },
    { key: 'Host', value: '$http_host' },
  ]
  location.proxyPass = `http://${upstreamName}`

  return location
}

const genRedirectHttpsLocation = (): NginxLocation => {
  const location: NginxLocation = { path: '/' }

  location.rewrite = {
    from: '^/(.*)',
    to: 'https://$host$request_uri',
    mode: NginxRewriteMode.Permanent,
  }

  return location
}

const genNginxSSL = (proxy: NginxProxy): NginxSSLConfig => {
  const ssl: NginxSSLConfig = {
    certificate: proxy.certificate ? proxy.certificate.crt : '',
    certificateKey: proxy.certificate ? proxy.certificate.crtKey : '',
    sessionTimeout: proxy.sslSessionTimeout,
    protocols: proxy.sslProtocols,
    ciphers: proxy.sslCiphers,
    sessionCache: proxy.sslSessionCache,
    preferServerCiphers: proxy.sslPreferServerCiphers,
    stapling: proxy.sslStapling,
  }

  return ssl
}

const genNginxUpstream = (proxy: NginxProxy): NginxUpstreamConfig => {
  const servers = proxy.application.mechines
    .filter(mechine => !mechine.disabled)
    .map(mechine => ({ host: `${mechine.publicIp}:${mechine.port}` }))

  const config: NginxUpstreamConfig = {
    name: `${proxy.application.key}_${proxy.id}`,
    servers,
  }

  return config
}

const genNginxConfig = async (proxy: NginxProxy): Promise<NginxConfig> => {
  const config: NginxConfig = {}

  // 没有域名，不生成代理
  if (!proxy.domains) return config

  if (hasMechines(proxy)) config.upstream = genNginxUpstream(proxy)

  if (proxy.enableHttp) {
    config.http = {}
    config.http.serviceName = proxy.domains
    config.http.location = []

    if (proxy.redirectHttps) {
      // 重定向Https
      const location = genRedirectHttpsLocation()
      config.http.location.push(location)
    } else if (config.upstream) {
      // 获取服务信息
      const location = genServiceLocation(config.upstream.name)
      config.http.location.push(location)
    }
  }

  if (proxy.enableHttps && proxy.certificate) {
    config.https = {}
    config.https.serviceName = proxy.domains
    config.https.location = []
    config.https.ssl = genNginxSSL(proxy)

    if (config.upstream) {
      const location = genServiceLocation(config.upstream.name)
      config.https.location.push(location)
    }

    await CA.injectNginx(config, proxy.certificate.id)
  }

  return config
}

/** 将代理信息生成nginx文件 */
export const apply = async (id: number): Promise<void> => {
  console.log('[nginx proxy:生成nginx文件]')
  const repository = getRepository(NginxProxy)
  const proxy = await repository.findOne(id, {
    join: {
      alias: 'proxy',
      leftJoinAndSelect: {
        certificate: 'proxy.certificate',
        application: 'proxy.application',
        mechines: 'application.mechines',
      },
    },
  })

  if (!proxy) throw new ServerError(404, ErrorMessage.noNginxProxy)

  const config = await genNginxConfig(proxy)
  const CONFIG_PATH = getNginxConfigPath(proxy)
  await fs.ensureDir(NGINX_CONF_DIR)
  await fs.writeFile(CONFIG_PATH, stringify(config))
  await reloadNginxConfig()
}


/** 获取nginx代理列表 */
export const getList = async (): Promise<NginxProxy[]> => {
  const repository = getRepository(NginxProxy)
  return await repository.find({ relations: ['application'] })
}

/** 获取nginx代理配置信息 */
export const getInfo = async (id: number): Promise<NginxProxy> => {
  if (!validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)

  const repository = getRepository(NginxProxy)
  const nginxProxy = await repository.findOne(id)

  if (!nginxProxy) throw new ServerError(404, ErrorMessage.noNginxProxy)
  return nginxProxy
}

/** 创建nginx代理 */
export const create = async (options): Promise<NginxProxy> => {
  const {
    id, domains, enableHttp, enableHttps, application, certificate, redirectHttps,
    sslCiphers, sslPreferServerCiphers, sslProtocols, sslSessionCache,
    sslSessionTimeout, sslStapling,
  } = options
  if (validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)

  const repository = getRepository(NginxProxy)
  const nginxProxy = new NginxProxy()
  if (domains) nginxProxy.domains = domains
  if (typeof enableHttp === 'boolean') nginxProxy.enableHttp = enableHttp
  if (typeof enableHttps === 'boolean') nginxProxy.enableHttps = enableHttps
  if (typeof redirectHttps === 'boolean') nginxProxy.redirectHttps = redirectHttps
  if (application) nginxProxy.application = application
  if (certificate) nginxProxy.certificate = certificate
  if (sslCiphers) nginxProxy.sslCiphers = sslCiphers
  if (typeof sslPreferServerCiphers === 'boolean') nginxProxy.sslPreferServerCiphers = sslPreferServerCiphers
  if (sslProtocols) nginxProxy.sslProtocols = sslProtocols
  if (sslSessionCache) nginxProxy.sslSessionCache = sslSessionCache
  if (sslSessionTimeout) nginxProxy.sslSessionTimeout = sslSessionTimeout
  if (typeof sslStapling === 'boolean') nginxProxy.sslStapling = sslStapling

  await repository.save(nginxProxy)
  await apply(nginxProxy.id)
  return nginxProxy
}

/** 更新nginx代理 */
export const update = async (id: number, options): Promise<NginxProxy> => {
  if (validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)

  const {
    domains, enableHttp, enableHttps, application, certificate, redirectHttps,
    sslCiphers, sslPreferServerCiphers, sslProtocols, sslSessionCache,
    sslSessionTimeout, sslStapling,
  } = options

  const repository = getRepository(NginxProxy)

  const nginxProxy = await repository.findOne(id)
  if (!nginxProxy) throw new ServerError(404, ErrorMessage.noNginxProxy)

  if (domains) nginxProxy.domains = domains
  if (typeof enableHttp === 'boolean') nginxProxy.enableHttp = enableHttp
  if (typeof enableHttps === 'boolean') nginxProxy.enableHttps = enableHttps
  if (typeof redirectHttps === 'boolean') nginxProxy.redirectHttps = redirectHttps
  if (application === null) nginxProxy.application = application
  if (certificate) nginxProxy.certificate = certificate
  if (sslCiphers) nginxProxy.sslCiphers = sslCiphers
  if (typeof sslPreferServerCiphers === 'boolean') nginxProxy.sslPreferServerCiphers = sslPreferServerCiphers
  if (sslProtocols) nginxProxy.sslProtocols = sslProtocols
  if (sslSessionCache) nginxProxy.sslSessionCache = sslSessionCache
  if (sslSessionTimeout) nginxProxy.sslSessionTimeout = sslSessionTimeout
  if (typeof sslStapling === 'boolean') nginxProxy.sslStapling = sslStapling

  const np = await repository.save(nginxProxy)
  await apply(np.id)
  return np
}

/** 删除nginx代理 */
export const remove = async (id: number): Promise<void> => {
  if (!validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)

  const repository = getRepository(NginxProxy)
  const nginxProxy = await repository.findOne(id)
  if (!nginxProxy) throw new ServerError(404, ErrorMessage.noNginxProxy)

  await repository.delete(id)
  const CONFIG_PATH = getNginxConfigPath(nginxProxy)
  if (await fs.pathExists(CONFIG_PATH)) await fs.remove(CONFIG_PATH)
}
