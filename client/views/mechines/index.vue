<template>
  <div>
    <creator :show="isShowCreator" @cancle="hideCreator" @created="refreshMechines" />
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

          <v-divider v-if="mechines.length" />

          <item
            v-for="mechine in mechines"
            :key="mechine.id"
            :id="mechine.id"
            :public-ip="mechine.publicIp"
            :port="mechine.port"
            :type="mechine.type"
            :disabled="mechine.disabled"
            :application="mechine.application"
            :communication="mechine.communication"
            @removed="refreshMechines"
          />
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import request from 'framework/request'
import creator from './creator.vue'
import item from './item.vue'


export default {
  components: { creator, item },

  data() {
    return {
      isShowCreator: false,
      mechines: [],
    }
  },

  mounted() {
    this.fetchMechines()
  },

  methods: {
    showCreator() {
      this.isShowCreator = true
    },
    hideCreator() {
      this.isShowCreator = false
    },

    async fetchMechines() {
      this.mechines = await request
        .get('/api/mechines')
        .then(res => res.body)
    },

    async refreshMechines() {
      await this.fetchMechines()
      this.hideCreator()
    },
  },
}
</script>
<style lang="postcss" scoped>

</style>
