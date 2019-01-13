import Router from 'koa-router'
import { join } from 'path'
import { getList, getInfo, create, update, remove } from '../../controller/mechine'
import ServerError from '../../class/ServerError'
import { ErrorMessage } from '../../constant';


const router = new Router()

const addMechineUrl = host => app => ({
  ...app,
  url: encodeURI(join(host, `/api/mechine/${app.id}`))
})

router
  .prefix('/mechine')

  .get('/', async ctx => {
    const list = await getList()

    ctx.body = list.map(addMechineUrl)
  })

  .get('/:id', async ctx => {
    ctx.body = await getInfo(ctx.params.id)
  })

  .post('/', async ctx => {
    ctx.body = await create(ctx.request.body)
  })

  .put('/:id', async ctx => {
    const { id } = ctx.request.body
    if (id && id !== ctx.params.id) throw new ServerError(400, ErrorMessage.unableChangeId)

    const mechine = await update(ctx.params.id, ctx.request.body)
    ctx.body = mechine
  })

  .delete('/:id', async ctx => {
    await remove(ctx.params.id)
    ctx.status = 200
  })
