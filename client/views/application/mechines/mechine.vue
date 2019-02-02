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
        <v-btn v-if="disabled" icon ripple @click="enable" :loading="changingDisbaled">
          <v-icon color="blue-grey darken-4">play_arrow</v-icon>
        </v-btn>
        <v-btn v-if="!disabled" icon ripple @click="disable" :loading="changingDisbaled">
          <v-icon color="blue-grey darken-4">pause</v-icon>
        </v-btn>

        <v-btn icon ripple @click="unlock">
          <v-icon color="blue-grey darken-4">lock_open</v-icon>
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
    communication: vt.string.isRequired,
  },

  data() {
    return {
      changingDisbaled: false,
    }
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
      const { disabled } = this

      if (disabled) return { text: '未启用', status: 'disabled', color: 'error--text' }
      else return { text: '运行中', status: 'running', color: 'success--text' }
    },
  },
  methods: {
    async unlock() {
      await request
        .put(`/api/mechines/${this.id}`)
        .send({ application: null })
        .send({ disabled: true })

      this.$emit('unlocked')
    },

    async disable() {
      this.changingDisbaled = true

      await request
        .put(`/api/mechines/${this.id}`)
        .send({ disabled: true })

      this.changingDisbaled = false
      this.$emit('disable')
    },

    async enable() {
      this.changingDisbaled = true
      await request
        .put(`/api/mechines/${this.id}`)
        .send({ disabled: false })

      this.changingDisbaled = false
      this.$emit('enable')
    }

  },
}
</script>
<style lang="postcss" scoped>

</style>
