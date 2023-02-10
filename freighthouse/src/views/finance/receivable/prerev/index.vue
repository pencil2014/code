<template>
  <div
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button
            v-if="checkAuth($route.name, 'tab-prerevList', 'btn-preWriteoff')"
            class="finance-btn"
            @click="receivablePrerevWriteoff"
            size="mini"
            type="primary"
          >预收款核销</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-prerevList', 'btn-transerSettleCorp')"
            class="finance-btn"
            @click="exchangeCorpShow"
            size="mini"
            type="primary"
          >预收调转</el-button>
          <!-- v-if="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-handleExport')" -->
          <el-button
            class="finance-btn"
            @click="handleExport"
            size="mini"
            v-if="checkAuth($route.name, 'tab-prerevList', 'btn-handleExport')"
          >导出</el-button>
        </div>
        <div class="money-box-right">
          <el-button
            class="finance-btn"
            @click="handleRefund"
            size="mini"
            v-if="checkAuth($route.name, 'tab-prerevList', 'btn-refund')"
            type="danger"
          >申请退款</el-button>
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
        </div>
      </div>
      <FinanceTable :option="option1" @send-multi="sendMulti" />
    </div>
    <!-- 凭证弹框组件 -->
    <PreviewDialog :dialogOption="previewDialog" />
    <RefundDialog
      :form="query"
      @close-refund-dialog="refundDialog"
      v-if="rejectDialogVisible"
      :open="rejectDialogVisible"
    />
    <!-- 修改结算单位 -->
    <ExchangeCorpDialog
      :dialogOption="exchangeCorpDialog"
      @close="exchangeCorp"
      :receivablePrerevId="receivablePrerevId"
      :transferSettleCorpCode="transferSettleCorpCode"
    />
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import { receivablePrerevList, getPrerevListAmtSummary, transferSettleCorp } from '@/api/fin/receivableReg'
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import RefundDialog from '../components/refund'
import ExchangeCorpDialog from '../components/exchangeCorpDialog'
export default {
  name: 'prerev',
  // props: ['isJumpRouteFromPage'],
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: receivablePrerevList('geturl'),
      keyDownActive: true,
      exchangeCorpDialog: { show: false },
      previewDialog: {
        show: false,
        title: '凭证预览',
        seqNo: '',
        showData: {},
      },
      searchBackup: [],
      currentComponent: '',
      receivablePrerevId: 0,
      transferSettleCorpCode: '',
      option1: {},
      searchOption: {},
      table1DataBackup: [],
      multipleSelection1: [],
      orderBillId: '',
      showReceivablePrerevWriteoff: false,
      selectedOptionItem: '',
      batchPrintCreateData: [],
      invoiceReceivableIndex: 0,
      writeoffReceipayId: '',
      rowData: '',
      rejectDialogVisible: false,
      query: {},
      // 升序
      ascColumns: [],
      // 降序
      descColumns: [],
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 右侧搜索条件
      buttonSearch: '',
      selfColumnsBase: [
        {
          prop: 'receivablePrerevNo',
          label: '预收款登记',
          type: 'button',
          sortable: true,
          width: '155px',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'recvCompName',
          label: '所属分公司',
          type: 'text',
          width: 150,
          sortable: true,
        },
        {
          prop: 'payAccountName',
          label: '付款账户名',
          type: 'text',
          width: '130px',
          sortable: true,
        },
        {
          prop: 'payBankName',
          label: '付款银行',
          width: '124px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'payAccountNo',
          label: '付款账号',
          width: '104px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'receiveAmt',
          label: '原收款金额',
          width: '124px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'accountNo',
          label: '收款账号',
          width: '114px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'accountShortName',
          label: '我司收款账户简称',
          width: '130px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'bankName',
          label: '我司收款银行',
          width: '114px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'recvDate',
          label: '收付日期',
          width: '114px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'preceiveAmt',
          label: '预收款金额',
          width: '124px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'balance',
          label: '预收可用余额',
          width: '124px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'refundAmt',
          label: '退款金额',
          width: '104px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'writeoffAmt',
          label: '已核销金额',
          width: '104px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'currency',
          label: '预收款币种',
          width: '104px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'settleCorpName',
          label: '结算单位',
          width: 150,
          sortable: true,
          type: 'text',
        },
        {
          prop: 'settleCorpType',
          label: '结算单位类型',
          width: '124px',
          sortable: false,
          type: 'text',
        },
        {
          prop: 'isTemporary',
          label: '是否虚拟',
          width: '124px',
          sortable: true,
          type: 'select',
          propInDict: 'yesNo',
        },
        {
          prop: 'isTransfer',
          label: '是否预收调转',
          width: '134px',
          sortable: true,
          type: 'select',
          propInDict: 'yesNo',
        },
        { prop: 'assistedCompName', label: '代分公司收款', width: '150px', sortable: true },
        {
          prop: 'writeoffReceipayNo',
          label: '核销编号',
          type: 'button',
          sortable: true,
          width: '155px',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              const params = { writeoffNo: row.writeoffReceipayNo }
              const query = {
                source: 'writeoffRecv',
                receivableRegId: row.receivableRegId,
                writeoffReceipayNo: row.writeoffReceipayNo,
              }
              this.routerPush('WriteoffRecvDetail2', query, true, params)
            },
          },
        },
        {
          prop: 'voucherNo',
          label: '凭证号',
          type: 'button',
          sortable: true,
          width: '104px',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.initShowVoucher(this.previewDialog, row.acctVoucherSeqno, '', '')
            },
          },
        },
        {
          prop: 'receivableRegNo',
          label: '收款登记号',
          width: '155px',
          type: 'button',
          sortable: true,
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.$emit('update:isJumpRouteFromPage', true)
              this.$router.push({
                name: 'WriteoffRecvDetail',
                query: {
                  source: 'createSettlementFromReceivableRegId',
                  receivableRegId: row.receivableRegId,
                },
              })
            },
          },
        },
        {
          prop: 'newReceivablePrerevNo',
          label: '新预收款登记号',
          width: '155px',
          type: 'button',
          sortable: true,
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.routerPushTab('PrerevWriteoff', {
                source: 'createSettlementFromPrerev',
                receivablePrerevNo: row.newReceivablePrerevNo,
              })
            },
          },
        },
        {
          prop: 'sourceType',
          label: '预收款来源',
          width: '104px',
          sortable: true,
          type: 'select',
          propInDict: 'receivablePrerevSourceType',
        },
        {
          prop: 'lockStatus',
          label: '锁定状态',
          width: '104px',
          sortable: true,
          type: 'select',
          propInDict: 'finLockStatus',
        },
        {
          prop: 'lockReason',
          label: '锁定原因',
          width: '124px',
          sortable: true,
          type: 'tooltip',
        },
        {
          prop: 'invoiceNos',
          label: '发票号',
          type: 'columnTip',
          width: 140,
          sortable: false,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            callback: (no, componentProps, index) => {
              let row = componentProps.row
              let invoiceReceivableIds = row.invoiceReceivableIds_multiValue
                ? row.invoiceReceivableIds_multiValue
                : row.invoiceNos_multiValue
              let invoiceReceivableId = invoiceReceivableIds[index]
              let query = {
                source: 'detail',
                invoiceReceivableId,
              }
              this.$emit('update:isJumpRouteFromPage', true)
              this.$router.push({
                path: '/finance/receivable/invoiceReceivableDetail',
                query,
              })
            },
          },
        },
        {
          prop: 'bankseqFileCode',
          label: '到账水单',
          type: 'button',
          width: '80px',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              window.open(`/base/fileView/preview/${row.bankseqFileCode}/sowoll`)
            },
            data: [{ label: '有', type: 'text', show: true }],
          },
          sortable: false,
        },
        {
          prop: 'payBankseqFileNo',
          label: '客户付款水单',
          type: 'button',
          width: '80px',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              window.open(`/base/fileView/preview/${row.payBankseqFileNo}/sowoll`)
            },
            data: [{ label: '有', type: 'text', show: true }],
          },
          sortable: false,
        },
        {
          prop: 'createdName',
          label: '创建人',
          width: '104px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'createdTime',
          label: '创建时间',
          width: '130px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'updatedName',
          label: '更新人',
          width: '104px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'updatedTime',
          label: '更新时间',
          width: '130px',
          sortable: true,
          type: 'text',
        },
      ],
    }
  },
  created() {
    let searchArr = ['allNo', 'settleCorpCode', 'payBankName', 'currency', 'preceiveAmt', 'createdTime']
    this.searchOption = {
      // saveDefault: true,
      saveShow: true,
      saveName: 'regPrerevList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        // 初始搜索条件数
        defaultSearchLength: 6,
        // 条件数组
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          allNo: { label: '各类单号', type: 'input' },
          receivablePrerevNo: { label: '预收款登记号', type: 'input' },
          newReceivablePrerevNo: { label: '新预收款登记号', type: 'input' },
          writeoffReceipayNo: { label: '核销编号', type: 'input' },
          voucherNo: { label: '凭证号', type: 'input' },
          receivableRegNo: { label: '收款登记号', type: 'input' },
          invoiceNo: { label: '发票号', type: 'input' },
          sourceType: { label: '预收款来源', type: 'select', prop: 'receivablePrerevSourceType' },
          isTransfer: { label: '是否预收调转', type: 'select', prop: 'yesNo' },
          settleCorpCode: {
            label: '结算单位',
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item)
            },
            remoteSelectList: [],
          },
          assistedCompCode: {
            label: '代分公司收款',
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, containTemporary: 'all' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, containTemporary: 'all' }, item)
            },
            remoteSelectList: [],
          },
          recvCompCode: {
            label: '所属分公司',
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          settleCorpType: { label: '结算单位类型', type: 'select', prop: 'settleUnitType', multiple: true },
          isTemporary: { label: '是否虚拟', type: 'select', prop: 'yesNo' },
          payBankName: { label: '付款银行', type: 'input' },
          payAccountName: { label: '付款账户名', type: 'input' },
          payAccountNo: { label: '付款账号', type: 'input' },
          accountNo: { label: '收款账号', type: 'input' },
          accountShortName: { label: '我司收款账户简称', type: 'input' },
          bankName: { label: '我司收款银行', type: 'input' },
          recvDate: { label: '收付日期', type: 'lsDaterange', format: 'yyyy-MM-dd' },
          currency: {
            label: '预收款币种',
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
          preceiveAmt: { label: '预收款金额', type: 'range' },
          receiveAmt: { label: '原收款金额', type: 'range' },
          balance: { label: '预收可用余额', type: 'range' },
          refundAmt: { label: '退款金额', type: 'range' },
          writeoffAmt: { label: '已核销金额', type: 'range' },
          hasBankseqFile: { label: '到账水单', type: 'select', prop: 'hasNo' },
          hasPayBankseqFile: { label: '客户付款水单', type: 'select', prop: 'hasNo' },
          lockStatus: { label: '锁定状态', type: 'select', prop: 'finLockStatus' },
          createdBy: {
            label: '创建人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          updatedBy: {
            label: '更新人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },

          // 锁定状态、所属分公司、是否预收调转、更新人、新预收款登记号

          createdTime: { label: '创建时间', type: 'daterange', format: 'yyyy-MM-dd' },
          updatedTime: { label: '更新时间', type: 'daterange', format: 'yyyy-MM-dd' },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '详情',
          type: 'text',
          show: true,
          action: 'showDetail',
        },
      ],
    })
    if (!this.checkAuth(this.$route.name, 'tab-prerevList', 'btn-detail')) {
      operationBtns = false
    }
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
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
      $name: 'prerevList',
      data: [...this.option.data],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
      listAmtSummary,
      maxHeight: this.getFinanceTableMaxHeight,
      sortable: true,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      emptyText: '数据将在查询后显示',
    })
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))

    this.option1.columns = columns
    if (!this.searchOption.saveShow) {
      this.getData()
    }
    this.cTimestamp = new Date().getTime()
  },
  methods: {
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    //申请退款按钮
    handleRefund() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要申请退款的项！')
      }
      if (this.multipleSelection1.length > 1) {
        return this.$msgErrClose('一次只能勾选一个申请退款！')
      }
      if (this.multipleSelection1[0].lockStatus === 'lock') {
        return this.$msgErrClose('申请退款：' + this.multipleSelection1[0].lockReason)
      }
      if (this.multipleSelection1[0].balance == 0) {
        return this.$msgErrClose('预收可用余额为0，不能申请退款！')
      }
      // if (this.multipleSelection1[0].fromReceivablePrerevId) {
      //   return this.$msgErrClose('收款转移的订单，不能申请退款！')
      // }
      //申请退款查退款账号ID
      if (!this.multipleSelection1[0].payAccountName) {
        this.$store
          .dispatch('dict/bankAccountList', {
            accountNo: this.multipleSelection1[0].payAccountNo,
            accountName: this.multipleSelection1[0].payAccountName,
            unitCode: this.multipleSelection1[0].payCorpCode || this.multipleSelection1[0].settleCorpCode,
            receipayType: 'receive',
          })
          .then((data) => {
            let obj = data[0]
            this.parameter(obj)
          })
      } else {
        this.parameter()
      }
      console.log(this.multipleSelection1[0])
    },
    //申请退款参数
    parameter(data) {
      let arr = this.multipleSelection1.map((item) => {
        return {
          title: '预收可退金额',
          receivablePrerevId: item.receivablePrerevId,
          preceiveAmt: new LSnum(item.balance).toNum(2), // new LSnum(item.balance).minus(item.interTransferFee).toNum(2),
          currency: item.currency,
          recvCompCode: item.recvCompCode,
          recvBankName: data && data.settleUnitBankAcctId ? data.bankName : item.payBankName,
          recvAccountNo: data && data.settleUnitBankAcctId ? data.accountNo : item.payAccountNo,
          recvAccountName: data && data.settleUnitBankAcctId ? data.accountName : item.payAccountName,
          recvBankAccountId: data && data.settleUnitBankAcctId ? data.settleUnitBankAcctId : null,
          refund: 'pay', //判断退款接口是预收退款还是收款登记退款
          employeeName: '',
          refundType: 'overpayment',
          refundCurrency: item.currency,
          payWay: item.recvWay ? item.recvWay : '',
          settleMode: item.settleMode ? item.settleMode : '',
          transferChargeType: 'customer',
          receiveRefundAmt: new LSnum(item.balance).toNum(2), // new LSnum(item.balance).minus(item.interTransferFee).toNum(2),
          transferFeeAmt: 0,
          remark: '',
          payBankAccountId: item.compBankAccountId,
          payBankName: item.bankName,
          payAccountNo: item.accountNo,
          payAccountShortName: item.accountShortName,
          accountName: item.payAccountName,
          accountShortName: item.payAccountName,
          realRefundAmt: new LSnum(item.balance).toNum(2), // new LSnum(item.balance).minus(item.interTransferFee).toNum(2),
          rate: 1,
          trustFileIds: [],
          settleCorpCode: item.payCorpCode || item.settleCorpCode,
          isTemporary: item.isTemporary,
          payBankseqFileName: item.payBankseqFileName,
          payBankseqFileNo: item.payBankseqFileNo,
        }
      })
      this.query = arr[0]
      // 虚拟结算单位退款时可编辑账号、银行 20220630
      // if (
      //   (!this.query.recvBankName || !this.query.recvAccountNo || !this.query.recvAccountName) &&
      //   this.query.isTemporary === 'yes'
      // ) {
      //   return this.$msgErrClose(
      //     '虚拟结算单位发起退款申请，原收款单付款账户名、银行名称、账号不能为空，请先完善收款登记付款信息再发起！',
      //     5000
      //   )
      // }
      this.rejectDialogVisible = true
    },
    querySettleUnit(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString).then((data) => {
        cb(data)
      })
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
      this.finCommonSearch(data.query, this.searchOption)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({ column: 'confirmStatus', type: 'eq', value: this.buttonSearch })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      return receivablePrerevList(data)
        .then((res) => {
          this.finCommonColumns(res)
          if (customerList) return
          // if (res.data.configColumns && res.data.configColumns.length) {
          //   let columns = res.data.configColumns
          //   this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
          //   this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
          //   this.configColumns = res.data.configColumns
          // }
          if (res.code === 0) {
            let { list } = res.data
            let data = []
            list.forEach((item) => {
              // item.invoiceNo_multiValue = item.invoiceNo.split(',')
              item.invoiceNos_multiValue = item.invoiceNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.invoiceReceivableIds_multiValue = item.invoiceNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[0]
              })
              let settleCorpTypeName = item.settleCorpType.split(',')
              item.settleCorpType = settleCorpTypeName
                .map((it) => {
                  let unitTypeObj = this.dictMap['unitType'].find((el) => el.value === it)
                  return unitTypeObj && unitTypeObj['label']
                })
                .toString()
              data.push(item)
            })
            this.option1.data = data
            this.table1DataBackup = [...this.option1.data]
            this.$set(this.option1, 'emptyText', '未查询到任何数据')
            Object.assign(this.option1.pagination, res.data)
            // this.option1.pagination.currPage = res.data.currPage
            // this.option1.pagination.pageSize = res.data.pageSize
            // this.option1.pagination.totalCount = res.data.totalCount
          }
        })
        .finally(() => {
          this.lsLoading = false
        })
      // this.debounceLs(() => {
      //   this.getListAmtSummary(data)
      // })
    },
    getListAmtSummary(data) {
      getPrerevListAmtSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let labelObj = {
            preceiveAmtListLabel: '预收金额',
            preceiveBalanceAmtListLabel: '预收可用金额',
          }
          let colorObj = {
            preceiveAmtListColor: 'red', // 支持red, green, black三种值
            preceiveBalanceAmtListColor: 'green',
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
    sendMulti(data, option) {
      console.log(data, option)
      // console.log(data, option)
      if (option === this.option1) this.multipleSelection1 = data
      let data2 = { ascColumns: [], descColumns: [], query: [] }
      let ids = this.multipleSelection1.map((item) => item.receivablePrerevId).join(',')
      if (ids) {
        data2.query.push({
          column: 'receivablePrerevIds',
          type: 'eq',
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
    search(data) {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    showDetail(row) {
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: 'PrerevWriteoff',
        // path: '/finance/receivable/prerevDetail',
        query: {
          source: 'createSettlementFromPrerev',
          receivablePrerevId: row.receivablePrerevId,
        },
      })
    },
    refundDialog(val, isBreak) {
      this.rejectDialogVisible = val
      console.log(isBreak)
      if (isBreak === true) {
        this.getData()
      }
    },
    rejectSubmit() {
      this.$refs.query.validate((valid) => {
        if (valid) {
          approvePrepayApply(this.query).then((res) => {
            this.$msgSucClose('拒绝申请提交成功')
            this.rejectDialogVisible = false
          })
        }
      })
    },
    //预收款核销按钮
    receivablePrerevWriteoff() {
      if (this.multipleSelection1.length === 0) {
        this.$msgErrClose('请勾选需要预收款核销的项！')
        return
      }
      if (this.multipleSelection1.length > 1) {
        this.$msgErrClose('一次只能勾选一个预收款核销的项！')
        return
      }
      if (this.multipleSelection1[0].lockStatus !== 'unlock') {
        return this.$msgErrClose(this.multipleSelection1[0].lockReason + '，不能进行此操作！')
      }
      if (this.multipleSelection1[0].balance == 0) {
        this.$msgErrClose('预收可用余额为0，不能进行核销！')
        return
      }
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        path: '/finance/receivable/prerevWriteoff',
        query: {
          source: 'createPrerevWriteoffFrom',
          receivablePrerevId: this.multipleSelection1
            .map((item) => {
              return item.receivablePrerevId
            })
            .toString(),
        },
      })
    },
    handleExport() {
      let data = {
        columns: this.option1.columns.map((v) =>
          v.prop === 'bankseqFileCode' ? 'hasBankseqFile' : v.prop === 'payBankseqFileNo' ? 'hasPayBankseqFile' : v.prop
        ),
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      data.query = JSON.parse(JSON.stringify(this.searchBackup || []))
      if (this.multipleSelection1.length) {
        data.query = [
          {
            column: 'receivablePrerevIds',
            type: 'in',
            value: this.multipleSelection1.map((v) => v.receivablePrerevId).join(','),
          },
        ]
      }
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'receivablePrerevListExport' })
      this.lsLoading = true
      this.$store
        .dispatch('finance/downloadExcelFile', { data: data })
        .then((res) => {
          this.aTagClick(window.URL.createObjectURL(res), '预收款列表.xlsx')
        })
        .finally(() => (this.lsLoading = false))
    },
    exchangeCorpShow() {
      let rows = this.multipleSelection1
      if (rows.length !== 1) {
        return this.$msgErrClose('请勾选1个记录进行操作！')
      }
      let row = rows[0]
      // if (row.isTemporary !== 'yes') {
      //   return this.$msgErrClose('请勾选虚拟的结算单位进行操作！')
      // }
      if (row.lockStatus !== 'unlock') {
        return this.$msgErrClose(row.lockReason + '，不能进行此操作！')
      }
      this.receivablePrerevId = row.receivablePrerevId
      this.transferSettleCorpCode = row.settleCorpCode
      this.exchangeCorpDialog.show = true
    },
    // 修改结算单位
    exchangeCorp(refresh) {
      if (refresh === true) {
        this.getData()
        this.exchangeCorpDialog.show = false
      }
    },
    sendResFileList(val) {
      console.log(val)
      this.corpForm.fileId = val && val.length > 0 ? val[0].fileNo : ''
      this.corpForm.fileNo = val && val.length > 0 ? val[0].fileNo : ''
      this.corpForm.fileName = val && val.length > 0 ? val[0].name : ''
    },
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache || (this.$route.meta.refresh && timestamp - this.cTimestamp > 300)) {
      this.handleCurrentChange(1)
    }
  },
  components: {
    FinanceTable,
    FinanceSearch,
    RefundDialog,
    PreviewDialog,
    CustomColumns,
    FinanceUploadEmbed,
    ExchangeCorpDialog,
  },
}
</script>
<style>
</style>