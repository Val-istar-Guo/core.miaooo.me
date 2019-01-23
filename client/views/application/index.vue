<template>
  <div>
    <document-title>应用详情</document-title>
    <v-layout col>
      <v-flex sm8 offset-sm2>
        <base-info
          :app-key="$route.params.key"
          :name="name"
          :create-time="createTime"
          :update-time="updateTime"
          :enable-nginx-proxy="!!nginxProxy"
        />

        <mechines
          :mechines="mechines"
        />

        <nginx
          v-if="!!nginxProxy"
          :nginx-proxy="nginxProxy"
          @updated="fetchInfo"
        />
      </v-flex>
    </v-layout>
  </div>
</template>
<script>
import request from 'framework/request'
import baseInfo from './base-info'
import mechines from './mechines'
import nginx from './nginx'


export default {
  components: { baseInfo, mechines, nginx },
  data() {
    return {
      name: '',
      createTime: '',
      updateTime: '',
      nginxProxy: null,
      mechines: [],
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
      this.nginxProxy = application.nginxProxy
      this.mechines = application.mechines
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
