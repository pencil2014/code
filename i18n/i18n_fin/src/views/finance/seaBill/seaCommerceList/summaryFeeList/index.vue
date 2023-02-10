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
              v-if="checkAuth($route.name, 'tab-summaryFeeList', 'btn-confirmFee')"
              class="finance-btn"
              size="mini"
              type="primary"
              @click="confirmFee"
            >应付确认</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-radio-group v-model="confirmStatus" size="mini">
            <el-radio-button label>{{$t('Common.all')}}</el-radio-button>
            <el-radio-button label="no">待确认</el-radio-button>
            <el-radio-button label="yes">已确认</el-radio-button>
          </el-radio-group>
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
          </el-button-group>
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
import { feeListPage, feeListAmtSummary } from '@/api/fin/shBill'
import { employeeSelectlist } from '@/api/companyResource'
import { basePortList } from '@/api/base'
import { confirmFee } from '@/api/fin/fee'
export default {
  name: 'summaryFeeList',
  components: {
    FinanceSearch,
    FinanceTable,
    CustomColumns,
  },
  mixins: [mixin, mixin2, routerMixin],
  data() {
    let isAir = this.$route.name.indexOf('Air') > -1
    return {
      pageSizeUrl: feeListPage('geturl'),
      businessGroupType: isAir ? 'air' : 'ship',
      isAir,
      keyDownActive: true,
      confirmStatus: '',
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
          prop: 'sourceBizNo',
          label: this.$t('FeeList.orderNo'),
          type: 'button',
          width: 120,
          operationBtns: {
            show: true,
            callback: (action, index, row, option) => {
              console.log(row)
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'shLienMonNo',
          label: '月度编号',
          type: 'button',
          width: 125,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option, subItem) => {
              // Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
              //   this.commonRoute(to, from)
              // }
              this.routerPushTab(this.businessGroupType === 'air' ? 'SummaryBillDetailAir' : 'SummaryBillDetail', {
                shLienMonNo: row.shLienMonNo,
              })
            },
          },
        },
        {
          prop: 'confirmStatus',
          label: '是否确认',
          type: 'text',
          formatter: ({ row }) => {
            return row.confirmStatus === 'yes' ? '已确认' : '待确认'
          },
        },
        { prop: 'shipCarrierCode', label: '承运人', type: 'text', width: 100 },
        { prop: 'bizDate', label: '业务日期', type: 'text', width: 130 },
        { prop: 'businessType', label: this.$t('FeeList.businessTypes'), type: 'select', width: 130 },
        { prop: 'soNo', label: 'SO', type: 'text', width: 130 },
        { prop: 'mbl', label: 'MBL', type: 'text', width: 130 },
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 150 },
        { prop: 'polPortName', label: '起运港', type: 'text', width: 130 },
        { prop: 'podPortName', label: '目的地', type: 'text', width: 130 },
        { prop: 'pricingEmployeeName', label: '商务', type: 'text', width: 100 },
        { prop: 'sysLineGroup', label: '大航线', type: 'text', width: 130, hide: isAir },
        { prop: 'sysLineName', label: '小航线', type: 'text', width: 130 },
        { prop: 'containerInfo', label: '箱型箱量', type: 'text', width: 100 },
        { prop: 'amountTReal', label: 'TEU', type: 'text', width: 100 },
        { prop: 'feeAmt', label: this.$t('FeeList.feeAmt'), type: 'text', width: 100 },
        { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text', width: 80 },
        { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text', width: 100 },
        { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', width: 150 },
        { prop: 'settleLock', label: '是否结算锁定', type: 'select', propInDict: 'finLockStatus', width: 100 },
        { prop: 'settleStatus', label: '核销状态', type: 'select', propInDict: 'writeoffStatus', width: 100 },
        { prop: 'totalWriteoffAmt', label: '已核销金额', type: 'text', width: 100 },
        { prop: 'noWriteoffAmt', label: '未核销金额', type: 'text', width: 100 },
        { prop: 'finDate',label: this.$t('FeeList.finDate'), type: 'text', width: 100 },
        {
          prop: 'precloseStatus',
          label: '预关账状态',
          type: 'select',
          width: 100,
          formatter: ({ row }) => {
            return row.prefinCloseStatus === 'yes' ? '已关账' : '未关账'
          },
        },
        { prop: 'precloseTime', label: '预关账时间', type: 'text', width: 100 },
        {
          prop: 'closeStatus',
          label: '总关账状态',
          type: 'select',
          width: 100,
          formatter: ({ row }) => {
            return row.closeStatus === 'yes' ? '已关账' : '未关账'
          },
        },
        { prop: 'closeTime', label: '总关账时间', type: 'text', width: 100 },
        { prop: 'createdName', label: this.$t('Common.createdBy'), type: 'text', width: 100 },
        { prop: 'createdTime', label: this.$t('Common.createTime'), type: 'text', width: 130 },
        { prop: 'confirmName', label: '确认人', type: 'text', width: 100 },
        { prop: 'confirmTime', label: '确认时间', type: 'text', width: 130 },
      ],
    }
  },
  watch: {
    confirmStatus() {
      this.option1.pagination.currPage = 1
      this.getData()
    },
  },
  created() {
    let searchArr = ['sourceBizNos', 'settleCorpCodes', 'shipCarrierCode', 'createdTime']
    this.searchOption = {
      saveDefault: true,
      saveShow: true,
      saveName: 'seasummaryFeeList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          allNo: { label: this.$t('Hedge.variousNumbers'), type: 'input' },
          sourceBizNos: { label: this.$t('FeeList.orderNo'), type: 'input' },
          shLienMonNos: { label: '月度编号', type: 'input' },
          // TODO
          shipCarrierCode: {
            label: '承运人',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => {
              this.shipCarrierQuerySearch(queryString, item)
            },
            visibleChange: (queryString, item) => {
              this.shipCarrierQuerySearch(queryString, item)
            },
            remoteSelectList: [],
          },
          bizDate: { label: '业务日期', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['bizBeginDate', 'bizEndDate'] },
          // businessType: { label: this.$t('FeeList.businessTypes'), type: 'select', prop: 'businessType' },
          soNo: { label: 'SO', type: 'input' },
          mbl: { label: 'MBL', type: 'input' },
          // TODO
          settleCorpCodes: {
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
          polPortCode: {
            label: '起运港',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (val, item) => {
              this.portSearch(val, 'port_of_basic', '', item)
            },
            visibleChange: (val, item) => {
              this.portSearch(val, 'port_of_basic', '', item)
            },
            remoteSelectList: [],
          },
          podPortCode: {
            label: '目的地',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (val, item) => {
              this.portSearch(val, 'port_of_destination', '', item)
            },
            visibleChange: (val, item) => {
              this.portSearch(val, 'port_of_destination', '', item)
            },
            remoteSelectList: [],
          },
          // TODO
          pricingEmployeeId: {
            label: '商务',
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => {
              this.getEmployeeList(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.getEmployeeList(queryString, item)
            },
            remoteSelectList: [],
          },
          // TODO
          sysLineGroupCode: { label: '大航线', type: 'select', prop: 'dictGroupShipLine', hide: this.isAir },
          // TODO
          sysLineCode: {
            label: '小航线',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (val, item) => this.sysLineQuerySearch(val, item),
            visibleChange: (val, item) => this.sysLineQuerySearch(val, item),
            remoteSelectList: [],
          },
          // TODO
          currency: { label: this.$t('FeeList.currency'), type: 'select', selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL') },
          feeCode: {
            label: this.$t('FeeList.feeEname'),
            type: 'remoteSelect',
            reqKey: 'feeCode',
            multiple: true,
            remoteMethod: (queryString, filterItem) => this.remoteFeeItemList(queryString, filterItem),
            visibleChange: (queryString, filterItem) => this.remoteFeeItemList(queryString, filterItem),
            remoteSelectList: [],
          },
          settleCompCodes: {
            label: this.$t('FeeList.settleComp'),
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (queryString, item) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          // TODO
          settleLock: { label: '是否结算锁定', type: 'select', prop: 'finLockStatus' },
          settleStatus: { label: '核销状态', type: 'select', prop: 'writeoffStatus' },
          finDate: {label: this.$t('FeeList.finDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['finBeginDate', 'finEndDate'] },
          // TODO
          precloseStatus: {
            label: '预关账状态',
            type: 'select',
            selectOptions: [
              { label: '已关账', value: 'yes' },
              { label: '未关账', value: 'no' },
            ],
          },
          precloseTime: {
            label: '预关账时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
            ranges: ['preCloseBeginDate', 'preCloseEndDate'],
          },
          // TODO
          closeStatus: {
            label: '总关账状态',
            type: 'select',
            selectOptions: [
              { label: '已关账', value: 'yes' },
              { label: '未关账', value: 'no' },
            ],
          },
          closeTime: { label: '总关账时间', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['closeBeginDate', 'closeEndDate'] },
          // TODO
          createdBy: {
            label: this.$t('Common.createdBy'),
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item, row) => this.getEmployeeList(queryString, item),
            remoteSelectList: [],
          },
          createdTime: { label: this.$t('Common.createTime'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['beginDate', 'endDate'] },
          // TODO
          confirmBy: {
            label: '确认人',
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item, row) => this.getEmployeeList(queryString, item),
            remoteSelectList: [],
          },
          confirmTime: {
            label: '确认时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
            ranges: ['confirmBeginDate', 'confirmEndDate'],
          },
        },
      },
    }
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [{ label: '费用详情', type: 'text', show: true, action: 'showDetail' }],
      show: true,
    })
    const pagination = Object.assign({}, this.option.pagination, { isNew: true, show: true })
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
      $name: 'summaryFeeList',
      data: [],
      tips: { text: '', show: false },
      // sortable: true,
      // sortChange: (column, prop, order) => {
      //   this.descColumns = order == 'descending' ? [prop] : []
      //   this.ascColumns = order == 'ascending' ? [prop] : []
      //   this.getData()
      // },
      operationBtns,
      pagination,
      listAmtSummary,
      emptyText: this.$t('Common.emptyText'),
      maxHeight: this.getFinanceTableMaxHeight,
    })
    this.selfColumnsBase = this.selfColumnsBase.filter((v) => !v.hide)
    const columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    // let sortableList = ['totalLienAmt', 'totalLossAmt', 'restLienAmt', 'restLossAmt']
    // this.selfColumnsBase.forEach((item) => (sortableList.includes(item.prop) ? (item.sortable = true) : (item.sortable = false)))
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
      data.query = [...(this.searchBackup || [])]
      if (this.confirmStatus) {
        data.query.push({ column: 'confirmStatus', type: 'eq', value: this.confirmStatus })
      }
      this.lsLoading = true
      let reqData = JSON.parse(JSON.stringify(data))
      reqData.query.push({ column: 'businessGroup', type: 'eq', value: this.businessGroupType })
      return feeListPage(reqData)
        .then((res) => {
          this.finCommonColumns(res)
          if (customerList) return
          const datasource = res.data
          this.option1.data = datasource.list
          this.$set(this.option1, 'emptyText', this.$t('Common.noData'))
          Object.assign(this.option1.pagination, res.data)
        })
        .finally(() => (this.lsLoading = false))
    },
    getListAmtSummary(data) {
      feeListAmtSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let labelObj = {
            confirmFeeAmtListLabel: '确认金额',
            noConfirmFeeAmtListLabel: '未确认金额',
          }
          let colorObj = {
            confirmFeeAmtListColor: 'green', // 支持red, green, black三种值
            noConfirmFeeAmtListColor: 'red',
          }
          let data = res.data
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj,
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
    // 表格选择
    sendMulti(data) {
      this.multipleSelection = data
      let data2 = { ascColumns: [], descColumns: [], query: [] }
      let ids = this.multipleSelection.map((item) => item.feeId).join(',')
      if (ids) {
        data2.query.push({ column: 'feeIds', type: 'in', value: ids })
      } else {
        data2.query = [...(this.searchBackup || [])]
        if (this.confirmStatus) {
          data2.query.push({ column: 'confirmStatus', type: 'eq', value: this.confirmStatus })
        }
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
    goPaymentRequest() {},
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
    // 商务下拉框
    getEmployeeList(queryString, item) {
      employeeSelectlist({ name: queryString }).then((res) => {
        let list = res.data.map((item) => {
          return { label: item.cname, value: item.employeeId }
        })
        if (this.remoteSelectCommon(item, list)) {
          return
        }
        item.remoteSelectList = list
      })
    },
    showDetail(row) {
      let sourceType = row.sourceType
      let sourceBizNo = row.sourceBizNo
      this.showOneNoDetail(sourceType, sourceBizNo, { feeId: row.feeId, feeChild: 'specialManagementFee', isFromSea: true })
    },
    // 远程搜索港口下拉数据
    portSearch(queryString, portAttribute, state, item) {
      basePortList(queryString, portAttribute, state).then((res) => {
        let list = res.data.map((item) => {
          return { label: `${item.ename},${item.countryEname}`, value: item.portCode }
        })
        if (this.remoteSelectCommon(item, list)) {
          return
        }
        item.remoteSelectList = list
      })
    },
    // 承运人，船公司下拉列表自动补充的数据
    shipCarrierQuerySearch(queryString, item) {
      this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: 'valid' }).then((data) => {
        let list = data.map((item) => {
          return { label: `${item.key}`, value: item.value }
        })
        if (this.remoteSelectCommon(item, list)) {
          return
        }
        item.remoteSelectList = list
      })
    },
    // 费用名称下拉
    remoteFeeItemList(queryString, filterItem, lang) {
      this.$store.dispatch('dict/queryFeeItemList2', { businessType: '', serviceCode: '', queryString, lang }).then((data) => {
        if (this.remoteSelectCommon(filterItem, data)) return
        filterItem.remoteSelectList = data
      })
    },
    confirmFee() {
      if (this.multipleSelection.length === 0) {
        return this.$msgErrClose('请勾选需要确认的费用！')
      }
      let filterArr = this.multipleSelection.filter((item) => item.confirmStatus !== 'yes')
      if (filterArr.length === 0) {
        return this.$msgErrClose('请勾选待确认的费用！')
      }
      this.$confirmWarn('是否将选中的费用进行应付确认？', () => {
        let feeIds = this.multipleSelection.map((item) => item.feeId)
        confirmFee({ feeIds }).then(() => {
          this.$msgSucClose('应付确认成功！')
          this.getData()
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
