<template>
  <div class="top-bar">
    <div class="logo-box">
       <img src="../../assets/logo.png" :alt="$t('tobBar.title')" />
    </div>
    <div class="menu-box">
      <Menu />
    </div>
    <div class="nav-box">
      <NavBtn />
    </div>
  </div>
</template>

<script>
import Menu from './menu'
import NavBtn from './navbtn'
export default {
  components: {
    Menu,
    NavBtn
  },
  data () {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>
.top-bar{
  display: flex;
  height: 60px;
  background: #0062C4;
  .logo-box {
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-shrink: 0;
  }
  .menu-box {
    flex: 1;
  }
  .nav-box {
    flex-shrink: 0;
    margin-left: 15px;
  }
}
</style>