import * as LetsEncrypt from './LetsEncrypt'
import { CAInfo, CATypes } from '../../types'
import { Certificate } from '../../entity';
import ServerError from '../../class/ServerError';
import { ErrorMessage } from '../../constant';
import { NginxConfig } from '../../utils/nginx-config-parser';
import { join } from 'path';
import { CERTIFICATE_DIR } from '../../constant/Path';


/** 获取ca列表 */
export const getList = async (): Promise<CAInfo[]> => ([
  await LetsEncrypt.getInfo()
])

/** 获取证书信息 */
export const getInfo = async (type: CATypes): Promise<CAInfo | undefined> => {
  if (type === CATypes.LetsEncrypt) return await LetsEncrypt.getInfo()
}

/** 创建证书 */
export const create = async (certificate: Certificate): Promise<void> => {
  if (certificate.ca === CATypes.LetsEncrypt) await LetsEncrypt.create(certificate)

  throw new ServerError(400, ErrorMessage.caNotSupport)
}

export const injectNginx = async (config: NginxConfig, certificate: Certificate): Promise<void> => {
  if (certificate.ca === CATypes.LetsEncrypt) return await LetsEncrypt.injectNginx(config, certificate)

  throw new ServerError(400, ErrorMessage.caNotSupport)
}

