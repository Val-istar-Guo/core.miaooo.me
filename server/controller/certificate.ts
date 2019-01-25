import { getRepository, getManager } from 'typeorm'
import { Certificate, NginxProxy } from '../entity'
import ServerError from '../class/ServerError'
import { ErrorMessage } from '../constant'
import { create as createCa } from './ca'


const validateId = id => typeof id === 'number' && id > 0;

/** 获取证书列表 */
export const getList = async (): Promise<Certificate[]> => {
  const repository = getRepository(Certificate)
  return await repository.find()
}

/** 获取证书信息 */
export const getInfo = async (id: string): Promise<Certificate> => {
  if (validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)

  const repository = getRepository(Certificate)
  const certificate = await repository.findOne(id)

  if (!certificate) throw new ServerError(404, ErrorMessage.noCertificate)
  return certificate
}

/** 创建证书 */
export const create = async (options): Promise<Certificate> => {
  const { domains, ca } = options
  return await getManager().transaction('SERIALIZABLE', async transactionalEntityManager => {
    let certificate = new Certificate()
    certificate.domains = domains
    certificate.ca = ca
    // certificate.crtKey = crtKey
    // certificate.crt = crt
    // certificate.lastRefreshTime = new Date()
    // if (Array.isArray(nginxProxies)) {
    //   const ids = nginxProxies.map(item => item.id)
    //   // const proxies = await transactionalEntityManager.findByIds(NginxProxy, ids)
    //   console.log('ids[0] => ', ids[0])
    //   // certificate.nginxProxies = proxies
    //   if (ids[0]) {
    //     const proxy = await transactionalEntityManager.findOne(NginxProxy, ids[0])
    //     console.log('proxy => ', proxy)
    //     if (proxy) certificate.nginxProxies = [proxy]
    //   }
    // }

    certificate = await transactionalEntityManager.save(certificate)
    const nginxProxyIds = options.nginxProxies.map(item => item.id)
    console.log('nginxProxyIds => ', nginxProxyIds)
    let nginxProxies = await transactionalEntityManager.findByIds(NginxProxy, nginxProxyIds)
    console.log('nginxProxies => ', nginxProxies)
    nginxProxies.forEach(nginxProxy => nginxProxy.certificate = certificate)
    console.log('nginxProxies => ', nginxProxies)
    await transactionalEntityManager.save(nginxProxies)

    certificate = await createCa(certificate.id)
    certificate = await transactionalEntityManager.save(certificate)


    return certificate
  })
}

/** 更新证书 */
export const update = async (id: string, options): Promise<Certificate> => {
  if (!validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)
  const { name, domains, ca, crtKey } = options;

  const repository = getRepository(Certificate)
  const certificate = await repository.findOne(id)
  if (!certificate) throw new ServerError(404, ErrorMessage.noCertificate)

  if (domains) certificate.domains = domains
  if (ca) certificate.ca = ca
  if (crtKey) certificate.crtKey = crtKey

  await repository.save(certificate)

  return certificate
}

/** 删除证书 */
export const remove = async (id: string): Promise<void> => {
  if (!validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)

  const repository = getRepository(Certificate)
  const certificate = await repository.findOne(id)
  if (!certificate) throw new ServerError(404, ErrorMessage.noCertificate)

  await repository.delete(id)
}

