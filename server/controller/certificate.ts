import { getRepository } from 'typeorm'
import { Certificate } from '../entity'
import ServerError from '../class/ServerError'
import { ErrorMessage } from '../constant'


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
  const { name, domains, ca, crtKey, crt } = options

  const repository = getRepository(Certificate)
  const certificate = new Certificate()
  certificate.name = name
  certificate.domains = domains
  certificate.ca = ca
  certificate.crtKey = crtKey
  certificate.crt = crt

  await repository.save(certificate)
  return certificate
}

/** 更新证书 */
export const update = async (id: string, options): Promise<Certificate> => {
  if (!validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)
  const { name, domains, ca, crtKey } = options;

  const repository = getRepository(Certificate)
  const certificate = await repository.findOne(id)
  if (!certificate) throw new ServerError(404, ErrorMessage.noCertificate)

  if (name) certificate.name = name
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

