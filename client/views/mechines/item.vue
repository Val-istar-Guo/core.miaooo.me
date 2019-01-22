<template>
  <v-layout>
    <v-flex sm10>
      <v-layout fill-height align-center>
        <v-flex sm1 class="ml-3 font-weight-bold grey--text text--darken-2 unable-select">{{id}}</v-flex>
        <v-flex sm3 class="unable-select">{{host}}</v-flex>
        <v-flex sm2 class="unable-select">{{typeName}}</v-flex>
        <v-flex sm2 :class="[status.color, 'unable-select']">{{status.text}}</v-flex>
      </v-layout>
    </v-flex>
    <v-flex sm2>
      <v-layout justify-end>
        <v-btn icon ripple @click="remove">
          <v-icon color="blue-grey darken-4">delete</v-icon>
        </v-btn>
      </v-layout>
    </v-flex>
  </v-layout>
</template>
<script>
import request from 'framework/request'
import vt from 'vue-types'


export default {
  props: {
    id: vt.number.isRequired,
    publicIp: vt.string.isRequired,
    port: vt.number,
    type: vt.oneOf(['port', 'host']).isRequired,
    disabled: vt.bool.isRequired,
    application: vt.any,
    communication: vt.string.isRequired,
  },

  computed: {
    typeName() {
      const { type } = this
      if (type === 'port') return '端口机'
      else if (type === 'host') return '独立主机'
    },
    host() {
      const { publicIp, port } = this
      return port ? `${publicIp}:${port}` : publicIp
    },
    status() {
      const { application, disabled } = this
      if (!application) return { text: '未关联', status: 'stopping', color: 'grey--text' }
      else if (disabled) return { text: '未启用', status: 'disabled', color: 'error--text' }
      else return { text: '运行中', status: 'running', color: 'success--text' }
    }
  },
  methods: {
    async remove() {
      await request
        .delete(`/api/mechines/${this.id}`)

      this.$emit('removed')
    }
  },
}
</script>
<style lang="postcss" scoped>

</style>
