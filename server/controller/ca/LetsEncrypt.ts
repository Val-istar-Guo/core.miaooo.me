import { CAInfo, DomainTypes } from '../../types'
import { join } from 'path'
import fs from 'fs-extra'
import * as childProcess from 'child_process'
import { promisify } from 'util'
import { Path } from '../../types'
import { GetCAInfoFunc, CreateCACertificateFunc, InjectNginxConfigFunc } from './types'
import { Certificate } from '../../entity'
import { CERTIFICATE_DIR } from '../../constant/Path'
import ServerError from '../../class/ServerError';
import { ErrorMessage } from '../../constant';


const genPath = async (id: number) => {
  const filename = `${id}`
  const ROOT: Path = join(CERTIFICATE_DIR, filename)

  const CHALLENGES: Path = join(ROOT, 'challenges');
  const DOMAIN_CSR: Path = join(ROOT, 'domain.csr');
  const DOMAIN_KEY: Path = join(ROOT, 'domain.key');
  const ACCOUNT_KEY: Path = join(ROOT, 'account.key');
  const CRT: Path = join(ROOT, 'signed_chain.crt')

  await fs.ensureDir(CHALLENGES)

  return { CHALLENGES, DOMAIN_CSR, DOMAIN_KEY, ACCOUNT_KEY, CRT }
}

const exec = promisify(childProcess.exec)


/** 生成rsa私钥 */
const genRsa = async (size: number): Promise<string> => {
  const { stdout } = await exec(`openssl genrsa ${size}`)
  return stdout
}

const genAccountKey = async (paths): Promise<void> => {
  const accountKey = await genRsa(4096)
  await fs.writeFile(paths.ACCOUNT_KEY, accountKey)
}

const genDomainKey = async (paths): Promise<void> => {
  const domainKey = await genRsa(4096)
  await fs.writeFile(paths.DOMAIN_KEY, domainKey)
}

/** 获取openssl配置文件路径 */
const getOpensslConfigFilePath = async () => {
  const { stdout, stderr } = await exec('openssl version -a | grep OPENSSLDIR')

  if (stderr) throw new Error(stderr)

  console.log(stdout)
  const matched = stdout.match(/^OPENSSLDIR: "(.+)"/)
  if (!matched) throw new Error('无法找到openssl的配置文件')
  console.log('config file path => ', matched)

  return matched[1]
}

const genCSR = async (paths, domains: string[]) => {
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





/** 证书信息 */
export const getInfo: GetCAInfoFunc = async () => ({
  name: "Let's Encrypt",
  support: [DomainTypes.Many, DomainTypes.Pan, DomainTypes.Signle]
});

/** 创建证书 */
export const create: CreateCACertificateFunc = async certificate => {
  if (!certificate.nginxProxies.length) throw new ServerError(400, ErrorMessage.unableCreateLetsEncrypt.noProxy)

  const paths = await genPath(certificate.id)

  await genAccountKey(paths)
  await genDomainKey(paths)
  await genCSR(paths, certificate.domains)
  certificate.crt = paths.CRT
  certificate.crtKey = paths.DOMAIN_KEY
  certificate.lastRefreshTime = new Date()

  return certificate
}

export const injectNginx: InjectNginxConfigFunc = async (config, certificate) => {
  if (!config.http || !config.http.location) {
    throw new ServerError(400, ErrorMessage.needEnableNginxHttpBeforeCreateLetsEncrypt)
  }

  const { CHALLENGES } = await genPath(certificate.id)
  config.http.location.unshift({
    path: '/.well-known/acme-challenge/',
    alias: CHALLENGES,
    tryFiles: '$uri =404',
  })
}
