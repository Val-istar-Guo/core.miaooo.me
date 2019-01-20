<template>
  <div>
    <navigation>
      <div class="button add" @click="showCreator">创建应用</div>
    </navigation>

    <creator :show="isShowCreator" @created="refresh" @cancle="hideCreator" />

    <ul class="application-list">
      <li class="application" v-for="application of applications" :key="application.key">
        <div class="info">
          <span class="name">{{application.name}}</span>
          <span class="key">{{application.key}}</span>
        </div>
        <router-link class="detail-button" :to="`/applications/${application.key}`">查看</router-link>
      </li>
    </ul>
  </div>
</template>
<script>
import request from 'framework/request';
import creator from './creator'


export default {
  components: { creator },
  data() {
    return {
      isShowCreator: false,
      applications: [],
    }
  },

  mounted() {
    this.fetchList();
  },

  methods: {
    showCreator() {
      this.isShowCreator = true
    },
    hideCreator() {
      this.isShowCreator = false
    },

    async fetchList() {
      // console.log(request)
      this.applications = await request
        .get('/api/applications')
        .then(res => res.body)
    },

    async refresh() {
      this.hideCreator()
      await this.fetchList()
    }
  },
}
</script>
<style lang="postcss" scoped>
.application-list {
  width: 1000px;
  margin: 60px auto;
  padding: 0;
}

.application {
  box-sizing: border-box;
  list-style: none;
  padding: 12px 30px;
  width: 100%;
  border-bottom: 1px solid #efefef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: 30px;

  & .info {
    display: flex;
  }

  & .name {
    display: inline-block;
    font-size: 18px;
  }

  & .key {
    display: inline-block;
    font-size: 12px;
    font-weight: bolder;
    color: #666;
    margin-left: 20px;
  }

  & .detail-button {
    box-sizing: border-box;
    border: 1px solid #999;
    color: #666;
    line-height: 28px;
    height: 30px;
    background: transparent;
    padding: 0 10px;
    cursor: pointer;
    text-decoration: none;
  }
}
</style>
