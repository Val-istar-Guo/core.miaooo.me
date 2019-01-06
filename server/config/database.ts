import { ConnectionOptions } from "typeorm";

import { DATABASE } from '../constant/Path'
import { Application, Service, NginxProxy, Certificate } from '../entity'


const databaseOptions: ConnectionOptions = {
  type: 'sqlite',
  database: DATABASE,
  entities: [Application, Service, NginxProxy, Certificate],
  logging: true,
  synchronize: true,
}

export default databaseOptions
