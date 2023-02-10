<template>
  <div
    class="self__css"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="hedge-table finance-list-container">
      <div class="money-box">
        <div class="money-box-left"></div>
        <div class="money-box-right">
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
        </div>
      </div>
      <FinanceTable :option="option1" @send-multi="sendMulti" />
    </div>
  </div>
</template>

<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
// import FinanceTable from '../components/financeTable.vue'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { gedgingListPage, getListAmtSummary } from '@/api/fin/shBill'
export default {
  components: {
    FinanceSearch,
    FinanceTable,
  },
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: gedgingListPage('geturl'),
      businessGroupType: this.$route.name.indexOf('Air') > -1 ? 'air' : 'ship',
      keyDownActive: true,
      loading: false,
      searchOption: {},
      option1: {},
      multipleSelection: [],
    }
  },
  created() {
    this.searchOption = {
      saveDefault: true,
      saveShow: true,
      saveName: 'seahedgeBillList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: [
          { key: 'gedgingApplyNo', value: '' },
          { key: 'settleCorpCode', value: '' },
          { key: 'createdTime', value: '' },
          { key: 'writeoffStatus', value: '' },
        ],
        filterGroups: {
          gedgingApplyNo: { label: '对冲编号', type: 'input' },
          loseMonNo: { label: '亏损月度编号', type: 'input' },
          gedgingMonNo: { label: '对冲月度编号', type: 'input' },
          settleCorpCode: {
            label: '结算单位',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (queryString, item) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            visibleChange: (queryString, item) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            remoteSelectList: [],
          },
          createdTime: { label: '对冲时间', type: 'daterange', format: 'yyyy-MM-dd' },
          writeoffStatus: { label: '核销状态', type: 'select', prop: 'shLossGedgingWriteoffStatus' },
        },
      },
    }
    const pagination = Object.assign({}, this.option.pagination, {
      isNew: true,
      show: true,
    })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [{ label: '详情', show: true, action: 'showDetail' }],
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'hedgeBillList',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      selection: { show: true, fixed: true },
      listAmtSummary,
      maxHeight: this.getFinanceTableMaxHeight,
      emptyText: '数据将在查询后显示',
      pagination,
    })
    const columns = [
      {
        prop: 'gedgingApplyNo',
        label: '对冲编号',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => this.showDetail(row),
        },
        width: 130,
      },
      {
        prop: 'loseMonNo',
        label: '亏损月度编号',
        type: 'text',
        width: 120,
      },
      {
        prop: 'settleCorpName',
        label: '结算单位',
        type: 'text',
        width: 150,
      },
      {
        prop: 'currency',
        label: '币种',
        type: 'text',
      },
      {
        prop: 'gedgingAmt',
        label: '对冲金额',
        type: 'text',
      },
      {
        prop: 'gedgingMonNo',
        label: '对冲月度编号',
        type: 'text',
        width: 120,
      },
      {
        prop: 'gedGingSettleCorpName',
        label: '对冲结算单位',
        type: 'text',
        width: 150,
      },
      {
        prop: 'yearMon',
        label: '所属年月',
        type: 'text',
      },
      {
        prop: 'writeOffStatus',
        label: '核销状态',
        type: 'select',
        propInDict: 'shLossGedgingWriteoffStatus',
      },
      {
        prop: 'createdName',
        label: '对冲人',
        type: 'text',
      },
      {
        prop: 'createdTime',
        label: '对冲时间',
        type: 'text',
        width: 150,
      },
    ]
    this.option1.columns = columns
    // this.getData()
  },
  methods: {
    // 点击搜索
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // 获取数据
    getData(isSearch) {
      this.option1.loading = true
      const data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: [],
        query: [],
      }
      this.finCommonSearch(data.query, this.searchOption)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      this.lsLoading = true
      let reqData = JSON.parse(JSON.stringify(data))
      reqData.query.push({ column: 'businessGroup', type: 'eq', value: this.businessGroupType })
      gedgingListPage(reqData)
        .then((res) => {
          const data = res.data
          this.option1.data = data.list
          this.$set(this.option1, 'emptyText', '未查询到任何数据')
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = data.currPage
          // this.option1.pagination.pageSize = data.pageSize
          // this.option1.pagination.totalCount = data.totalCount

          // this.option1.pagination.hasNextPage = res.data.hasNextPage
          // this.option1.pagination.hasPreviousPage = res.data.hasPreviousPage
          // this.option1.pagination.isFirstPage = res.data.isFirstPage
          // this.option1.pagination.isLastPage = res.data.isLastPage
          // this.tableQuery.currPage = res.data.currPage
          // this.option1.pagination.total = res.data.totalCount
          // this.tableQuery.pageSize = res.data.pageSize
          this.option1.loading = false
        })
        .finally(() => (this.lsLoading = false))
    },
    getListAmtSummary(data) {
      getListAmtSummary(data).then((res) => {
        this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
          show: true,
          data: { sumList: res.data || [] },
          labelObj: { sumListLabel: '对冲金额' },
          colorObj: { sumListColor: 'green' },
        })
      })
    },
    // 分页方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // 选择表格
    sendMulti(data) {
      this.multipleSelection = data
      let data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      let ids = this.multipleSelection.map((item) => item.id).join(',')
      if (ids) {
        data2.query.push({ column: 'shLienGedgingIds', type: 'in', value: ids })
      } else {
        data2.query = this.searchBackup || []
      }
      if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => {
          let reqData = JSON.parse(JSON.stringify(data2))
          reqData.query.push({ column: 'businessGroup', type: 'eq', value: this.businessGroupType })
          this.getListAmtSummary(reqData)
        })
      }
    },
    // 跳转对冲详情页面
    showDetail(row) {
      this.routerPushTab('HedgeDetail', { gedgingApplyNo: row.gedgingApplyNo })
    },
  },
  activated() {
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    /* 获取列表数据*/
    if (!this.$route.meta.isUseCache) {
      this.getData()
    }
  },
}
</script>
