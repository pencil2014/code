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
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
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
          gedgingApplyNo: { label: this.$t('Hedge.hedgeNumber'), type: 'input' },
          loseMonNo: { label: '??????????????????', type: 'input' },
          gedgingMonNo: { label: '??????????????????', type: 'input' },
          settleCorpCode: {
            label: this.$t('FeeList.settleCorp'),
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
          createdTime: { label: '????????????', type: 'daterange', format: 'yyyy-MM-dd' },
          writeoffStatus: { label: '????????????', type: 'select', prop: 'shLossGedgingWriteoffStatus' },
        },
      },
    }
    const pagination = Object.assign({}, this.option.pagination, {
      isNew: true,
      show: true,
    })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [{ label: this.$t('Common.details'), show: true, action: 'showDetail' }],
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
      emptyText: this.$t('Common.emptyText'),
      pagination,
    })
    const columns = [
      {
        prop: 'gedgingApplyNo',
        label: this.$t('Hedge.hedgeNumber'),
        type: 'button',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => this.showDetail(row),
        },
        width: 130,
      },
      {
        prop: 'loseMonNo',
        label: '??????????????????',
        type: 'text',
        width: 120,
      },
      {
        prop: 'settleCorpName',
        label: this.$t('FeeList.settleCorp'),
        type: 'text',
        width: 150,
      },
      {
        prop: 'currency',
        label: this.$t('FeeList.currency'),
        type: 'text',
      },
      {
        prop: 'gedgingAmt',
        label: this.$t('Hedge.hedgeAmount'),
        type: 'text',
      },
      {
        prop: 'gedgingMonNo',
        label: '??????????????????',
        type: 'text',
        width: 120,
      },
      {
        prop: 'gedGingSettleCorpName',
        label: '??????????????????',
        type: 'text',
        width: 150,
      },
      {
        prop: 'yearMon',
        label: '????????????',
        type: 'text',
      },
      {
        prop: 'writeOffStatus',
        label: '????????????',
        type: 'select',
        propInDict: 'shLossGedgingWriteoffStatus',
      },
      {
        prop: 'createdName',
        label: '?????????',
        type: 'text',
      },
      {
        prop: 'createdTime',
        label: '????????????',
        type: 'text',
        width: 150,
      },
    ]
    this.option1.columns = columns
    // this.getData()
  },
  methods: {
    // ????????????
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // ????????????
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
          this.$set(this.option1, 'emptyText', this.$t('Common.noData'))
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
          labelObj: { sumListLabel: '????????????' },
          colorObj: { sumListColor: 'green' },
        })
      })
    },
    // ????????????
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // ????????????
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // ????????????
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
    // ????????????????????????
    showDetail(row) {
      this.routerPushTab('HedgeDetail', { gedgingApplyNo: row.gedgingApplyNo })
    },
  },
  activated() {
    // ?????????????????????????????????????????????????????????
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    /* ??????????????????*/
    if (!this.$route.meta.isUseCache) {
      this.getData()
    }
  },
}
</script>
