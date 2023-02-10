<template>
  <div
    class="finance-summay-cnt"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="summary-bill-cnt finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-specialPageList', 'btn-goPaymentRequest')"
              class="finance-btn"
              size="mini"
              type="primary"
              @click="goPaymentRequest"
            >付款申请</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-specialPageList', 'btn-goBlancaLoss')"
              class="finance-btn"
              size="mini"
              type="primary"
              @click="goBlancaLoss"
            >亏损对冲</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
        </div>
      </div>
      <FinanceTable :option="option1" :autoMax="true" @send-multi="sendMulti" />
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{ key: 'prop', label: 'label' }"
        @close="customColumnsPopClose"
      />
    </div>
  </div>
</template>

<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
// import FinanceTable from '../components/financeTable.vue'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { listSpecialPage, getSpecialListAmtSummary, listSysLineManagerSelect } from '@/api/fin/shBill'
import { listByRole } from '@/api/base'
import Vue from 'vue'
export default {
  name: 'pricingPageList',
  components: {
    FinanceSearch,
    FinanceTable,
    CustomColumns,
  },
  mixins: [mixin, mixin2, routerMixin],
  data() {
    let isAir = this.$route.name.indexOf('Air') > -1
    return {
      pageSizeUrl: '/fin/shLienMon/listSpecialPage',
      businessGroupType: isAir ? 'air' : 'ship',
      isAir,
      keyDownActive: true,
      searchOption: {},
      option1: {},
      multipleSelection: [],
      // 升序
      ascColumns: [],
      // 降序
      descColumns: [],
      // 初始表头
      selfColumnsBase: [
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', minWidth: 180 },
        { prop: 'yearMon', label: '所属年月', type: 'text', minWidth: 110 },
        { prop: 'specialContainerManagerName', label: '特种运输经理', minWidth: 110, type: 'text', hide: isAir },
        { prop: 'feeCount', label: '条数', type: 'text', minWidth: 80 },
        { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text', minWidth: 80 },
        {
          prop: 'totalLienAmt',
          label: '总留置费用',
          minWidth: 110,
          type: 'text',
          color: '#CD4130',
          // formatter: ({ row }) => '<span style="color:#CD4130">' + row.totalLienAmt + '</span>',
        },
        {
          prop: 'totalLossAmt',
          label: '总亏损费用',
          minWidth: 110,
          type: 'text',
          color: '#33B18A',
          // formatter: ({ row }) => '<span style="color:#33B18A">' + row.totalLossAmt + '</span>',
        },
        {
          prop: 'restLienAmt',
          label: '剩余留置费用',
          minWidth: 110,
          type: 'text',
          color: '#CD4130',
          // formatter: ({ row }) => '<span style="color:#CD4130">' + row.restLienAmt + '</span>',
        },
        {
          prop: 'restLossAmt',
          label: '剩余亏损费用',
          minWidth: 110,
          type: 'text',
          color: '#33B18A',
          // formatter: ({ row }) => '<span style="color:#33B18A">' + row.restLossAmt + '</span>',
        },
        {
          prop: 'lockStatus',
          label: '锁定状态',
          type: 'text',
          minWidth: 100,
          formatter: ({ row }) => {
            const statusName = this.dictMapObj.finLockStatus[row.lockStatus]
            if (row.lockStatus === 'lock') {
              return '<span style="color:#CD4130">' + statusName + '</span>'
            } else if (row.lockStatus === 'unlock') {
              return '<span style="color:#33B18A">' + statusName + '</span>'
            } else {
              return statusName
            }
          },
        },
        // {
        //   prop: 'createdTime',
        //   label: this.$t('Common.createTime'),
        //   type: 'text',
        //   width: 150,
        // },
        // {
        //   prop: 'updatedName',
        //   label: '更新人',
        //   type: 'text',
        // },
        // {
        //   prop: 'updatedTime',
        //   label: '更新时间',
        //   type: 'text',
        //   width: 150,
        // },
      ],
    }
  },
  created() {
    this.searchOption = {
      saveDefault: true,
      saveShow: true,
      saveName: 'pricingPageList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: [
          { key: 'settleCorpCode', value: '' },
          { key: 'yearMon', value: '' },
          { key: 'currency', value: '' },
          { key: 'lockStatus', value: '' },
        ],
        filterGroups: {
          settleCorpCode: {
            label: this.$t('FeeList.settleCorp'),
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: '' }, item),
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: '' }, item),
            remoteSelectList: [],
          },
          yearMon: { label: '所属年月', type: 'monthrange', format: 'yyyy-MM' },
          currency: { label: this.$t('FeeList.currency'), type: 'select', selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL') },
          lockStatus: { label: '锁定状态', type: 'select', prop: 'finLockStatus' },
        },
      },
    }
    const pagination = Object.assign({}, this.option.pagination, { isNew: true, show: true })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [{ label: this.$t('Common.details'), show: true, action: 'showDetail' }],
    })
    this.option1 = Object.assign({}, this.option, {
      customColumns: {
        show: true,
        handleCustomColumns: () => {
          if (!this.isNotFirtGetData) {
            this.getData(false, true).then((res) => setTimeout(() => (this.customColumnsPopShow = true), 600))
          } else {
            this.customColumnsPopShow = true
          }
        },
      },
      id: 'option1',
      $name: 'summaryBillList',
      data: [],
      tips: { text: '', show: false },
      sortable: true,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      operationBtns,
      pagination,
      listAmtSummary,
      emptyText: this.$t('Common.emptyText'),
      maxHeight: this.getFinanceTableMaxHeight,
    })
    this.selfColumnsBase = this.selfColumnsBase.filter((v) => !v.hide)
    const columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    let sortableList = [
      'shLienMonNo',
      'currency',
      'feeCount',
      'yearMon',
      'settleCorpName',
      'totalLienAmt',
      'totalLossAmt',
      'restLienAmt',
      'restLossAmt',
      'createdTime',
      'updatedTime',
    ]
    this.selfColumnsBase.forEach((item) => (sortableList.includes(item.prop) ? (item.sortable = true) : (item.sortable = false)))
    this.option1.columns = columns
    // this.getData()
  },
  methods: {
    // 搜索
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // 获取数据
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      const data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        columns: [],
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption, true)

      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      this.lsLoading = true
      let reqData = JSON.parse(JSON.stringify(data))
      reqData.query.push({ column: 'businessGroup', type: 'eq', value: this.businessGroupType })
      return listSpecialPage(reqData)
        .then((res) => {
          if (res.data.configColumns && res.data.configColumns.length) {
            let columns = res.data.configColumns
            this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
            this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
            this.configColumns = res.data.configColumns
          }
          if (customerList) return
          const datasource = res.data
          this.option1.data = datasource.list
          this.$set(this.option1, 'emptyText', this.$t('Common.noData'))
          Object.assign(this.option1.pagination, res.data)
        })
        .finally(() => (this.lsLoading = false))
    },
    getListAmtSummary(data) {
      getSpecialListAmtSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let labelObj = {
            restLienAmtListLabel: '剩余留置费用',
            restLossAmtListLabel: '剩余亏损费用',
            totalLienAmtListLabel: '　总留置费用',
            totalLossAmtListLabel: '　总亏损费用',
          }
          let colorObj = {
            restLienAmtListColor: 'green', // 支持red, green, black三种值
            restLossAmtListColor: 'red',
            totalLienAmtListColor: 'green',
            totalLossAmtListColor: 'red',
          }
          let data = res.data
          let { totalLienAmtList, totalLossAmtList, restLienAmtList, restLossAmtList } = data
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj,
            groups: true,
            isPartTop: true,
            place: 'top',
            subData1: { totalLienAmtList, totalLossAmtList },
            subData2: { restLienAmtList, restLossAmtList },
          })
        }
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
    // 跳转月度详情页
    showDetail(row) {
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      this.routerPush('SpecailBillDetail', { shLienMonNo: row.shLienMonNo })
    },
    // 表格选择
    sendMulti(data) {
      this.multipleSelection = data
      let data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      let ids = this.multipleSelection.map((item) => item.shLienMonNo).join(',')
      if (ids) {
        data2.query.push({ column: 'shLienMonNo', type: 'in', value: ids })
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
    // 申请付款
    goPaymentRequest() {
      const len = this.multipleSelection.length
      if (!len) {
        return this.$msgErrClose('请勾选需要申请付款的数据')
      }
      let filterArr = this.multipleSelection.filter((item) => +item.restLienAmt)

      if (!filterArr.length) {
        return this.$msgErrClose('不存在可申请付款的费用，请核实')
      }
      if (filterArr.length > 1) {
        // 同一付款单位，币种，航线，商务才是一起申请付款
        const { settleCorpCode, settleCompName, currency, sysLineCode, employeeId } = this.multipleSelection[0]
        if (!filterArr.every((item) => item.settleCompName === settleCompName && item.employeeId === employeeId)) {
          return this.$msgErrClose('同一结算分公司、商务的数据才能申请一起付款')
        }
      }
      // 锁定数据不允许付款和对冲
      if (filterArr.some((item) => item.lockStatus === 'lock')) {
        return this.$msgErrClose('锁定状态的数据无法进行付款申请，请重新选择')
      }
      // 把所有剩余留置费用不为0的数据ID传递过去
      sessionStorage.setItem('restLienAmtArr', JSON.stringify(filterArr))
      this.routerPushTab(this.businessGroupType === 'air' ? 'PaymentRequestAir' : 'PaymentRequest')
    },
    // 申请对冲
    goBlancaLoss() {
      const len = this.multipleSelection.length
      if (!len) {
        return this.$msgErrClose('请勾选需要亏损对冲的数据')
      }
      let filterArr = this.multipleSelection.filter((item) => +item.restLossAmt)
      if (!filterArr.length) {
        return this.$msgErrClose('不存在可对冲亏损的费用，请核实')
      }
      if (filterArr.length > 1) {
        // 同一付款单位，币种，航线，商务才是一起对冲亏损
        const { settleCorpCode, settleCompName, currency, sysLineCode, employeeId } = filterArr[0]
        const isSame = filterArr.every((item) => {
          return item.currency === currency
          return item.currency === currency && item.settleCompName === settleCompName && item.employeeId === employeeId
        })
        if (!isSame) {
          return this.$msgErrClose('同一付款币种的数据才能亏损对冲')
          return this.$msgErrClose('同一付款结算分公司、币种、商务的数据才能亏损对冲')
        }
      }
      // 锁定状态数据无法进行付款和对冲
      if (filterArr.some((item) => item.lockStatus === 'lock')) {
        return this.$msgErrClose('锁定状态的数据无法进行亏损对冲，请重新选择')
      }
      // 把所有留置费用不为0的数据ID传递过去
      sessionStorage.setItem('restLossAmtArr', JSON.stringify(filterArr))
      this.routerPushTab('BalanceLoss', { type: 'specialPageList', businessGroup: this.businessGroupType })
    },
  },
  activated() {
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    if (!this.$route.meta.isUseCache) {
      this.getData()
    }
  },
}
</script>

<style lang="sass" scoped>
</style>
