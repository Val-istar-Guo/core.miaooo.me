import { getRepository } from 'typeorm'
import { Application } from '../entity'
import ServerError from '../class/ServerError'
import { ErrorMessage } from '../constant'


/** 校验应用key值，自定义部分不能包含下划线，因为用于区分proxy.id与appkey */
const validateKey = (key: string): Boolean => /^application\.(website)(\.[a-zA-Z-]+)+$/.test(key)


/** 获取全部配置的列表 */
export const getList = async (): Promise<Application[]> => {
  const applicationRepository = getRepository(Application)
  return await applicationRepository.find()
}


/** 新建应用 */
export const create = async (options): Promise<Application> => {
  const { key, name, nginxProxy, services } = options

  if (!validateKey(key)) throw new ServerError(400, ErrorMessage.illegalKey)
  // BUG: nginxProxy exist
  // BUG: service exist

  const applicationRepository = getRepository(Application)

  const application = new Application()
  application.key = key
  application.name = name
  application.nginxProxy = nginxProxy
  application.services = services

  if (applicationRepository.hasId(application)) throw new ServerError(400, ErrorMessage.createExistApplication)
  await applicationRepository.save(application)
  return application
}


/** 获取应用信息 */
export const getInfo = async (key: string): Promise<Application> => {
  if (!validateKey(key)) throw new ServerError(400, ErrorMessage.illegalKey)

  const applicationRepository = getRepository(Application)
  const application = await applicationRepository.findOne(key)

  if (!application) throw new ServerError(404, ErrorMessage.noApplication)
  return application
}

/** 删除 */
export const remove = async (key: string): Promise<void> => {
  if (!validateKey(key)) throw new ServerError(400, ErrorMessage.illegalKey)

  const applicationRepository = getRepository(Application)
  const application = await applicationRepository.findOne(key)
  if (!application) throw new ServerError(404, ErrorMessage.noApplication)

  await applicationRepository.delete(key)
}

/** 更新信息 */
export const update = async (key: string, options): Promise<Application> => {
  if (!validateKey(key)) throw new ServerError(400, ErrorMessage.illegalKey)
  const { name, services, nginxProxy } = options

  const applicationRepository = getRepository(Application)
  const application = await applicationRepository.findOne(key)
  if (!application) throw new ServerError(404, ErrorMessage.noApplication)

  if (name) application.name = name
  if (nginxProxy) application.nginxProxy = nginxProxy
  if (application) application.services = services

  await applicationRepository.save(application)
  return application
}

