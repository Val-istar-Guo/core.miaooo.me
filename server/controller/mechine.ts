import { Mechine } from '../entity'
import { getRepository } from 'typeorm';
import ServerError from '../class/ServerError';
import { ErrorMessage } from '../constant';
import { CommunicationTypes } from '../entity/Mechine';


const validateId = id => typeof id === 'number' && id > 0;
const validatePort = port => typeof port === 'number' && port > 1023 && port < 49151;

export const getList = async (): Promise<Mechine[]> => {
  const repository = getRepository(Mechine)
  return await repository.find()
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
  const { check } = options

  const repository = getRepository(Mechine)
  const mechine = await repository.findOne(id)

  if (!mechine) throw new ServerError(400, ErrorMessage.noMechine)
  mechine.disabled = false
  mechine.communication = CommunicationTypes.proxy

  await repository.save(mechine)
  return mechine
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
