import Router from 'koa-router'
import fs from 'fs-extra'
import { getRepository } from 'typeorm'
import { Application } from '../../database/entity'
import { APPLICATION_DIR } from '../../constant'
import { join } from 'path';


const router = new Router()

const validateKey = key => /^app\.(website)(\.[a-zA-Z-]+)+$/.test(key)
const addApplicationUrl = host => app => ({
  ...app,
  url: encodeURI(join(host, `/api/applications/${app.key}`))
})
const errorMessage = {
  illegalKey: 'application key不符合规范',
  noApplication: '应用不存在',
}

router

  // NOTE: 获取全部配置的列表
  .get('/applications', async (ctx) => {
    const applicationRepository = getRepository(Application)
    const applications = await applicationRepository.find()

    ctx.body = applications.map(addApplicationUrl(ctx.host))
  })

  // NOTE: 新建应用
  .post('/applications', async ctx => {
    const { key, name, proxy, service } = ctx.request.body

    if (!validateKey(key)) ctx.throw(400, errorMessage.illegalKey)
    // BUG: proxy exist
    // BUG: service exist

    const applicationRepository = getRepository(Application)

    const application = new Application()
    application.key = key
    application.name = name
    application.proxy = proxy
    application.service = service

    await applicationRepository.save(application)
    return ctx.body = application
  })

  // NOTE: 获取应用信息
  .get('/applications/:key', async ctx => {
    if (!validateKey(ctx.params.key)) ctx.throw(400, errorMessage.illegalKey)

    const applicationRepository = getRepository(Application)
    const application = await applicationRepository.findOne(ctx.params.key)

    if (!application) ctx.throw(404, errorMessage.noApplication)
    ctx.body = application
  })

  // NOTE: 删除
  .delete('/applications/:key', async ctx => {
    const { key } = ctx.params
    if (!validateKey(key)) ctx.throw(400, errorMessage.illegalKey)

    const applicationRepository = getRepository(Application)
    const application = await applicationRepository.findOne(key)
    if (!application) ctx.throw(404, errorMessage.noApplication)

    await applicationRepository.delete(key)
    ctx.status = 200
  })

  // NOTE: 更新信息
  .put('/applications/:key', async ctx => {
    const { key } = ctx.params
    const { name, service, proxy } = ctx.request.body
    if (!validateKey(key)) ctx.throw(400, errorMessage.illegalKey)

    const applicationRepository = getRepository(Application)
    const application = await applicationRepository.findOne(key)
    if (!application) ctx.throw(404, errorMessage.noApplication)

    application.name = name
    application.proxy = proxy
    application.service = service

    await applicationRepository.save(application)
    ctx.body = application
  })

export default router

