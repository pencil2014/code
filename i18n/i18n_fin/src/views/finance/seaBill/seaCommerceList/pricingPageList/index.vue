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
              v-if="checkAuth($route.name, 'tab-pricingPageList', 'btn-goPaymentRequest')"
              class="finance-btn"
              size="mini"
              type="primary"
              @click="goPaymentRequest"
            >付款申请</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-pricingPageList', 'btn-goBlancaLoss')"
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
import { listPricingPage, getPricingListAmtSummary, listSysLineManagerSelect } from '@/api/fin/shBill'
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
      pageSizeUrl: '/fin/shLienMon/listPricingPage',
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
        {
          prop: 'shLienMonNo',
          label: '月度编号',
          type: 'button',
          width: 125,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option, subItem) => this.showDetail(row),
          },
        },
        {
          prop: 'settleCorpName',
          label: this.$t('FeeList.settleCorp'),
          type: 'text',
          width: 150,
        },
        {
          prop: 'settleCompName',
          label: '结算分公司',
          type: 'text',
          width: 150,
        },
        {
          prop: 'sysLineCompanyManagerName',
          label: '分公司航线经理',
          type: 'text',
          width: 130,
          hide: isAir,
        },
        {
          prop: 'yearMon',
          label: '所属年月',
          type: 'text',
        },
        {
          prop: 'sysLineGroupName',
          label: '大航线',
          type: 'text',
          hide: isAir,
        },
        {
          prop: 'sysLineName',
          label: '小航线',
          type: 'text',
        },
        {
          prop: 'sysLineGroupManagerName',
          label: '集团航线经理',
          width: 110,
          type: 'text',
          hide: isAir,
        },
        {
          prop: 'areaName',
          label: '区域',
          type: 'text',
          hide: isAir,
        },
        {
          prop: 'sysLineAreaManagerName',
          label: '区域航线经理',
          width: 110,
          type: 'text',
          hide: isAir,
        },
        {
          prop: 'specialContainerManagerName',
          label: '特种运输经理',
          width: 110,
          type: 'text',
          hide: isAir,
        },
        {
          prop: 'sysLineSupervisorName',
          label: '商务主管',
          type: 'text',
        },
        {
          prop: 'employeeName',
          label: '商务',
          type: 'text',
        },
        {
          prop: 'feeCount',
          label: '条数',
          type: 'text',
        },
        {
          prop: 'currency',
          label: this.$t('FeeList.currency'),
          type: 'text',
        },
        {
          prop: 'totalLienAmt',
          label: '总留置费用',
          width: 110,
          type: 'text',
          color: '#CD4130',
          // formatter: ({ row }) => {
          //   return '<span style="color:#CD4130">' + row.totalLienAmt + '</span>'
          // },
        },
        {
          prop: 'totalLossAmt',
          label: '总亏损费用',
          width: 110,
          type: 'text',
          color: '#33B18A',
          // formatter: ({ row }) => {
          //   return '<span style="color:#33B18A">' + row.totalLossAmt + '</span>'
          // },
        },
        {
          prop: 'restLienAmt',
          label: '剩余留置费用',
          width: 110,
          type: 'text',
          color: '#CD4130',
          // formatter: ({ row }) => {
          //   return '<span style="color:#CD4130">' + row.restLienAmt + '</span>'
          // },
        },
        {
          prop: 'restLossAmt',
          label: '剩余亏损费用',
          width: 110,
          type: 'text',
          color: '#33B18A',
          // formatter: ({ row }) => {
          //   return '<span style="color:#33B18A">' + row.restLossAmt + '</span>'
          // },
        },
        {
          prop: 'lockStatus',
          label: '锁定状态',
          type: 'text',
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
        {
          prop: 'createdTime',
          label: this.$t('Common.createTime'),
          type: 'text',
          width: 150,
        },
        {
          prop: 'updatedName',
          label: '更新人',
          type: 'text',
        },
        {
          prop: 'updatedTime',
          label: '更新时间',
          type: 'text',
          width: 150,
        },
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
          { key: 'shLienMonNo', value: '' },
          { key: 'sysLineCode', value: '' },
          { key: 'settleCorpCode', value: '' },
          { key: 'yearMon', value: '' },
        ],
        filterGroups: {
          shLienMonNo: {
            label: '月度编号',
            type: 'input',
          },
          orderNo: { label: this.$t('FeeList.orderNo'), type: 'input' },
          // employeeNo: {
          //   label: '工号',
          //   type: 'input',
          //   showType: '1'
          // },
          sysLineGroupCode: { label: '大航线', type: 'select', prop: 'dictGroupShipLine', multiple: true, hide: this.isAir },
          sysLineCode: {
            label: '小航线',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (val, item) => {
              this.sysLineQuerySearch(val, item)
            },
            visibleChange: (val, item) => {
              this.sysLineQuerySearch(val, item)
            },
            remoteSelectList: [],
          },
          employeeId: {
            label: '商务',
            type: 'remoteSelect',
            showType: '2',
            remoteMethod: (queryString, item) => this.getSellers(queryString, item, 'pricing'),
            visibleChange: (queryString, item) => this.getSellers(queryString, item, 'pricing'),
            remoteSelectList: [],
          },
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
          settleCompCode: {
            label: '结算分公司',
            prop: 'settleCompCode',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          sysLineGroupManagerId: {
            label: '集团航线经理',
            type: 'remoteSelect',
            hide: this.isAir,
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.sysLineManagerList({ managerName: queryString, orgType: 'group' }, item),
            visibleChange: (queryString, item) => this.sysLineManagerList({ managerName: queryString, orgType: 'group' }, item),
          },
          sysLineCompanyManagerId: {
            label: '分公司航线经理',
            type: 'remoteSelect',
            hide: this.isAir,
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.sysLineManagerList({ managerName: queryString, orgType: 'company' }, item),
            visibleChange: (queryString, item) => this.sysLineManagerList({ managerName: queryString, orgType: 'company' }, item),
          },
          sysLineAreaManagerId: {
            label: '区域航线经理',
            type: 'remoteSelect',
            hide: this.isAir,
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.sysLineManagerList({ managerName: queryString, orgType: 'region' }, item),
            visibleChange: (queryString, item) => this.sysLineManagerList({ managerName: queryString, orgType: 'region' }, item),
          },
          // specialContainerManagerId: {
          //   label: '特种运输经理',
          //   type: 'remoteSelect',
          //   clearable: true,
          //   remoteSelectList: [],
          //   remoteMethod: (queryString, item) => this.sysLineManagerList({managerName:queryString,orgType:'region'}, item),
          //   visibleChange: (queryString, item) => this.sysLineManagerList({managerName:queryString,orgType:'region'}, item),
          // },
          sysLineSupervisorId: {
            label: '商务主管',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) =>
              this.sysLineManagerList({ managerName: queryString, orgType: 'supervisor' }, item),
            visibleChange: (queryString, item) =>
              this.sysLineManagerList({ managerName: queryString, orgType: 'supervisor' }, item),
          },
          // sysLineSupervisorName: {
          //   label: '商务主管',
          //   type: 'input',
          //   showType: '1'
          // },
          currency: { label: this.$t('FeeList.currency'), type: 'select', selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL') },
          lockStatus: { label: '锁定状态', type: 'select', prop: 'finLockStatus' },
          yearMon: {
            label: '所属年月',
            type: 'monthrange',
            format: 'yyyy-MM',
          },
          createdTime: {
            label: this.$t('Common.createTime'),
            type: 'daterange',
            format: 'yyyy-MM-dd',
          },
          updatedTime: {
            label: '更新时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
          },
        },
      },
    }
    let obj = {}
    let filterGroups = this.searchOption.addFilter.filterGroups
    for (const key in filterGroups) {
      if(!filterGroups[key].hide){
        obj[key] = filterGroups[key]
      }
    }
    this.searchOption.addFilter.filterGroups = obj
    const pagination = Object.assign({}, this.option.pagination, {
      isNew: true,
      show: true,
    })
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
      tips: {
        text: '',
        show: false,
      },
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
      return listPricingPage(reqData)
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
          // this.option1.pagination.currPage = datasource.currPage
          // this.option1.pagination.pageSize = datasource.pageSize
          // this.option1.pagination.totalCount = datasource.totalCount

          // this.option1.pagination.hasNextPage = res.data.hasNextPage
          // this.option1.pagination.hasPreviousPage = res.data.hasPreviousPage
          // this.option1.pagination.isFirstPage = res.data.isFirstPage
          // this.option1.pagination.isLastPage = res.data.isLastPage
          // this.tableQuery.pageSize = res.data.pageSize
          // this.tableQuery.currPage = res.data.currPage
          // this.option1.pagination.total = res.data.totalCount
          // this.tableQuery.pageSize = res.data.pageSize
        })
        .finally(() => (this.lsLoading = false))
    },
    getListAmtSummary(data) {
      getPricingListAmtSummary(data).then((res) => {
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
      const query = {
        shLienMonNo: row.shLienMonNo,
      }
      this.routerPush('SummaryBillDetail', query)
    },
    // 表格选择
    sendMulti(data) {
      this.multipleSelection = data
      let data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      let ids = this.multipleSelection
        .map((item) => {
          return item.shLienMonNo
        })
        .join(',')
      if (ids) {
        data2.query.push({
          column: 'shLienMonNo',
          type: 'in',
          value: ids,
        })
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
      this.routerPushTab('PaymentRequest')
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
      this.routerPushTab('BalanceLoss', { type: 'pricingPageList', businessGroup: this.businessGroupType })
    },
    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString, item) {
      let params = this.isAir ? { value: queryString } : { name: queryString, state: '' }
      this.$store.dispatch(`dict/${this.isAir ? 'airportSyslineList' : 'baseSystemLineList'}`, params).then((data) => {
        let list = data.map((item) => {
          if (this.isAir) {
            return { label: item.cname, value: item.sysLineCode }
          }
          return { label: item.value, value: item.key }
        })
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList = list
      })
    },
    // 获取商务
    getSellers(name = '', item, role) {
      let query = [
        { column: 'roleCode', type: 'eq', value: role },
        { column: 'employeeStatus', type: 'eq', value: 'all' },
      ] // column: 'roleCode', type: 'in', value: 'bd,obd'
      name && query.push({ column: 'name', type: 'eq', value: name })
      listByRole({ currPage: 1, pageSize: 50, query }).then(({ data: { list } }) => {
        if (
          this.remoteSelectCommon(
            item,
            list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
          )
        )
          return
        item.remoteSelectList = list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
      })
    },
    sysLineManagerList(queryString, item) {
      listSysLineManagerSelect(queryString).then((res) => {
        item.remoteSelectList = res.data.map((items) => {
          return {
            label: items.managerName,
            value: items.managerId,
          }
        })
      })
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
