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
          v-if="checkAuth($route.name,'tab-depositList', 'btn-apply')"
          class="finance-btn"
          size="mini"
          type="success"
          @click="routerPushTab('DepositApply')"
        >申请押金</el-button>
        <el-button
          v-if="checkAuth($route.name,'tab-depositList', 'btn-cancel')"
          class="finance-btn"
          size="mini"
          type="purple"
          @click="cancelApply"
        >撤回申请</el-button>
        <el-button
          v-if="checkAuth($route.name,'tab-depositList', 'btn-auditPass')"
          class="finance-btn"
          size="mini"
          type="success"
          @click="applyAudit('pass')"
        >审核通过</el-button>
        <el-button
          v-if="checkAuth($route.name,'tab-depositList', 'btn-auditRefuse')"
          class="finance-btn"
          size="mini"
          type="danger"
          @click="applyAudit('refuse')"
        >审核拒绝</el-button>
      </div>
      <div class="money-box-right">
        <el-button
          v-if="checkAuth($route.name,'tab-depositList', 'btn-receive')"
          class="finance-btn"
          size="mini"
          type="primary"
          @click="receiveCfgShow"
        >开具/收取押金条</el-button>
        <el-button
          v-if="checkAuth($route.name,'tab-depositList', 'btn-refund')"
          class="finance-btn"
          size="mini"
          type="purple"
          @click="refundCfgShow"
        >收回/退回押金条</el-button>
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
    <FinDialog :option="dialogApply" @close="applyClose" />
    <FinDialog ref="receiveCfg" :option="receiveCfg" @close="receiveClose" />
    <FinDialog ref="refundCfg" :option="refundCfg" @close="refundClose" />
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import FinDialog from '@/views/finance/components/financeDialog/finDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { departmentTreeList } from '@/api/companyResource'
import {
  depositApplyList,
  getListAmtSummary,
  depositApplyRevoke,
  depositApplyAudit,
  recvDepositFile,
  backDepositFile,
} from '@/api/fin/deposit'

export default {
  name: 'depositList',
  label: '押金列表',
  mixins: [mixin, mixin2, routerMixin],
  components: {
    FinanceTableMass,
    FinanceSearch,
    CustomColumns,
    FinDialog,
  },
  watch: {
    searchOption: {
      handler(val) {
        console.log(val)
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      keyDownActive: true,
      pageSizeUrl: depositApplyList('geturl'),
      keyDownActive: true,
      searchOption: {},
      option1: {},
      multipleSelection1: [],
      departmentList: [],
      selfColumnsBase: [],
      dialogApply: {
        show: false,
        width: '600px',
        labelWidth: '80px',
        title: '审核拒绝',
        text: '拒绝',
        formItems: [{ label: '拒绝原因', type: 'textarea', prop: 'auditRemark', rules: { required: true, message: ' ' } }],
        form: { auditRemark: '' },
      },
      receiveCfg: {
        show: false,
        width: '600px',
        labelWidth: '130px',
        title: '开具/收取押金条',
        formItems: [
          {
            label: '开具/收取押金条',
            type: 'select',
            prop: 'status',
            propInDict: 'depositFileStatus',
            disabled: true,
            rules: { required: true, message: ' ' },
          },
          { label: '附件', type: 'file', prop: 'fileNo', limit: 1, rules: { required: true, message: ' ' } },
        ],
        form: { status: '', fileNo: '' },
      },
      refundCfg: {
        show: false,
        width: '600px',
        labelWidth: '130px',
        title: '收回/退回押金条',
        formItems: [
          {
            label: '收回/退回押金条',
            type: 'select',
            prop: 'status',
            propInDict: 'depositFileStatus',
            disabled: true,
            rules: { required: true, message: ' ' },
          },
        ],
        form: { status: '' },
      },
    }
  },
  created() {
    this.loanBasicData()
    // 搜索配置
    let searchInputGroup = ['depositApplyNo', 'settleCompCode', 'depositFileRecvStatus']
    this.searchOption = {
      saveDefault: true,
      saveName: 'depositApplyList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          depositApplyNo: { label: '押金申请编号', type: 'input' },
          settleCompCode: {
            label: '所属分公司',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
          },
          settleCorpCode: {
            label: '客户/供应商名称',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: '' }, item),
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: '' }, item),
          },
          depositType: { label: '押金类型', type: 'select', prop: 'depositType' },
          depositSubType: { label: '押金子类型', type: 'input' },
          receipayType: { label: '押金收付类型', type: 'select', prop: 'depositReceipayType' },
          currency: { label: '币种', type: 'select', prop: 'noOriginalCurrency' },
          orderNo: { label: '关联单号', type: 'input' },
          feeCode: {
            label: '费用名称',
            type: 'select',
            selectOptions: [
              { label: '押金(供应商)', value: 'YJGYS' },
              { label: '押金(客户)', value: 'YJKH' },
            ],
          },
          depositFileRecvStatus: {
            label: '开具/收取押金条',
            type: 'select',
            selectOptions: this.dictMap.depositFileStatus.filter((v) => v.value.indexOf('back') === -1),
          },
          depositFileBackStatus: {
            label: '收回/退回押金条',
            type: 'select',
            selectOptions: this.dictMap.depositFileStatus.filter((v) => v.value.indexOf('back') > -1),
          },
          auditStatus: { label: '审核状态', type: 'select', prop: 'auditStatusNocancel' },
          auditBy: {
            label: '审核人',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item),
          },
          rivalBankName: { label: '对方开户行', type: 'input' },
          rivalAccountName: { label: '对方户名', type: 'input' },
          rivalAccountNo: { label: '对方账号', type: 'input' },
          applyBy: {
            label: '申请人',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item),
          },
          applyPersonDeptCode: {
            label: '所属部门',
            prop: 'applyPersonDeptCode',
            type: 'cascader',
            cascaderList: this.departmentList,
            cascaderProps: { children: 'childList', label: 'deptCname', value: 'deptCode', checkStrictly: true },
          },
          createdTime: { label: '申请时间', type: 'daterange', format: 'yyyy-MM-dd' },
          auditTime: { label: '审核时间', type: 'daterange', format: 'yyyy-MM-dd' },
          recvWriteOffNo: { label: '收款核销编号', type: 'input' },
          payWriteOffNo: { label: '付款核销编号', type: 'input' },
          unitType: { label: '客户/供应商类型', type: 'select', prop: 'unitType' },
          depositFileBackBy: {
            label: '收回/退回人',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item),
          },
          depositFileBackTime: { label: '收回/退回时间', type: 'daterange', format: 'yyyy-MM-dd' },
          depositFileRecvBy: {
            label: '开具/收取人',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item),
          },
          depositFileRecvTime: { label: '开具/收取时间', type: 'daterange', format: 'yyyy-MM-dd' },
        },
      },
    }
    console.log(this.dictMap.depositFileStatus.filter((v) => v.value.indexOf('back') === -1))
    console.log(this.dictMap.depositFileStatus.filter((v) => v.value.indexOf('back') > -1))
    // 表格配置
    let summaryArr = [
      { key: 'recvAmtList', label: '收押金', color: 'red' },
      { key: 'payAmtList', label: '付押金', color: 'green' },
    ]
    let labelObj = {}
    let colorObj = {}
    summaryArr.forEach((v) => {
      labelObj[v.key + 'Label'] = v.label
      colorObj[v.key + 'Color'] = v.color
    })
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.option1 = {
      ...this.option,
      id: 'option1',
      $name: 'PreCloseAuditTab',
      pagination,
      listAmtSummary: Object.assign({}, this.option.listAmtSummary, { show: true, labelObj, colorObj, data: [] }),
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns,
      },
      colorColumns: ['depositReceipayType', 'auditStatus'],
    }
    this.selfColumnsBase = [
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
      { prop: 'settleCompName', width: 150, label: '所属分公司', type: 'text' },
      { prop: 'settleCorpName', width: 150, label: '客户/供应商名称', type: 'text' },
      { prop: 'unitType', width: 150, label: '客户/供应商类型', type: 'select', multi: true },
      { prop: 'depositType', width: 118, label: '押金类型', type: 'select', propInDict: 'depositType' },
      { prop: 'depositSubType', width: 118, label: '押金子类型', type: 'select', propInDict: 'depositSubType' },
      { prop: 'receipayType', width: 90, label: '押金收付类型', type: 'select', propInDict: 'depositReceipayType' },
      { prop: 'currency', width: 90, label: '币种', type: 'text' },
      { prop: 'amt', width: 90, label: '金额', type: 'text' },
      {
        prop: 'orderNo',
        label: '关联单号',
        type: 'button',
        width: 150,
        operationBtns: {
          show: true,
          callback: (fn, index, row) => this.showOneNoDetail('sourceBizNo', row.orderNo, { isTab: true }),
        },
      },
      { prop: 'feeName', width: 90, label: '费用名称', type: 'text' },
      // 开具/收取押金条：初始状态(未开具、未收取），收押金对应：未开具、已开具。付押金对应：未收取、已收取。
      // 收回/退回押金条：初始状态(未收回、未退回），收押金对应：未收回、已收回。付押金对应：未退回、已退回。
      { prop: 'depositFileRecvStatus', width: 90, label: '开具/收取押金条', type: 'select', propInDict: 'depositFileStatus' },
      { prop: 'depositFileBackStatus', width: 90, label: '收回/退回押金条', type: 'select', propInDict: 'depositFileStatus' },
      {
        prop: 'depositFileName',
        label: '押金条附件',
        type: 'button',
        width: 100,
        operationBtns: {
          show: true,
          callback: (action, $index, row) => this.vmShowAttachment(row.depositFileNo),
        },
      },
      { prop: 'auditStatus', width: 100, label: '审批状态', type: 'select' },
      // { prop: 'auditName', width: 100, label: '当前审核人', type: 'text' },
      { prop: 'rivalBankName', width: 130, label: '对方开户行', type: 'text' },
      { prop: 'rivalAccountName', width: 130, label: '对方户名', type: 'text' },
      { prop: 'rivalAccountNo', width: 130, label: '对方账号', type: 'text' },
      { prop: 'applyName', width: 100, label: '申请人', type: 'text' },
      { prop: 'applyPersonDeptName', width: 100, label: '所属部门', type: 'text' },
      { prop: 'createdTime', width: 130, label: '申请时间', type: 'text' },
      { prop: 'auditName', width: 100, label: '审核人', type: 'text' },
      { prop: 'auditTime', width: 130, label: '审核时间', type: 'text' },
      {
        prop: 'applyFileName',
        label: '押金申请附件',
        type: 'button',
        width: 100,
        operationBtns: {
          show: true,
          callback: (action, $index, row) => this.vmShowAttachment(row.applyFileNo),
        },
      },
      {
        prop: 'recvWriteOffNo',
        label: '收款核销编号',
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
        prop: 'payWriteOffNo',
        label: '付款核销编号',
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
      { prop: 'applyRemark', width: 150, label: '备注', type: 'text' },
      { prop: 'auditRemark', width: 150, label: '拒绝原因', type: 'text' },
      { prop: 'depositFileBackName', width: 100, label: '收回/退回人', type: 'text' },
      { prop: 'depositFileBackTime', width: 130, label: '收回/退回时间', type: 'text' },
      { prop: 'depositFileRecvName', width: 100, label: '开具/收取人', type: 'text' },
      { prop: 'depositFileRecvTime', width: 130, label: '开具/收取时间', type: 'text' },
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
      return depositApplyList(data)
        .then((res) => {
          this.finCommonColumns(res)
          if (customerList) return
          ;(res.data.list || []).forEach((item) => {
            item.recvWriteOffNo_multiValue = item.recvWriteOffNo ? item.recvWriteOffNo.split(',') : []
            item.payWriteOffNo_multiValue = item.payWriteOffNo ? item.payWriteOffNo.split(',') : []
          })

          this.option1.data = res.data.list
          console.log(this.option1.data);
          this.$set(this.option1, 'emptyText', '未查询到任何数据')
          Object.assign(this.option1.pagination, res.data)
        })
        .finally(() => (this.lsLoading = false))
    },
    getListAmtSummary(data) {
      getListAmtSummary(data).then((res) => {
        this.option1.listAmtSummary.data = res.data
      })
    },
    sendMulti(data) {
      this.multipleSelection1 = data
      let data2 = { ascColumns: [], descColumns: [], query: [] }
      let ids = this.multipleSelection1.map((item) => item.depositApplyId).join(',')
      if (ids) {
        data2.query.push({ column: 'depositApplyId', type: 'in', value: ids })
      } else {
        data2.query = this.searchBackup || []
      }
      if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => this.getListAmtSummary(data2))
      }
    },
    search(data) {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    showDetail(row) {
      this.routerPushTab('DepositApplyDetail', { depositApplyNo: row.depositApplyNo })
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
    // 成功操作刷新页面通用方法
    commonSuccess(msg) {
      this.$msgSucClose(msg)
      this.getData()
    },
    // 取消申请
    cancelApply() {
      let rows = this.multipleSelection1
      if (!rows.length) {
        return this.$msgErrClose('请选择需要操作的项！')
      }
      if (rows.find((v) => v.auditStatus !== 'pending')) {
        return this.$msgErrClose('含有已审核的记录，请选择待审核的项！')
      }
      this.$confirmWarn('确认撤回申请？', () => {
        depositApplyRevoke({ depositApplyIds: rows.map((v) => v.depositApplyId) }).then((res) => {
          this.commonSuccess('撤回申请成功！')
        })
      })
    },
    // 审核通过、拒绝
    applyAudit(type) {
      let rows = this.multipleSelection1
      if (rows.length !== 1) {
        return this.$msgErrClose('请选择一条进行操作！')
      }
      if (rows[0].auditStatus !== 'pending') {
        return this.$msgErrClose('请选择待审核的项！')
      }
      if (type === 'pass') {
        this.$confirmWarn('确认审核通过？', () => {
          depositApplyAudit({ depositApplyId: rows[0].depositApplyId, auditStatus: 'pass' }).then((res) =>
            this.commonSuccess('审核通过成功！')
          )
        })
      } else {
        this.rowData = rows[0]
        this.dialogApply.show = true
      }
    },
    // 审核拒绝弹框
    applyClose(tag) {
      if (!tag) {
        return (this.dialogApply.show = false)
      }
      let data = {
        depositApplyId: this.rowData.depositApplyId,
        auditStatus: 'refuse',
        auditRemark: this.dialogApply.form.auditRemark,
      }
      this.lsLoading = true
      depositApplyAudit(data)
        .then((res) => {
          this.dialogApply.show = false
          this.commonSuccess('审核拒绝成功！')
        })
        .finally(() => (this.lsLoading = false))
    },
    // 开具/收取押金条
    receiveCfgShow() {
      let rows = this.multipleSelection1
      if (rows.length !== 1) {
        return this.$msgErrClose('请选择一条进行操作！')
      }
      let obj = this.multipleSelection1[0]
      if (obj.auditStatus !== 'pass') {
        return this.$msgErrClose('只有审核通过才能进行此操作！')
      }
      if (obj.depositFileBackStatus === 'recv_back_yes' || obj.depositFileBackStatus === 'back_yes') {
        return this.$msgErrClose('已进行收回/退回押金条，不能进行此操作！')
      }
      if (obj.depositFileRecvStatus === 'recv_yes' || obj.depositFileRecvStatus === 'make_yes') {
        return this.$msgErrClose('已进行开具/收取押金条，不能重复操作！')
      }
      this.receiveCfg.form.fileNo = this.receiveCfg.form.fileName = ''
      this.receiveCfg.show = true
      setTimeout(() => {
        Object.assign(this.receiveCfg.form, {
          depositApplyId: obj.depositApplyId,
          status: obj.receipayType === 'receive' ? 'make_yes' : 'recv_yes',
        })
      }, 100)
    },
    receiveClose(tag) {
      console.log(this.receiveCfg.form)
      if (!tag) {
        return (this.receiveCfg.show = false)
      }
      let data = { ...this.receiveCfg.form, fileName: this.receiveCfg.form.__fileName__ }
      this.lsLoading = true
      recvDepositFile(data)
        .then((res) => {
          this.receiveCfg.show = false
          this.commonSuccess('开具/收取押金条操作成功！')
        })
        .finally(() => (this.lsLoading = false))
    },
    // 收回/退回押金条
    refundCfgShow() {
      let rows = this.multipleSelection1
      if (!rows.length) {
        return this.$msgErrClose('请选择需要操作的项！')
      }
      let obj = this.multipleSelection1[0]
      if (rows.find((v) => v.depositFileRecvStatus !== 'recv_yes' && v.depositFileRecvStatus !== 'make_yes')) {
        return this.$msgErrClose('只有进行开具/收取押金条后，才能进行此操作！')
      }
      if (rows.find((v) => v.depositFileBackStatus === 'recv_back_yes' || v.depositFileBackStatus === 'back_yes')) {
        return this.$msgErrClose('已进行收回/退回押金条，不能重复操作！')
      }
      this.refundCfg.show = true
      setTimeout(() => {
        Object.assign(this.refundCfg.form, {
          depositApplyIds: rows.map((v) => v.depositApplyId),
          status: obj.receipayType === 'receive' ? 'recv_back_yes' : 'back_yes',
        })
      }, 100)
    },
    refundClose(tag) {
      console.log(this.refundCfg.form)
      if (!tag) {
        return (this.refundCfg.show = false)
      }
      this.lsLoading = true
      backDepositFile({ ...this.refundCfg.form })
        .then((res) => {
          this.refundCfg.show = false
          this.commonSuccess('收回/退回押金条操作成功！')
        })
        .finally(() => (this.lsLoading = false))
    },
  },
  activated() {
    console.log(sessionStorage.getItem('_refreshPage'))
    if (sessionStorage.getItem('_refreshPage') === 'depositManageList') {
      sessionStorage.removeItem('_refreshPage')
      this.handleCurrentChange(1)
    }
  },
}
</script>
<style lang="scss" scoped>
</style>