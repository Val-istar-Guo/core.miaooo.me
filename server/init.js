import fs from 'fs-extra'
import { ROOT_DIR, CERTIFICATE_DIR, APPLICATION_DIR } from './constant'


// OPTIMIZE: check python and openssl is installed

if (!fs.existsSync(ROOT_DIR)) {
  throw new Error(`配置的nginx文件夹路径不存在：${NGINX_FOLDER}`)
}

fs.ensureDir(CERTIFICATE_DIR)
fs.ensureDir(APPLICATION_DIR)
