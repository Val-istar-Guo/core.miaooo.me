import { ConnectionOptions, createConnection, Connection } from 'typeorm'

export default (options: ConnectionOptions): Function => {
  let connection: Connection | null = null


  return async (ctx, next) => {
    if (connection && connection.isConnected) {
      await next()
      return
    }

    connection = await createConnection(options)
    await next()
  }
}
