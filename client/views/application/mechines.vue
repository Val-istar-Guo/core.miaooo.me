<template>
  <div>
    <div class="unable-select  body-1 grey--text text--darken-2 mb-3 mt-4">机器管理</div>
    <v-card>
      <v-divider v-if="mechines.length" />

      <v-btn grow flat block large color="blue-grey darken-4" class="mt-0 mb-0">
        <v-icon >add</v-icon>
      </v-btn>
    </v-card>
  </div>
</template>
<script>
import moment from 'moment'
import vt from 'vue-types'


export default {
  props: {
    mechines: vt.array.def([]),
  },

  methods: {
  }
}
</script>
<style lang="postcss" scoped>

</style>
