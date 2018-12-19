import Router from 'koa-router'
import { CERTIFICATE_DIR } from '../../constant'
import Certificates from '../../class/Certificates'


const router = new Router()

router
  // NOTE: 获取证书列表
  .get('/certificates', async ctx => {
    const files = fs.readdir(CERTIFICATE_DIR)
    ctx.body = files.map(filename => filename.replace(/\.conf$/, ''))
  })

  // NOTE: 创建证书
  .post('/certificates', async ctx => {
    const certificate = await Certificates.create(ctx.request.body)
    return await certificate.info()
  })

  // NOTE: 修改证书
  .put('/certificates/:name', async ctx => {
    const certificate = await Certificates(ctx.params.name)

    await certificate.update(ctx.request.body)
  })

  // NOTE: 删除证书
  .delete('/certificates/:name', async ctx => {
    const certificate = await Certificates(ctx.params.name)
    await certificate.delete()
  })

export default router
