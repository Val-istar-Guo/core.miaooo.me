import Router from 'koa-router'
import { join } from 'path'
import { getList, getInfo, create, update, remove } from '../../controller/nginx-proxy'
import ServerError from '../../class/ServerError'
import { ErrorMessage } from '../../constant';


const router = new Router()

const addProxyUrl = host => proxy => ({
  ...proxy,
  url: encodeURI(join(host, `/api/nginx-proxies/${proxy.id}`))
})

router
  .prefix('/nginx-proxies')

  .get('/', async ctx => {
    const list = await getList()
    ctx.body = list.map(addProxyUrl(ctx.host))
  })

  .post('/', async ctx => {
    ctx.body = await create(ctx.request.body)
  })

  .get('/:id', async ctx => {
    ctx.body = await getInfo(ctx.params.id)
  })

  .put('/:id', async ctx => {
    const { id } = ctx.request.body
    if (id && id !== ctx.params.id) throw new ServerError(400, ErrorMessage.unableChangeId)

    ctx.body = await update(ctx.params.id, ctx.request.body)
  })

  .delete('/:id', async ctx => {
    await remove(parseInt(ctx.params.id))
    ctx.status = 200
  })


export default router
