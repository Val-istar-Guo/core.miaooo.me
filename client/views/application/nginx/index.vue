<template>
  <div>
    <div class="unable-select  body-1 grey--text text--darken-2 mb-3 mt-4">Nginx配置</div>
    <certification-creator
      :show="isShowCertificationCreator"
      :domains="domains"
      :nginx-proxy-id="nginxProxy.id"
      @created="hideCertificationCreator"
      @cancle="hideCertificationCreator"
    />
    <v-card>
      <v-card-text>
        <v-form>
          <v-combobox
            v-model="domains"
            :items="recommendDomains"
            :search-input.sync="search.domain"
            label="域名"
            hide-selected
            multiple
            small-chips
            auto-select-first
            counter
          />

          <v-switch
            :disabled="nginxProxy.certificate && nginxProxy.certificate.ca === 'LetsEncrypt'"
            v-model="enableHttp"
            label="启用Http"
          />

          <v-switch
            v-if="enableHttp && enableHttps && nginxProxy.certificate"
            v-model="redirectHttps"
            label="重定向Https"
          />

          <v-switch
            v-model="enableHttps"
            label="启用Https"
          />

          <div v-if="enableHttps" class="mt-4 d-block">
            <v-label>https 配置</v-label>

            <v-layout class="mt-3" align-center>
              <v-text-field
                disabled
                label="CA证书"
                placeholder="请创建CA证书"
                :value="certificateName"
              />
              <v-btn
                v-if="!nginxProxy.certificate"
                round
                flat
                @click="showCertificationCreator"
                :disabled="!domains.length || !nginxProxy.id"
              >创建证书</v-btn>
              <v-btn
                v-if="nginxProxy.certificate"
                round
                flat
                :loading="certificateUpdating"
                @click="renewCertificate"
                :disabled="!domains.length || !nginxProxy.id || certificateDeleting"
              >更新证书</v-btn>
              <v-btn
                v-if="nginxProxy.certificate"
                round
                flat
                :loading="certificateDeleting"
                @click="deleteCertificate"
                :disabled="!domains.length || !nginxProxy.id || certificateUpdating"
              >删除证书</v-btn>
            </v-layout>

            <v-switch
              v-model="sslStapling"
              label="发送证书列表"
            />
            <v-switch
              v-model="sslPreferServerCiphers"
              label="优先使用服务器加密协议"
            />

            <v-select
              label="ssl加密算法"
              v-model="sslCiphers"
              :items="ciphers"
              multiple
              small-chips
            />

            <v-select
              v-model="sslProtocols"
              label="ssl协议"
              :items="protocols"
              multiple
              small-chips
            />

            <v-text-field
              v-model="sslSessionCache"
              label="Session Cache"
              disabled
            />

            <v-text-field
              v-model="sslSessionTimeout"
              label="Session超时时间"
              disabled
            />

          </div>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-layout justify-end>
          <v-btn
            flat
            :disabled="!modified"
            :loading="saving"
            color="success"
            @click="save"
          >保存</v-btn>
        </v-layout>
      </v-card-actions>

    </v-card>
  </div>
</template>
<script>
import moment from 'moment'
import vt from 'vue-types'
import request from 'framework/request'
import certificationCreator from './certification-creator'


export default {
  components: { certificationCreator },
  props: {
    nginxProxy: vt.shape({
      id: vt.integer.isRequired,
      domains: vt.arrayOf(vt.string).isRequired,
      enableHttp: vt.bool.isRequired,
      enableHttps: vt.bool.isRequired,
      redirectHttps: vt.bool.isRequired,
      certification: vt.object,

      sslCiphers: vt.arrayOf(vt.string).isRequired,
      sslPreferServerCiphers: vt.bool.isRequired,
      sslProtocols: vt.arrayOf(vt.string).isRequired,
      sslSessionCache: vt.string.isRequired,
      sslSessionTimeout: vt.string.isRequired,
      sslStapling: vt.bool.isRequired,
    }).loose,
  },

  data() {
    return {
      domains: this.nginxProxy.domains,
      enableHttp: this.nginxProxy.enableHttp,
      enableHttps: this.nginxProxy.enableHttps,
      redirectHttps: this.nginxProxy.redirectHttps,
      sslCiphers: this.nginxProxy.sslCiphers,
      sslPreferServerCiphers: this.nginxProxy.sslPreferServerCiphers,
      sslProtocols: this.nginxProxy.sslProtocols,
      sslSessionCache: this.nginxProxy.sslSessionCache,
      sslSessionTimeout: this.nginxProxy.sslSessionTimeout,
      sslStapling: this.nginxProxy.sslStapling,

      isShowCertificationCreator: false,

      search: {
        domain: '',
      },
      ciphers: [
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'DHE-RSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-SHA384',
        'ECDHE-RSA-AES128-SHA256',
        'ECDHE-RSA-AES256-SHA',
        'ECDHE-RSA-AES128-SHA',
        'DHE-RSA-AES256-SHA',
        'DHE-RSA-AES128-SHA',
      ],
      protocols: ['TLSv1', 'TLSv1.1', 'TLSv1.2'],
      saving: false,
      certificateUpdating: false,
      certificateDeleting: false,
    }
  },

  computed: {
    certificateName() {
      const { nginxProxy} = this
      const { certificate } = this.nginxProxy

      if (!certificate) return ''

      return `${certificate.ca} for ${certificate.domains.join(', ')}`
    },

    recommendDomains() {
      if (!this.search.domain) return []
      return ['.com', '.cn', '.me'].map(item => `${this.search.domain}${item}`)
    },

    modified() {
      return [
        'domains', 'enableHttp', 'enableHttps', 'redirectHttps', 'sslCiphers',
        'sslPreferServerCiphers', 'sslProtocols', 'sslSessionCache', 'sslSessionTimeout', 'sslStapling',
      ].some(prop => this[prop] !== this.nginxProxy[prop])
    },

  },

  watch: {
    nginxProxy() {
      this.domains = this.nginxProxy.domains
      this.enableHttp = this.nginxProxy.enableHttp
      this.enableHttps = this.nginxProxy.enableHttps
      this.redirectHttps = this.nginxProxy.redirectHttps
      this.sslCiphers = this.nginxProxy.sslCiphers
      this.sslPreferServerCiphers = this.nginxProxy.sslPreferServerCiphers
      this.sslProtocols = this.nginxProxy.sslProtocols
      this.sslSessionCache = this.nginxProxy.sslSessionCache
      this.sslSessionTimeout = this.nginxProxy.sslSessionTimeout
      this.sslStapling = this.nginxProxy.sslStapling
    },
  },

  methods: {
    async save() {
      this.saving = true
      const nginxProxy = {
        domains: this.domains,
        enableHttp: this.enableHttp,
        enableHttps: this.enableHttps,
        redirectHttps: this.enableHttps && this.certificate ? this.redirectHttps : false,
        sslCiphers: this.sslCiphers,
        sslPreferServerCiphers: this.sslPreferServerCiphers,
        sslProtocols: this.sslProtocols,
        sslSessionCache: this.sslSessionCache,
        sslSessionTimeout: this.sslSessionTimeout,
        sslStapling: this.sslStapling,
      }
      const res = await request
        .put(`/api/nginx-proxies/${this.nginxProxy.id}`)
        .send(nginxProxy)

      this.saving = false
      this.$emit('updated', { section: 'nginx', nginxProxy: res.body })
    },

    showCertificationCreator() {
      this.isShowCertificationCreator = true
    },

    hideCertificationCreator() {
      this.isShowCertificationCreator = false
    },

    async renewCertificate() {
      this.certificateUpdating = true
      try {
        const res = await request
          .put(`/api/certificates/${this.nginxProxy.certificate.id}/renew`)
        this.$emit('updated', { section: 'nginx' })
      } finally {
        this.certificateUpdating = false
      }
    },

    async deleteCertificate() {
      this.certificateDeleting = true
      try {
        await request.delete(`/api/certificates/${this.nginxProxy.certificate.id}`)
        this.$emit('updated', { section: 'nginx' })
      } finally {
        this.certificateDeleting = false
      }
    },
  }
}
</script>
<style lang="postcss" scoped>

</style>
