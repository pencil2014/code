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
              v-if="checkAuth($route.name, 'tab-sysLinePageList', 'btn-goPaymentRequest')"
              class="finance-btn"
              size="mini"
              type="primary"
              @click="goPaymentRequest"
            >付款申请</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-sysLinePageList', 'btn-goBlancaLoss')"
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
      <FinanceTable :option="option1" @send-multi="sendMulti" />
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
import { listSysLinePage, getSysLineListAmtSummary, listSysLineManagerSelect } from '@/api/fin/shBill'
import { employeeSelectlist } from '@/api/companyResource'
import Vue from 'vue'
export default {
  name: 'sysLinePageList',
  components: {
    FinanceSearch,
    FinanceTable,
    CustomColumns,
  },
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: '/fin/shLienMon/listSysLinePage',
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
        // {
        //     prop: 'shLienMonNo',
        //     label: '月度编号',
        //     type: 'button',
        //     width: 125,
        //     operationBtns: {
        //         show: true,
        //         callback: (fn, index, row, option, subItem) => {
        //             this.showSummaryDetail(row)
        //         }
        //     }
        // },
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
        },
        {
          prop: 'areaName',
          label: '区域',
          type: 'text',
        },
        {
          prop: 'sysLineAreaManagerName',
          label: '区域航线经理',
          width: 110,
          type: 'text',
        },
        {
          prop: 'sysLineSupervisorName',
          label: '商务主管',
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
          formatter: ({ row }) => {
            return '<span style="color:#CD4130">' + row.totalLienAmt + '</span>'
          },
        },
        {
          prop: 'totalLossAmt',
          label: '总亏损费用',
          width: 110,
          type: 'text',
          formatter: ({ row }) => {
            return '<span style="color:#33B18A">' + row.totalLossAmt + '</span>'
          },
        },
        {
          prop: 'restLienAmt',
          label: '剩余留置费用',
          width: 110,
          type: 'text',
          formatter: ({ row }) => {
            return '<span style="color:#CD4130">' + row.restLienAmt + '</span>'
          },
        },
        {
          prop: 'restLossAmt',
          label: '剩余亏损费用',
          width: 110,
          type: 'text',
          formatter: ({ row }) => {
            return '<span style="color:#33B18A">' + row.restLossAmt + '</span>'
          },
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
        // {
        //     prop: 'createdTime',
        //     label: this.$t('Common.createTime'),
        //     type: 'text',
        //     width: 150
        // },
        // {
        //     prop: 'updatedName',
        //     label: '更新人',
        //     type: 'text'
        // },
        // {
        //     prop: 'updatedTime',
        //     label: '更新时间',
        //     type: 'text',
        //     width: 150
        // }
      ],
    }
  },
  created() {
    let searchInputGroup = ['sysLineCode', 'settleCorpCode', 'yearMon']
    this.searchOption = {
      saveDefault: true,
      saveShow: true,
      saveName: 'sysLinePageList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          orderNo: { label: this.$t('FeeList.orderNo'), type: 'input' },
          sysLineGroupCode: { label: '大航线', type: 'select', prop: 'dictGroupShipLine', multiple: true },
          sysLineCode: {
            label: '小航线',
            type: 'remoteSelect',
            showType: '2',
            multiple: true,
            remoteMethod: (val, item) => this.sysLineQuerySearch(val, item),
            visibleChange: (val, item) => this.sysLineQuerySearch(val, item),
            remoteSelectList: [],
          },
          // employeeId: {
          //   label: '商务',
          //   type: 'remoteSelect',
          //   showType: '2',
          //   remoteMethod: (queryString, item, row) => {
          //     this.getEmployeeList(queryString, item)
          //   },
          //   visibleChange: (queryString, item, row) => {
          //     this.getEmployeeList(queryString, item)
          //   },
          //   remoteSelectList: []
          // },
          // {
          //     prop: 'settleCompName',
          //     label: '结算分公司',
          //     type: 'text',
          //     width: 150
          // },
          settleCorpCode: {
            label: this.$t('FeeList.settleCorp'),
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            // 结算单位有很多，不显示默认下拉列表---特殊设想---先取消
            visibleChange: (queryString, item, row) => {
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
            clearable: true,
            showType: '3',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.sysLineManagerList({ managerName: queryString, orgType: 'group' }, item),
            visibleChange: (queryString, item) => this.sysLineManagerList({ managerName: queryString, orgType: 'group' }, item),
          },
          sysLineCompanyManagerId: {
            label: '分公司航线经理',
            type: 'remoteSelect',
            clearable: true,
            showType: '3',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.sysLineManagerList({ managerName: queryString, orgType: 'company' }, item),
            visibleChange: (queryString, item) => this.sysLineManagerList({ managerName: queryString, orgType: 'company' }, item),
          },
          sysLineAreaManagerId: {
            label: '区域航线经理',
            type: 'remoteSelect',
            clearable: true,
            showType: '3',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.sysLineManagerList({ managerName: queryString, orgType: 'region' }, item),
            visibleChange: (queryString, item) => this.sysLineManagerList({ managerName: queryString, orgType: 'region' }, item),
          },
          sysLineSupervisorId: {
            label: '商务主管',
            type: 'remoteSelect',
            clearable: true,
            showType: '3',
            remoteSelectList: [],
            remoteMethod: (queryString, item) =>
              this.sysLineManagerList({ managerName: queryString, orgType: 'supervisor' }, item),
            visibleChange: (queryString, item) =>
              this.sysLineManagerList({ managerName: queryString, orgType: 'supervisor' }, item),
          },
          // sysLineSupervisorName: {
          //   label: '商务主管',
          //   type: 'input',
          // },
          currency: { label: this.$t('FeeList.currency'), type: 'select', selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL') },
          lockStatus: { label: '锁定状态', type: 'select', prop: 'finLockStatus' },
          yearMon: { label: '所属年月', type: 'monthrange', format: 'yyyy-MM', ranges: ['yearMonStart', 'yearMonEnd'] },
          // createdTime: {
          //   label: this.$t('Common.createTime'),
          //   type: 'daterange',
          // },
          // updatedTime: {
          //   label: '更新时间',
          //   type: 'daterange',
          // }
        },
      },
    }
    const pagination = Object.assign({}, this.option.pagination, {
      isNew: true,
      show: true,
    })
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [{ label: this.$t('Common.details'), show: true, action: 'showDetail' }],
    })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
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
    const columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    let sortableList = [
      'shLienMonNo',
      'currency',
      'feeCount',
      'yearMon',
      'settleCorpName',
      'settleCompName',
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
      return listSysLinePage(data)
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
          // this.option1.pagination.total = res.data.totalCount
          // this.tableQuery.currPage = res.data.currPage
        })
        .finally(() => (this.lsLoading = false))
    },
    getListAmtSummary(data) {
      getSysLineListAmtSummary(data).then((res) => {
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
          let {totalLienAmtList, totalLossAmtList, restLienAmtList, restLossAmtList, } = data
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj,
            groups: true, 
            isPartTop: true, 
            place: 'top',
            subData1: {totalLienAmtList, totalLossAmtList},
            subData2: {restLienAmtList, restLossAmtList},
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
          this.getListAmtSummary(data2)
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
        if (!filterArr.every((item) => item.settleCompName === settleCompName)) {
          return this.$msgErrClose('同一结算分公司的数据才能申请一起付款')
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
          return item.currency === currency && item.settleCompName === settleCompName
        })
        if (!isSame) {
          return this.$msgErrClose('同一付款币种的数据才能亏损对冲')
          return this.$msgErrClose('同一付款币种、结算分公司的数据才能亏损对冲')
        }
      }
      // 锁定状态数据无法进行付款和对冲
      if (filterArr.some((item) => item.lockStatus === 'lock')) {
        return this.$msgErrClose('锁定状态的数据无法进行亏损对冲，请重新选择')
      }
      // 把所有留置费用不为0的数据ID传递过去
      sessionStorage.setItem('restLossAmtArr', JSON.stringify(filterArr))
      this.routerPushTab('BalanceLoss', { type: 'sysLinePageList' })
    },
    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString, item) {
      this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then((data) => {
        if (
          this.remoteSelectCommon(
            item,
            data.map((item) => ({ label: item.value, value: item.key }))
          )
        )
          return
        item.remoteSelectList = data.map((item) => {
          return {
            label: item.value,
            value: item.key,
          }
        })
      })
    },
    // 商务下拉框
    getEmployeeList(queryString, item) {
      employeeSelectlist(queryString).then((res) => {
        item.remoteSelectList = res.data.map((item) => {
          return {
            label: item.cname,
            value: item.employeeId,
          }
        })
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
    showDetail(row) {
      // 跳转月度详情页
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      this.routerPush('ShLienMonthDetail', { shLienMonNo: row.shLienMonNo })
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
