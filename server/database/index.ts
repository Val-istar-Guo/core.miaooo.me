import 'reflect-metadata'
import { ConnectionOptions } from "typeorm";

import { DATABASE } from '../constant/paths'
import { Application, Service, Proxy, Certificate } from './entity'


export const databaseOptions: ConnectionOptions = {
  type: 'sqlite',
  database: DATABASE,
  entities: [Application, Service, Proxy, Certificate],
  logging: true,
  synchronize: true,
}
