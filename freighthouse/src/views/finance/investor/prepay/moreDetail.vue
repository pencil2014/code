<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-approve-btns-box">
      <div class="finance-approve-btns-left">更多余额详情</div>
      <div class="finance-approve-btns-right">
        <el-button @click="cancel" size="mini">返回</el-button>
      </div>
    </div>
    <div class="table-title">
      <span>账号：{{info.accountNo}}</span>
      <span>结算单位：{{info.settleCorpName}}</span>
      <span>所属分公司：{{info.settleCompName}}</span>
    </div>
    <FinanceTable :option="option1" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import PREPAY from '@/api/fin/prepayAccount'
import PREREV from '@/api/fin/prerevAccount'

export default {
  name: 'InvestorPrepayDetailMore',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
  },
  data() {
    return {
      prepayAccountId: 0,
      // 列表页--表格配置
      option1: {},
      info: {},
    }
  },
  created() {
    // 表格配置
    this.option1 = {
      ...this.option,
      id: 'option1', $name: 'InvestorPrepayDetailMore',
      pagination: { show: false },
      operationBtns: false,
      selection: false,
    }
    this.option1.columns = [
      { prop: 'currency', label: '币种', type: 'text' },
      {
        prop: 'balance',
        label: '余额',
        type: 'button',
        no__line: (row, val) => !val || val === '0' || val === '0.00',
        operationBtns: false,
        callback: (row, prop) => {
          if (this.prepayAccountId) {
            return this.routerPush('InvestorPrepayDetail', { prepayAccountId: row.prepayAccountId, currency: row.currency })
          }
          this.routerPush('PrerevAccountDetail', { prerevAccountId: row.prerevAccountId, currency: row.currency })
        },
      },
      { prop: 'updatedTime', label: '操作时间', type: 'text' },
    ]
  },
  methods: {
    //返回
    cancel(refresh) {
      this.routerBack(refresh)
    },
    // 封装请求参数并请求列表
    getData() {
      this.lsLoading = true
      let method = this.prepayAccountId ? PREPAY.morePrepayAccountList : PREREV.morePrerecAccountList
      let data = this.prepayAccountId ? { prepayAccountId: this.prepayAccountId } : { prerevAccountId: this.prerevAccountId }
      method(data)
        .then((res) => {
          let data = this.prepayAccountId ? res.data[0] || {} : res.data || {}
          this.info = data
          this.option1.data = data.balanceList || []
        })
        .finally(() => (this.lsLoading = false))
    },
  },
  activated() {
    // if (!this.$route.meta.isUseCache) {
    //   return
    // }
      // this.option1.pagination.currPage = 1
      // this.info = { ...this.$route.query }
      // console.log(this.info)
      this.prepayAccountId = this.$route.query.prepayAccountId || 0
      this.prerevAccountId = this.$route.query.prerevAccountId || 0
      this.getData()
    
  },
}
</script>
