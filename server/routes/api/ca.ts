import Router from 'koa-router'
import { getList } from '../../controller/ca'


const router = new Router()

// const addCertificateUrl = host => app => ({
//   ...app,
//   url: encodeURI(join(host, `/api/certificates/${app.id}`))
// })


router
  .prefix('/ca')

  // NOTE: 获取ca列表
  .get('/', async ctx => {
    ctx.body = await getList()
  })

  // .get('/:name', async ctx => {
  // })


export default router
