<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div>
      <div class="money-box money-box-border-bottom" style="background:#FFFFFF;border-radius:4px;">
        <div class="money-box-left">
          <div class="money-title">{{$t('Finance.detailslate')}}</div>
        </div>
        <div class="money-box-right">
          <el-button @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
        </div>
      </div>
      <div class="settlement-detail-form settlement-detail-form-own money-box-border-bottom">
        <el-form
          :model="lateFeeForm"
          ref="lateFeeForm"
          :inline="true"
          size="mini"
          label-width="120px"
        >
          <DetailDiv :label="$t('Hedge.custOverduePaymentNo')" :content="lateFeeForm.custOverduePaymentNo" :isTooltip="true" :labelWidth="'150'" />
          <DetailDiv :label="$t('FeeList.settleComp')" :content="lateFeeForm.settleCompName" :isTooltip="true" :labelWidth="'150'" />
          <DetailDiv :label="$t('FeeList.settleCorp')" :content="lateFeeForm.settleCorpName" :labelWidth="'150'" />
          <DetailDiv :label="$t('Hedge.writeoffNo')" :content="`<span style='text-decoration:underline;color:rgb(24,144,255);cursor:pointer;'>${lateFeeForm.writeoffReceipayNo}</span>`" :contentClick="contentClick" :labelWidth="'150'" />
          <DetailDiv :label="$t('FeeList.receivePayDates')" :content="lateFeeForm.receiveDate" :labelWidth="'150'" />
          <DetailDiv :label="$t('Settle.orignalCurrency')" :content="lateFeeForm.currency" :labelWidth="'150'" />
          <DetailDiv :label="$t('Hedge.arrearReceiveAmt')" :content="lateFeeForm.arrearReceiveAmt" :labelWidth="'150'" />
          <DetailDiv :label="$t('Finance.actuallatefee')" :content="lateFeeForm.lateFeeAmt" :labelWidth="'150'" />
          <DetailDiv :label="$t('Finance.confactual')" :content="lateFeeForm.unconfirmLateFeeAmt" :labelWidth="'150'" />
          <DetailDiv :label="$t('Finance.actuallateConf')" :content="lateFeeForm.confirmLateFeeAmt" :labelWidth="'150'" />
          <DetailDiv :label="$t('Finance.reduction')" :content="lateFeeForm.deductLateFeeAmt" :labelWidth="'150'" />
          <DetailDiv :label="$t('Finance.proceStatus')" :content="dictMapObj['custOverduePaymentDisposalStatus'][lateFeeForm.disposalStatus]" :labelWidth="'150'" />
          <DetailDiv :label="$t('Common.processing')" :content="dictMapObj['custOverduePaymentDisposalType'][lateFeeForm.disposalType]" :labelWidth="'150'" />
          <DetailDiv :label="$t('OrderFee.assumerType')" :content="dictMapObj['custOverduePaymentAssumerType'][lateFeeForm.assumerType]" :labelWidth="'150'" />
          <DetailDiv :label="$t('Finance.reductionMethod')" :content="dictMapObj['custOverduePaymentDeductionType'][lateFeeForm.reductionType]" :labelWidth="'150'" />
        </el-form>
      </div>
      <!-- <div class="finance-table-container">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title size-12">费用列表</div>
          </div>
          <div class="money-box-right">
          </div>
        </div>
        <FinanceTableMass
          :option="option1" />
      </div> -->
    </div>
    <!-- <div class="finance-search-list-gap"></div> -->
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box" style="background-color:#fff;">
        <div class="money-box-left">
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'btn-exportList')" class="finance-btn" size="mini" @click="handleExport('list')">{{$t('Finance.exportList')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'btn-exportDetail')" class="finance-btn" size="mini" @click="handleExport('detail')">{{$t('Finance.exportDetails')}}</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1" />
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
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { custOverduePaymentInfo, getCustOverdueFeeList, feeListPageSummary } from '@/api/fin/custOverduePayment'
import { listByRole } from '@/api/base'
import { departmentTreeList } from '@/api/companyResource'
import { dateFormat } from '@/views/finance/utils/finance'
let that = null
export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      loading: false,
      lateFeeForm: {
        custOverduePaymentNo: '',
        settleCompName: '',
        settleCorpName: '',
        writeoffReceipayNo: '',
        receiveDate: '',
        currency: '',
        arrearReceiveAmt: '',
        lateFeeAmt: '',
        unconfirmLateFeeAmt: '',
        confirmLateFeeAmt: '',
        deductLateFeeAmt: '',
        disposalStatus: '',
        disposalType: '',
        assumerType: '',
        reductionType: ''
      },
      option1: {},
      searchOption: {},
      departmentListO: [],
      departmentListB: [],
      departmentListOBD: [],
      selfColumnsBase: [],
    }
  },
  created() {
    this.loanBasicData()
    let searchArr = ['orderNo', 'bdEmployeeId', 'businessType']
    let filterGroups = {
      orderNo: { label: this.$t('FeeList.orderNo'), type: 'input' },
      bdEmployeeId: {
        label: this.$t('FeeList.bdEmployeeId'),
        type: 'remoteSelect',
        clearable: true,
        multiple: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.getSellers(queryString, item, ''), // 'obd'
        visibleChange: (queryString, item) => this.getSellers(queryString, item, ''), // 'obd'
      },
      bdDeptCode: {
        label: this.$t('Finance.salesDepart'),
        prop: 'bdDeptCode',
        type: 'cascader',
        cascaderList: this.departmentListB,
        cascaderProps: {
          children: 'childList',
          label: 'deptCname',
          value: 'deptCode',
          checkStrictly: true,
        },
      },
      ownerCompCode: {
        label: this.$t('Finance.salescompany'),
        prop: 'ownerCompCode',
        type: 'remoteSelect',
        remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
        visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
        remoteSelectList: [],
      },
      businessType: {	label: this.$t('FeeList.businessTypes'),	type: "select", prop:'businessType' },
      fiscalTermNo: { label: this.$t('Finance.receBillNo'), type: 'input', placeholder: this.$t('Finance.multiplecomma'), },
      crmTimeType: { label: this.$t('Finance.timeType'), type: 'select', prop: 'settleInfoTimeType' },
      settleDate: { label: this.$t('LateFee.billingDay'), type: 'daterange', format: 'yyyy-MM-dd' },
      dueDate: { label: this.$t('Finance.paymentDueDate'), type: 'daterange', format: 'yyyy-MM-dd' },
      feeEnName: {
        label: this.$t('FeeList.feeEname'),
        type: 'remoteSelect',
        reqKey: 'feeCode',
        multiple: true,
        remoteMethod: (queryString, filterItem) => this.remoteFeeItemList(queryString, filterItem),
        visibleChange: (queryString, filterItem) => this.remoteFeeItemList(queryString, filterItem),
        remoteSelectList: [],
      },
    }
    this.searchOption = {
      saveDefault: true,
      saveName: 'LateFeeDetail',
      isNotAutoLoad: this.isSU ? false : true,
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups,
      },
    }
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'LateFeeDetail1',
      data: [],
      index: { show: true },
      tips: false,
      rootTipsHide: true,
      selection: false,
      operationBtns: Object.assign({}, this.option.operationBtns, {
        show: false
      }),
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
      sortable: true,
      sortChange: this.sortChange,
      listAmtSummary
    })
    this.selfColumnsBase = [
      { prop: 'settleCompName', label: this.$t('Supplier.settlementBranch'), minWidth: 150, type: 'text', sortable: false, },
      { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), minWidth: 150, type: 'text', sortable: false, },
      {
        prop: 'orderNo',
        label: this.$t('PreClose.bizNo'),
        width: 130,
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            let sourceType = row.sourceType || 'order'
            let sourceBizNo = row.orderNo
            this.showOneNoDetail(sourceType, sourceBizNo)
          },
        },
      },
      { prop: 'bdEmployeeName', label: this.$t('FeeList.bdEmployeeId'), type: 'text', width: 100, sortable: false, },
      { prop: 'bdDeptName', label: this.$t('Finance.salesDepart'), type: 'text', width: 100, sortable: false, },
      { prop: 'ownerCompName', label: this.$t('Finance.salescompany'), type: 'text', width: 150, sortable: false, },
      { prop: 'businessType', label: this.$t('FeeList.businessTypes'), type: 'select', width: 100, sortable: false, },
      { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text', sortable: false, },
      { prop: 'receipayType', label: this.$t('FeeList.receipayType'), type: 'select', propInDict: 'receipayGroup', sortable: false, },
      { prop: 'crmTimeType', label: this.$t('Finance.timeType'), type: 'select', propInDict: 'settleInfoTimeType', sortable: false, },
      { prop: 'feeDate', label: this.$t('Common.time'), type: 'text', width: 100 },
      { prop: 'settleDate', label: this.$t('LateFee.billingDay'), type: 'text', width: 100 },
      { prop: 'dueDate', label: this.$t('Finance.paymentDueDate'), type: 'text', width: 100 },
      { prop: 'graceDays', label: this.$t('LateFee.graceDays'), type: 'text', width: 100, sortable: false, },
      { prop: 'receiveDate', label: this.$t('FeeList.receivePayDates'), type: 'text', width: 100 },
      { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text', sortable: false, },
      { prop: 'feeAmt', label: this.$t('FeeList.recFeeAmt'), type: 'text', width: 90 },
      { prop: 'arrearAmt', label: this.$t('Finance.overdueAmt'), type: 'text', width: 90 },
      { prop: 'arrearReceiveAmt', label: this.$t('Hedge.arrearReceiveAmt'), type: 'text', width: 110 },
      { prop: 'lateFeeAmt', label: this.$t('Finance.actuallatefee'), type: 'text', width: 100 },
      { prop: 'lateFeeCalcRemark', label: this.$t('Finance.rulesActual'), type: 'text', width: 130, sortable: false, },
      { 
        prop: 'fiscalTermNo',
        label: this.$t('Finance.receBillNo'),
        width: 130,
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            let { fiscalTermNo, settleCompName, settleCorpName, settleDate, dueDate, graceDays, cleanStatus } = row
            this.routerPushTab('FiscalTermDetail', { fiscalTermNo, settleCompName, settleCorpName, settleDate, dueDate, graceDays, cleanStatus })
          },
        },
      }
    ]
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = columns
  },
  methods: {
    getLateFeeInfo() {
      let data = {
        custOverduePaymentNo: this.lateFeeForm.custOverduePaymentNo
      }
      custOverduePaymentInfo(data).then(res => {
        this.lateFeeForm = Object.assign(this.lateFeeForm, res.data)
      })
    },
    getData(isSearch, otherParams) {
      // this.isNotFirtGetData = true
      this.loading = true
      let { prop, order } = this.sortParams
      let isCustom = otherParams === true
      let data = {
        currPage: 1, // this.option1.pagination.currPage,
        pageSize: 9999, // customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        query: [
          {
            column: 'custOverduePaymentNo',
            type: 'eq',
            value: this.lateFeeForm.custOverduePaymentNo
          }
        ],
        ascColumns: order === 'ascending' ? [prop] : [],
        descColumns: order === 'descending' ? [prop] : order === 'ascending' ? [] : ['createdTime'],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      let isExport = typeof otherParams === 'object' && otherParams.isExport
      if (isExport) {
        let type = typeof otherParams === 'object' && otherParams.type
        let text = type === 'list' ? this.$t('Finance.latedetfees'): this.$t('Finance.latebreakdown')
        this.$confirm(text, this.$t('Common.tips'), {
          confirmButtonText: this.$t('Common.sure'),
          cancelButtonText: this.$t('Common.cancel'),
          type: 'warning',
        }).then(() => {
          let value = type === 'list' ? 'custOverdueFeeListExport' : 'custOverdueFeeInterestDetailExport'
          data.query.push({"column": "queryDataModuleCode", "type": "eq", "value": value})
          this.$store.dispatch('finance/downloadExcelFile', { data }).then((res) => {
            let text = type === 'list' ? this.$t('Finance.latedetfeesEx'): this.$t('Finance.latebreakdownEx')
            let link = document.createElement('a')
            link.href = window.URL.createObjectURL(res)
            link.download = text + dateFormat('yyyy-mm-dd HH_MM_SS', new Date()) + '.xlsx'
            link.click()
            this.loading = false
          })
        }).catch(err => {
          console.log(err)
          this.loading = false
        })
        return
      }
      return getCustOverdueFeeList(data)
        .then((res) => {
          if (res.code === 0) {
            this.finCommonColumns(res)
            if (isCustom) return
            // let i = 0
            // let arr = []
            // do {
            //   arr = arr.concat(res.data.list)
            // } while (i++ < 100)
            this.option1.data = res.data.list || [] // arr // 
            this.getListAmtSummary(data)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getListAmtSummary(data) {
      feeListPageSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let data = {
            arrearAmtSummaryList: [],
            arrearReceiveAmtSummaryList: [],
            lateFeeAmtSummaryList: []
          }
          data = Object.assign(data, res.data)
          let labelObj = {
            arrearAmtSummaryListLabel: this.$t('LateFee.overdueAmt'),
            arrearReceiveAmtSummaryListLabel: this.$t('LateFee.arrearReceiveAmt'),
            lateFeeAmtSummaryListLabel: this.$t('LateFee.actualLatefee')
          }
          let colorObj = {
            arrearAmtSummaryListColor: 'red', // 支持red, green, black三种值
            arrearReceiveAmtSummaryListColor: 'green',
            lateFeeAmtSummaryListColor: 'red'
          }
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj,
          })
          console.log('this.option1.listAmtSummary:', this.option1.listAmtSummary)
        }
      })
    },
    // 获取销售
    getSellers(name = '', item, role) {
      let query = [{ column: 'roleCode', type: 'eq', value: role }] // column: 'roleCode', type: 'in', value: 'bd,obd'
      name && query.push({ column: 'name', type: 'eq', value: name })
      listByRole({ currPage: 1, pageSize: 30, query }).then(({ data: { list } }) => {
        list = list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList = list
      })
    },
    // 部门下拉框
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        let resData1 = JSON.parse(JSON.stringify(res.data || []))
        let resData2 = JSON.parse(JSON.stringify(res.data || []))
        let resData3 = JSON.parse(JSON.stringify(res.data || []))
        this.departmentListO.splice(0, 1000, ...this.getTreeData(resData1))
        this.departmentListB.splice(0, 1000, ...this.getTreeData(resData2))
        this.departmentListOBD.splice(0, 1000, ...this.getTreeData(resData3))
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
    },
    remoteFeeItemList(queryString, filterItem, lang) {
      this.$store.dispatch('dict/queryFeeItemList2', { businessType: '', serviceCode: '', queryString, lang }).then((data) => {
        console.log(data)
        if (this.remoteSelectCommon(filterItem, data)) return
        filterItem.remoteSelectList = data
      })
    },
    sortChange(column, prop, order) {
      this.sortParams = { prop, order }
      this.isSort = true
      this.getData()
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
    contentClick() {
      that.showOneNoDetail('writeoffNos', this.lateFeeForm.writeoffReceipayNo)
    },
    //返回
    cancel() {
      this.routerBack()
    },
    handleExport(type) {
      this.getData(true, { isExport: true, type })
    },
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    CustomColumns
  },
  activated() {
    if (!this.$route.meta.isUseCache) {
      this.lateFeeForm.custOverduePaymentNo = this.$route.query.custOverduePaymentNo
      this.getLateFeeInfo()
      this.getData(true)
    }
    that = this
    // let { custOverduePaymentNo, settleCompName, settleCorpName, writeoffReceipayNo, receiveDate, currency, arrearReceiveAmt, lateFeeAmt, unconfirmLateFeeAmt, confirmLateFeeAmt, deductLateFeeAmt, disposalStatus } = this.$route.query
    // this.lateFeeForm = Object.assign(this.lateFeeForm, {
    //   custOverduePaymentNo,
    //   settleCompName,
    //   settleCorpName,
    //   writeoffReceipayNo,
    //   receiveDate,
    //   currency,
    //   arrearReceiveAmt,
    //   lateFeeAmt,
    //   unconfirmLateFeeAmt,
    //   confirmLateFeeAmt,
    //   deductLateFeeAmt,
    //   disposalStatus
    // })
  },
}
</script>

<style lang="scss" scoped>
/deep/ .detail__div{
  width: calc(25% - 16px) !important;
}
.finance-approve-btns-box {
  display: flex;
  justify-content: space-between;
  height: 40px;
  padding: 0 24px;
  border-radius: 4px 4px 0px 0px;
  border-bottom: 1px solid #e9e9e9;
}
.finance-approve-btns-left {
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  line-height: 24px;
  margin-top: 8px;
}
.finance-approve-btns-right {
  margin-top: 6px;
}
</style>
