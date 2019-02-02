import { getRepository, getManager } from 'typeorm'
import { Certificate, NginxProxy } from '../entity'
import ServerError from '../class/ServerError'
import { ErrorMessage } from '../constant'
import { create as createCa, renew as renewCa } from './ca'
import { apply as applyNginx } from './nginx-proxy'


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

    certificate = await transactionalEntityManager.save(certificate)
    const nginxProxyIds = options.nginxProxies.map(item => item.id)
    let nginxProxies = await transactionalEntityManager.findByIds(NginxProxy, nginxProxyIds)
    nginxProxies.forEach(nginxProxy => nginxProxy.certificate = certificate)
    await transactionalEntityManager.save(nginxProxies)

    certificate = await createCa(certificate.id)
    certificate = await transactionalEntityManager.save(certificate)

    await applyNginx(certificate.id)

    return certificate
  })
}

/** 更新证书 */
export const update = async (id: number, options): Promise<Certificate> => {
  if (!validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)
  const { name, domains, ca, crtKey } = options;

  const repository = getRepository(Certificate)
  const certificate = await repository.findOne(id)
  if (!certificate) throw new ServerError(404, ErrorMessage.noCertificate)

  if (domains) certificate.domains = domains
  if (ca) certificate.ca = ca
  if (crtKey) certificate.crtKey = crtKey

  await repository.save(certificate)
  await applyNginx(certificate.id)

  return certificate
}

/** 删除证书 */
export const remove = async (id: number): Promise<void> => {
  if (!validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)

  return await getManager().transaction('SERIALIZABLE', async transactionalEntityManager => {
    const certificate = await transactionalEntityManager
      .findOne(Certificate, id, { relations: ['nginxProxies'] })
    if (!certificate) throw new ServerError(404, ErrorMessage.noCertificate)

    const promisies = certificate.nginxProxies.map(proxy => {
      proxy.certificate = null
      return transactionalEntityManager.save(proxy)
    })

    await Promise.all(promisies)
    await applyNginx(certificate.id)
    await transactionalEntityManager.delete(Certificate, id)
  })
}

/** 更新证书 */
export const renew = async (id: number): Promise<Certificate> => {
  return await getManager().transaction('SERIALIZABLE', async transactionalEntityManager => {
    const certificate = await renewCa(id)
    await applyNginx(certificate.id)

    return await transactionalEntityManager.save(certificate)
  })
}

