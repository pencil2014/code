<template>
  <div class="finance-page">
    <div class="finance-container">
      <el-tabs class="fin-el-tabs" v-model="activeName">
        <el-tab-pane v-for="item in tabsList" :key="item.name" :label="item.label" :name="item.name">
          <!-- <div class="finance-list-container"> -->
          <!-- <component :is="item" /> -->
          <!-- </div> -->
        </el-tab-pane>
      </el-tabs>
      <keep-alive>
        <component :is="component" />
      </keep-alive>
    </div>
  </div>
</template>
<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
/******** 自动引入组件  --begin  省去修改文件名后需要做一系列改动 ******** */
// 更改或添加组件，需遵循文件命名规则，以'Tab.vue'结尾
// 用法 https://webpack.js.org/guides/dependency-management/#require-with-expression
const context = require.context('./components', false, /Tab.vue$/)
const tabsList = context.keys().map((item) => context(item).default).filter(item => !item.hide)
//根据组件name属性最后一位数字进行排序 更改页面tab显示顺序需到组件内更改组件name值
tabsList.sort((a, b) => a.name.slice(-1) - b.name.slice(-1))
/******** 自动引入组件  --end  ******** */
export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      tabsList: tabsList,
      activeName: tabsList[0].name,
    }
  },
  computed: {
    component() {
      return tabsList.find(({ name }) => this.activeName === name)
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-page ::v-deep .el-tabs__header {
  user-select: none;
}
// #E63923 红色
// #7BD269 !important 绿色
</style>