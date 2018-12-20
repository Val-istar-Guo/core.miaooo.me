import { join } from 'path'
import { CERTIFICATE_DIR } from '../../constant'


class Certificate {
  constructor (name) {
    this.name = name
    this.path = join(CERTIFICATE_DIR, name)
  }

  static async create(path) {
    throw new Error(`${this.name} 证书不支持创建`)
  }

  async renew() {
  }

  async fillNginxConfig(config) {
    const index = config[0][1].findIndex(item => item[0] && /^location/.test(item[0]))
    config[0][1].splice(index, 0,
      `ssl_certificate ${this.crt}`,
      `ssl_certificate_key ${this.key}`,
    )
  }

  async delete() {

  }
}


export default Certificate
