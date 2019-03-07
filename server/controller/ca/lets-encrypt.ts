import { CAInfo, DomainTypes } from '../../types'
import { join, resolve } from 'path'
import fs from 'fs-extra'
import * as childProcess from 'child_process'
import { promisify } from 'util'
import env from 'detect-env'
import { Path } from '../../types'
import { GetCAInfoFunc, CreateCACertificateFunc, InjectNginxConfigFunc, RenewCACertificateFunc } from './types'
import { Certificate } from '../../entity'
import { CERTIFICATE_DIR } from '../../constant/path'
import ServerError from '../../class/ServerError';
import { ErrorMessage } from '../../constant';
import { apply as applyNginx } from '../nginx-proxy'


/** 获取openssl配置文件路径 */
const getOpensslConfigFilePath = async () => {
  console.log('[Lets Encrypt:获取openssl配置文件路径]')
  const { stdout, stderr } = await exec('openssl version -d')

  if (stderr) throw new Error(stderr)

  const matched = stdout.match(/"(.*)"/)
  if (!matched) throw new Error('无法找到openssl的配置文件')

  return `${matched.pop()}/openssl.cnf`
}

const genPath = async (id: number) => {
  console.log('[Lets Encrypt:生成路径]')
  const filename = `${id}`
  const ROOT: Path = join(CERTIFICATE_DIR, filename)

  const CHALLENGES: Path = join(ROOT, 'challenges/')
  const DOMAIN_CSR: Path = join(ROOT, 'domain.csr')
  const DOMAIN_KEY: Path = join(ROOT, 'domain.key')
  const ACCOUNT_KEY: Path = join(ROOT, 'account.key')
  const ACME_TINY_PY: Path = join(resolve('.'), 'bin', 'acme_tiny.py')
  const CRT: Path = join(ROOT, 'signed_chain.crt')
  const OPENSSL_CONFIG: Path = await getOpensslConfigFilePath()

  await fs.ensureDir(CHALLENGES)

  return { CHALLENGES, DOMAIN_CSR, DOMAIN_KEY, ACCOUNT_KEY, CRT, OPENSSL_CONFIG, ACME_TINY_PY }
}

const exec = promisify(childProcess.exec)


/** 生成rsa私钥 */
const genRsa = async (size: number): Promise<string> => {
  console.log('[Lets Encrypt:生成Rsa私钥]')
  const { stdout } = await exec(`openssl genrsa ${size}`)
  return stdout
}

const genAccountKey = async (paths): Promise<void> => {
  console.log('[Lets Encrypt:生成account key]')
  const accountKey = await genRsa(4096)
  await fs.writeFile(paths.ACCOUNT_KEY, accountKey)
}

const genDomainKey = async (paths): Promise<void> => {
  console.log('[Lets Encrypt:生成domain.key]')
  const domainKey = await genRsa(4096)
  await fs.writeFile(paths.DOMAIN_KEY, domainKey)
}

const genCSR = async (paths, domains: string[]) => {
  console.log('[Lets Encrypt:生成CSR]')
  const subjectAltName = domains.map(domain => `DNS:${domain}`).join(',')
  const { stdout, stderr } = await exec(`openssl req -new -sha256 -key ${paths.DOMAIN_KEY} -subj "/" -reqexts SAN -config <(cat ${paths.OPENSSL_CONFIG} <(printf "[SAN]\\nsubjectAltName=${subjectAltName}"))`, { shell: "/bin/bash" })

  await fs.writeFile(paths.DOMAIN_CSR, stdout)
}

const genCRT = async (paths) => {
  console.log('[Lets Encrypt:生成CRT]')
  const { CHALLENGES, DOMAIN_CSR, ACCOUNT_KEY, ACME_TINY_PY } = paths
  const { stdout, stderr } = await exec(`python ${ACME_TINY_PY} --account-key ${ACCOUNT_KEY} --csr ${DOMAIN_CSR} --acme-dir ${CHALLENGES}`)

  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
  await fs.writeFile(paths.CRT, stdout)
}





/** 证书信息 */
export const getInfo: GetCAInfoFunc = async () => ({
  name: "Let's Encrypt",
  support: [DomainTypes.Many, DomainTypes.Pan, DomainTypes.Signle]
});

/** 创建证书 */
export const create: CreateCACertificateFunc = async certificate => {
  console.log('[Lets Encrypt:创建证书]')
  if (!certificate.nginxProxies.length) throw new ServerError(400, ErrorMessage.unableCreateLetsEncrypt.noProxy)

  const paths = await genPath(certificate.id)

  await genAccountKey(paths)
  await genDomainKey(paths)
  await genCSR(paths, certificate.domains)
  await Promise.all(certificate.nginxProxies.map(proxy => applyNginx(proxy.id)))
  if (env.is.prod) await genCRT(paths)

  certificate.crt = paths.CRT
  certificate.crtKey = paths.DOMAIN_KEY
  certificate.lastRefreshTime = new Date()

  return certificate
}

export const renew: RenewCACertificateFunc = async certificate => {
  console.log('[Lets Encrypt:更新证书]')
  if (!certificate.nginxProxies.length) throw new ServerError(400, ErrorMessage.unableCreateLetsEncrypt.noProxy)

  const paths = await genPath(certificate.id)

  await Promise.all(certificate.nginxProxies.map(proxy => applyNginx(proxy.id)))
  await genCRT(paths)

  certificate.crt = paths.CRT
  certificate.crtKey = paths.DOMAIN_KEY
  certificate.lastRefreshTime = new Date()

  return certificate
}

export const injectNginx: InjectNginxConfigFunc = async (config, certificate) => {
  console.log('[Lets Encrypt:插入nginx配置]')
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
