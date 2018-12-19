import fs from 'fs-extra'
import { join } from 'path'
import { APPLICATION_DIR } from '../constant'
import Certificates from './Certificates'
import { mergeDeepLeft } from 'ramda'


const parseNginxConfig = array => array
  .map(item => {
    if (Array.isArray(item)) {
      const key = item[0]
      if (!item[1].length) return ''

      const props = parseNginxConfig(item[1]).replace(/^/mg, '  ')

      return `${key} {\n${props}\n}`
    } else if (typeof item === 'string') {
      return item
    } else {
      throw new Error('nginx 配置格式错误')
    }
  })
  .join(';\n')

const buildNginxConf = async (config) => {
  // NOTE: 没有服务，应用就没有意义
  if (!config.service) return []

  const nginxConfig = [
    ['server', []],
    ['server', []]
  ]

  if (config.enableHttp) {
    nginxConfig[0][1] = [
      'listen 80',
      config.domains ? `server_name ${config.domains.join(' ')}` : '',
    ]

    if (config.redirectHttps) {
      nginxConfig[0][1].push([
        'location /',
        ['rewrite ^/(.*) https://$server_name$1 permanent']
      ])
    } else if (config.service) {
      await config.service.fillNginxConfig(nginxConfig[0][1])
    }
  }

  console.log('nginx config => ', nginxConfig)

  if (config.certificate) {
    nginxConfig[1][1] = [
      'listen 443 ssl',

      `server_name ${config.domains.join(' ')}`,
      `ssl_session_timeout ${config.sessionTimeout}`,
      `ssl_protocols ${config.protocols.join(' ')}`,
      `ssl_ciphers ${config.ciphers.join(':')}`,
      `ssl_session_cache ${config.sessionCache}`,
      config.preferServerCiphers ? 'ssl_prefer_server_ciphers on' : '',
      config.stapling ? 'ssl_stapling on' : '',
    ]

    await config.certificate.fillNginxConfig(nginxConfig)

    if (config.service) {
      await config.service.fillNginxConfig(nginxConfig[1][1])
    }
  }

  console.log('nginx config => ', nginxConfig)

  return parseNginxConfig(nginxConfig)
}

class Application {
  constructor(name) {
    this.name = name

    this.loaded = false
  }

  get path() {
    return join(APPLICATION_DIR, this.name)
  }


  async exist() {
    return await fs.exists(this.path)
  }

  async delete() {
    if (!await this.exist()) throw new Error(`${this.name} 服务不存在`)

    await fs.remove(this.path)
  }

  async load() {
    if (this.loaded) return

    if (!await this.exist()) throw new Error(`${this.name} 服务不存在`)

    const config = await fs.readJSON(join(this.path, 'application.json'))
    this.config = config

    if (this.config.certificate) this.config.certificate = new Certificates(this.config.certificate)
    if (this.config.service) this.config.service = new Service(this.config.service)

    this.nginxConfig = await fs.readFile(join(this.path, 'nginx.conf'))

    this.loaded = true
  }

  async reload() {
    this.loaded = false
    this.load()
  }

  async refreshNginxConfig() {
    this.nginxConfig = await buildNginxConf(this.config)
    const NGINX_CONF = join(this.path, 'nginx.conf')
    await fs.writeFile(NGINX_CONF, this.nginxConfig)
  }


  static async create(options) {
    const { name } = options

    if (!name) throw new Error('请填写应用名称')

    const PATH = join(APPLICATION_DIR, name)
    if (await fs.exists(PATH)) throw new Error('服务已存在，无法创建')

    const APPLICATION_JSON = join(PATH, 'application.json')
    const NGINX_CONF = join(PATH, 'nginx.conf')

    await fs.ensureFile(NGINX_CONF)
    await fs.ensureFile(APPLICATION_JSON)


    const config = {
      domains: [],
      enableHttp: true,
      redirectHttps: false,
      ssl: {
        sessionTimeout: '5m',
        protocols: ['TLSv1', 'TLSv1.1', 'TLSv1.2'],
        ciphers: [
          'ECDHE-RSA-AES256-GCM-SHA384', 'ECDHE-RSA-AES128-GCM-SHA256',
          'DHE-RSA-AES256-GCM-SHA384', 'ECDHE-RSA-AES256-SHA384', 'ECDHE-RSA-AES128-SHA256',
          'ECDHE-RSA-AES256-SHA', 'ECDHE-RSA-AES128-SHA', 'DHE-RSA-AES256-SHA',
          'DHE-RSA-AES128-SHA',
        ],
        sessionCache: 'shared:SSL:50m',
        preferServerCiphers: true,
        stapling: true,
      },
    }

    await fs.writeJSON(APPLICATION_JSON, config)
    const nginxConfig = await buildNginxConf(config)
    await fs.writeFile(NGINX_CONF, nginxConfig)

    return new Application(name)
  }

  async info() {
    await this.load()

    return this.config
  }

  async update (config) {
    await this.load()
    if (config.name) throw new Error('暂时不支持修改应用名称')
    this.config = mergeDeepLeft(config, this.config)
    await fs.writeJSON(join(this.path, 'application.json'), this.config)

    await this.refreshNginxConfig()
  }
}

export default Application
