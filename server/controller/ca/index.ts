import * as LetsEncrypt from './LetsEncrypt'
import { CAInfo, CATypes } from '../../types'
import { Certificate } from '../../entity';
import ServerError from '../../class/ServerError';
import { ErrorMessage } from '../../constant';
import { NginxConfig } from '../../utils/nginx-config-parser';
import { join } from 'path';
import { CERTIFICATE_DIR } from '../../constant/Path';
import { getRepository } from 'typeorm';


/** 获取ca列表 */
export const getList = async (): Promise<CAInfo[]> => ([
  await LetsEncrypt.getInfo()
])

/** 获取证书信息 */
export const getInfo = async (type: CATypes): Promise<CAInfo | undefined> => {
  if (type === CATypes.LetsEncrypt) return await LetsEncrypt.getInfo()
}

/** 创建证书 */
export const create = async (id: number): Promise<Certificate> => {
  const repository = getRepository(Certificate)
  const certificate = await repository.findOne(id, { relations: ['nginxProxies'] })
  if (!certificate) throw new ServerError(400, ErrorMessage.noCertificate)
  console.log('certificate => ', certificate)


  if (certificate.ca === CATypes.LetsEncrypt) return await LetsEncrypt.create(certificate)
  throw new ServerError(400, ErrorMessage.caNotSupport)
}

export const injectNginx = async (config: NginxConfig, certificate: Certificate): Promise<void> => {
  if (certificate.ca === CATypes.LetsEncrypt) return await LetsEncrypt.injectNginx(config, certificate)

  throw new ServerError(400, ErrorMessage.caNotSupport)
}

