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
import CustReceiList from '@/views/finance/receivable/fiscalTermList/custReceiList'
import FiscalTermList from '@/views/finance/receivable/fiscalTermList/fiscalTermList'
import LateFeeList from '@/views/finance/receivable/fiscalTermList/lateFeeList'
import DerateList from '@/views/finance/receivable/fiscalTermList/derateList'
import FeeDetailList from '@/views/finance/receivable/fiscalTermList/feeDetailList'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      activeName: 'custReceiList',
      tabsList: [
        {
          label: '客户应收汇总',
          name: 'custReceiList'
        },
        {
          label: '应收账单',
          name: 'fiscalTermList'
        },
        {
          label: '费用明细',
          name: 'feeDetailList'
        },
        {
          label: '滞纳金列表',
          name: 'lateFeeList'
        },
        {
          label: '减免申请审核',
          name: 'derateList'
        },
      ],
      isJumpRouteFromPage: false
    }
  },
  components: {
    CustReceiList,
    FiscalTermList,
    LateFeeList,
    DerateList,
    FeeDetailList
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
  activated() {
    if (this.$route.query.tabFromOther) {
      this.$nextTick(() => {
        this.activeName = this.$route.query.tabFromOther
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

