<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-approve-btns-box">
      <div class="finance-approve-btns-left">预收详情</div>
      <div class="finance-approve-btns-right">
        <el-button @click="cancel" size="mini">返回</el-button>
      </div>
    </div>
    <FinanceSearch v-if="forceRefresh" :searchOption="searchOption1" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div style="padding: 14px 16px 0 16px;font-size:14px;">
      预收款总余额：{{currency}}
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
import PREREV from '@/api/fin/prerevAccount'
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
      prerevAccountId: 0,
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption1: {},
      currency: '',
      amt: '',
      forceRefresh: false,
    }
  },
  created() {
    // 搜索配置
    this.searchOption1 = {
      // saveDefault: true,
      addFilter: {
        // 初始搜索条件数
        defaultSearchLength: 3,
        // 条件数组
        searchInputGroup: [
          { key: 'receivableRegNo', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'receiveAmt', value: '', showType: '2', range: { min: '', max: '' } },
          { key: 'createdTime', value: '', showType: '3', range: { min: '', max: '' } },
        ],
        // 左侧下拉框及对应右侧配置
        filterGroups: {
          receivableRegNo: { label: '收款登记号', type: 'input', showType: '1' },
          receivablePrerevNo: { label: '预收款登记号', type: 'input', showType: '1' },
          receiveAmt: { label: '收款金额', type: 'range', showType: '2' },
          preceiveAmt: { label: '转预收金额', type: 'range', showType: '2' },
          writeoffAmt: { label: '预收抵账金额', type: 'range', showType: '2' },
          refundAmt: { label: '预收款金额', type: 'range', showType: '2' },
          createdTime: { label: '创建时间', type: 'daterange', format: 'yyyy-MM-dd', showType: '3' },
          updatedTime: { label: '更新时间', type: 'daterange', format: 'yyyy-MM-dd', showType: '3' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.option1 = {
      ...this.option,
      id: 'option1', $name: 'PrerevAccountDetail',
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
    // TODO
    let btnObj = {
      type: 'button',
      no__line: (row, val) => !val || val === '0' || val === '0.00',
      width: 116,
      operationBtns: false,
      callback: (row, type) => {
        let { receivablePrerevId, receivableRegNo, receivablePrerevNo } = row
        this.routerPush('PrerevAccountDetailDetail', {
          amt: row[type],
          type,
          receivablePrerevId,
          receivableRegNo,
          receivablePrerevNo,
          detailType: 'receive',
        })
      },
    }
    let columns = [
      { prop: 'recvCompName', label: '所属分公司', type: 'text', sortable: false, width: 150 },
      { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 150, sortable: false },
      { prop: 'accountNo', label: '账号', type: 'text', sortable: false, width: 100 },
      { prop: 'currency', label: '币种', type: 'text', sortable: false, width: 80 },
      {
        prop: 'receivableRegNo',
        label: '收款登记号',
        type: 'button',
        width: 130,
        operationBtns: false,
        callback: ({ receivableRegNo }) => {
          // this.routerPush('PrerevWriteoff', {receivableRegNo})
          this.isJumpRouteFromPage = true
          this.$router.push({
            name: 'WriteoffRecvDetail',
            query: {
              source: 'createSettlementFromReceivableRegId',
              receivableRegNo,
            },
          })
        },
      },
      {
        prop: 'receivablePrerevNo',
        label: '预收款登记号',
        type: 'button',
        width: 130,
        operationBtns: false,
        callback: ({ receivablePrerevId }) => {
          this.routerPush('PrerevWriteoff', { receivablePrerevId, source: '' })
        },
      },
      { prop: 'receiveAmt', label: '收款金额', type: 'text', width: 116 },
      { prop: 'preceiveAmt', label: '转预收金额', type: 'text', width: 116 },
      { prop: 'writeoffAmt', label: '预收抵账金额', ...btnObj },
      { prop: 'refundAmt', label: '退款金额', ...btnObj },
      { prop: 'balance', label: '余额', type: 'text', width: 100 },
      { prop: 'createdName', label: '创建人', type: 'text', width: 100 },
      { prop: 'createdTime', label: '创建时间', type: 'text', width: 130 },
      { prop: 'updatedName', label: '更新人', type: 'text', width: 100 },
      { prop: 'updatedTime', label: '更新时间', type: 'text', width: 130 },
    ]
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
      this.finCommonSearch(data.query, this.searchOption1, '', 'rangeMinMax')
      // this.searchOption1.addFilter.searchInputGroup.forEach(({ key, value, range, req }) => {
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
      if (isSearch) {
        this.searchBackup = data.query
        let obj = this.searchOption1.data
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
          { column: 'prerevAccountId', type: 'eq', value: this.prerevAccountId },
          { column: 'currency', type: 'eq', value: this.currency },
        ]
      )
      console.log(data.query)
      let dataAlias = {
        currPage: 1,
        pageSize: 10,
        query: [
          { column: 'prerevAccountId', type: 'eq', value: this.prerevAccountId },
          { column: 'currency', type: 'eq', value: this.currency },
        ],
      }
      PREREV.getReceivablePrerevTotal(dataAlias).then((res) => {
          this.amt = (res.data && res.data.preceiveAmtTotal && res.data.preceiveAmtTotal[this.currency]) || 0
        })
      PREREV.listReceivablePrerevPage(data)
        .then((res) => {
          // res.data.list.forEach((item) => console.log(item.prerevAccountId))
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
  },
  // 路由进入前守卫 实例要在next回调中才能获取
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (!to.meta.isUseCache || to.meta.refresh || vm.isFirstGetData) {
        vm.isFirstGetData = false
        vm.forceRefresh = false
        vm.prerevAccountId = vm.$route.query.prerevAccountId || vm.$route.query.prerecAccountId || 0
        vm.currency = vm.$route.query.currency || 'CURRENCY'
        vm.searchOption1.data = { currency: '', settleCorpCode: '' }
        vm.searchOption1.addFilter.searchInputGroup = [
          { key: 'receivableRegNo', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'receiveAmt', value: '', showType: '2', range: { min: '', max: '' } },
          { key: 'createdTime', value: '', showType: '3', range: { min: '', max: '' } },
        ]
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
  //     this.prerevAccountId = this.$route.query.prerevAccountId || this.$route.query.prerecAccountId || 0
  //     this.currency = this.$route.query.currency || 'CURRENCY'
  //     this.searchOption1.data = { currency: '', settleCorpCode: '' }
  //     this.searchOption1.addFilter.searchInputGroup = [
  //       { key: 'receivableRegNo', value: '', showType: '1', range: { min: '', max: '' } },
  //       { key: 'receiveAmt', value: '', showType: '2', range: { min: '', max: '' } },
  //       { key: 'createdTime', value: '', showType: '3', range: { min: '', max: '' } },
  //     ]
  //     this.getData()
  // },
}
</script>
