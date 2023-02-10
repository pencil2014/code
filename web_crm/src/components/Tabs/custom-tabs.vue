
<!-- <custom-tabs :menus="menus" :activeName="menus[0].key" v-on:tabsClick="tabsClick"></custom-tabs>
menus: 展示列表，目前包括key，value
activeName： 默认选择传入默认的key值
tabsClick： 点击事件响应
tabType: tab类型 type="card"时是卡片类型 type="是正常标签类型"
-->

<template>
  <el-tabs v-model="activeKey" @tab-click="handleClick" :type="tabType" class="custom-tabs" @getMenus="getMenus">
    <el-tab-pane v-for="(item) in menus" :label="item.value" :name="item.key" :key="item.key">
    </el-tab-pane>
  </el-tabs>
</template>
<script>
export default {
  props: {
    menus: {
      type: Array,
      default: []
    },
    activeName: {
      type: String
    },
    tabType: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      activeKey: ""
    };
  },
  computed: {},
  created() {
    this.activeKey = this.activeName
  },
  watch: {
    activeName: function (newValue, oldValue) {
      this.activeKey = newValue
    }
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    handleClick(tab, event) {
      this.$emit('tabsClick', this.activeKey)
    },
    getMenus(serviceList, serviceInfoList) {
      this.$emit("getMenus", serviceList, serviceInfoList)
    }
  }
}
</script>

<style lang="scss">
.custom-tabs{
  &.el-tabs--top .el-tabs__item.is-top:nth-child(2) {
    padding-left: 30px!important;
  }
  &.el-tabs--top .el-tabs__item.is-top:last-child {
    padding-right: 30px!important;
  }
  .el-tabs__nav-wrap::after{
    background-color: #E9E9E9;
    height: 1px;
  }
  .el-tabs__header{
    margin: 0;
    background-color: #fff;
  }
  .el-tabs__item{
    font-size: 14px;
    line-height: 32px;
    height: 32px;
    text-align: center;
    padding: 0px 30px;
    position: relative;
    color: #3E80F5;
    &::before{
      content: '';
      position: absolute;
      display: block;
      height: 16px;
      width: 1px;
      right: -1px;
      top: 8px;
      background-color: #3E80F5;
    }
    &.is-active{
      color: #fff;
      background-color: #3E80F5;
      &::before{
        content: '';
        position: absolute;
        display: block;
        height: 16px;
        left: 1px;
        right: 0;
        top: 8px;
      }
    }
  }
  .el-tabs__active-bar{
    display: none;
  }
}


</style>
