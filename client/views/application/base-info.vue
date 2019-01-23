<template>
  <div>
    <div class="unable-select  body-1 grey--text text--darken-2 mb-3">
      基本信息
    </div>
    <v-card>
      <v-card-title primary-title>
        <div>
          <h3 class="headline md-0">{{name}}</h3>
          <div>
            <div class="body-2 grey--text font-weight-bold">{{appKey}}</div>
          </div>
          <div class="mt-3 font-weight-light body-1">
            <div>创建于：{{format(createTime)}}</div>
            <div>修改于：{{format(updateTime)}}</div>
          </div>
        </div>
      </v-card-title>


      <v-card-actions>
        <v-layout justify-end>
          <v-btn flat color="error" @click="remove" :loading="deleting">删除</v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
import request from 'framework/request'
import moment from 'moment'
import vt from 'vue-types'
import { setTimeout } from 'timers';


export default {
  props: {
    name: vt.string.isRequired,
    appKey: vt.string.isRequired,
    createTime: vt.string.isRequired,
    updateTime: vt.string.isRequired,
    enableNginxProxy: vt.bool.def(false),
  },

  data() {
    return {
      deleting: false,
      // enableNginxloading: false,
    }
  },

  methods: {
    format(time) {
      console.log(time, new Date(time))
      return moment(time).format('YYYY-MM-DD HH:mm:ss')
    },

    async remove() {
      this.deleting = true
      await request
        .delete(`/api/applications/${this.appKey}`)

      this.deleting = false
      this.$router.replace(`/applications`)
    }

    // enableNginx() {
    //   this.enableNginxloading = true
    //   setTimeout(() => {
    //     this.enableNginxloading = false
    //   }, 2000)
    //   // await request
    //   //   .get('/api/mechines')

    //   this.$emit('modified', {})
    // }
  }
}
</script>
<style lang="postcss" scoped>

</style>
