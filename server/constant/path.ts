import { resolve, join } from 'path'
import { Path } from '../types'


export const DATABASE: Path = process.env.database || resolve('./database')

export const ROOT_DIR: Path = process.env.ROOT_DIR|| resolve('./domain.conf.d')
export const NGINX_CONF_DIR: Path = join(ROOT_DIR, 'nginx.conf.d')
export const CERTIFICATE_DIR: Path = join(ROOT_DIR, 'certificate.d')
