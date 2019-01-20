<template>
  <div class="base-info">
    <div class="name">{{name}}</div>
    <div class="key">appkey: {{appKey}}</div>
    <div class="create-time">创建时间: {{format(createTime)}}</div>
    <div class="update-time">更新时间：{{format(updateTime)}}</div>
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
.base-info {
  margin-bottom: 30px;
}

.name {
  font-size: 28px;
  margin-bottom: 20px;
}

.key,
.create-time,
.update-time {
  font-size: 16px;
  margin: 5px 0;
}
</style>
