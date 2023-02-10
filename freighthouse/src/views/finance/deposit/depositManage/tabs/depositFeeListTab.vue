<template>
  <div
    class="finance-list-container"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div style="height: 8px; background: #f8f9fd"></div>
    <div class="money-box">
      <div class="money-box-left">
        <el-button
          v-if="checkAuth($route.name,'tab-depositFeeList', 'btn-createSettle')"
          class="finance-btn"
          @click="createSettlement('group')"
          size="mini"
          type="primary"
        >生成结算单</el-button>
        <!-- <el-button class="finance-btn" size="mini" @click="getData">导出</el-button> -->
      </div>
      <div class="money-box-right">
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
      </div>
    </div>
    <div class="finance-list-container">
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
    <BizDetailList :bizDetailVisible="bizDetailVisible" />
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import BizDetailList from '@/views/finance/orderFee/orderFee/components/components/bizDetailList'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { feeListMixin } from '@/views/finance/settlement/feeList/feeListMixin'
import { departmentTreeList } from '@/api/companyResource'
import { listDepositFeePage, getDepositFeeListAmtSummary } from '@/api/fin/deposit'
import { groupSettleOrderApply } from '@/api/fin/fee'

export default {
  name: 'depositFeeList',
  label: '押金费用汇总',
  mixins: [mixin, mixin2, routerMixin, feeListMixin],
  components: {
    FinanceTableMass,
    FinanceSearch,
    CustomColumns,
    BizDetailList,
  },
  data() {
    return {
      keyDownActive: true,
      pageSizeUrl: listDepositFeePage('geturl'),
      searchOption: {},
      option1: {},
      multipleSelection1: [],
      departmentList: [],
      selfColumnsBase: [],
      bizDetailVisible: { show: false, feeId: '', isFinBill: false },
    }
  },
  created() {
    this.loanBasicData()
    // 搜索配置
    let searchArr = ['sourceBizNo', 'settleCompCode', 'settleCorpCode', 'settleCorpType', 'feeCode']
    let searchCfgArr = [
      'sourceBizNo',
      'settleCompCode',
      'settleCorpCode',
      'settleCorpType',
      'settleCorpSubType',
      'receipayType',
      'currency',
      'feeAmt',
      'feeCode',
      'remark', // 费用备注 no
      'agentCompCode', // 费用代收付分公司 label
      'finDate',
      'reviseStatus',
      'precloseStatus',
      'precloseTime',
      'closeStatus',
      'closeTime',
      'settleOrderStatus',
      'settleOrderNo',
      'settleTime', // 结算时间 no
      'settleLock',
      'settleCycle',
      'settleStatus',
      'receivePayDate',
      'gedgingStatus',
      'payApplySettleNo',
      'payOrderNo',
      'writeoffStatus',
      'writeoffDate',
      'writeoffNo',
      'depositApplyNo',
      'depositType',
      'depositSubType',
      'depositReceipayType',
      'createdBy',
      'createdByDeptCode', // 创建部门
    ]
    let filterGroups2 = {
      remark: { label: '费用备注', type: 'input' },
      feeCode: {
        label: '费用名称',
        type: 'select',
        selectOptions: [
          { label: '押金(供应商)', value: 'YJGYS' },
          { label: '押金(客户)', value: 'YJKH' },
        ],
      },
      sourceBizNo: { label: '单号', type: 'input' },
      depositApplyNo: { label: '押金申请编号', type: 'input' },
      settleOrderNo: { label: '结算单号', type: 'input' },
      payApplySettleNo: { label: '请款单号', type: 'input' },
      payOrderNo: { label: '付款单号', type: 'input' },
      writeoffNo: { label: '核销编号', type: 'input' },
      settleStatus: { label: '结清状态', type: 'select', multiple: true, prop: 'feeSettleStatus' },
      writeoffStatus: { label: '核销状态', type: 'select', multiple: true, prop: 'writeoffStatus' },
      depositType: { label: '押金类型', type: 'select', prop: 'depositType' },
      depositSubType: { label: '押金子类型', type: 'input' },
      settleCycle: { label: '结算方式', type: 'select', multiple: true, prop: 'settleCycle' },
      settleTime: { label: '结算时间', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['settleTimeStart', 'settleTimeEnd'] },
      finDate: { label: '财务日期', type: 'daterange', format: 'yyyy-MM-dd' },
      precloseTime: { label: '预关账时间', type: 'daterange', format: 'yyyy-MM-dd' },
      closeTime: { label: '关账时间', type: 'daterange', format: 'yyyy-MM-dd' },
      receivePayDate: {
        label: '收付日期',
        type: 'daterange',
        format: 'yyyy-MM-dd',
        ranges: ['receivePayDateStart', 'receivePayDateEnd'],
      },
      writeoffDate: {
        label: '核销日期',
        type: 'daterange',
        format: 'yyyy-MM-dd',
        ranges: ['writeoffDateStart', 'writeoffDateEnd'],
      },
      settleCorpCode: {
        label: '结算单位',
        type: 'remoteSelect',
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: '' }, item),
        visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: '' }, item),
      },
      settleCompCode: {
        label: '分公司',
        type: 'remoteSelect',
        remoteSelectList: [],
        remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
        visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
      },
      createdByDeptCode: {
        label: '创建部门',
        prop: 'createdByDeptCode',
        type: 'cascader',
        cascaderList: this.departmentList,
        cascaderProps: { children: 'childList', label: 'deptCname', value: 'deptCode', checkStrictly: true },
      },
    }
    let filterGroups = {}
    searchCfgArr.forEach((v) => {
      if (v === 'agentCompCode') {
        filterGroups[v] = { ...this.filterGroups[v], label: '费用代收付分公司' }
      } else if (v === 'receipayType') {
        filterGroups[v] = { ...this.filterGroups[v], label: '费用收付类型' }
      } else if (filterGroups2[v]) {
        filterGroups[v] = filterGroups2[v]
      } else if (this.filterGroups[v]) {
        filterGroups[v] = this.filterGroups[v]
      }
    })
    this.searchOption = {
      saveDefault: true,
      saveName: 'listDepositFeePage',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups,
      },
    }
    // 表格配置
    let summaryArr = [
      { key: 'recFeeAmtList', label: '应收', color: 'red' },
      { key: 'payFeeAmtList', label: '应付', color: 'green' },
    ]
    let labelObj = {}
    let colorObj = {}
    summaryArr.forEach((v) => {
      labelObj[v.key + 'Label'] = v.label
      colorObj[v.key + 'Color'] = v.color
    })
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '80px',
      data: [{ label: '详情', show: true, action: 'BizDetail' }],
    })
    this.option1 = {
      ...this.option,
      id: 'option1',
      $name: 'PreCloseAuditTab',
      pagination,
      operationBtns,
      listAmtSummary: Object.assign({}, this.option.listAmtSummary, { show: true, labelObj, colorObj, data: [] }),
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns,
        // () => {
        //   if (!this.isNotFirtGetData) {
        //     this.getData(false, true).then((res) => setTimeout(() => (this.customColumnsPopShow = true), 600))
        //   } else {
        //     this.customColumnsPopShow = true
        //   }
        // },
      },
      colorColumns: [
        'depositReceipayType',
        'auditStatus',
        'receipayGroup',
        'yesNo',
        'finLockStatus',
        'writeoffStatus',
        'feeSettleStatus',
      ],
    }
    this.selfColumnsBase = [
      {
        prop: 'sourceBizNo',
        label: '单号',
        type: 'button',
        width: 150,
        operationBtns: {
          show: true,
          callback: (fn, index, row) => this.showOneNoDetail('sourceBizNo', row.sourceBizNo, { isTab: true }),
        },
      },
      { prop: 'settleCompName', width: 150, label: '分公司', type: 'text' },
      { prop: 'settleCorpName', width: 150, label: '结算单位', type: 'text' },
      { prop: 'settleCorpType', width: 150, label: '结算单位类型', type: 'select', propInDict: 'unitType', multi: true },
      {
        prop: 'settleCorpSubType',
        width: 150,
        label: '结算单位子类型',
        type: 'select',
        propInDict: 'settleUnitSubType',
        multi: true,
        noDict: true,
      },
      { prop: 'receipayType', width: 150, label: '费用收付类型', type: 'select', propInDict: 'receipayGroup' },
      { prop: 'currency', width: 90, label: '币种', type: 'text' },
      { prop: 'feeAmt', width: 90, label: '金额', type: 'text' },
      { prop: 'feeName', width: 90, label: '费用名称', type: 'text' },
      { prop: 'remark', width: 90, label: '费用备注', type: 'text' },
      { prop: 'agentCompName', width: 90, label: '费用代收付分公司', type: 'text' },
      { prop: 'finDate', width: 130, label: '财务日期', type: 'text' },
      { prop: 'reviseStatus', width: 100, label: '调账状态', type: 'select', propInDict: 'feeReviseStatus' },
      { prop: 'precloseStatus', width: 100, label: '预关账状态', type: 'select', propInDict: 'yesNo' },
      { prop: 'precloseTime', width: 130, label: '预关账时间', type: 'text' },
      { prop: 'closeStatus', width: 100, label: '关账状态', type: 'select', propInDict: 'yesNo' },
      { prop: 'closeTime', width: 130, label: '关账时间', type: 'text' },
      { prop: 'settleOrderStatus', width: 100, label: '结算单生成状态', type: 'select', propInDict: 'finFeeSettleOrderStatus' },
      {
        prop: 'settleOrderNos',
        label: '结算单号',
        type: 'columnTip',
        width: 148,
        component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps) => {
            this.showColumnDetailHandle({ type: 'settleOrderNos', no, componentProps }, { isTab: true })
          },
        },
      },
      { prop: 'settleTimes', width: 130, label: '结算时间', type: 'text' },
      { prop: 'settleLock', width: 100, label: '是否结算锁定', type: 'select', propInDict: 'finLockStatus' },
      { prop: 'settleCycle', width: 100, label: '结算方式', type: 'select' },
      { prop: 'settleAmt', width: 130, label: '结算金额', type: 'text' },
      { prop: 'settleStatus', width: 100, label: '结清状态', type: 'select', propInDict: 'feeSettleStatus' },
      { prop: 'receivePayDates', width: 130, label: '收付日期', type: 'text' },
      { prop: 'settleApplyAmt', width: 130, label: '已生成结算金额', type: 'text' },
      { prop: 'canSettleApplyAmt', width: 130, label: '未生成结算金额', type: 'text' },
      { prop: 'gedgingStatus', width: 100, label: '对冲状态', type: 'select', propInDict: 'yesNo' },
      {
        prop: 'payApplySettleNos',
        label: '请款单号',
        type: 'columnTip',
        width: 130,
        component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps) => {
            this.showColumnDetailHandle({ type: 'paySettleApplyNo', no, componentProps }, { isTab: true })
          },
        },
      },
      {
        prop: 'payOrderNos',
        label: '付款单号',
        type: 'columnTip',
        width: 130,
        component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps) => {
            this.showColumnDetailHandle({ type: 'pay_order', no, componentProps }, { isTab: true })
          },
        },
      },
      { prop: 'totalWriteoffAmt', width: 130, label: '已核销金额', type: 'text' },
      { prop: 'gedgingWriteoffAmt', width: 130, label: '已对冲金额', type: 'text' },
      { prop: 'notWriteoffAmt', width: 130, label: '未核销金额', type: 'text' },
      { prop: 'writeoffStatus', width: 100, label: '核销状态', type: 'select' },
      { prop: 'writeOffDate', width: 130, label: '核销日期', type: 'text' },
      {
        prop: 'writeoffNos',
        label: '核销编号',
        width: 130,
        type: 'columnTip',
        component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps) => {
            this.showColumnDetailHandle({ type: 'writeoffNos', no, componentProps }, { isTab: true })
          },
        },
      },
      {
        prop: 'depositApplyNo',
        label: '押金申请编号',
        type: 'button',
        width: 150,
        operationBtns: {
          show: true,
          callback: (fn, index, row) => this.routerPushTab('DepositApplyDetail', { depositApplyNo: row.depositApplyNo }),
        },
      },
      { prop: 'depositType', width: 118, label: '押金类型', type: 'select', propInDict: 'depositType' },
      { prop: 'depositSubType', width: 118, label: '押金子类型', type: 'select', propInDict: 'depositSubType' },
      { prop: 'depositReceipayType', width: 90, label: '押金收付类型', type: 'select', propInDict: 'depositReceipayType' },
      { prop: 'createdName', width: 130, label: '创建人', type: 'text' },
      { prop: 'createdByDeptName', width: 130, label: '创建部门', type: 'text' },
    ]
    this.option1.columns = [...this.selfColumnsBase] // columns
    this.columns.push(...this.selfColumnsBase.map((item) => item.prop))
  },
  methods: {
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    search(data) {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption, true, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      return listDepositFeePage(data)
        .then((res) => {
          this.finCommonColumns(res)
          if (customerList) return
          res.data.list.forEach((item) => {
            item.settleOrderNos_multiValue = item.settleOrderNos ? item.settleOrderNos.split(',') : []
            item.writeoffNos_multiValue = item.writeoffNos ? item.writeoffNos.split(',') : []
            item.settleTimes_multiValue = item.settleTimes.split(',')
            item.payApplySettleNos_multiValue = item.payApplySettleNos.split(',')
            item.payOrderNos_multiValue = item.payOrderNos.split(',')
          })
          this.option1.data = res.data.list
          this.$set(this.option1, 'emptyText', '未查询到任何数据')
          Object.assign(this.option1.pagination, res.data)
        })
        .finally(() => (this.lsLoading = false))
    },
    getDepositFeeListAmtSummary(data) {
      getDepositFeeListAmtSummary(data).then((res) => {
        this.option1.listAmtSummary.data = {
          payFeeAmtList: res.data.payFeeAmtList,
          recFeeAmtList: res.data.recFeeAmtList,
        }
      })
    },
    sendMulti(data) {
      this.multipleSelection1 = data
      let data2 = { ascColumns: [], descColumns: [], query: [] }
      let ids = this.multipleSelection1.map((item) => item.feeId).join(',')
      if (ids) {
        data2.query.push({ column: 'feeIds', type: 'in', value: ids })
      } else {
        data2.query = this.searchBackup || []
      }
      if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => this.getDepositFeeListAmtSummary(data2))
      }
    },
    // 部门下拉框
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
    },
    createSettlement(type) {
      console.log(!!this.hasSearch, this.isSelectAll)
      let allResult = !!this.hasSearch && this.isSelectAll
      let data = { allResult, settleOrderBuildType: type }
      if (!this.multipleSelection1.length) {
        return this.$msgErrClose('请选择需要生成结算单的费用！')
      }
      let multipleSelection = this.multipleSelection1
      let hasAgent = multipleSelection.some((item) => item.agentCompName !== '')
      if (hasAgent) {
        let bool = multipleSelection.some((item) => item.agentCompName === '')
        if (bool) {
          return this.$msgErrClose('代收付费用不允许跟非代收付费用在同一个结算单！')
        }
        let agentCompName = multipleSelection[0].agentCompName
        bool = multipleSelection.some((item) => item.agentCompName !== agentCompName)
        if (bool) {
          return this.$msgErrClose('代收付的费用必须是同一家代收付分公司！')
        }
        let bool1 = multipleSelection.some((item) => item.receipayType === 'receive')
        let bool2 = multipleSelection.some((item) => item.receipayType === 'pay')
        if (bool1 && bool2) {
          return this.$msgErrClose('费用同时存在应收和应付费用，不能进行代收付！')
        }
      }
      data.feeIds = this.multipleSelection1.map((v) => v.feeId).join(',')
      this.lsLoading = true
      groupSettleOrderApply(data)
        .then((res) => {
          if (res.data.settleOrderNos) {
            this.settleOrderNos = res.data.settleOrderNos
            this.resultDialogOption.show = true
            return
          }
          this.$store.state._feeToSettleParams = res
          this.routerPushTab('CreateSettlement', { source: 'createSettlementFromFeeSearch' })
        })
        .finally(() => (this.lsLoading = false))
    },
    handleBizDetail(row) {
      console.log(row)
      this.bizDetailVisible.isFinBill = row.sourceType === 'finbill'
      this.bizDetailVisible.show = true
      this.bizDetailVisible.feeId = row.feeId
    },
  },
}
</script>
<style lang="scss" scoped>
</style>