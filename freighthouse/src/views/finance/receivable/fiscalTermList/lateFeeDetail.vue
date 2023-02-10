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
          <div class="money-title">滞纳金详情</div>
        </div>
        <div class="money-box-right">
            <el-button
              v-if="checkAuth('FiscalTermList', 'tab-lateFeeList', 'btn-lateFeeReceive') && lateFeeForm.disposalStatus === 'init'"
              class="finance-btn"
              @click="receiveVisibleOut = true"
              size="mini"
              type="primary"
            >滞纳金收取</el-button>
            <el-button
              v-if="checkAuth('FiscalTermList', 'tab-lateFeeList', 'btn-lateFeeDerate') && lateFeeForm.disposalStatus === 'init'"
              class="finance-btn"
              @click="derateVisibleOut = true"
              size="mini"
              type="primary"
            >滞纳金减免</el-button>
          <el-button @click="cancel" size="mini">返回</el-button>
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
          <DetailDiv label="滞纳金编号：" :content="lateFeeForm.custOverduePaymentNo" :isTooltip="true" :labelWidth="'120'" />
          <DetailDiv label="分公司：" :content="lateFeeForm.settleCompName" :isTooltip="true" :labelWidth="'120'" />
          <DetailDiv label="结算单位：" :content="lateFeeForm.settleCorpName" :labelWidth="'120'" />
          <DetailDiv label="核销编号：" :content="`<span style='text-decoration:underline;color:rgb(24,144,255);cursor:pointer;'>${lateFeeForm.writeoffReceipayNo}</span>`" :contentClick="contentClick" :labelWidth="'120'" />
          <DetailDiv label="收付日期：" :content="lateFeeForm.receiveDate" :labelWidth="'120'" />
          <DetailDiv label="原币种：" :content="lateFeeForm.currency" :labelWidth="'120'" />
          <DetailDiv label="超期已收金额：" :content="lateFeeForm.arrearReceiveAmt" :labelWidth="'120'" />
          <DetailDiv label="实际滞纳金：" :content="lateFeeForm.lateFeeAmt" :labelWidth="'120'" />
          <DetailDiv label="待确认实际滞纳金：" :content="lateFeeForm.unconfirmLateFeeAmt" :labelWidth="'120'" />
          <DetailDiv label="已确认实际滞纳金：" :content="lateFeeForm.confirmLateFeeAmt" :labelWidth="'120'" />
          <DetailDiv label="减免实际滞纳金：" :content="lateFeeForm.deductLateFeeAmt" :labelWidth="'120'" />
          <DetailDiv label="处理状态：" :content="dictMapObj['custOverduePaymentDisposalStatus'][lateFeeForm.disposalStatus]" :labelWidth="'120'" />
          <DetailDiv label="处理方式：" :content="dictMapObj['custOverduePaymentDisposalType'][lateFeeForm.disposalType]" :labelWidth="'120'" />
          <DetailDiv label="承担方式：" :content="dictMapObj['custOverduePaymentAssumerType'][lateFeeForm.assumerType]" :labelWidth="'120'" />
          <DetailDiv label="减免方式：" :content="dictMapObj['custOverduePaymentDeductionType'][lateFeeForm.reductionType]" :labelWidth="'120'" />
        </el-form>
      </div>
    </div>
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box" style="background-color:#fff;">
        <div class="money-box-left">
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'btn-exportList')" class="finance-btn" size="mini" @click="handleExport('list')">导出列表</el-button>
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'btn-exportDetail')" class="finance-btn" size="mini" @click="handleExport('detail')">导出明细</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
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
    <LateFeeReceive :receiveVisibleOut.sync="receiveVisibleOut" :lateFeeFormOut="lateFeeForm" @refreshListPage="refreshListPage2" />
    <LateFeeDerate :derateVisibleOut.sync="derateVisibleOut" :lateFeeFormOut="lateFeeForm" @refreshListPage="refreshListPage2" />
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
import LateFeeReceive from '@/views/finance/receivable/fiscalTermList/lateFeeReceive'
import LateFeeDerate from '@/views/finance/receivable/fiscalTermList/lateFeeDerate'
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
      receiveVisibleOut: false,
      derateVisibleOut: false,
    }
  },
  created() {
    this.loanBasicData()
    let searchArr = ['orderNo', 'bdEmployeeId', 'businessType']
    let filterGroups = {
      orderNo: { label: '工作单号', type: 'input' },
      bdEmployeeId: {
        label: '销售',
        type: 'remoteSelect',
        clearable: true,
        multiple: true,
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.getSellers(queryString, item, ''), // 'obd'
        visibleChange: (queryString, item) => this.getSellers(queryString, item, ''), // 'obd'
      },
      bdDeptCode: {
        label: '销售所属部门',
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
        label: '销售所属公司',
        prop: 'ownerCompCode',
        type: 'remoteSelect',
        remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
        visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
        remoteSelectList: [],
      },
      businessType: {	label: "业务类型",	type: "select", prop:'businessType' },
      fiscalTermNo: { label: '应收账单编号', type: 'input', placeholder: '多个用逗号拼接' },
      crmTimeType: { label: '时间类型', type: 'select', prop: 'settleInfoTimeType' },
      settleDate: { label: '账单日', type: 'daterange', format: 'yyyy-MM-dd' },
      dueDate: { label: '结款到期日', type: 'daterange', format: 'yyyy-MM-dd' },
      feeName: {
        label: '费用名称',
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
      { prop: 'settleCompName', label: '结算分公司', minWidth: 150, type: 'text', sortable: false, },
      { prop: 'settleCorpName', label: '结算单位', minWidth: 150, type: 'text', sortable: false, },
      {
        prop: 'orderNo',
        label: '单号',
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
      { prop: 'bdEmployeeName', label: '销售', type: 'text', width: 100, sortable: false, },
      { prop: 'bdDeptName', label: '销售所属部门', type: 'text', width: 100, sortable: false, },
      { prop: 'ownerCompName', label: '销售所属公司', type: 'text', width: 150, sortable: false, },
      { prop: 'businessType', label: '业务类型', type: 'select', width: 100, sortable: false, },
      { prop: 'feeName', label: '费用名称', type: 'text', sortable: false, },
      { prop: 'receipayType', label: '收付类型', type: 'select', propInDict: 'receipayGroup', sortable: false, },
      { prop: 'crmTimeType', label: '时间类型', type: 'select', propInDict: 'settleInfoTimeType', sortable: false, },
      { prop: 'feeDate', label: '时间', type: 'text', width: 100 },
      { prop: 'settleDate', label: '账单日', type: 'text', width: 100 },
      { prop: 'dueDate', label: '结款到期日', type: 'text', width: 100 },
      { prop: 'graceDays', label: '宽限天数', type: 'text', width: 100, sortable: false, },
      { prop: 'receiveDate', label: '收付日期', type: 'text', width: 100 },
      { prop: 'currency', label: '币种', type: 'text', sortable: false, },
      { prop: 'feeAmt', label: '应收金额', type: 'text', width: 90 },
      { prop: 'arrearAmt', label: '超期金额', type: 'text', width: 90 },
      { prop: 'arrearReceiveAmt', label: '超期已收金额', type: 'text', width: 110 },
      { prop: 'lateFeeAmt', label: '实际滞纳金', type: 'text', width: 100 },
      { prop: 'lateFeeCalcRemark', label: '实际滞纳金计算规则', type: 'text', width: 130, sortable: false, },
      { 
        prop: 'fiscalTermNo',
        label: '应收账单编号',
        width: 130,
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            let { fiscalTermNo, settleCompName, settleCorpName, settleDate, dueDate, graceDays, cleanStatus } = row
            this.routerPush('FiscalTermDetail', { fiscalTermNo, settleCompName, settleCorpName, settleDate, dueDate, graceDays, cleanStatus })
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
        query: [],
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
      data.query = [...(this.searchBackup || [])]
      data.query.push(
        {
          column: 'custOverduePaymentNo',
          type: 'eq',
          value: this.lateFeeForm.custOverduePaymentNo
        }
      )
      let isExport = typeof otherParams === 'object' && otherParams.isExport
      if (isExport) {
        let type = typeof otherParams === 'object' && otherParams.type
        let title = type === 'list' ? '滞纳金详情费用列表' : '滞纳金详情费用计算明细'
        this.$confirm(`是否确认导出${title}？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          let value = type === 'list' ? 'custOverdueFeeListExport' : 'custOverdueFeeInterestDetailExport'
          data.query.push({"column": "queryDataModuleCode", "type": "eq", "value": value})
          this.$store.dispatch('finance/downloadExcelFile', { data }).then((res) => {
            let link = document.createElement('a')
            link.href = window.URL.createObjectURL(res)
            link.download = `${title}导出` + dateFormat('yyyy-mm-dd HH_MM_SS', new Date()) + '.xlsx'
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
            arrearAmtSummaryListLabel: '超期金额',
            arrearReceiveAmtSummaryListLabel: '超期已收金额',
            lateFeeAmtSummaryListLabel: '实际滞纳金'
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
    refreshListPage2(){
      this.refreshView('FiscalTermList', 'from')
      this.getLateFeeInfo()
      this.getData(true)
    }
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    CustomColumns,
    LateFeeReceive,
    LateFeeDerate,
  },
  activated() {
    this.lateFeeForm.custOverduePaymentNo = this.$route.query.custOverduePaymentNo
    if (!this.$route.meta.isUseCache) {
      this.getLateFeeInfo()
      // this.getData(true)
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
