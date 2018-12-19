import Router from 'koa-router'
import fs from 'fs-extra'
import { APPLICATION_DIR } from '../../constant'
import Application from '../../class/Application'
import { join } from 'path';


const router = new Router()

router

  // NOTE: 获取全部配置的列表
  .get('/applications', async (ctx) => {
    const files = await fs.readdir(APPLICATION_DIR)
    ctx.body = files
      .map(filename => {
        const name = filename.replace(/\.conf$/, '')
        const url = encodeURI(join(ctx.host, `/api/applications/${name}`))
        return { name, url }
      })
  })

  // NOTE: 新建应用
  .post('/applications', async ctx => {
    const application = await Application.create(ctx.request.body)
    ctx.body = await application.info()
  })

  // NOTE: 获取应用信息
  .get('/applications/:name', async ctx => {
    console.log(ctx.params.name)
    const application = new Application(ctx.params.name)
    ctx.body = await application.info()
  })

  // NOTE: 删除
  .delete('/applications/:name', async ctx => {
    const application = new Application(ctx.params.name)

    if (!await application.exist()) ctx.throw(404)
    else {
      await application.delete()
      ctx.body = ''
    }
  })

  // NOTE: 更新信息
  .put('/applications/:name', async ctx => {
    const application = new Application(ctx.params.name)
    if (!await application.exist()) ctx.throw(404)

    await application.update(ctx.request.body)
    ctx.body = await application.info()
  })

export default router

