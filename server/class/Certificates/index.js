import { join } from 'path'
import fs from 'fs-extra'
import { CERTIFICATE_DIR } from '../../constant'
import LetsEncrypt from './LetsEncrypt'


const certificates = {
  LetsEncrypt,
}

class Certificates {
  constructor(name) {
    this.name = name
    this.path = join(CERTIFICATE_DIR, name)
    this.loaded = false

    this.certificate = null
  }

  async load() {
    if (this.loaded) return

    const config = fs.readJSON(join(this.path, 'certificate.json'))
    const Certificate = certificates[config.type]

    if (Certificate) throw new Error(`${this.name} 证书信息已损坏`)
    this.certificate = new Certificate(this.name)

    this.loaded = true
  }

  async fillNginxConfig(...arg) {
    await this.load()
    await this.certificate.fillNginxConfig(...arg)
  }

  static async create(type, options) {
    if (!(type in certificates)) throw new Error(`${type} 证书不支持创建`)

    await certificates[type].create(options)

    return new Certificates(options.name)
  }
}

export default Certificates
