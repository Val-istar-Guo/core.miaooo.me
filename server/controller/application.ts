import { getRepository } from 'typeorm'
import { Application } from '../database/entity'
import ServerError from '../class/ServerError'
import ErrorMessage from '../constant/errorMessage'


/** 校验应用key值 */
const validateKey = (key: string): Boolean => /^application\.(website)(\.[a-zA-Z-]+)+$/.test(key)


/** 获取全部配置的列表 */
export const getList = async (): Promise<Application[]> => {
  const applicationRepository = getRepository(Application)
  return await applicationRepository.find()
}


/** 新建应用 */
export const create = async (options): Promise<Application> => {
  const { key, name, proxy, service } = options

  if (!validateKey(key)) throw new ServerError(400, ErrorMessage.illegalKey)
  // BUG: proxy exist
  // BUG: service exist

  const applicationRepository = getRepository(Application)

  const application = new Application()
  application.key = key
  application.name = name
  application.proxy = proxy
  application.service = service

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
  const { name, service, proxy } = options
  if (!validateKey(key)) throw new ServerError(400, ErrorMessage.illegalKey)

  const applicationRepository = getRepository(Application)
  const application = await applicationRepository.findOne(key)
  if (!application) throw new ServerError(404, ErrorMessage.noApplication)

  application.name = name
  application.proxy = proxy
  application.service = service

  await applicationRepository.save(application)
  return application
}

