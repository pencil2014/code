<template>
  <div class="finance-page">
    <el-tabs v-model="activeName" class="fin-el-tabs">
      <el-tab-pane
        v-for="(item, index) in tabsList"
        :key="'tabsList' + index"
        :label="item.label"
        :name="item.name"
        class="fin-el-tab-pane"
      ></el-tab-pane>
    </el-tabs>
    <el-button class="finance-btn" @click="cancel" size="mini">返回</el-button>
    <keep-alive>
      <component :ref="activeName" :is="component" :isJumpRouteFromPage.sync="isJumpRouteFromPage" />
    </keep-alive>
  </div>
</template>
<script>
import SettlementBillListBill from './settlementBillListBill'
import SettlementBillListMonth from './settlementBillListMonth'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      activeName: 'month',
      tabsList: [
        { label: '月结账单', name: 'month' },
        { label: '票结账单', name: 'bill' },
      ],
    }
  },
  activated() {
    if (!this.$route.meta.isUseCache) {
      console.log('activated')
    }
  },
  methods: {
    cancel() {
      // 此处固定返回结算单详情，否则有的情况返回结算单对账单详情，导致不合理
      let fromTo =
        this.jumpRouteFromToList &&
        this.jumpRouteFromToList.find((item) => {
          return item.to.name === 'SettlementDetail'
        })
      this.$router.push({
        path: fromTo ? fromTo.to.path : '',
        query: fromTo ? fromTo.to.query : {},
      })
    },
  },
  components: {
    SettlementBillListBill,
    SettlementBillListMonth,
  },
  computed: {
    component() {
      return this.activeName === 'month' ? SettlementBillListMonth : SettlementBillListBill
    },
  },
}
</script>
<style scoped>
.finance-page {
  position: relative;
}
.finance-btn {
  position: absolute;
  right: 8px;
  top: 4px;
}
/* .money-box {
  padding-top: 0px;
} */
</style>