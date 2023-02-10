<template>
    <div class="finance-page">
  <div class="finance-container finance-regwriteoff regwriteoff">
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
          <!-- 切换时样式出现问题，利用component组件 -->
          <!-- <template>
            <div class="finance-search-tabs-gap">
            </div>
            <div v-show="item.name === 'gedgingList' && activeName === 'gedgingList'">
              <GedgingList ref="first" :isJumpRouteFromPage1.sync='isJumpRouteFromPage' />
            </div>
            <div v-show="item.name === 'gedgingWriteOffList' && activeName === 'gedgingWriteOffList'">
              <GedgingWriteOffList ref="second" :isJumpRouteFromPage1.sync='isJumpRouteFromPage' />
            </div>
          </template> -->
        </el-tab-pane>
      </el-tabs>
      <keep-alive>
        <component :isJumpRouteFromPage.sync="isJumpRouteFromPage" :ref="refStr" :is="component" />
      </keep-alive>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import WriteoffRecvList from '@/views/finance/receivable/writeoffRecv/index'
import WriteoffPayList from '@/views/finance/pay/writeoffPay/index'
import GedgingWriteOffList from '@/views/finance/otherWriteOff/gedgingWriteOffList'
import SettleOrder from '@/views/finance/otherWriteOff/settleOrderBaddebtList/components/settleOrderList'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      orderNo: this.$store.state.finance.orderNo,
      activeName: 'writeoffRecvList',
      tabsList: [
        {
          label: '收款核销',
          name: 'writeoffRecvList'
        },
        {
          label: '付款核销',
          name: 'writeoffPayList'
        },
        {
          label: '对冲核销',
          name: 'gedgingWriteOffList'
        },
        {
          label: '提成预销单',
          name: 'settleOrder'
        },
      ],
      isJumpRouteFromPage: false
    }
  },
  components: {
    WriteoffRecvList,
    WriteoffPayList,
    GedgingWriteOffList,
    SettleOrder
  },
  methods: {
    tabClick(tab, event) {
    },
  },
  computed: {
    component() {
      return this.activeName.substring(0, 1).toUpperCase() + this.activeName.substring(1)
    },
    refStr() {
      return this.activeName
    }
  },
}
</script>
<style lang="scss" scoped>
</style>

