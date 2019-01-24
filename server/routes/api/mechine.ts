import Router from 'koa-router'
import { join } from 'path'
import { getCount, getList, getInfo, create, update, remove, distribute } from '../../controller/mechine'
import ServerError from '../../class/ServerError'
import { ErrorMessage } from '../../constant';


const router = new Router()

const addMechineUrl = host => app => ({
  ...app,
  url: encodeURI(join(host, `/api/mechine/${app.id}`))
})

router
  .prefix('/mechines')

  .get('/', async ctx => {
    const list = await getList(ctx.query)

    ctx.body = list.map(addMechineUrl(ctx.host))
  })

  .get('/counter', async ctx => {
    const count = await getCount(ctx.query)
    ctx.body = { count }
  })

  .get('/:id', async ctx => {
    ctx.body = await getInfo(parseInt(ctx.params.id))
  })

  .post('/', async ctx => {
    ctx.body = await create(ctx.request.body)
  })

  .put('/distributor', async ctx => {
    ctx.body = await distribute(ctx.request.body)
  })

  .put('/:id', async ctx => {
    const { id } = ctx.request.body
    if (id && id !== ctx.params.id) throw new ServerError(400, ErrorMessage.unableChangeId)

    const mechine = await update(parseInt(ctx.params.id), ctx.request.body)
    ctx.body = mechine
  })

  .delete('/:id', async ctx => {
    await remove(parseInt(ctx.params.id))
    ctx.status = 200
  })

export default router
