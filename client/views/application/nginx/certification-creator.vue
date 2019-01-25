<template>
  <v-dialog :value="show" persistent width="500">
    <v-card>
      <v-card-title class="headline lighten-2" primary-title>
        创建证书
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-select
            label="服务商"
            v-model="ca"
            :items="caTypes"
            prepend-icon="security"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn flat @click="$emit('cancle')">取消</v-btn>
        <v-btn flat @click="create">确定</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import request from 'framework/request'
import vt from 'vue-types'


export default {
  props: {
    show: vt.bool.def(false),
    domains: vt.arrayOf(vt.string).isRequired,
    nginxProxyId: vt.number.isRequired,
  },

  data() {
    const caTypes = [
      { text: "Let's Encrypt", value: 'LetsEncrypt' },
    ]

    const ca = caTypes[0].value
    return { caTypes, ca }
  },

  methods: {
    async create() {
      const certification = await request
        .post('/api/certificates')
        .send({ ca: this.ca })
        .send({ domains: this.domains })
        .send({ nginxProxies: [{ id: this.nginxProxyId }] })
        .then(res => res.body)

      this.$emit('created', { certification })
    }
  },
}
</script>
<style lang="postcss" scoped>

</style>
