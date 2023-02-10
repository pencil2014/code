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
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      activeName: 'custReceiList',
      tabsList: [
        {
          label: this.$t('LateFee.custReceiList'), // '客户应收汇总',
          name: 'custReceiList'
        },
        {
          label: this.$t('LateFee.fiscalTermList'), // '应收账单',
          name: 'fiscalTermList'
        },
        {
          label: this.$t('LateFee.lateFeeList'), // '滞纳金列表',
          name: 'lateFeeList'
        },
        {
          label: this.$t('LateFee.derateList'), // '减免申请审核',
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
    DerateList
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
    if (this.$route.query.tabFromOther === 'lateFeeList') {
      this.$nextTick(() => {
        this.activeName = 'lateFeeList'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>

