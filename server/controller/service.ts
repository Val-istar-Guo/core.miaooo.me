import { getRepository } from "typeorm";
import { Service } from "../entity";
import ServerError from "../class/ServerError";
import { ErrorMessage } from "../constant";


const validateId = id => typeof id === 'number' && id > 0;

export const getList = async (): Promise<Service[]> => {
  const repository = getRepository(Service)
  return await repository.find()
}


export const getInfo = async (id: number): Promise<Service> => {
  if (validateId(id)) throw new ServerError(400, ErrorMessage.illegalId)
  const repository = getRepository(Service)

  const service = await repository.findOne(id)

  if (!service) throw new ServerError(404, ErrorMessage.noCertificate)
  return service
}

export const create = async (options): Promise<Service> => {
  const { name, applicationKey, mechines } = options

  const repository = getRepository(Service)
  const service = new Service()
  service.name = name
  service.application = applicationKey

  await repository.save(service)
  return service
}
