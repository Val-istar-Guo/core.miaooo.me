import Router from 'koa-router'
import { join } from 'path'
import { getList, getInfo, create, update, remove } from '../../controller/application'
import ServerError from '../../class/ServerError'
import { ErrorMessage } from '../../constant';


const router = new Router()

const addApplicationUrl = host => app => ({
  ...app,
  url: encodeURI(join(host, `/api/applications/${app.key}`))
})

router

  // NOTE: 获取全部配置的列表
  .get('/applications', async (ctx) => {
    console.log('-----------------------------')
    const list = await getList()
    ctx.body = list.map(addApplicationUrl(ctx.host))
  })

  // NOTE: 新建应用
  .post('/applications', async ctx => {
    const application = await create(ctx.request.body)
    ctx.body = application
  })

  // NOTE: 获取应用信息
  .get('/applications/:key', async ctx => {
    const application = await getInfo(ctx.params.key)

    ctx.body = application
  })

  // NOTE: 删除
  .delete('/applications/:key', async ctx => {
    const { key } = ctx.params
    await remove(key)

    ctx.status = 200
  })

  // NOTE: 更新信息
  .put('/applications/:key', async ctx => {
    const { key, name, service, proxy } = ctx.request.body
    if (key && key !== ctx.params.key) throw new ServerError(400, ErrorMessage.unableChangeKey)

    const application = await update(ctx.params.key, { name, service, proxy })
    ctx.body = application
  })

export default router

