import 'reflect-metadata'
import { ConnectionOptions, createConnection, Connection } from 'typeorm'


export default (options: ConnectionOptions): Function => {
  let connection: Connection | null = null

  process.on(<any> 'rebuild', () => {
    if (connection) {
      console.log('close............................................')
      connection.close()
    }
  })

  return async (ctx, next) => {
    if (connection && connection.isConnected) {
      await next()
      return
    }

    connection = await createConnection(options)
    await next()
  }
}
