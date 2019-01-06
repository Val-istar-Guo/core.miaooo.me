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

export const update = async (id, options): Promise<Mechine> => {
  if(!validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)
  const { check } = options

  const repository = getRepository(Mechine)
  const mechine = await repository.findOne(id)

  if (!mechine) throw new ServerError(400, ErrorMessage.onMechine)
  mechine.disabled = false
  mechine.communication = CommunicationTypes.proxy

  await repository.save(mechine)
  return mechine
}
