<template>
  <div :class="classObj" class="app-wrapper">
    <!-- <div
      v-if="device === 'mobile' && sidebar.opened"
      class="drawer-bg"
      @click="handleClickOutside"
    /> -->
    <!-- <sidebar class="sidebar-container" /> -->
    <div class>
      <!-- <div class="top-container">
        <div class="logo">
          <img :src="require('@/assets/logo.png')" @click="goHome" class="logo-img"/>
        </div>
        <div class="tagsView-cont">
          <tags-view />
        </div>
        <navbar />
      </div> -->
      <div class="main-container">
        <!-- <hamburger
          :is-active="sidebar.opened"
          class="hamburger-container"
          @toggleClick="toggleSideBar"
        /> -->
        <app-main />
      </div>
    </div>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain } from './components'
import TagsView from './components/TagsView'
import ResizeMixin from './mixin/ResizeHandler'
import Hamburger from '@/components/Hamburger'
import store from '@/store'

export default {
  name: 'Layout',
  components: {
    Navbar,
    Sidebar,
    AppMain,
    TagsView,
    Hamburger,
  },
  mixins: [ResizeMixin],
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    fixedHeader() {
      return this.$store.state.settings.fixedHeader
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile',
      }
    },
  },
  created() {
    // this.hbt()
		store.dispatch('app/setSPartWidth', 144)
		store.dispatch('app/setTPartHeight', 30)
  },
  methods: {
    goHome(){
      this.$router.push({
        name:'Dashboard'
      })
    },
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar', this.$route)
    },
    hbt() {
      let _sw_heartbeat_time = localStorage.getItem('_sw_heartbeat_time')
      console.log(new Date().getTime() - _sw_heartbeat_time > 11000)
      console.log(this.$route.name)
      if (this.$route.name !== 'Login' && new Date().getTime() - _sw_heartbeat_time > 11000) {
        this.$store.dispatch('user/resetToken').then(() => {
          console.log('hello reset-')
        })
        this.$router.push({name: 'Login'})
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
@import '~@/styles/variables.scss';

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}
.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.mobile .fixed-header {
  width: 100%;
}
.top-container {
  display: flex;
  .logo,.navbar{
    flex: 0 0 auto;
  }
  .tagsView-cont{
    flex: 1 1 auto;
    overflow: hidden;
  }
  height: 30px;
  // overflow: hidden;
  position: relative;
  background: #2d3a5d;
  .logo {
    color: #fff;
    text-align: center;
    width: 144px;
    float: left;
    display: inline-block;
    line-height: 30px;
    padding-top: 7px;
    .logo-img{
      display: block;
      width: 112px;
      height: auto;
      margin: 0 auto;
      cursor: pointer;
    }
  }
  // .tagsView-cont {
  //   width: calc(100% - 530px);
  //   float: left;
  // }
}

.hamburger-container {
  z-index: 1003;
  position: absolute;
  top: 50%;
  left: 0;
  line-height: 80px;
  height: 80px;
  width: 10px;
  background-color: #222;
  margin-top: -40px;
  // height: 100%;
  float: left;
  cursor: pointer;
  transition: background 0.3s;
  -webkit-tap-highlight-color: transparent;
  border-radius: 0px 4px 4px 0px;
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
}
// 全局设置input，button 1366尺寸大小
.app-wrapper ::v-deep .finance-page, .app-wrapper ::v-deep .one-kind-fee {
  font-size: 12px;
  // el-form组件内label及内容区，各类输入框，行高和高度，
  .el-form-item__label {
    height: 20px !important;
    line-height: 20px !important;
  }
  // 不能粗暴的设置.el-form-item__content高度20px, 因为存在多行或者文件上传的情况
  .el-form-item__content {
    line-height: 20px !important;
  }
  input,
  select,
  .el-range-editor--mini.el-input__inner,
  .el-cascader--mini {
    height: 20px !important;
    line-height: 20px !important; // 16px
  }
  .el-input__icon {
    line-height: 20px !important;
  }
  
  .el-form-item__label {
    padding-right: 4px;
  }
  // textarea 及计数组件
  textarea {
    height: 20px;
    padding-top: 0;
    padding-bottom: 0;
    min-height: 20px !important;
    font-size: 12px;
    line-height: 18px !important;
  }
  .el-textarea .el-input__count {
    bottom: 2px;
    height: 16px;
    line-height: 16px;
  }
  // 日期分隔符
  .el-range-editor--mini .el-range-separator {
    line-height: 12px;
  }
  // 按钮
  .el-button--mini,
  .el-radio-button--mini .el-radio-button__inner {
    font-size: 12px;
    height: 20px;
    padding: 3px 7px;
  }
  // 20210524  恢复*号，取消粉红背景色
  // 必填项，取消*号，改为背景色, 
  // .is-required {
  //   & > label::before {
  //     display: none;
  //   }
  //   &.checkboxGroup .el-form-item__label,
  //   input,
  //   select,
  //   textarea,
  //   .el-date-editor--daterange {
  //     background: #fef5f4;
  //   }
  //   // 对于多选下拉框，会有两个input框，会遮盖placeholder，需设置tags input框底色透明
  //   .el-select__tags input,
  //   .el-date-editor--daterange input {
  //     background: transparent;
  //   }
  // }
  .is-disabled {
    &.checkboxGroup .el-form-item__label,
    input,
    select,
    textarea,
    .el-date-editor--daterange {
      background: #f5f7fa;
    }
  }
  // el-tab样式---见finance.scss的.el-tabs__item
  // .el-tabs__nav-scroll,
  // .el-tabs__nav-scroll > div,
  // .el-tabs__nav-scroll .el-tabs__item {
  //   padding-top: 0;
  //   font-size: 12px;
  //   height: 24px;
  //   line-height: 24px;
  // }
}
</style>
<style lang="scss">
@import '~@/views/finance/style/finance.scss';
@import '~@/views/bkg/style/bkg.scss';
</style>
