import Router from 'koa-router'
import * as koaBody from 'koa-body'

import * as config from '../../config'
import connectDatabase from '../../middleware/connect-database'
import certificateRouter from  './certificates'
import applicationRouter from './applications'
import serviceRouter from './services'
import nginxProxiesRouter from './nginx-proxies'
import caRouter from './ca'


const router = new Router()

router
  .use(connectDatabase(config.database))

  .prefix('/api')
  // BUG: user auth
  .use(koaBody())
  .use(applicationRouter.routes())
  .use(certificateRouter.routes())
  .use(serviceRouter.routes())
  .use(caRouter.routes())
  .use(nginxProxiesRouter.routes())

export default router
