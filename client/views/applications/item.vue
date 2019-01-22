<template>
  <v-layout>
    <v-flex sm10>
      <v-layout fill-height align-center>
        <v-flex sm2 class="ml-3">{{name}}</v-flex>
        <v-flex sm3>{{appKey}}</v-flex>
      </v-layout>
    </v-flex>
    <v-flex sm2>
      <v-layout justify-end>
        <v-btn icon ripple :to="url">
          <v-icon color="blue-grey darken-4">list</v-icon>
        </v-btn>
      </v-layout>
    </v-flex>
  </v-layout>
</template>
<script>
import vt from 'vue-types'

export default {
  props: {
    name: vt.string.def(''),
    appKey: vt.string.isRequired,
    divider: vt.bool.isRequired,
    index: vt.integer,
  },
  computed: {
    url() {
      return `/applications/${this.appKey}`
    }
  },
}
</script>
