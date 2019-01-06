import Router from 'koa-router'
import faviconRouter from './favicon'
import apiRouter from './api'


const router = new Router()

router
  .use(faviconRouter.routes())
  .use(apiRouter.routes())

export default router
