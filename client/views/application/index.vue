<template>
  <div>
    <navigation>
      <div class="button delete" @click="deleteApplication">删除应用</div>
    </navigation>
    <div class="content">
      <base-info
        :app-key="$route.params.key"
        :name="name"
        :create-time="createTime"
        :update-time="updateTime"
      />
      <button>申请机器</button>
      <button>启动nginx服务</button>
      <button>启动https服务</button>
    </div>
  </div>
</template>
<script>
import request from 'framework/request'
import baseInfo from './base-info'


export default {
  components: { baseInfo },
  data() {
    return {
      name: '',
      createTime: '',
      updateTime: '',
    }
  },
  mounted() {
    this.fetchInfo()
  },
  methods: {
    async fetchInfo() {
      const { key } = this.$route.params

      const application = await request
        .get(`/api/applications/${key}`)
        .then(res => res.body)

      this.name = application.name
      this.createTime = application.createTime
      this.updateTime = application.updateTime
    },
    async deleteApplication() {
      const { key } = this.$route.params

      const res = await request
        .delete(`/api/applications/${key}`)

      if (res.ok) this.$router.push('/applications')
      else console.log('删除应用失败')
    }
  }
}
</script>
<style lang="postcss" scoped>
.content {
  width: 1000px;
  margin: 60px auto;
  color: #333;
}
</style>
