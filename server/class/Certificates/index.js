import { join } from 'path'
import fs from 'fs-extra'
import { CERTIFICATE_DIR } from '../../constant'
import LetsEncrypt from './LetsEncrypt'


const certificates = {
  LetsEncrypt,
}

class Certificates {
  static get certificates() {
    return Object.entries(certificates)
      .map(([type, Certificate]) => ({ type, caName: Certificate.caName }))
  }

  constructor(name) {
    this.name = name
    this.path = join(CERTIFICATE_DIR, name)
    this.loaded = false

    this.config = {}
    this.certificate = null
  }

  async exist() {
    return await fs.exists(this.path)
  }

  async load() {
    if (this.loaded) return

    const config = await fs.readJSON(join(this.path, 'certificate.json'))
    const Certificate = certificates[config.type]

    if (!Certificate) throw new Error(`${this.name} 证书信息已损坏`)
    this.certificate = new Certificate(this.name)
    this.config = config

    this.loaded = true
  }

  async fillNginxConfig(...arg) {
    await this.load()
    await this.certificate.fillNginxConfig(...arg)
  }

  async delete() {
    if (!await this.exist()) throw new Error(`${this.name} 服务不存在`)

    await this.load()
    await this.certificate.delete()

    await fs.remove(this.path)
  }

  static async create(options) {
    const { type, name, domains } = options

    if (!type) throw new Error('请设置证书类型')
    if (!name) throw new Error('请设置证书名称')

    if (!(type in certificates)) throw new Error(`${type} 证书不支持创建`)

    const ROOT = join(CERTIFICATE_DIR, name)
    const CONFIG = join(ROOT, 'certificate.json')
    if (await fs.pathExists(ROOT)) throw new Error(`${name} 证书已存在`)

    await certificates[type].create(options)
    await fs.writeJSON(CONFIG, { type, name, domains })

    return new Certificates(options.name)
  }

  async info() {
    await this.load()

    return this.config
  }

}

export default Certificates
