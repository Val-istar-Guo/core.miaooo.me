import { getRepository } from 'typeorm'
import { Certificate } from '../database/entity'
import ServerError from '../class/ServerError'
import ErrorMessage from '../constant/errorMessage'


/** 校验应用key值 */
const validateKey = (key: string): Boolean => /^certificate\.(letsencrypt)(\.[a-zA-Z-]+)+$/.test(key)


export const getList = async (): Promise<Certificate[]> => {
  const repository = getRepository(Certificate)
  return await repository.find()
}

export const getInfo = async (key: string): Promise<Certificate> => {
  if (validateKey(key)) throw new ServerError(400, ErrorMessage.illegalKey)

  const repository = getRepository(Certificate)
  const certificate = await repository.findOne(key)

  if (!certificate) throw new ServerError(404, ErrorMessage.noCertificate)
  return certificate
}

export const create = async (options): Promise<Certificate> => {
  const { key, name, domains, ca, crtKey, crt } = options
  if (validateKey(key)) throw new ServerError(400, ErrorMessage.illegalKey)

  const repository = getRepository(Certificate)
  const certificate = new Certificate()
  certificate.key = key
  certificate.name = name
  certificate.domains = domains
  certificate.ca = ca
  certificate.crtKey = crtKey
  certificate.crt = crt

  if (repository.hasId(certificate)) throw new ServerError(400, ErrorMessage.createExistCertificate)
  await repository.save(certificate)
  return certificate
}
