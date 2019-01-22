<template>
  <div>
    <document-title>应用管理</document-title>
    <creator :show="isShowCreator" @cancle="hideCreator" @created="refresh" />
    <v-layout>
      <v-flex xs12 sm8 offset-sm2>
        <v-card>
          <v-btn
            grow
            flat
            block
            large
            color="blue-grey darken-4"
            class="mt-0 mb-0"
            @click="showCreator"
          >
            <v-icon >add</v-icon>
          </v-btn>

          <v-divider v-if="applications.length" />

          <item
            v-for="(application, index) of applications"
            :key="application.key"
            :name="application.name"
            :app-key="application.key"
            :divider="index + 1 < applications.length"
            :index="index"
          />
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>
<script>
import request from 'framework/request';
import creator from './creator.vue'
import item from './item'


export default {
  components: { creator, item },
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
