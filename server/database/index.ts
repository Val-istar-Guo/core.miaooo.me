import 'reflect-metadata'
import { createConnection, ConnectionOptions } from "typeorm";
import { DATABASE } from '../constant'

import Application from './entity/application'
import Service from './entity/service'
import Proxy from './entity/proxy'
import Certificate from './entity/certificate'


export const databaseOptions: ConnectionOptions = {
  type: 'sqlite',
  database: DATABASE,
  entities: [Application, Service, Proxy, Certificate],
  logging: true,
  synchronize: true,
}
