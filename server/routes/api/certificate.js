import Router from 'koa-router'
import fs from 'fs-extra'


const router = new Router()

router
  // NOTE: 获取证书列表
  .get('/certificates', async ctx => {
  })

  // NOTE: 获取证书类型列表
  .get('/certificates/types', async ctx => {
  })

  // NOTE: 创建证书
  .post('/certificates', async ctx => {
  })

  // NOTE: 修改证书
  .put('/certificates/:name', async ctx => {
  })

  // NOTE: 删除证书
  .delete('/certificates/:name', async ctx => {
  })

export default router
