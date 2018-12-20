import Router from 'koa-router'
import fs from 'fs-extra'
import { CERTIFICATE_DIR } from '../../constant'
import Certificates from '../../class/Certificates'


const router = new Router()

router
  // NOTE: 获取证书列表
  .get('/certificates', async ctx => {
    const files = await fs.readdir(CERTIFICATE_DIR)
    ctx.body = files.map(filename => filename.replace(/\.conf$/, ''))
  })

  // NOTE: 获取证书类型列表
  .get('/certificates/types', async ctx => {
    ctx.body = Certificates.certificates
  })

  // NOTE: 创建证书
  .post('/certificates', async ctx => {
    const certificate = await Certificates.create(ctx.request.body)
    ctx.body = await certificate.info()
  })

  // NOTE: 修改证书
  .put('/certificates/:name', async ctx => {
    const certificate = new Certificates(ctx.params.name)

    await certificate.update(ctx.request.body)
    ctx.body = await certificate.info()
  })

  // NOTE: 删除证书
  .delete('/certificates/:name', async ctx => {
    const certificate = new Certificates(ctx.params.name)
    await certificate.delete()
    ctx.body = ''
  })

export default router
