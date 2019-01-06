import 'reflect-metadata'
import { ConnectionOptions, createConnection, Connection } from 'typeorm'
import env from 'detect-env'

export default (options: ConnectionOptions): Function => {
  let connection: Connection | null = null


  return async (ctx, next) => {
    if (connection && connection.isConnected) {
      await next()
      return
    }

    connection = await createConnection(options)

    try {
      await next()
    } catch (e) {
      if (!env.is.prod) await connection.close()
      throw e
    }

    if (!env.is.prod) await connection.close()
  }
}
