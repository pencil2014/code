<template>
  <div class="finance-page">
    <div class="finance-container">
      <el-tabs class="fin-el-tabs" v-model="activeName">
        <el-tab-pane
          v-for="item in tabsList"
          :key="item.name"
          :label="item.label"
          :name="item.name"
        >
          <!-- <component :is="item" /> -->
        </el-tab-pane>
      </el-tabs>
      <keep-alive>
        <component :isJumpRouteFromPage.sync="isJumpRouteFromPage" :is="component" />
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
const List = context.keys().map((item) => context(item).default)
const nameList = ['preClose1', 'preClose4', 'preClose2', 'preClose3']
//根据组件name属性最后一位数字进行排序 更改页面tab显示顺序需到组件内更改组件name值
const tabsList = nameList.map((v) => List.find((item) => item.name === v)).filter((v) => v && !v.hide)
/******** 自动引入组件  --end  ******** */
export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      tabsList: tabsList,
      activeName: tabsList[0].name,
      tabRefresh: {
        pre: false,
        audit: false,
      },
    }
  },
  provide() {
    return {
      tabRefresh: this.tabRefresh,
    }
  },
  computed: {
    component() {
      return this.tabsList.find(({ name }) => this.activeName === name)
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (to.query.tab !== undefined && !vm.$route.query.tabFromOther) {
        let tab
        if (to.query.tab == 0 || to.query.tab === 'fail') {
          tab = 0
        } else if (to.query.tab === 'pending') {
          tab = 1
        } else if (to.query.tab === 'audit') {
          tab = 2
        } else if (to.query.tab === 'success') {
          tab = 3
        }
        vm.$nextTick(() => {
          vm.activeName = vm.tabsList[tab].name
        })
        vm.$router.push('preClose')
      }
    })
  },
  activated() {
    if (this.$route.query.tabFromOther) {
      this.$nextTick(() => {
        this.activeName = this.$route.query.tabFromOther
      })
    }

    // if (this.$route.query.tabFromOther == 'preClose1') {
    //   this.$nextTick(() => {
    //     this.activeName = 'preClose1'
    //     // this.$nextTick(() => {
    //     //   this.$router.push({ name: 'PreClose', ...this.$route.query ,tabFromOther: true,})
    //     // })
    //   })
    // } else if (this.$route.query.tabFromOther == 'preClose4') {
    //   this.$nextTick(() => {
    //     this.activeName = 'preClose4'
    //     // this.$nextTick(() => {
    //     //   this.$router.push({ name: 'PreClose', ...this.$route.query ,tabFromOther: true, })
    //     // })
    //   })
    // } else if (this.$route.query.tabFromOther == 'preClose2') {
    //   this.$nextTick(() => {
    //     this.activeName = 'preClose2'
    //     // this.$nextTick(() => {
    //     //   this.$router.push({ name: 'PreClose', ...this.$route.query ,tabFromOther: true, })
    //     // })
    //   })
    // } else if (this.$route.query.tabFromOther == 'preClose3') {
    //   this.$nextTick(() => {
    //     this.activeName = 'preClose3'
    //     // this.$nextTick(() => {
    //     //   this.$router.push({ name: 'PreClose', ...this.$route.query ,tabFromOther: true, })
    //     // })
    //   })
    // }
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