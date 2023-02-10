<template>
  <div class="finance-page">
    <el-tabs v-model="activeName" class="fin-el-tabs">
      <el-tab-pane
        v-for="(item, index) in tabsList"
        :key="'tabsList' + index"
        :label="item.label"
        :name="item.name"
        class="fin-el-tab-pane"
      >
        <template v-if="false">
          <div
            v-if="item.name === 'invoiceReceivableApplyList' && activeName === 'invoiceReceivableApplyList'"
          >
            <InvoiceReceivableApplyList key="InvoiceReceivableApplyList" />
            <!-- :isJumpRouteFromPage.sync="isJumpRouteFromPage" -->
          </div>
          <div v-if="item.name === 'invoicePrerevList' && activeName === 'invoicePrerevList'">
            <InvoicePrerevList key="InvoicePrerevList" />
            <!-- :isJumpRouteFromPage.sync="isJumpRouteFromPage" -->
          </div>
          <div
            v-else-if="item.name === 'invoiceReceivableList' && activeName === 'invoiceReceivableList'"
          >
            <InvoiceReceivableList key="InvoiceReceivableList" />
            <!-- :isJumpRouteFromPage.sync="isJumpRouteFromPage" -->
          </div>
          <div
            v-else-if="item.name === 'invoiceReceivableCancelList' && activeName === 'invoiceReceivableCancelList'"
          >
            <InvoiceReceivableCancelList key="InvoiceReceivableCancelList" />
            <!-- :isJumpRouteFromPage.sync="isJumpRouteFromPage" -->
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
    <keep-alive>
      <component :ref="activeName" :is="component" />
    </keep-alive>
  </div>
</template>
<script>
import InvoiceReceivableApplyList from './invoiceReceivableApplyList'
import InvoiceReceivableList from './invoiceReceivableList'
import InvoiceReceivableCancelList from './invoiceReceivableCancelList'
import InvoicePrerevList from './invoicePrerevList'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      activeName: 'invoiceReceivableApplyList',
      tabsList: [
        {
          label: '开票申请',
          name: 'invoiceReceivableApplyList',
        },
        {
          label: '预收款开票审核',
          name: 'invoicePrerevList',
        },
        {
          label: '发票列表',
          name: 'invoiceReceivableList',
        },
        {
          label: '红冲作废申请',
          name: 'invoiceReceivableCancelList',
        },
      ],
      cTimestamp: 0,
    }
  },
  created() {
    this.cTimestamp = new Date().getTime()
    this.detectActiveName()
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 300) {
      this.detectActiveName()
    }
  },
  methods: {
    tabClick(tab, event) {},
    detectActiveName() {
      let nameListByNum = ['first', 'second', 'third']
      let nameListByStr = [
        'invoiceReceivableApplyList',
        'invoiceReceivableList',
        'invoicePrerevList',
        'invoiceReceivableCancelList',
      ]
      let invoiceChild = this.$route.query.invoiceChild
      let index = nameListByNum.findIndex((item) => item === invoiceChild)
      if (index > -1) {
        invoiceChild = nameListByStr[index]
      }
      this.activeName = invoiceChild || 'invoiceReceivableApplyList'
    },
  },
  components: {
    InvoiceReceivableApplyList,
    InvoiceReceivableList,
    InvoicePrerevList,
    InvoiceReceivableCancelList,
  },
  computed: {
    component() {
      let obj = {
        invoiceReceivableApplyList: InvoiceReceivableApplyList,
        invoicePrerevList: InvoicePrerevList,
        invoiceReceivableList: InvoiceReceivableList,
        invoiceReceivableCancelList: InvoiceReceivableCancelList,
      }
      return obj[this.activeName]
    },
  },
}
</script>
<style lang="scss" scoped>
</style>