import 'reflect-metadata'
import { createConnection, ConnectionOptions } from "typeorm";

import { DATABASE } from '../constant'
import { Application, Service, Proxy, Certificate } from './entity'


export const databaseOptions: ConnectionOptions = {
  type: 'sqlite',
  database: DATABASE,
  entities: [Application, Service, Proxy, Certificate],
  logging: true,
  synchronize: true,
}
