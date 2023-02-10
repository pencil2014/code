<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-approve-btns-box">
      <div class="finance-approve-btns-left">
        {{title}}
        <span>
          <i class="el-icon-info"></i>
          {{warnMessage}}
        </span>
      </div>
      <div class="finance-approve-btns-right">
        <el-button @click="cancel" size="mini">返回</el-button>
      </div>
    </div>
    <DetailFeeSearchFilter
      ref="DetailFeeSearchFilter"
      :columns="feeListColumns"
      :list="option1.data"
      @search="search"
    />
    <FinanceTable :option="option1" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import DetailFeeSearchFilter from '@/views/finance/components/financeSearch/detailFeeSearchFilter'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { systemFeeList } from '@/api/fin/settleOrderBaddebt'
export default {
  name: 'receiLossFeeDetail',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    DetailFeeSearchFilter,
  },
  data() {
    return {
      title: this.$route.name === 'ReceiLossSettleFeeDetail' ? '坏账申请费用明细' : '对冲费用明细',
      warnMessage:
        this.$route.name === 'ReceiLossSettleFeeDetail'
          ? '坏账申请审核通过之后系统生成的费用。'
          : '对冲审核通过之后系统生成的内部往来费用。',
      keyDownActive: true,
      isFirstGetData: false,
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption: {},
      forceRefresh: false,
      feeListColumns: [],
    }
  },
  created() {
    // 表格配置
    this.option1 = {
      ...this.option,
      id: 'option1',
      pagination: false,
      operationBtns: false,
      selection: false,
      colorColumns: ['receipayType'],
    }
    let columns = [
      {
        prop: 'sourceBizNo',
        label: '单号', // 另：可通过sourceType判断，为order时为订单号，否则为费用单号（手续费归为费用单大类）
        type: 'button',
        width: 150,
        st: 1,
        callback: (row) => {
          let sourceType = row.sourceType
          let sourceBizNo = row.sourceBizNo
          this.showOneNoDetail(sourceType, sourceBizNo, { feeId: row.feeId })
        },
      },
      { prop: 'receipayType', label: '应收应付', width: 80, type: 'select', st: 3 },
      { prop: 'settleCompName', label: '分公司', minWidth: 200, type: 'text', st: 2 },
      { prop: 'settleCorpName', label: '结算单位', minWidth: 200, type: 'text', st: 2 },
      { prop: 'feeName', label: '费用名称', width: 150, type: 'text', st: 2 },
      { prop: 'currency', label: '币种', type: 'text', width: 80, st: 3 },
      { prop: 'feeAmt', label: '金额', type: 'text', width: 100 },
    ]
    if (this.$route.name !== 'ReceiLossSettleFeeDetail') {
      columns.push({ prop: 'finDate', label: '财务日期', type: 'text', width: 130, st: 4 })
    }
    this.feeListColumns.push(...columns.map((item) => ({ ...item })))
    this.option1.columns = columns
  },
  methods: {
    //返回
    cancel() {
      this.routerBack()
    },
    search(list) {
      this.option1.data = [...list]
    },
    // 封装请求参数并请求列表
    getData() {
      this.lsLoading = true
      let data = { settleOrderId: this.settleOrderId, writeoffNo: this.writeoffNo }
      systemFeeList(data)
        .then((res) => (this.option1.data = res.data))
        .finally(() => (this.lsLoading = false))
    },
  },
  // 路由进入前守卫 实例要在next回调中才能获取
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (!to.meta.isUseCache || to.meta.refresh || vm.isFirstGetData) {
        vm.isFirstGetData = false
        vm.forceRefresh = false
        vm.settleOrderId = vm.$route.query.settleOrderId
        vm.writeoffNo = vm.$route.query.writeoffNo
        vm.$nextTick(() => (vm.forceRefresh = true))
        vm.option1.data = []
        vm.$refs.detailFeeSearch && vm.$refs.detailFeeSearch.clearData()
        vm.getData()
      }
      to.meta.isUseCache = true
      to.meta.isClickBack = false
      to.meta.refresh = false
      vm.jumpRouteFromToList.forEach((item) => {
        if (item.to.name === to.name) {
          item.to.meta.refresh = false
        }
      })
    })
  },
}
</script>
<style lang="scss" scoped>
.finance-page {
  .finance-approve-btns-box {
    display: flex;
    justify-content: space-between;
    padding: 8px;
    border-radius: 4px 4px 0px 0px;
    border-bottom: 1px solid #e9e9e9;
  }
  .finance-approve-btns-left {
    font-size: 14px;
    font-weight: 600;
    color: #222222;
    line-height: 16px;
    padding: 2px 0;
    & > span {
      color: #969696;
      font-size: 12px;
      font-weight: normal;
    }
  }
  .table-title {
    padding: 14px 16px 0 16px;
    font-size: 14px;
    span {
      padding-right: 40px;
    }
  }
}
</style>
