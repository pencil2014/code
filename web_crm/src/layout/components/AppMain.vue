<template>
  <section class="app-main">
    <!-- <transition name="fade-transform" mode="out-in">
    </transition> -->
    <keep-alive>
      <router-view :key="key" v-if="$route.meta.keepAlive"/>
    </keep-alive>
    <router-view :key="key" v-if="!$route.meta.keepAlive"/>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    key() {
      return this.$route.path
    }
  },
  created() {
  }
}
</script>

<style scoped>
.app-main {
  /*35 = navbar  */
  /*30 = tagsview  */
  height: 100%;
  width: 100%;
  padding: 0;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  position: relative;
  /* overflow-y: auto; */
  background-color: #f5f7f9;
}
.fixed-header+.app-main {
  padding-top: 50px;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
