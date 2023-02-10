<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-approve-btns-box">
      <div class="finance-approve-btns-left">预付详情</div>
      <div class="finance-approve-btns-right">
        <el-button @click="cancel" size="mini">返回</el-button>
      </div>
    </div>
    <FinanceSearch v-if="forceRefresh" :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div style="padding: 14px 16px 0 16px;font-size:14px;">
      预付款总余额：{{currency}}
      <span style="color:#CD4130">{{amt}}</span>
    </div>
    <FinanceTable :option="option1" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import PREPAY from '@/api/fin/prepayAccount'
export default {
  name: 'investorPayDetail',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
  },
  data() {
    return {
      keyDownActive: true,
      isFirstGetData: false,
      prepayAccountId: this.$route.query.Id || 0,
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption: {},
      currency: '',
      amt: '',
      forceRefresh: false,
    }
  },
  created() {
    // 搜索配置
    this.searchOption = {
      // saveDefault: true,
      addFilter: {
        // 初始搜索条件数
        defaultSearchLength: 4,
        // 条件数组
        searchInputGroup: [
          { key: 'payOrderNo', value: '', showType: '3', range: { min: '', max: '' } },
          { key: 'orderType', value: '', showType: '4', range: { min: '', max: '' } },
          { key: 'prepayAmt', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'createdTime', value: '', showType: '2', range: { min: '', max: '' } },
        ],
        // 左侧下拉框及对应右侧配置
        filterGroups: {
          payOrderNo: { label: '付款单号', type: 'input', showType: '3' },
          orderType: { label: '单号类型', prop: 'payOrderType', type: 'select', showType: '4' },
          prepayAmt: { label: '预付款金额', type: 'range', showType: '1' },
          prepayToRepayAmt: { label: '预付抵账金额', type: 'range', showType: '1' },
          refundAmt: { label: '退款金额', type: 'range', showType: '1' },
          toPrepayAmt: { label: '转充值', type: 'range', showType: '1' },
          balance: { label: '余额', type: 'range', showType: '1' },
          createdTime: { label: '创建时间', type: 'daterange', format: 'yyyy-MM-dd', showType: '2' },
          updatedTime: { label: '更新时间', type: 'daterange', format: 'yyyy-MM-dd', showType: '2' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.option1 = {
      ...this.option,
      id: 'option1', $name: 'InvestorPrepayDetail',
      pagination,
      operationBtns: false,
      selection: false,
      sortable: true,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
    }
    let btnObj = {
      type: 'button',
      no__line: (row, val) =>{
        console.log(val, !val , val === '0' , val === '0.00')
       return !val || val === '0' || val === '0.00'},
      operationBtns: false,
      callback: (row, type) => {
        let { payOrderNo, orderType, prepayAccountBalanceId } = row
        this.routerPush('InvestorPrepayDetailDetail', {
          payOrderNo,
          prepayAccountBalanceId,
          orderType,
          amt: row[type],
          type,
          detailType: 'pay',
        })
      },
    }
    let columns = [
      { prop: 'settleCompName', label: '所属分公司', type: 'text', width: 150, sortable: false },
      { prop: 'settleCorpName', label: '结算单位', width: 150, type: 'text', sortable: false },
      { prop: 'accountNo', label: '账号', type: 'text', sortable: false, width: 150 },
      { prop: 'currency', label: '币种', type: 'text', sortable: false, width: 80 },
      {
        prop: 'payOrderNo',
        label: '付款单号',
        type: 'button',
        width: 140,
        operationBtns: false,
        callback: ({ payOrderNo }) => {
          this.routerPush('OrderDetails', { payOrderNo })
        },
      },
      { prop: 'orderType', label: '单号类型', type: 'select', propInDict: 'payOrderType', width: 80 },
      { prop: 'prepayAmt', label: '预付款金额', type: 'text', width: 100 },
      { prop: 'prepayToRepayAmt', label: '预付抵账金额', ...btnObj, width: 116 },
      { prop: 'refundAmt', label: '退款金额', ...btnObj, width: 100 },
      { prop: 'toPrepayAmt', label: '转充值', ...btnObj, width: 100 },
      { prop: 'balance', label: '余额', type: 'text', width: 100 },
      { prop: 'createdName', label: '创建人', type: 'text', width: 100 },
      { prop: 'createdTime', label: '创建时间', type: 'text', width: 130 },
      { prop: 'updatedName', label: '更新人', type: 'text', width: 100 },
      { prop: 'updatedTime', label: '更新时间', type: 'text', width: 130 },
    ]
    columns.forEach((item, index) => index - 3 <= 0 && (item.sortable = false))
    this.option1.columns = columns
  },
  methods: {
    //返回
    cancel() {
      this.routerBack()
    },
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    // 分页改变当前页   有分页必写此方法
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
        query: [],
      }
      this.finCommonSearch(data.query, this.searchOption, '', 'rangeMinMax')
      // this.searchOption.addFilter.searchInputGroup.forEach(({ key, value, range, req }) => {
      //   if (range.min || range.max) {
      //     if (range.min) {
      //       data.query.push({
      //         column: key + 'Min',
      //         type: 'eq',
      //         value: range.min,
      //       })
      //     }
      //     if (range.max) {
      //       data.query.push({
      //         column: key + 'Max',
      //         type: 'eq',
      //         value: range.max,
      //       })
      //     }
      //     return
      //   }
      //   if (!value) return
      //   if (typeof value !== 'object') {
      //     return data.query.push({
      //       column: key,
      //       type: 'eq',
      //       value: req || value,
      //     })
      //   }
      //   data.query.push({
      //     column: key + 'Start',
      //     type: 'eq',
      //     value: value[0],
      //   })
      //   data.query.push({
      //     column: key + 'End',
      //     type: 'eq',
      //     value: value[1],
      //   })
      // })
      console.log(JSON.stringify(data.query));
      if (isSearch) {
        this.searchBackup = data.query
        let obj = {}
        this.searchBackup.push(
          ...Object.keys(obj)
            .filter((key) => obj[key])
            .map((key) => {
              return { column: key, type: 'eq', value: obj[key] }
            })
        )
      }
      data.query = this.searchBackup || []
      data.query.push(
        ...[
          { column: 'prepayAccountId', type: 'eq', value: this.prepayAccountId },
          { column: 'currency', type: 'eq', value: this.currency },
        ]
      )
      console.log(data.query)
      if (this.balanceRefresh) {
        this.balanceRefresh = false
        PREPAY.balance(data).then((res) => (this.amt = res.data && res.data[0] ? res.data[0].balance : 0))
      }
      PREPAY.balanceInList(data)
        .then((res) => {
          this.option1.data = res.data.list
          Object.assign(this.option1.pagination, res.data)
          console.log(this.option1);
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
  },
  // 路由进入前守卫 实例要在next回调中才能获取
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (!to.meta.isUseCache || to.meta.refresh || vm.isFirstGetData) {
        vm.isFirstGetData = false
        vm.forceRefresh = false
        vm.prepayAccountId = vm.$route.query.prepayAccountId || 0
        vm.currency = vm.$route.query.currency || 'CURRENCY'
        vm.searchOption.addFilter.searchInputGroup = [
          { key: 'payOrderNo', value: '', showType: '3', range: { min: '', max: '' } },
          { key: 'orderType', value: '', showType: '4', range: { min: '', max: '' } },
          { key: 'prepayAmt', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'createdTime', value: '', showType: '2', range: { min: '', max: '' } },
        ]
        vm.option1.data = []
        vm.amt = ''
        vm.balanceRefresh = true
        vm.$nextTick(()=> vm.forceRefresh = true)
        vm.search()
      }
      to.meta.isUseCache = true
      to.meta.isClickBack = false
      to.meta.refresh = false
      vm.jumpRouteFromToList.forEach(item => {
        if (item.to.name === to.name) {
          item.to.meta.refresh = false
        }
      })
    })
  },
  // activated() {
  //   // if (!this.$route.meta.isUseCache) {
  //   //   return
  //   // }
  //     // this.option1.pagination.currPage = 1
  //     this.prepayAccountId = this.$route.query.prepayAccountId || 0
  //     this.currency = this.$route.query.currency || 'CURRENCY'
  //     this.searchOption.addFilter.searchInputGroup = [
  //       { key: 'payOrderNo', value: '', showType: '3', range: { min: '', max: '' } },
  //       { key: 'orderType', value: '', showType: '4', range: { min: '', max: '' } },
  //       { key: 'prepayAmt', value: '', showType: '1', range: { min: '', max: '' } },
  //       { key: 'createdTime', value: '', showType: '2', range: { min: '', max: '' } },
  //     ]
  //     this.option1.data = []
  //     this.amt = ''
  //     this.balanceRefresh = true
  //     this.search()
    
  // },
}
</script>
