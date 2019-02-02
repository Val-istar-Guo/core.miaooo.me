import { Mechine, Application } from '../entity'
import { getRepository, IsNull, Not, getManager } from 'typeorm';
import ServerError from '../class/ServerError';
import { ErrorMessage } from '../constant';
import { CommunicationTypes } from '../entity/Mechine';


const validateId = id => typeof id === 'number' && id > 0;
const validatePort = port => typeof port === 'number' && port > 1023 && port < 49151;


export const getList = async (options): Promise<Mechine[]> => {
  const { type, status, take, skip } = options
  const repository = getRepository(Mechine)

  const filter: any = {}
  if (type) filter.type = type
  if (status === 'stoping') {
    filter.application = IsNull()
  } else if (status === 'running') {
    filter.application = Not(IsNull())
    filter.disabled = false
  } else if (status === 'disabled') {
    filter.application = Not(IsNull())
    filter.disabled = true
  }

  return await repository.find({
    where: filter,
    relations: ['application'],
    skip,
    take,
  })
}

export const getCount = async (options): Promise<number> => {
  const { type, status } = options

  const repository = getRepository(Mechine)

  const filter: any = {}
  if (type) filter.type = type
  if (status === 'stoping') {
    filter.application = IsNull()
  } else if (status === 'running') {
    filter.application = Not(IsNull())
    filter.disabled = false
  } else if (status === 'disabled') {
    filter.application = Not(IsNull())
    filter.disabled = true
  }

  return await repository.count(filter)
}

export const getInfo = async (id: number): Promise<Mechine> => {
  if (validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)

  const repository = getRepository(Mechine)
  const mechine = await repository.findOne(id)

  if (!mechine) throw new ServerError(404, ErrorMessage.noMechine)
  return mechine
}

export const update = async (id: number, options): Promise<Mechine> => {
  if(!validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)
  const { disabled, communication, application } = options

  const repository = getRepository(Mechine)
  const mechine = await repository.findOne(id)
  if (!mechine) throw new ServerError(400, ErrorMessage.noMechine)

  if (typeof options.disabled === 'boolean') mechine.disabled = disabled
  if (communication) mechine.communication = CommunicationTypes.proxy
  if (application === null) mechine.application = application

  return await repository.save(mechine)
}

export const reset = async (id: number): Promise<Mechine> => {
  return await update(id, { disabled: false, application: null,  })
}

export const create = async (options: []): Promise<Mechine[]> => {
  const repository = getRepository(Mechine)
  if (options.some(({ type, port }) => type === 'port' && !validatePort(port))) {
    throw new ServerError(400, ErrorMessage.portMechineNeedPort)
  }

  // BUG: 检查该机器是否已经存在，避免重复创建

  const mechines = options.map(({ type, publicIp, privateIp, port, country, region, communication}) => {
    const mechine = new Mechine()
    mechine.type = type
    if (publicIp) mechine.publicIp = publicIp
    if (privateIp) mechine.privateIp = privateIp
    if (port) mechine.port = port
    mechine.country = country
    mechine.region = region
    mechine.communication = communication
    mechine.disabled = true
    return mechine
  })

  await repository.save(mechines)
  return mechines
}

export const remove = async (id: number): Promise<void> => {
  if (!validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)

  const repository = getRepository(Mechine)
  const certificate = await repository.findOne(id)
  if (!certificate) throw new ServerError(404, ErrorMessage.noMechine)

  await repository.delete(id)
}

export const distribute = async ({ application, type }): Promise<Mechine> => {
  return await getManager().transaction('SERIALIZABLE', async transactionalEntityManager => {
    const mechine = await transactionalEntityManager.findOne(Mechine, {
      where: {
        type,
        application: IsNull(),
      }
    })

    if (!mechine) throw new ServerError(400, ErrorMessage.noMechine)
    const app = await transactionalEntityManager.findOne(Application, application)
    if (!app) throw new ServerError(400, ErrorMessage.noApplication)
    mechine.application = app
    return await transactionalEntityManager.save(mechine)
  })
}
