<template>
  <v-app>
    <v-toolbar color="blue-grey darken-4" dark>
      <v-toolbar-title class="unable-select">应用管理平台</v-toolbar-title>

      <v-spacer></v-spacer>
      <v-toolbar-items >
        <v-btn flat to="/applications">应用</v-btn>
        <v-btn flat to="/mechines">机器</v-btn>
        <v-btn flat to="/certificates">证书</v-btn>
        <v-btn flat to="/services">服务</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <div class="mt-5 mb-5">
      <router-view></router-view>
    </div>
  </v-app>
</template>

<script>
export default {
}
</script>
<style lang="postcss">
</style>
