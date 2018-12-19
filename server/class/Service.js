class Service {
  constructor(name) {
    this.name = name
  }

  async load() {
    const list = []
    this.list = list;

    const service = this.list.find(item => item.name === this.name)
    if (!service) throw new Error(`${this.name} 服务不存在`)

    this.type = service.type
    this.address = service.address
    this.sock = service.sock
  }

  async fillNginxConfig(config) {
    if (this.sock) {
      config.push([
        'location /',
        [
          'include uwsgi_params',
          'uwsgi_pass unix:/var/www/api.miaooo.me/tmp/server.sock',
        ],
      ])
    } else if (this.address) {
      config.push([
        'location /',
        [
          'sendfile  off',
          'proxy_set_header   X-Real-IP $remote_addr',
          'proxy_set_header   Host      $http_host',
          `proxy_pass ${this.address}`,
        ],
      ])
    }
  }
}

export default Service
