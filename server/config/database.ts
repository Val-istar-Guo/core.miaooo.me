import { ConnectionOptions } from "typeorm";

import { DATABASE } from '../constant/Path'
import { Application, Service, NginxProxy, Certificate, Mechine } from '../entity'


const databaseOptions: ConnectionOptions = {
  type: 'sqlite',
  database: DATABASE,
  entities: [Application, Service, NginxProxy, Certificate, Mechine],
  logging: true,
  // synchronize: true,
  // dropSchema: true,
}

export default databaseOptions
