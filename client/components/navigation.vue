<template>
  <div class="navigation">
    <nav>
      <router-link class="link" to="/applications">应用</router-link>
      <router-link class="link" to="/domains">域名</router-link>
      <router-link class="link" to="/certificates">证书</router-link>
      <router-link class="link" to="/mechines">机器</router-link>
    </nav>
    <div class="operators">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
}
</script>
<style lang="postcss" scoped>
.navigation {
  background: #333;
  display: flex;
  justify-content: space-between;
  color: #fff;

  & nav {
    & .link {
      color: #fff;
      text-decoration: none;
      padding: 30px 30px;
      display: inline-block;
      &.active {
        color: #fff;
        background: #666;
      }
    }
  }

  & .operators {
    margin-right: 20px;
    display: flex;
    align-items: center;

    & .button {
      font-size: 14px;
      cursor: pointer;
      border: 1px solid #fff;
      border-radius: 4px;
      padding: 10px 20px;
      text-align: center;
    }
  }
}


</style>
