<template>
  <div class="finance-container finance-regwriteoff regwriteoff">
    <div class="finance-page">
      <el-tabs
        v-model="activeName"
        @tab-click="tabClick"
        class="fin-el-tabs">
        <el-tab-pane
          v-for="(item, index) in tabsList"
          :key="'tabsList' + index"
          :label="item.label"
          :name="item.name"
          class="fin-el-tab-pane">
          <!-- <template>
            <div v-if="item.name === 'settleList' && activeName === 'settleList'">
              <SettleList ref="first" :isJumpRouteFromPage.sync='isJumpRouteFromPage' />
            </div>
            <div v-if="item.name === 'prepayList' && activeName === 'prepayList'">
              <PrepayList ref="second" :isJumpRouteFromPage.sync='isJumpRouteFromPage' />
            </div>
            <div v-if="item.name === 'payApplyReceiveRefund' && activeName === 'payApplyReceiveRefund'">
              <PayApplyReceiveRefund ref="third" :isJumpRouteFromPage.sync='isJumpRouteFromPage' />
            </div>
          </template> -->
        </el-tab-pane>
      </el-tabs>
      <!-- 为提升性能，暂时牺牲部分不常用的路由跳转问题 -->
      <keep-alive>
        <component
          :ref="activeName"
          :is="component"
          :isJumpRouteFromPage.sync="isJumpRouteFromPage"
        />
      </keep-alive>
    </div>
  </div>
</template>
<script>
import SettleList from '../settle/'
import PrepayList from '../prepay/'
import PayApplyReceiveRefund from '../payApplyReceiveRefund/'
import SettleSpecial from '../settle/settleSpecial'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      activeName: '',
      tabsList: [
        {
          label: this.$t('PayApplyList.settleList'), // '结算付款',
          name: 'settleList'
        },
        {
          label: this.$t('PayApplyList.prepayList'), // '预付款',
          name: 'prepayList'
        },
        {
          label: this.$t('PayApplyList.refundList'), // '退款申请',
          name: 'payApplyReceiveRefund'
        },
        {
          label: this.$t('PayApplyList.settleSpecialList'), // '专项申请',
          name: 'settleSpecial'
        },
      ],
      isJumpRouteFromPage: false,
      componentCfg: {
        settleList: SettleList,
        prepayList: PrepayList,
        payApplyReceiveRefund: PayApplyReceiveRefund,
        settleSpecial: SettleSpecial,
      },
    }
  },
  components: {
    SettleList,
    PrepayList,
    PayApplyReceiveRefund,
    SettleSpecial,
  },
  methods: {
    tabClick(tab, event) {
    },
  },
  computed: {
    component() {
      return this.componentCfg[this.activeName]
    },
  },
	activated () {
    // url有值tabFromOther,说明是链接跳转
    let routeQuery = this.$route.query
    if (routeQuery.tabFromOther) {
      sessionStorage.setItem('_routeQueryToSearch', JSON.stringify(routeQuery))
      // 不使用nextTick 直接设置this.activeName无效
      this.$nextTick(() => {
        this.isNotFirstActivated = true
        this.activeName = routeQuery.tabFromOther
        // 不使用nextTick 直接跳转路由，search组件activated钩子则无法读取原url参数
        // this.$nextTick(() => {
        //   this.$router.push({ name: 'PrepayList' })
        // })
      })
    } else if (!this.isNotFirstActivated) {
      // activeName最好不要设置初始值，设置初始值初次进入有参数tabFromOther时，会触发初始页面search组件组件
      this.isNotFirstActivated = true
      this.activeName = 'settleList'
    }
	},
}
</script>
<style lang="scss" scoped>
</style>


