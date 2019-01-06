class LetsEncrypt extends Certificate {
  static get caName () {
    return "Let's Encrypt"
  }

  static async create({ name, domains }) {
    const ROOT = join(CERTIFICATE_DIR, name)

    const paths = {
      CHALLENGES: join(ROOT, 'challenges'),
      DOMAIN_CSR: join(ROOT, 'domain.csr'),
      DOMAIN_KEY: join(ROOT, 'domain.key'),
      ACCOUNT_KEY: join(ROOT, 'account.key')
    }

    await fs.ensureDir(paths.CHALLENGES)
    await genAccountKey(paths)
    await genDomainKey(paths)
    await genCSR(paths, domains)
  }

  get crt() {
    return join(this.path, 'signed_chain.crt')
  }

  get key() {
    return join(this.path, 'domain.key')
  }

  get challenges() {
    return join(this.path, 'challenges')
  }

  async renew() {

  }


  async fillNginxConfig(config) {
    super.fillNginxConfig(config)

    if (config[0][1].every(item => !/^listen 80$/.test(item))) throw new Error(`${LetsEncrypt.caName} 证书必须要启用 http`)

    const index = config[0][1].findIndex(item => item[0] && /^location/.test(item[0]))

    config[0][1].splice(index, 0, [
      'location /.well-known/acme-challenge/',
      [
        `alias ${this.challenges}`,
        'try_files $uri =404',
      ]
    ])
  }
}

export default LetsEncrypt
