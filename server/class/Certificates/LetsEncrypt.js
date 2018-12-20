import fs from 'fs-extra'
import childProcess from 'child_process'
import { join } from 'path'
import { promisify } from 'util'
import Certificate from './Certificate'
import { CERTIFICATE_DIR } from '../../constant'


const exec = promisify(childProcess.exec)
const genRsa = async size => {
  const { stdout } = await exec(`openssl genrsa ${size}`)

  return stdout
}

const genAccountKey = async paths => {
  const accountKey = await genRsa(4096)
  await fs.writeFile(paths.ACCOUNT_KEY, accountKey)
}

const genDomainKey = async paths => {
  const domainKey = await genRsa(4096)
  await fs.writeFile(paths.DOMAIN_KEY, domainKey)
}

const getOpensslConfigFilePath = async () => {
  const { stdout, stderr } = await exec('openssl version -a | grep OPENSSLDIR')

  if (stderr) throw new Error(stderr)

  console.log(stdout)
  const matched = stdout.match(/^OPENSSLDIR: "(.+)"/)
  if (!matched) throw new Error('无法找到openssl的配置文件')
  console.log('config file path => ', matched)

  return matched[1]
}

const genCSR = async (paths, domains) => {
  await getOpensslConfigFilePath()
  const subjectAltName = domains.map(domain => `DNS:${domain}`).join(',')
  const { stdout, stderr } = await exec(`openssl req -new -sha256 -key ${paths.DOMAIN_KEY} -subj "/" -reqexts SAN -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\\nsubjectAltName=${subjectAltName}"))`, { shell: "/bin/bash" })

  await fs.writeFile(paths.DOMAIN_CSR, stdout)
}

const genCRT = async (paths) => {
  const { CHALLENGES, DOMAIN_CSR, ACCOUNT_KEY, ACME_TINY_PY } = paths
  const { stdout, stderr } = await exec(`python ${ACME_TINY_PY} --account-key ${ACCOUNT_KEY} --csr ${DOMAIN_CSR} --acme-dir ${CHALLENGES}`)

  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}



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
