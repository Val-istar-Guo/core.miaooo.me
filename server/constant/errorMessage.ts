const enum ErrorMessage {
  illegalKey = 'application key不符合规范',

  noApplication = '应用不存在',
  createExistApplication = '应用key已存在，请更换key后重新创建应用',

  noCertificate = '证书不存在',
  createExistCertificate = '证书key已存在，请更换key后重新创建证书',
}

export default ErrorMessage
