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

      <v-divider />

      <v-card-actions>
        <v-layout justify-end>
          <v-btn flat color="blue-grey darken-4">修改</v-btn>
          <v-btn flat color="error">删除</v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
import moment from 'moment'


export default {
  props: {
    name: String,
    appKey: String,
    createTime: String,
    updateTime: String,
  },

  methods: {
    format(time) {
      console.log(time, new Date(time))
      return moment(time).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>
<style lang="postcss" scoped>

</style>
