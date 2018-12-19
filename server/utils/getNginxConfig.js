import fs from 'fs-extra'
import parser from '@webantic/nginx-config-parser'


export default path => {
  const stringConfig = await fs.readFile(path)
  const config = parser.parse(stringConfig)

  return config
}
