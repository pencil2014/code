<template>
  <div
    class="finance-list-container"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="money-box">
      <div class="money-box-left">
        <el-button
          class="finance-btn"
          size="mini"
          @click="$refs.FinDialog.compareDialog.show = true"
          v-if="checkAuth($route.name, 'tab-compareBillPayList', 'btn-compare')"
          type="primary"
        >对账</el-button>
      </div>
      <div class="money-box-right">
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
      </div>
    </div>
    <FinanceTable :option="option1" @send-multi="sendMulti" />
    <FinDialog ref="FinDialog" :vm="vm" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { bankCompareListPage as bankListPage } from '@/api/fin/compareBill.js'
// import FinDialog from '@/views/finance/components/financeDialog/finDialog'
import FinDialog from '../components/compareDialog'

export default {
  name: 'compareBillPayList',
  label: '日对账-付款',
  mixins: [mixin, mixin2, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    FinDialog,
  },
  activated() {
    let _compareBillPayList = sessionStorage.getItem('_compareBillPayList')
    sessionStorage.removeItem('_compareBillPayList')
    if (_compareBillPayList) {
      this.search()
    }
  },
  data() {
    return {
      pageSizeUrl: bankListPage('geturl'),
      keyDownActive: true,
      searchOption: {},
      option1: {},
      multipleSelection1: [],
      vm: this,
      // 升序
      ascColumns: [],
      // 降序
      descColumns: [],
    }
  },
  created() {
    // 搜索配置
    let searchInputGroup = ['bankAccStatementCompareNo', 'compBankName', 'receivePayDate']
    this.searchOption = {
      saveDefault: true,
      saveName: 'compareBillPayList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          bankAccStatementCompareNo: { label: '对账编号', type: 'input' },
          receivePayDate: { label: this.$t('PayApplyList.receivePayDate'), type: 'daterange', format: 'yyyy-MM-dd' },
          // receivePayType: { label: this.$t('FeeList.receipayType'), type: 'select', prop: 'receipayType' },
          // bankSeqNo: { label: '银行流水号', type: 'input' },
          settleCompCode: {
            label: this.$t('Settle.branchCompany'),
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            remoteSelectList: [],
          },
          compAccountShortName: { label: '银行简称', type: 'input' },
          compBankName: { label: '银行名称', type: 'input' },
          compAccountNo: { label: '银行账号', type: 'input' },
          currency: { label: this.$t('FeeList.currency'), type: 'select', prop: 'validCurrencyNR' },
          matchResult: { label: '对比结果', type: 'select', prop: 'supplierBillCompareMatchResult', multiple: true },
          compareBy: {
            label: '对账人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          compareTime: { label: this.$t('Collect.reconcTime'), type: 'daterange', format: 'yyyy-MM-dd' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.option1 = {
      ...this.option,
      id: 'option1',
      $name: 'PreCloseAuditTab',
      pagination,
      sortable: true,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
    }
    this.option1.operationBtns = Object.assign({}, this.option.operationBtns, { show: false })
    this.option1.emptyText = '数据将在查询后显示'
    let columns = [
      {
        prop: 'bankAccStatementCompareNo',
        label: '对账编号',
        type: 'button',
        width: '130px',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) =>
            this.routerPushTab('CompareBillPayResult', { bankAccStatementCompareNo: row.bankAccStatementCompareNo }),
        },
        showOverflow: false,
      },
      { prop: 'receivePayDate', width: 160, label: '收付日期' },
      // formatter: ({ row }) => `${row.startDate || '-'} ~ ${row.endDate || ''}`,
      { prop: 'receivePayType', label: this.$t('FeeList.receipayType'), type: 'select', width: 80, propInDict: 'receipayGroup' },
      { prop: 'settleCompName', width: 150, label: '所属分公司' },
      { prop: 'compAccountShortName', width: 130, label: '银行简称' },
      { prop: 'compBankName', width: 100, label: '银行名称' },
      { prop: 'compAccountNo', width: 130, label: '银行账号' },
      { prop: 'currency', width: 70, label: '币种' },
      { prop: 'matchResult', label: '对比结果', type: 'select', width: 80, propInDict: 'supplierBillCompareMatchResult' },
      { prop: 'bankRows', width: 100, label: '银行账条数' },
      { prop: 'sysRows', width: 100, label: '系统账条数' },
      { prop: 'bankTotalAmt', width: 100, label: '银行账总额' },
      { prop: 'sysTotalAmt', width: 100, label: '系统账总额' },
      { prop: 'compareStatus', label: '对账', type: 'select', width: 80, propInDict: 'bankAccStatementCompareStatus' },
      { prop: 'compareName', width: 100, label: '对账人' },
      { prop: 'compareTime', width: 130, label: '对账时间' },
    ]
    this.option1.columns = columns.map((item) => {
      if (item.prop !== 'compareTime' && item.prop !== 'receivePayDate') {
        item.sortable = false
      }
      return item
    })
    this.optionMaxHeight = this.option1
    // this.getData()
  },
  methods: {
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    sendMulti(data) {
      this.multipleSelection1 = data
    },
    getData(isSearch) {
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
      }
      this.finCommonSearch(data.query, this.searchOption, true, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = JSON.parse(JSON.stringify(this.searchBackup || []))
      data.query.push({ column: 'receivePayType', type: 'eq', value: 'pay' })
      bankListPage(data)
        .then((res) => {
          this.option1.data = res.data.list || []
          this.$set(this.option1, 'emptyText', this.$t('Common.noData'))
          Object.assign(this.option1.pagination, res.data)
        })
        .finally(() => (this.lsLoading = false))
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-list-container ::v-deep {
  .el-button.el-button--text {
    margin-left: 5px;
    margin-right: 5px;
  }
}
.el-dialog .title {
  font-size: 12px;
  color: #222222;
  font-weight: bold;
  margin-bottom: 12px;
}
.el-dialog .big {
  padding: 8px 0;
  font-size: 12px;
  &.index {
    color: #bfbfbf;
    font-weight: bold;
  }
}
.el-dialog .el-table.border-table ::v-deep td {
  border-right: 1px solid #ebeef5 !important;
}
.el-dialog .el-form ::v-deep label {
  font-size: 12px !important;
}
</style>