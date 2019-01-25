<template>
  <div>
    <div class="unable-select  body-1 grey--text text--darken-2 mb-3 mt-4">机器管理</div>

    <v-card>
      <v-divider v-if="mechines.length" />

      <v-btn
        grow
        flat
        block
        large
        color="blue-grey darken-4"
        class="mt-0 mb-0"
        @click="showDistributor"
      >
        <v-icon >add</v-icon>
      </v-btn>

      <mechine
        v-for="mechine in mechines"
        :key="mechine.id"
        :id="mechine.id"
        :public-ip="mechine.publicIp"
        :port="mechine.port"
        :type="mechine.type"
        :disabled="mechine.disabled"
        :application="mechine.application"
        :communication="mechine.communication"
        @unlocked="$emit('updated', { section: 'mechines' })"
        @enable="$emit('updated', { section: 'mechines' })"
        @disable="$emit('updated', { section: 'mechines' })"
      />
    </v-card>

    <v-dialog persistent :value="isShowDistributor" width="300">
      <v-card>
        <v-card-title
          class="headline lighten-2"
          primary-title
        >
          机器类型
        </v-card-title>
        <v-card-text>
          <v-container v-if="!mechineNumberChecked" fill-height align-center justify-center>
            <v-progress-circular
              indeterminate
              color="primary"
            />
          </v-container>
          <v-form v-if="mechineNumberChecked">
            <v-radio-group v-model="mechineType">
              <v-radio
                :label="`端口机${!count.port ? '（库存为空）' : ''}`"
                value="port"
                :disabled="!count.port"
              />
              <v-radio
                :label="`独立主机${!count.host ? '（库存为空）' : ''}`"
                value="host"
                :disabled="!count.host"
              />
            </v-radio-group>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            flat
            color="blue-grey darken-4"
            @click="hideDistributor"
          >取消</v-btn>
          <v-btn
            flat
            color="blue-grey darken-4"
            :disabled="!mechineNumberChecked || !mechineType"
            @click="addMechine"
            :loading="distributing"
          >确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>
<script>
import request from 'framework/request'
import moment from 'moment'
import vt from 'vue-types'
import mechine from './mechine'


export default {
  components: { mechine },
  props: {
    appKey: vt.string.isRequired,
    mechines: vt.array.def([]),
  },

  data() {
    return {
      isShowDistributor: false,
      mechineType: '',
      mechineNumberChecked: false,
      count: {
        port: 0,
        host: 0,
      },
      distributing: false,
    }
  },

  methods: {
    showDistributor() {
      this.isShowDistributor = true
      this.checkMechineNumber()
    },

    hideDistributor() {
      this.isShowDistributor = false
    },

    async checkMechineNumber() {
      // await Promise.all([this.checkPortMechineNumber(), this.checkHostMechineNumber()])
      await Promise.all([this.checkHostMechineNumber(), this.checkPortMechineNumber()])
      this.mechineNumberChecked = true
      if (this.count.port) this.mechineType = 'port'
      else if (this.count.host) this.mechineType = 'host'
    },

    async checkPortMechineNumber() {
      this.count.port = await request
        .get('/api/mechines/counter')
        .query({ type: 'port' })
        .then(res => res.body.count)
    },
    async checkHostMechineNumber() {
      this.count.host = await request
        .get('/api/mechines/counter')
        .query({ type: 'host' })
        .then(res => res.body.count)
    },

    async addMechine() {
      this.distributing = true
      await request
        .put('/api/mechines/distributor')
        .send({ type: this.mechineType })
        .send({ application: this.appKey })
      this.$emit('updated', { section: 'mechine' })
      this.distributing = false
      this.hideDistributor()
    }
  }
}
</script>
<style lang="postcss" scoped>

</style>
