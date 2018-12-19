import Router from 'koa-router'
import koaBody from 'koa-body'

import certificateRouter from  './certificate'
import applicationRouter from './application'
import serviceRouter from './service'


const router = new Router()

router
  .prefix('/api')
  // BUG: user auth
  .use(koaBody())
  .use(applicationRouter.routes())
  .use(certificateRouter.routes())
  .use(serviceRouter.routes())

export default router
