import { resolve, join } from 'path'


export const ROOT_DIR = process.env.ROOT_DIR|| resolve('./domain.config.d')
export const APPLICATION_DIR = join(ROOT_DIR, 'applications')
export const CERTIFICATE_DIR = join(ROOT_DIR, 'certificates')
