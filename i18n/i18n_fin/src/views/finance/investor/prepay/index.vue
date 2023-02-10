<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left"></div>
        <div class="money-box-right">
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="refreshListPage"
              size="mini"
              type="primary"
            >{{$t('Common.refresh')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTable :option="option1" />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import PREPAY from '@/api/fin/prepayAccount'

export default {
  mixins: [mixin, mixin2, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
  },
  data() {
    return {
      pageSizeUrl: PREPAY.listPage('geturl'),
      keyDownActive: true,
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption: {},
    }
  },
  created() {
    // 搜索配置
    let searchInputGroup = ['settleCorpCode', 'settleCompCode', 'accountNo']
    this.searchOption = {
      saveDefault: true,
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          settleCorpCode: {
            label: this.$t('FeeList.settleCorp'),
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) =>
              this.querySettleUnit2({ queryString, unitTypes: 'customer,supplier,company' }, item),
            visibleChange: (queryString, item) =>
              this.querySettleUnit2({ queryString, unitTypes: 'customer,supplier,company' }, item),
            remoteSelectList: [],
          },
          settleCompCode: {
            label: this.$t('FeeList.settleComp'),
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            remoteSelectList: [],
          },
          accountNo: { label: '账号', type: 'input' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.option1 = {
      ...this.option,
      id: 'option1', $name: 'InvestorPrepay',
      pagination,
      selection: false,
      sortable: true,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      emptyText: this.$t('Common.emptyText'),
    }
    this.option1.operationBtns.width = '80px'
    this.option1.operationBtns.data = [{ label: '更多余额', show: true, action: 'showDetail' }]
    let btnObj = {
      type: 'button',
      no__line: (row, val) => !val || val === '0' || val === '0.00',
      operationBtns: false,
      callback: (row, currency) => {
        this.routerPush('InvestorPrepayDetail', { prepayAccountId: row.prepayAccountId || 0, currency })
      },
    }
    let columns = [
      { prop: 'settleCompName', label: this.$t('Settle.branchCompany'), type: 'text', minWidth: 150 },
      { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', minWidth: 150 },
      { prop: 'accountNo', label: '账号', type: 'text', minWidth: 150 },
      { prop: 'CNY', label: 'CNY余额', ...btnObj, minWidth: 100 },
      { prop: 'USD', label: 'USD余额', ...btnObj, minWidth: 100 },
      { prop: 'HKD', label: 'HKD余额', ...btnObj, minWidth: 100 },
      { prop: 'EUR', label: 'EUR余额', ...btnObj, minWidth: 100 },
      { prop: 'GBP', label: 'GBP余额', ...btnObj, minWidth: 100 },
      { prop: 'MXN', label: 'MXN余额', ...btnObj, minWidth: 100 },
      { prop: 'VND', label: 'VND余额', ...btnObj, minWidth: 100 },
    ]
    this.option1.columns = columns
  },
  methods: {
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    // 封装请求参数并请求列表
    getData(isSearch) {
      this.lsLoading = true
      let data = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
      }
      if (isSearch) {
        this.searchBackup = []
        this.searchOption.addFilter.searchInputGroup.forEach((val) => {
          val && this.searchBackup.push({ column: val.key, type: 'eq', value: val.value })
        })
      }
      data.query = this.searchBackup || []
      PREPAY.listPage(data)
        .then((res) => {
          this.option1.data = res.data.list
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    // 搜索按钮
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // table行详情按钮
    showDetail({ prepayAccountId, accountNo, settleCompName, settleCorpName }) {
      this.routerPush('InvestorPrepayDetailMore', { prepayAccountId })
    },
  },
}
</script>
