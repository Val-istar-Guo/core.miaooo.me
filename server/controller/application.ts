import { getRepository } from 'typeorm'
import { Application, NginxProxy, Mechine } from '../entity'
import ServerError from '../class/ServerError'
import { ErrorMessage } from '../constant'


/** 校验应用key值，自定义部分不能包含下划线，因为用于区分proxy.id与appkey */
const validateKey = (key: string): Boolean => /^application\.(website)(\.[a-zA-Z-]+)+$/.test(key)


/** 获取全部配置的列表 */
export const getList = async (): Promise<Application[]> => {
  const repository = getRepository(Application)
  return await repository.find()
}


/** 新建应用 */
export const create = async (options): Promise<Application> => {
  const { key, name, nginxProxy } = options

  if (!validateKey(key)) throw new ServerError(400, ErrorMessage.illegalKey)
  // BUG: nginxProxy exist
  // BUG: service exist

  const repository = getRepository(Application)
  if (await repository.findOne(key)) throw new ServerError(400, ErrorMessage.createExistApplication)

  const application = new Application()
  application.key = key
  application.name = name
  application.nginxProxy = new NginxProxy()

  await repository.save(application)
  return application
}


/** 获取应用信息 */
export const getInfo = async (key: string): Promise<Application> => {
  if (!validateKey(key)) throw new ServerError(400, ErrorMessage.illegalKey)

  const repository = getRepository(Application)
  const application = await repository.findOne(key, { relations: ['nginxProxy', 'mechines', 'services'] })

  if (!application) throw new ServerError(404, ErrorMessage.noApplication)
  return application
}

/** 删除 */
export const remove = async (key: string): Promise<void> => {
  if (!validateKey(key)) throw new ServerError(400, ErrorMessage.illegalKey)

  const repository = getRepository(Application)
  const application = await repository.findOne(key)
  if (!application) throw new ServerError(404, ErrorMessage.noApplication)

  await repository.delete(key)
}

/** 更新信息 */
export const update = async (key: string, options): Promise<Application> => {
  if (!validateKey(key)) throw new ServerError(400, ErrorMessage.illegalKey)
  const { name, services, mechines } = options

  const repository = getRepository(Application)
  const application = await repository.findOne(key)
  if (!application) throw new ServerError(404, ErrorMessage.noApplication)

  if (name) application.name = name
  if (application) application.services = services
  if (mechines) {
    const mehcineRepository = getRepository(Mechine)
    application.mechines = await mehcineRepository.findByIds(mechines)
  }

  await repository.save(application)
  return application
}

