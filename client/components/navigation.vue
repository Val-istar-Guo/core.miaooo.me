<template>
  <div class="navigation">
    <v-toolbar color="blue-grey darken-4" dark tabs>
      <v-toolbar-title>应用管理平台</v-toolbar-title>
      <!-- <v-spacer></v-spacer>
      <v-btn icon><v-icon>search</v-icon></v-btn>
      <v-btn icon><v-icon>more_vert</v-icon></v-btn> -->

      <v-tabs
        slot="extension"
        color="blue-grey darken-4"
        grow
      >
        <v-tabs-slider color="orange lighten-4"></v-tabs-slider>

        <v-tab to="/applications">应用</v-tab>
        <v-tab to="/mechines">机器</v-tab>
        <v-tab to="/certificates">证书</v-tab>
        <v-tab to="/services">服务</v-tab>
      </v-tabs>

    </v-toolbar>
  </div>
</template>
<script>
export default {
}
</script>
<style lang="postcss" scoped>
</style>
