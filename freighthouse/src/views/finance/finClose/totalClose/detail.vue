<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-container finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">总关账失败明细</div>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" @click="cancel" size="mini">返回</el-button>
        </div>
      </div>
      <FinanceTable :option="tableOption" />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mixin as voucherMixin } from '@/views/finance/voucher/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import API from '@/api/fin/finClose'

export default {
  name: 'totalClose2',
  label: '总关账失败明细',
  mixins: [mixin, mixin2, voucherMixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
  },
  data() {
    return {
      searchOption: {},
      tableOption: {},
    }
  },
  created() {
    // 表格配置
    this.tableOption = { ...this.option, id: 'option1', $name: 'TotalClose', pagination: { show: false }, selection: false }
    this.tableOption.operationBtns.width = '60px'
    this.tableOption.operationBtns.data = [{ label: '详情', type: 'text', show: true, action: 'showDetail' }]
    let columns = [
      { prop: 'billNo', label: '单号', width: 130, type: 'button', callback: (row) => this.showDetail(row) },
      { prop: 'settleCompName', label: '分公司', type: 'text', minWidth: 150 },
      { prop: 'bizDate', label: '业务日期', type: 'text', width: 100 },
      { prop: 'finMon', label: '财务月份', type: 'text', width: 100 },
      { prop: 'createdTime', label: '检查时间', type: 'text',width: 130 },
      { prop: 'errorReason', label: '失败原因', type: 'text', minWidth: 180 },
      { prop: 'bdEmployeeName', label: '业务员', type: 'text', width: 100 },
      { prop: 'opEmployeeName', label: '操作姓名', type: 'text', width: 100 },
    ]
    this.tableOption.columns = columns
    this.optionMaxHeight = this.tableOption
  },
  methods: {
    cancel(refresh) {
      this.routerBack(refresh)
    },
    getData() {
      let { settleCompCode, deptCode } = this.$route.query
      API.deptFinClosingFailList({ settleCompCode, deptCode })
        .then((res) => {
          this.tableOption.data = res.data || []
        })
        .finally(() => (this.lsLoading = false))
    },
    // 跳转至详情页
    showDetail(row) {
      if (!row.billNo) {
        return this.$message.error('单号不能为空！')
      }
      this.showOneNoDetail('sourceBizNo', row.billNo, { isTab: true })
    },
  },
}
</script>
<style lang="scss" scoped>
.money-box {
  padding: 6px 8px;
  border-bottom: 1px solid #e9e9e9;
  margin-bottom: 8px;
}
</style>
