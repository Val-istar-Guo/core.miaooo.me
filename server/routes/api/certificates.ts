import Router from 'koa-router'
import { join } from 'path'
import { renew, getInfo, getList, create, update, remove } from '../../controller/certificate'
import ServerError from '../../class/ServerError'
import { ErrorMessage } from '../../constant';


const router = new Router()

const addCertificateUrl = host => app => ({
  ...app,
  url: encodeURI(join(host, `/api/certificates/${app.id}`))
})

const addApplicationUrl = host => app => ({
  ...app,
  url: encodeURI(join(host, `/api/applications/${app.id}`))
})

router
  .prefix('/certificates')
  // NOTE: 获取证书列表
  .get('/', async ctx => {
    const list = await getList()
    ctx.body = list.map(addCertificateUrl(ctx.host))
  })

  // NOTE: 创建证书
  .post('/', async ctx => {
    ctx.body = await create(ctx.request.body)
  })

  // NOTE: 获取证书信息
  .get('/:id', async ctx => {
    ctx.body = await getInfo(ctx.params.id)
  })

  // NOTE: 修改证书
  .put('/:id', async ctx => {
    const id = parseInt(ctx.request.body.id)

    if (ctx.request.body.id && ctx.request.body.id !== id) {
      throw new ServerError(400, ErrorMessage.unableChangeId)
    }

    ctx.body = await update(id, ctx.request.body)
  })

  // NOTE: 更新证书
  .put('/:id/renew', async ctx => {
    ctx.body = await renew(parseInt(ctx.params.id))
  })

  // NOTE: 删除证书
  .delete('/:id', async ctx => {
    await remove(parseInt(ctx.params.id))
    ctx.status = 200
  })


export default router
