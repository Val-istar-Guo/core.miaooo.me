import fs from 'fs-extra'
import childProcess from 'child_process'
import { promisify } from 'util'
import Certificate from './Certificate'
import { CERTIFICATE_DIR } from '../../constant'


const exec = promisify(childProcess.exec)
const genRsa = async size => {
  const { stdout, stderr } = await exec(`openssl genrsa ${size}`)

  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}

const genAccountKey = async paths => {
  await genRsa(4096)
}

const genDomainKey = async paths => {
  await genRsa(4096)
}

const getOpensslConfigFilePath = async () => {
  const { stdout, stderr } = await exec('openssl version -a | grep OPENSSLDIR')

  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}

const genCSR = async (path, domains) => {
  await getOpensslConfigFilePath()
  const subjectAltName = domains.map(domain => `DNS:${domain}`).join(',')
  const { stdout, stderr } = await exec(`openssl req -new -sha256 -key domain.key -subj "/" -reqexts SAN -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\nsubjectAltName=${subjectAltName}"))`)

  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}

const genCRT = async (paths) => {
  const { CHALLENGES, DOMAIN_CSR, ACCOUNT_KEY, ACME_TINY_PY } = paths
  const { stdout, stderr } = await exec(`python ${ACME_TINY_PY} --account-key ${ACCOUNT_KEY} --csr ${DOMAIN_CSR} --acme-dir ${CHALLENGES}`)

  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}



export default class extends Certificate {
  get caName () {
    return "Let's Encrypt"
  }

  static async create({ name, domains }) {
    const ROOT = join(CERTIFICATE_DIR, name)
    if (fs.pathExists(ROOT)) throw new Error(`${name} 证书已存在`)

    const paths = {
      CHALLENGES: join(ROOT, 'challenges'),
      DOMAIN_CSR: join(ROOT, 'domain.csr'),
      DOMAIN_KEY: join(ROOT, 'domain.key'),
      ACCOUNT_KEY: join(ROOT, 'account.key')
    }

    await fs.ensureDir(paths.CHALLENGES_PATH)
    await genAccountKey(paths)
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

    if (config[0][1].every(item => !/^listen 80$/.test(item))) throw new Error(`${Certificate.caName} 证书必须要启用 http`)

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
