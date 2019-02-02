import { getRepository, getManager } from 'typeorm'
import { Application, NginxProxy, Mechine } from '../entity'
import ServerError from '../class/ServerError'
import { ErrorMessage } from '../constant'
import { remove as removeNginxProxy } from './nginx-proxy'
import { reset as resetMechine } from './mechine'


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

  return await getManager().transaction('SERIALIZABLE', async transactionalEntityManager => {
    const exist = await transactionalEntityManager.findOne(Application, key)
    if (exist) throw new ServerError(400, ErrorMessage.createExistApplication)

    let nginxProxy = new NginxProxy()
    nginxProxy = await transactionalEntityManager.save(nginxProxy)

    const application = new Application()
    application.key = key
    application.name = name
    application.nginxProxy = nginxProxy

    return await transactionalEntityManager.save(application)
  })
}


/** 获取应用信息 */
export const getInfo = async (key: string): Promise<Application> => {
  if (!validateKey(key)) throw new ServerError(400, ErrorMessage.illegalKey)

  const repository = getRepository(Application)
  const application = await repository.findOne(key, {
    join: {
      alias: 'application',
      leftJoinAndSelect: {
        nginxProxy: 'application.nginxProxy',
        mechines: 'application.mechines',
        services: 'application.services',
        certificate: 'nginxProxy.certificate',
      },
    },
  })

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
  if (application.nginxProxy) await removeNginxProxy(application.nginxProxy.id)
  if (application.mechines) {
    const resetMechinesPromises = application.mechines.map(mechine => resetMechine(mechine.id))
    await Promise.all(resetMechinesPromises)
  }
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

