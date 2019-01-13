import Router from 'koa-router'
import { getList, getInfo } from '../../controller/service'


const router = new Router()

router
  .get('/services', async ctx => {
    getList()
  })

  .post('/services', async ctx => {

  })

  .put('/services/:name', async ctx => {

  })

export default router

