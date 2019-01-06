import { Message } from '../types'


const unableCreateLetsEncrypt = {
  noProxy: <Message> "没有启动代理，无法创建Let's Encrypt证书",
}

export default {
  illegalId: <Message> 'id不符合规范',
  illegalKey: <Message> 'application key不符合规范',
  unableChangeKey: <Message> '不可以修改key的值',
  unableChangeId: <Message> '不可以修改id的值',

  noApplication: <Message> '应用不存在',
  createExistApplication: <Message> '无法创建已存在的应用',

  noCertificate: <Message> '证书不存在',
  noNginxProxy: <Message> 'nginx代理不存在',
  noService: <Message> '服务不存在',
  onMechine: <Message> '机器不存在',

  unableCreateLetsEncrypt,
  caNotSupportCreateCertificate: <Message> '目前暂不支持创建此ca证书',
  caNotSupport: <Message> '该ca目前尚不支持',

  needEnableNginxHttpBeforeCreateLetsEncrypt: <Message> '创建LetsEncrypt证书，需要nginx代理启用http',
}
