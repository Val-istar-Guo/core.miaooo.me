import { Mechine } from '../entity'
import { getRepository } from 'typeorm';
import ServerError from '../class/ServerError';
import { ErrorMessage } from '../constant';
import { CommunicationTypes } from '../entity/Mechine';


const validateId = id => typeof id === 'number' && id > 0;

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

export const create = async (options): Promise<Mechine> => {
  const { host, address } = options

  const repository = getRepository(Mechine)
  const mechine = new Mechine
  mechine.host = host
  mechine.address = address
  mechine.disabled = true

  await repository.save(mechine)
  return mechine
}

export const remove = async (id: number): Promise<void> => {
  if (!validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)

  const repository = getRepository(Mechine)
  const certificate = await repository.findOne(id)
  if (!certificate) throw new ServerError(404, ErrorMessage.noMechine)

  await repository.delete(id)
}
