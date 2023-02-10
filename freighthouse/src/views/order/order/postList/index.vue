<template>
  <div class="finance-page">
    <div class="finance-container">
      <el-tabs class="fin-el-tabs" v-model="activeItem">
        <el-tab-pane v-for="item in panes" :key="item.name" :label="item.label" :name="item.name">
          <!-- <component :is="item" /> -->
        </el-tab-pane>
      </el-tabs>
      <keep-alive>
        <component ref="tab" :isJumpRouteFromPage.sync="isJumpRouteFromPage" :is="component" />
      </keep-alive>
    </div>
  </div>
</template>
<script>
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
/******** 自动引入组件  --begin  省去修改文件名后需要做一系列改动 ******** */
// 更改或添加组件，需遵循文件命名规则，以'Tab.vue'结尾
// 用法 https://webpack.js.org/guides/dependency-management/#require-with-expression
const context = require.context('./components', false, /Tab.vue$/)
const panes = context.keys().map((item) => context(item).default)
//根据组件name属性最后一位数字进行排序 更改页面tab显示顺序需到组件内更改组件name值
panes.sort((a, b) => b.name.slice(-1) - a.name.slice(-1))
console.log(panes);
/******** 自动引入组件  --end  ******** */
export default {
  mixins: [routerMixin],
  data() {
    return {
      panes: panes,
      activeItem: panes[0].name,
    }
  },
  computed: {
    component() {
      return panes.find(({ name }) => this.activeItem === name)
    },
  },
  // TODO 暂不做缓存，牵扯到跳转结算单，跳转过于复杂
  // beforeRouteEnter(to, from, next) {
  //   next((vm) => {
  //     if (from.meta.refresh) {
  //       from.meta.refresh = false
  //       vm.activeItem === meta.tabName
  //       vm.$nextTick(() => {
  //         vm.$refs['tab'].handleCurrentChange(1)
  //       })
  //     }
  //   })
  // },
}
</script>
<style lang="scss" scoped>
.finance-page ::v-deep .el-tabs__header {
  user-select: none;
}
// #E63923 红色
// #7BD269 !important 绿色
</style>