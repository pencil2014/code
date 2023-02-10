
// 分离一些配置数据、状态、简单的操作到mixin
// 分离一些配置数据、状态、简单的操作到mixin
// 分离一些配置数据、状态、简单的操作到mixin


// TODO 状态说明
// 一般确认状态  ，就是生成结算单了要确认  ，才能进行后续的操作
// 后续操作，就会存在锁定状态，核销状态，关闭状态
// 锁定状态，就是发起了财务流程，还没有审批的中间状态，核销就是审批通过后的状态
// 关闭就是整个结算单都核销完了，就关闭了
// confirmStatus yes已确认、no未确认
// finLockStatus 锁定状态 lock已锁定 unlock未锁定
// writeoffStatus 核销状态 finish已核销 nofinish未核销  part_finish部分核销
// finUseStatus 财务状态 yes已用  no未用
// closeStatus 关闭状态 yes已关闭(表示此结算单的费用已全部核销) no 未关闭

// finLockOrUseOrClose   finLockStatus === 'lock' || finUseStatus === 'finish' || closeStatus === 'yes')
// finLockOrInvoiceOrCloseOrWriteOff    finLockStatus === 'lock' || closeStatus === 'yes'
// isWriteoff  writeoffStatus !==  "nofinish"
// invoiceApplyAvaliable  finLockStatus !== 'lock' && invoiceStatus !== "finish"
// this.option1.edit = (this.isDetailPage && this.finLockOrInvoiceOrCloseOrWriteOff) ? false : true
//
// 几个汇率逻辑
// exchangeRateList: [], // 接口返回的当日结算汇率列表
// settleExchangeRateList: [], // 结算需要用到的汇率列表, 如果是详情页，初始化由接口返回exchangeRateList，
// 币别手动变化，费用的新增、删除、搜索过滤均会触发currencyChange
// 结算币别变化currencyChange会触发settleExchangeRateList从exchangeRateList获取汇率，同时也触发settlementDetailForm.exchangeRates从exchangeRateList获取汇率
// settlementDetailForm.exchangeRates: [], // 结算汇率表格数据，可编辑，编辑后会同步到settleExchangeRateList和费用列表，
// settlementDetailForm.exchangeRatesSys: [], // 系统结算汇率表格数据，不可编辑

import { billGenerateSo, settleOrderBillGenerateSo } from '@/api/fin/bill'
import { generateBill } from '@/api/fin/settleOrderBill'
import {
  settleOrderAdd,
  settleOrderUpdate,
  generateSettleOrder,
  info,
  invoiceConfirm,
  confirm,
  close, // 删除结算单
  relationPayInfo, //新增&修改 水单
  delelteRelationPayInfo, //删除 水单
  settleOrderAgentConfirm,
  settleOrderAgentCancel,
  releaseSettleOrder,
  settleOrderInvoiceFeeList,
  splitSettleOrder,
  settleOrderAgentConfirmValidate,
  cancelConfirm,
  listReceivableRegForWriteoff,
  checkCanRelationPayInvoice,
} from '@/api/fin/settleOrder'
import { close as invoiceApplyClose } from '@/api/fin/invoiceReceivableApply'
import { badApplyCancel } from '@/api/fin/settleOrderBaddebt'
import { releaseInvoiceFee } from '@/api/fin/invoiceReceivable'
import { deleteRelationInvoice, cancelPayApplySettle, validPayApplySettle } from '@/api/fin/pay'
import EXPRESS from '@/api/fin/expressBill'
import { actualExchangeRate, listColumnConfigGet, listColumnConfigSave } from '@/api/base'
import { interTransApply, gedgingCancel } from '@/api/fin/gedging'
import { listPage } from '@/api/fin/invoiceReceivableApply'
import { dateFormat } from '@/views/finance/utils/finance'

let initRate = () => {
  return {
    systemRate: '',
    settlementRateTitle: '',
    settlementRate: null,
    exchangeRateId: null,
    lowerRate: null,
    upperRate: null,
  }
}
export const settlementMixin = {
  data() {
    let rules = { required: true, message: ' ', triggers: 'change' }
    return {
      settleRegList: [],
      feeSearchToggle: true, //费用搜索默认显示
      billDialog: false,
      billDialogForm: { lang: 'US', billFeeType: '', billType: '' },
      billDialogRules: { lang: rules, billFeeType: rules, billType: rules },
      invoiceTableOption: { data: [] },
      invoiceApplyTableOption: { data: [] },
      payApplySettleList: { data: [] }, // 核销信息列表-应付
      gendingApplyList: { data: [] }, // 对冲信息列表
      writeoffRecvList: { data: [] }, // 核销信息列表-应收
      writeoffPayList: { data: [] }, // 核销信息列表-应付
      badDebtList: { data: [] },
      orderTableOption: { data: [] },
      option1: { data: [] },
      multipleSelection1: [],
      settlementDetailForm: {
        groupStatus: '',
        badStatus: '',
        agentStatus: '',
        createdName: '',
        createdTime: '',
        settleOrderNo: '',
        settleOrderId: '',
        settleOrderStatus: '',
        settleOrderStatusLabel: '',
        finLockStatus: '',
        finLockStatusLabel: '',
        finLockReason: '',
        settleCompName: '',
        settleCorpName: '',
        settleCompCode: '',
        settleCorpCode: '',
        settleCorpObj: {},
        settleCompObj: {},
        settleCycle: '',
        settleCurrency: '',
        confirmStatus: '',
        confirmStatusLabel: '',
        latestPayDate: '',
        orderType: '',
        // orignalRecFeeSumStr: '',
        // settleRecFeeSumStr: '',
        // orignalPayFeeSumStr: '',
        // settlePayFeeSumStr: '',
        offSetFeeSumStr: '',
        offsetPayType: '',
        interTransferStatus: '',
        relationInvoiceCurrency: '',
        exchangeRates: [initRate()],
        exchangeRatesSys: [initRate()],
        exchangeRateType: '',
      },
      unsettleRecvpayType: '',
      searchWords: '',
      financePageMargin: '',
      currencyAddOriginal: [],
      exchangeRateList: [], // 接口返回的当日结算汇率列表
      settleExchangeRateList: [], // 结算需要用到的汇率列表
      timer1: null,
      timer2: null,
      invoicePaymentId: -1,
      addFeeDialogVisible: { show: false },
      relationRegDialogVisible: { show: false },
      settleOrderFeeIds: [],
      isDetailPage: false,
      sourceType: '',
      sourceOrderBillNo: '',
      billDetailParams: {},
      existFeeIds: [],
      noExchangeRate: false,
      source: '',
      billId: '',
      settleOrderBillId: '',
      settleOrderBillNo: '',
      orderNo: '',
      feeIds: '',
      settleOrderId: '',
      supplierBillId: '',
      expressBillId: '',
      row: '',
      settleOrderNo: '',
      feeSourceType: '',
      isJumpRouteFromPage: false,
      routeBackName: undefined,
      cTimestamp: 0,
      submitDisabled: false,
      vmDataBackup: '',
      isDataChangeFromBackEnd: false,
      settleCorpList: [],
      settleCompList: [],
      ExchangeRateDialogCfg: { data: [], show: false, type: '', change: false }, // 汇率弹框配置
      feeListReceive: '',
      feeListPay: '',
      writeoffStatus: '', //核销状态
      // 上传、修改委托单弹框
      orderDialogOption: {
        show: false,
        title: this.$t('Settle.uploadorder'),
        oldFile: {},
        rules: {
          file: { required: true, message: this.$t('Common.required'), trigger: 'change' },
          payName: { required: true, message: '  ', trigger: 'change' },
        },
        // formItems: [
        //   { label: '付款账户名', type: 'select', prop: 'payName', rules, propInDict: 'customerRelationType' },
        //   { label: '附件', prop: 'fileNo', type: 'file', acceptTypes: ['doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png'], limit: 1 },
        // ],
        form: { payName: '', file: '' },
      },
      isForeign: false, // 是否是国外同行、直客
      adjustRateState: false, // 是否修改过汇率
      loading: false,
      finLockOrInvoiceOrCloseOrWriteOff: false,
      finLockOrClose: false,
      finLockOrUseOrClose: false,
      isWriteoff: false,
      invoiceApplyAvaliable: false,
      // 自定义表头弹框
      customColumnsPopShow: false,
      selfColumnsBase: [],
      agentReceipayDialogVisible: false,
      agentForm: { agentCompCode: '', agentCompName: '' },
      remoteSelect1: {},
      //关联发票
      relevanceOpne: false,
      relationInvoiceForm: {
        payInfoId: '',
        settleOrderNo: '',
        currency: '',
        recvCorpName: '',
        recvCorpCode: '',
        settleCompCode: '',
        settleCompName: '',
        supplierAccountNo: '',
      },
      // exchangeRatesCash: [],
      canInvoiceAmt: { min: '', max: '' },
      resultDialogOption: {
        show: false,
        title: this.$t('Settle.exportSuc'),
        resultType: 'success',
        text_cancel: this.$t('Common.close'),
        titleText: this.$t('Settle.exportStatementSuc'),
      },
      resultDialogOption2: {
        show: false,
        title: this.$t('Settle.hedgSuc'),
        resultType: 'success',
        text_cancel: this.$t('Common.close'),
        titleText: this.$t('Settle.hedgApplySuc'),
      },
      settleOrder_gedgingApplyNoList: [],
      settleOrderBillIds: '',
      isMultiComp: false,
      sysExchangeRateList: [],
      settleRateList: [],
      gedgingRateListSys: [],
      gedgingRateList: [],
      exchangeRateTypeList: [
        { value: 'receive', label: this.$t('Hedge.collectionRate')},
        { value: 'pay', label: this.$t('Hedge.paymentRate') },
      ],
      rateType: '',
      invoiceConfirmList: [
        // { label: this.$t('Settle.confirmInvoic'), value: 'yes' },
        // { label: this.$t('Settle.noinvoicing'), value: 'no' },
      ],
      agentTypeList: [
        { label: this.$t('FeeList.expenses'), value: 'openAgentReceipayDialog' },
        { label: this.$t('Settle.withdrawal'), value: 'cancelAgentCompany' },
      ],
      singleInvoiceType: '',
      dialogVisibleO: { show: false },
      customerInfo: {},
      sellerInfo: {},
      invoiceReceivableList: [],
      applyItemGroupList: [],
      otherInvoiceInfo: {},
      orignalRecFeeSumList: [],
      orignalPayFeeSumList: [],
      settleRecFeeSumList: [],
      settlePayFeeSumList: [],
    }
  },
  methods: {
    // 费用列表oldProp转为newProp
    propOldToNew(list, arrProp, callback) {
      list.forEach((item, index) => {
        let find = arrProp.find(v => item.prop === v[0])
        if (find) {
          item.prop = find[1]
          callback && callback(index)
        }
      })
    },
    // 合计数组转为字符串
    listToStr(list, key, type) {
      this.settlementDetailForm[key] = ''
      list.forEach((v) => {
        if (type) {
          this.settlementDetailForm[key] +=
            v.currency +
            ` <span style="color:${type === 'rec' ? 'rgb(230, 57, 35)' : 'rgb(51, 177, 138)'}">${v.sumAmt}</span>` +
            ' '
        } else {
          this.settlementDetailForm[key] += v.currency + v.sumAmt + ' ' // '&nbsp;&nbsp;'
        }
      })
    },
    dealOffsetPayType(receive, pay) {
      this.settlementDetailForm.offsetPayType = receive ? this.$t('FeeList.receivable') : pay ? this.$t('FeeList.payable') : '0'
      return receive ? 'receive' : pay ? 'pay' : '0'
    },
    clearSettleFormVal(keys) {
      keys.forEach(key => this.settlementDetailForm[key] = '')
    },
    async getData() {
      if (this.source === 'createSettlementFromFeeSearch') {
        // 从供应商对账、费用列表生成结算单，直接生成结算单数据，存在本地跳到本页面使用
        this.sourceType = this.$route.query.isSupplier ? 'supplier_bill' : 'fee_list'
        this.sourceOrderBillNo = this.$route.query.isSupplier ? this.$route.query.supplierBillNo : ''
        let localData = this.$store.state._feeToSettleParams
        if (!localData) {
          this.delVisitedView()
          this.cancel()
          return
        }
        this.handleData(localData)
      } else if (this.source === 'createSettlementFromSpecial') {
        // 从专项管理费生成结算单
        this.sourceType = 'fee_list' // 结算单来源 订单 order, 账单 bill,财务费用单 finance 由上游页面传过来
        this.sourceOrderBillNo = '' // 结算单来源编号 订单号,账单号,财务费用单号 由上游页面传过来
        generateSettleOrder({ feeIds: this.feeIds })
          .then((res) => this.handleData(res))
          .catch((err) => this.catchFn(err, 'delete'))
      } else if (this.source === 'createSettlementFromOrderFeeIds') {
        // 从订单详情内费用tab生成结算单
        this.sourceType = 'order'
        this.sourceOrderBillNo = this.orderNo
        generateSettleOrder({ feeIds: this.feeIds, feeSourceType: this.feeSourceType })
          .then((res) => this.handleData(res))
          .catch((err) => this.catchFn(err, 'delete'))
      } else if (this.source === 'createSettlementFromBill') {
        // 从账单列表&订单详情费用tab账单生成结算单
        this.sourceType = 'bill'
        this.sourceOrderBillNo = this.billId
        billGenerateSo({ billId: this.billId })
          .then((res) => this.handleData(res))
          .catch((err) => this.catchFn(err))
      } else if (this.source === 'createSettlementFromSettleOrderBill') {
        // 从客户账单的月结账单tab生成结算单
        this.sourceType = 'settle_order_bill'
        this.sourceOrderBillNo = this.settleOrderBillNo
        settleOrderBillGenerateSo({ settleOrderBillId: this.settleOrderBillId })
          .then((res) => this.handleData(res))
          .catch((err) => this.catchFn(err))
      } else if (this.source === 'settlementDetail') {
        // 进入结算单详情页面
        let data = null
        if (this.settleOrderNo && this.settleOrderNo !== '') {
          data = { settleOrderNo: this.settleOrderNo }
        } else {
          data = { settleOrderId: this.settleOrderId }
        }
        info(data)
          .then((res) => this.handleData(res))
          .catch((err) => this.catchFn(err))
      } else if (this.source === 'createSettlementFromFinBill') {
        // 从费用单详情生成结算单
        this.sourceType = 'finance'
        this.sourceOrderBillNo = this.billNo
        generateSettleOrder({ feeIds: this.feeIds })
          .then((res) => this.handleData(res))
          .catch((err) => this.catchFn(err, 'delete'))
      } else if (this.source === 'createSettlementFromExpressBill') {
        // 从寄单对账生成结算单
        this.feeSourceType = this.sourceType = 'express_bill'
        this.sourceOrderBillNo = this.$route.query.supplierBillNo
        let { settleCompCode, settleCompName } = this.$route.query
        await EXPRESS.createSettleOrder({
          expressBillId: this.expressBillId,
          settleCompCode,
          settleCompName,
          feeSourceType: 'express_bill',
        })
          .then((res) => this.handleData(res))
          .catch((err) => this.catchFn(err, 'delete'))
      }
    },

    init() {
      this.loading = true
      let routeQuery = this.$route.query
      // console.log('route.query:', routeQuery)
      this.source = routeQuery.source || ''
      this.billId = routeQuery.billId
      this.billNo = routeQuery.billNo
      this.settleOrderBillId = routeQuery.settleOrderBillId
      this.settleOrderBillNo = routeQuery.settleOrderBillNo
      this.orderNo = routeQuery.orderNo
      this.feeIds = routeQuery.feeIds ? JSON.parse(routeQuery.feeIds) : routeQuery.feeIds
      this.settleOrderId = routeQuery.settleOrderId
      this.supplierBillId = routeQuery.supplierBillId
      this.expressBillId = routeQuery.expressBillId
      this.row = routeQuery.row ? JSON.parse(routeQuery.row) : routeQuery.row
      this.settleOrderNo = routeQuery.settleOrderNo
      this.feeSourceType = routeQuery.feeSourceType
      // 改成从info接口中获取状态
      // this.isWriteoff = (this.row && this.row.closeStatus === 'yes') ? true : false
      // this.finLockOrUseOrClose = (this.row && (this.row.finLockStatus === 'lock' || this.row.finUseStatus === 'yes' || this.row.closeStatus === 'yes')) ? true : false
      this.isDetailPage = this.source.indexOf('create') > -1 ? false : true

      let operationBtns = Object.assign({}, this.option.operationBtns, {
        data: [{ label: this.$t('Common.del'), action: 'Delete', show: true }],
        show: true,
      })
      let operationBtns2 = Object.assign({}, this.option.operationBtns, {
        data: [{ label: this.$t('Common.del'), show: true }],
        callback: (action, index, row) => {
          this.$confirmWarn(this.$t('Settle.confirmtodel'), () => {
            let method = releaseInvoiceFee
            let data = { invoiceReceivableId: row.invoiceReceivableId, settleOrderIds: [this.settleOrderId] }
            if (row._type == 'pay') {
              method = deleteRelationInvoice
              data = { deleteInvoiceNos: [row.invoiceNo], settleOrderNo: this.settleOrderNo }
            }
            method(data).then((res) => {
              this.$msgSucClose(this.$t('Settle.deleteSuc'))
              this.getData()
              // this.invoiceTableOption.data.splice(index, 1)
            })
          })
        },
        // show: (this.isDetailPage && this.finLockOrUseOrClose) ? false : true
      })
      if (!this.checkAuth(this.$route.name, 'btn-invoiceDelete')) operationBtns2 = false
      let operationBtns2_2 = Object.assign(
        {},
        this.option.operationBtns,
        { width: 150 },
        {
          data: [
            {
              label: this.$t('Hedge.gedgingCancel'),
              showFn: (row) =>
                this.checkAuth(this.$route.name, 'btn-invoiceApplyClose') && row.invoiceApplyStatus == 'no_invoice',
            },
          ],
          callback: (action, index, row) => {
            this.$confirmWarn(this.$t('PreClose.withdrawalTips'), () => {
              let data = { invoiceReceivableApplyIds: [row.invoiceReceivableApplyId] }
              invoiceApplyClose(data).then((res) => {
                this.$msgSucClose(this.$t('Settle.applicationsuc'))
                this.getData()
              })
            })
          },
        }
      )
      let operationBtns3 = Object.assign({}, this.option.operationBtns, {
        width: '100px',
        data: [
          { label: this.$t('Common.edit'), showFn: () => this.checkAuth(this.$route.name, 'btn-orderEdit'), action: 'edit' },
          { label: this.$t('Common.del'), showFn: () => this.checkAuth(this.$route.name, 'btn-orderDel'), action: 'delete' },
        ],
        callback: (action, index, row) => {
          if (action == 'delete') {
            this.$confirmWarn(this.$t('Settle.deletewater'), () => {
              delelteRelationPayInfo({ id: row.id }).then((res) => {
                this.$msgSucClose(this.$t('Settle.deleteSuc'))
                this.orderTableOption.data.splice(index, 1)
              })
            })
          } else if (action == 'edit') {
            this._orderIndex = index
            this._orderRow = row
            this.uploadOrder('edit')
          }
        },
      })
      this.invoiceTableOption = { ...this.option, selection: false, operationBtns: operationBtns2, rootTipsHide: true }
      this.invoiceTableOption.columns = [
        // {
        //   prop: 'invoiceNo',
        //   label: this.$t('FeeList.invoiceNo'),
        //   type: 'button',
        //   width: 130,
        //   operationBtns: {
        //     show: true,
        //     callback: (fn, index, row, option, subItem) => {
        //       if (row.fileNo) {
        //         const href = `/base/fileView/preview/${row.fileNo}/${row.fileName}`
        //         window.open(href)
        //       } else {
        //         if (row._type === 'pay') {
        //           return this.$msgWarnClose(this.$t('Settle.noattachment'))
        //         }
        //         this.previewInvoiceFromList(row.invoiceReceivableId || row.invoicePaymentId, row._type)
        //       }
        //     },
        //   },
        // },
        // { prop: 'invoiceType', label: this.$t('Settle.invoicingType'), type: 'select', width: 130 },
        // { prop: 'amt', label: this.$t('Settle.invoiceAmt') },
        // { prop: 'currency', label: this.$t('Settle.invoiceCur') },
        // { prop: 'invoiceRate', label: this.$t('Settle.invoiceRate') },
        // { prop: 'taxRate', label: this.$t('Settle.taxRate'), type: 'select', propInDict: 'taxRateInfo' },
        // { prop: 'taxAmt', label: this.$t('FeeList.taxAmt')},
        { prop: 'refAmt', label: this.$t('FinBill.ssociatAmount')},
      ]
      this.invoiceApplyTableOption = { ...this.option, selection: false, operationBtns: operationBtns2_2, rootTipsHide: true }
      this.invoiceApplyTableOption.columns = [
        {
          prop: 'invoiceReceivableApplyNo',
          label: this.$t('Charge.applicationNumber'),
          type: 'button',
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => this.showInvoiceApplyDetail(row),
          },
        },
        // { prop: 'invoiceType', label: this.$t('Settle.invoicingType'), type: 'select', width: 130 },
        // { prop: 'amt', label: this.$t('Settle.invoiceAmt')},
        // { prop: 'currency', label: this.$t('Settle.invoiceCur')},
        // { prop: 'invoiceApplyStatus', label: this.$t('Settle.invoiceStatus'), type: 'select' },
        { prop: 'createdName', label: this.$t('Settle.applicant')},
        { prop: 'createdTime', label: this.$t('Settle.applicationDate')},
      ]
      this.orderTableOption = { ...this.option, selection: false, operationBtns: operationBtns3, rootTipsHide: true }
      this.orderTableOption.columns = [
        { prop: 'payName', label: this.$t('Collect.accountName')},
        {
          prop: 'fileName',
          label: this.$t('Settle.waterbill'),
          type: 'button',
          callback: (row) => {
            window.open(this.getDownloadPath(row.fileNo))
          },
        },
        { prop: 'createdName', label: this.$t('Settle.uploader')},
        { prop: 'createdTime', label: this.$t('Settle.uploadTime')},
      ]
      this.option1 = Object.assign({}, this.option, {
        customColumns: {
          show: true,
          handleCustomColumns: () => (this.customColumnsPopShow = true),
        },
        id: 'option1',
        $name: 'SettlementDetail',
        data: [],
        tips: { text: '', show: false },
        operationBtns,
        edit: true,
        maxHeight: 400,
        sortable: true,
        sortChange: this.sortChange,
      })
      this.selfColumnsBase = [
        {
          prop: 'sourceBizNo',
          label: this.$t('PreClose.bizNo'), // 另：可通过sourceType判断，为order时为订单号，否则为费用单号（手续费归为费用单大类）
          type: 'button',
          width: 120,
          callback: (row) => {
            let sourceType = row.sourceType
            let sourceBizNo = row.sourceBizNo
            this.showOneNoDetail(sourceType, sourceBizNo, { feeId: row.feeId })
          },
        },
        { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', width: 150 },
        {
          prop: 'receipayType',
          label: this.$t('Settle.receipayType'),
          width: 80,
          type: 'select',
          propInDict: 'feeitemReceipayGroup',
          readOnly: true,
          formatter: ({ cellValue }) => {
            if (cellValue === 'receive') {
              return `<span style="color:#CD4130">${this.$t('FeeList.receivable')}</span>`
            } else if (cellValue === 'pay') {
              return `<span style="color:#33B18A">${this.$t('FeeList.payable')}</span>`
            } else {
              return this.dictMapObj.feeitemReceipayGroup[cellValue]
            }
          },
        },
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 150 },
        { prop: 'mbl', label: this.$t('FeeList.mbl'), type: 'text', width: 100 },
        { prop: 'hbl', label: this.$t('FeeList.hbl'), type: 'text', width: 100 },
        { prop: 'serviceName',label: this.$t('FeeList.serviceCodes'), type: 'text', width: 80 },
        // { prop: 'feeName', label: this.$t('FeeList.feeName'), type: 'text', width: 80 },
        { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text', width: 128 },
        { prop: 'feeAmt', label: this.$t('FeeList.feeAmt'), type: 'text', width: 100, disabled: true },
        { prop: 'canUseSettleAmt', label: this.$t('Settle.canSettleAmt'), type: 'text', width: 100, disabled: true },
        {
          prop: 'settleAmt',
          label: this.$t('Settle.settleAmt'),
          type: 'input',
          width: 100,
          validateInput: (value, row, pItem, changeE) => {
            // changeE: true, 表示change事件调用此方法，已监听input，不需监听change
            if (changeE) return
            this.validateInput(value, row, pItem, changeE)
            if (Math.abs(value) > Math.abs(row.canUseSettleAmt)) {
              this.$set(row, 'settleAmt', row.canUseSettleAmt)
              this.$msgErrClose(this.$t('Settle.cannotexceed'))
            }
            console.log('```````````input validate');
            this.$nextTick(() => this.addDelFee(false))
          },
          readOnly: false,
          disabled: true,
        },
        { prop: 'currency', label: this.$t('Settle.feeCurrency'), type: 'text', width: 80, disabled: true },
        // {
        //   prop: 'settleCurrency',
        //   label: this.$t('Settle.settleCurrency'),
        //   type: 'text'
        // },
        { prop: 'exchangeRate', label: this.$t('Settle.settleExRate'), width: 80, type: 'text', disabled: true },
        { prop: 'exchangeRateFee', label: this.$t('Settle.exSettleAmt'), width: 100, type: 'text', disabled: true },
        // { prop: 'oldSettleExRate', label: this.$t('Settle.settleExRate'), type: 'text' },
        // { prop: 'oldExSettleAmt', label: this.$t('Settle.exSettleAmt'), type: 'text' },
        { prop: 'settleCurrency', label: this.$t('Settle.settleCurrency'), width: 80, type: 'text', disabled: true },
        // { prop: 'invoiceStatus', label: this.$t('Settle.invoiceStatus'), width: 80, type: 'select', propInDict: 'feeInvoiceStatus', readOnly: true },
        // { prop: 'isIssueInvoice', label: this.$t('Settle.confirminvoi'), width: 100, type: 'select', propInDict: 'yesNo', readOnly: true },
        { prop: 'settleCycle', label: this.$t('FeeList.settleCycles'), width: 80, type: 'select', readOnly: true, propInDict: 'settleCycle' },
        // { prop: 'taxRate', label: this.$t('FeeList.taxRate'), width: 80, type: 'text', propInDict: 'taxRateInfo', isForceSelect: true },
        // { prop: 'taxAmt', label: this.$t('FeeList.taxAmt'), width: 100, type: 'text' },
        // { prop: 'feeAmtWithoutTax', label: this.$t('FeeList.feeAmtWithoutTax'), width: 100, type: 'text' },
        // { prop: 'invoiceAmt', label: this.$t('Collect.invoicedAmt'), width: 100, type: 'text' },
        // { prop: 'canInvoiceAmt', label: this.$t('Settle.invoiceableAmt'), width: 100, type: 'text' },
        { prop: 'finDate', label: this.$t('FeeList.finDate'), width: 86, type: 'text' },
      ]
      this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
      this.option1.columns = [...this.selfColumnsBase]
      listColumnConfigGet({ scenesCode: 'fin_settle_order_fee_list' }).then((res) => {
        this.columnConfig = true
        this.dealCustomColumn(res)
      })
      let dictMapCurrency = JSON.parse(JSON.stringify(this.dictMap['validCurrency']))
      let find = dictMapCurrency.find((item) => item.value === 'ORIGINAL')
      if (find) {
        find.value = 'original'
      } else {
        dictMapCurrency.push({ label: this.$t('Settle.orignalCurrency'), value: 'original' })
      }
      this.currencyAddOriginal = dictMapCurrency
      let operationBtns4 = Object.assign(
        {},
        this.option.operationBtns,
        { width: 150 },
        {
          data: [
            {
             label: this.$t('Hedge.gedgingCancel'),
              colorType: 'cancel',
              showFn: (row) => {
                if (row.applyNo) {
                  return row.status === 'pending' && this.checkAuth(this.$route.name, 'btn-cancelPayApplySettle')
                } else if (row.gedgingApplyId) {
                  return row.auditStatus === 'pending' && this.checkAuth(this.$route.name, 'btn-gedgingCancel')
                } else if (row.settleOrderBaddebtNo) {
                  return row.auditStatus === 'pending' && this.checkAuth(this.$route.name, 'btn-orderDel')
                }
              },
            },
            { label: this.$t('Settle.feeBreakdown'), showFn: (row) => row.writeoffNo && (row.settleOrderBaddebtId || row.gedgingApplyId), action: 'showFeeDetail' },
          ],
          callback: (action, index, row) => {
            console.log(row)
            if (action === 'showFeeDetail') {
              let name = row.settleOrderBaddebtId ? 'ReceiLossSettleFeeDetail' : 'GedgingSettleFeeDetail'
              this.routerPush(name, { settleOrderId: this.settleOrderId, writeoffNo: row.writeoffNo })
              return
            }
            this.$confirmWarn(this.$t('PreClose.withdrawalTips'), () => {
              let method = gedgingCancel
              let data = { gedgingApplyId: row.gedgingApplyId }
              if (row.applyNo) {
                method = cancelPayApplySettle
                data = { applyNoList: [row.applyNo] }
              } else if (row.settleOrderBaddebtId) {
                method = badApplyCancel
                data = { settleOrderBaddebtId: row.settleOrderBaddebtId }
              }
              method(data).then((res) => {
                this.$msgSucClose(this.$t('Hedge.withdrawalSuc'))
                this.getData()
              })
            })
          },
        }
      )
      let commonCfg = { ...this.option, selection: false, operationBtns: operationBtns4, rootTipsHide: true }
      this.badDebtList = {
        ...commonCfg,
        columns: [
          {
            prop: 'settleOrderBaddebtNo',
            label:  this.$t('Charge.applicationNumber'),
            type: 'button',
            minWidth: 150,
            callback: (row) => {
              this.routerPush('BadApplyDetail', { settleOrderBaddebtId: row.settleOrderBaddebtId })
            },
          },
          { prop: 'badReason', label:  this.$t('Charge.debtsReasons'), type: 'select', propInDict: 'baddebtReason' },
          { prop: 'dealWay', label:  this.$t('Common.processing'), type: 'select', propInDict: 'baddebtDealWay' },
          { prop: 'auditStatus', label:  this.$t('FinBill.approvalResult'), type: 'select' },
          // { prop: 'currency',  label: this.$t('FeeList.currency'),},
          { prop: 'witeoffSumRemark', label:  this.$t('Charge.eliminationAmt') },
          { prop: 'refuseReason', label:  this.$t('FinBill.refuseReason'), minWidth: 160 },
          { prop: 'createdName', label:  this.$t('Settle.applicant'), },
          { prop: 'createdTime', label: this.$t('Settle.applicationDate'), minWidth: 130 },
          { prop: 'auditName', label:  this.$t('FinBill.approverName'), },
          { prop: 'auditTime', label: this.$t('FinBill.approveEndTime'), minWidth: 130 },
        ],
      }
      this.gendingApplyList = {
        ...commonCfg,
        columns: [
          {
            prop: 'gedgingApplyNo',
            label:  this.$t('Settle.hedgeNo'),
            type: 'button',
            minWidth: 150,
            callback: (row) => {
              this.routerPush('GedgingDetail', { source: 'gedgingDetail', gedgingApplyId: row.gedgingApplyId })
            },
          },
          { prop: 'gedgingType', label:  this.$t('Hedge.gedgingType'), type: 'select' },
          { prop: 'gedgingCurrency', label: this.$t('FeeList.currency'), type: 'select', selectOptions: this.currencyAddOriginal },
          { prop: 'recvGedgingAmount', label:  this.$t('Hedge.recvGedgingAmount'), },
          { prop: 'payGedgingAmount', label:  this.$t('Hedge.payGedgingAmount'), },
          { prop: 'refuseReason', label:  this.$t('FinBill.refuseReason'), minWidth: 160 },
          { prop: 'createdName', label:  this.$t('Settle.applicant'), },
          { prop: 'createdTime', label: this.$t('Settle.applicationDate'), minWidth: 130 },
          { prop: 'auditName', label:  this.$t('FinBill.approverName'), },
          { prop: 'auditTime', label: this.$t('FinBill.approveEndTime'), minWidth: 130 },
        ],
      }
      this.payApplySettleList = {
        ...commonCfg,
        columns: [
          {
            prop: 'applyNo',
            label:  this.$t('Settle.paymentNo'),
            type: 'button',
            minWidth: 150,
            callback: (row) => {
              this.routerPush('SettleDetail', { applyNo: row.applyNo })
            },
          },
          { prop: 'payWay', label:  this.$t('Settle.payWay'), type: 'select' },
          { prop: 'currency', label:  this.$t('FeeList.currency') },
          { prop: 'applyPayAmt', label:  this.$t('FeeList.feeAmt') },
          { prop: 'status', label:  this.$t('Common.status'), type: 'select', propInDict: 'payApplySettleStatus' },
          { prop: 'recvAccountName', label:  this.$t('Settle.recvAccountName'), minWidth: 150 },
          { prop: 'recvAccountNo', label:  this.$t('Settle.recvAccountNo'), minWidth: 150 },
          { prop: 'refuseReason', label:  this.$t('FinBill.refuseReason'), minWidth: 160 },
          { prop: 'createdName', label:  this.$t('Settle.applicant'), },
          { prop: 'createdTime', label: this.$t('Settle.applicationDate'), minWidth: 130 },
          { prop: 'confirmName', label:  this.$t('FinBill.approverName'), },
          { prop: 'confirmTime', label: this.$t('FinBill.approveEndTime'), minWidth: 130 },
        ],
      }
      this.writeoffRecvList = {
        ...commonCfg,
        operationBtns: false,
        columns: [
          {
            prop: 'writeoffReceipayNo',
            label:  this.$t('Hedge.writeoffNo'),
            type: 'button',
            minWidth: 150,
            callback: (row) => {
              const params = { writeoffNo: row.writeoffReceipayNo }
              const query = { source: 'writeoffRecvDetail', writeoffReceipayNo: row.writeoffReceipayNo }
              this.routerPush('WriteoffRecvDetail2', query, false, params)
              // this.routerPush('WriteoffRecvDetail2', { writeoffReceipayNo: row.writeoffReceipayNo, source: 'writeoffRecv' })
            },
          },
          {
            prop: 'regNo',
            label:  this.$t('Settle.advanceReg'),
            type: 'button',
            minWidth: 150,
            callback: (row) => {
              let isPre = row.writeoffRecvSource !== 'receivable_reg'
              this.routerPush(isPre ? 'PrerevWriteoff' : 'WriteoffRecvDetail', {
                [isPre ? 'receivablePrerevNo' : 'receivableRegNo']: row.regNo,
              })
            },
          },
          { prop: 'writeoffFeeAmtDesc', label:  this.$t('Charge.writeoffAmt'), },
          { prop: 'writeoffSubType', label:  this.$t('Charge.underwritSubtypes'), type: 'select', propInDict: 'recWriteoffSubType' },
          { prop: 'writeoffName', label:  this.$t('Hedge.writeoffs') },
          { prop: 'writeoffTime', label:  this.$t('Hedge.writeoffTime'), minWidth: 130 },
        ],
      }
      this.writeoffPayList = {
        ...commonCfg,
        operationBtns: false,
        columns: [
          {
            prop: 'writeoffReceipayNo',
            label:  this.$t('Hedge.writeoffNo'),
            type: 'button',
            minWidth: 150,
            callback: (row) => {
              this.routerPush('WritePayDetail', { writeoffReceipayNo: row.writeoffReceipayNo })
            },
          },
          {
            prop: 'payOrderNo',
            label: this.$t('Settle.payOrderNo'),
            type: 'button',
            minWidth: 150,
            callback: (row) => {
              this.routerPush('OrderDetails', { payOrderNo: row.payOrderNo })
            },
          },
          { prop: 'currency', label:  this.$t('Collect.writeoffCurrency') },
          { prop: 'writeoffAmt', label:  this.$t('Charge.writeoffAmt'), },
          { prop: 'writeoffSubType', label:  this.$t('Charge.underwritSubtypes'), type: 'select', propInDict: 'writeoffSubType' },
          { prop: 'writeoffName', label:  this.$t('Hedge.writeoffs') },
          { prop: 'writeoffTime', label:  this.$t('Hedge.writeoffTime'), minWidth: 130 },
        ],
      }
      this.remoteSelect1 = {
        remoteMethod: (queryString, item) => {
          this.querySettleUnit2({ queryString, unitTypes: 'company', isAdd: true }, item)
        },
        visibleChange: (queryString, item) => {
          this.querySettleUnit2({ queryString, unitTypes: 'company', isAdd: true }, item)
        },
        change: (value, item) => { },
        remoteSelectList: [],
      }
    },

    catchFn(err, cancelStr) {
      console.log(err)
      this.loading = false
      this.cancel('', cancelStr)
    },
    // -------------------自定义表头处理 begin-------------------
    dealWriteOffColumns() {
      console.log(this.isWriteoff)
      this.option1.columns.forEach((item) => {
        if (['writeoffAmt', 'noWriteoffAmt'].includes(item.prop)) {
          item.hide = !this.isWriteoff
          // this.$set(item, 'hide', !this.isWriteoff)
        }
      })
      this.option1.columns = [...this.option1.columns]
    },
    dealExRateColumns() {
      this.option1.columns.forEach((item) => {
        if (['newSettleExRate', 'newExSettleAmt', 'diffNoWriteoffAmt', 'diffSettleAmt'].includes(item.prop)) {
          item.hide = !(this.adjustRateState && !this.canEdit)
          // this.$set(item, 'hide', !(this.adjustRateState && !this.canEdit))
        }
      })
      this.option1.columns = [...this.option1.columns]
    },
    // 自定义表头
    customColumnsPopClose(action, value) {
      console.log(value)
      this.customColumnsPopShow = false
      if (action === 'Confirm') {
        let columnList = this.getColumnsValues(value) // getColumnsValues在本页面无作用
        listColumnConfigSave({ columnList, scenesCode: 'fin_settle_order_fee_list' }).then((res) => {
          this.dealCustomColumn(res)
        })
      }
    },
    dealCustomColumn(res) {
      if (res.data?.columnList?.length) {
        let list = res.data.columnList
        let hideArr = this.selfColumnsBase.filter((item) => item.disabled)
        hideArr.forEach(({ prop }) => {
          if (!list.includes(prop)) {
            list.push(prop)
          }
        })
        this.configColumns = list
        // let arrDel = this.selfColumnsBase.map((v) => v.prop).filter((v) => !list.includes(v))
        // this.option1.columns = this.option1.columns.map((v) => {
        //   v.hide = arrDel.includes(v.prop) ? true : false
        //   return v
        // })
        this.option1.columns = list.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
        this.dealWriteOffColumns()
        this.dealExRateColumns()
        // setTimeout(() => {
        //   this.$nextTick(() => {
        //     console.log(this.option1.columns.map((item) => item.hide))
        //     console.log(this.option1.columns.map((item) => item.prop))
        //     console.log(this.option1.columns.map((item) => item.fixed))
        //   })
        // }, 300)
      }
      // -------------------自定义表头处理 end-------------------
    },
    // 费用列表排序
    sortChange(column, prop, order) {
      // console.log(column, prop, order)
      if (!order) return
      let arr = [
        'feeAmt',
        'canUseSettleAmt',
        'settleAmt',
        'exchangeRate',
        'taxRate',
        'taxAmt',
        'feeAmtWithoutTax',
        'invoiceAmt',
        'canInvoiceAmt',
      ]
      let isNum = arr.includes(prop)
      if (order === 'descending') {
        this.option1.data = this.option1.data.sort((a, b) => {
          return isNum ? b[prop] - a[prop] : b[prop] > a[prop] ? 1 : -1
        })
      } else if (order === 'ascending') {
        this.option1.data = this.option1.data.sort((a, b) => {
          return isNum ? a[prop] - b[prop] : a[prop] > b[prop] ? 1 : -1
        })
      }
    },
    // 上传客户水单
    uploadOrder(type) {
      // this._orderIndex = index
      // this._orderRow = row
      let form = this.orderDialogOption.form
      if (type !== 'edit') {
        this._orderRow = ''
        this.orderDialogOption.title = this.$t('Settle.uploadorder')
        form.payName = form.file = form.id = ''
        this.orderDialogOption.rules.file.required = true
        this.orderDialogOption.oldFile = {}
      } else {
        this.orderDialogOption.title = this.$t('Settle.modifyOrder')
        form.payName = this._orderRow.payName
        form.id = this._orderRow.id
        form.file = ''
        this.orderDialogOption.rules.file.required = false
        this.orderDialogOption.oldFile = { ...this._orderRow }
      }
      console.log(this.orderDialogOption)
      // console.log(this._orderRow );
      this.orderDialogOption.show = true
    },
    orderDialogOptionClose(tag) {
      // 关闭客户水单弹框
      let form = this.orderDialogOption.form
      const formData = new FormData()
      for (const key in form) {
        if (form[key]) {
          formData.append(key, form[key])
        }
      }
      formData.append('settleOrderNo', this.settleOrderNo)
      relationPayInfo(formData).then((res) => {
        // this._orderIndex = index
        // this._orderRow = row
        this.$msgSucClose(this._orderRow ? this.$t('Hedge.modifyTips') : this.$t('Settle.addSuc'))
        if (!this._orderRow) {
          this.orderTableOption.data.push(res.data)
        } else {
          this.orderTableOption.data.splice(this._orderIndex, 1, res.data)
        }
      })
    },
    //关联发票
    async handleRelationInvoice() {
      await checkCanRelationPayInvoice({ settleOrderNo: this.settleOrderNo })
      Object.assign(this.relationInvoiceForm, {}, this.settlementDetailForm)
      // this.relationInvoiceForm.supplierAccountNo = this.multipleSelection1[0].payInfoVo.recvAccountNo
      this.relationInvoiceForm.name = 'settlementDetail'
      this.relationInvoiceForm.currency = this.settlementDetailForm.relationInvoiceCurrency || ''
      this.relationInvoiceForm.settleCompCode = this.settlementDetailForm.settleCompCode
      this.relationInvoiceForm.recvCorpName = this.settlementDetailForm.settleCompName
      this.relationInvoiceForm.recvCorpCode = this.settlementDetailForm.settleCorpCode
      // this.relationInvoiceForm.payInfoId = [4372]
      this.relevanceOpne = true
    },
    closeDialogVisibleRelationInvoice(val, isBreak) {
      this.relevanceOpne = val
      if (isBreak === true) {
        this.getData()
      }
    },
    //发票登记
    async addInvoice(item, index) {
      await checkCanRelationPayInvoice({ settleOrderNo: this.settleOrderNo })
      let isInvoiceNo = this.invoiceTableOption.data.map((subItem) => {
        return subItem.invoiceNo
      })
      console.log(item)
      let settleOrderNoList = this.settlementDetailForm.settleOrderNo ? [this.settlementDetailForm.settleOrderNo] : []
      let query = {
        titleName: this.$t('Settle.addInvoice'),
        name: 'SettleList',
        currency: item.relationInvoiceCurrencyAmt.map((item) => item.currency).toString(),
        // currency: item.relationInvoiceCurrency,
        amt: item.relationInvoiceCurrencyAmt.map((item) => item.amt).toString(),
        supplierCorpName: item.settleCorpName,
        supplierCorpCode: item.settleCorpCode,
        recvAccountNo: '',
        settleOrderNoList,
        isRepeatInvoiceNo: this.isRepeat(isInvoiceNo),
        settleCompCode: item.settleCompCode,
        relationInvoiceCurrencyAmt: item.relationInvoiceCurrencyAmt,
      }
      this.routerPush('InvoicePaymentListReg', query)
    },
    isRepeat(arr) {
      var hash = {}
      for (var i in arr) {
        if (hash[arr[i]]) {
          return true
        }
        hash[arr[i]] = true
      }
      return false
    },
    // 导出对账单按钮
    handleCommand() {
      this.billDialog = true
      this.$nextTick(() => this.$refs.billDialogForm.resetFields())
    },
    // 导出对账单弹框 确认按钮
    exportBill() {
      this.$refs.billDialogForm.validate((valid) => {
        if (!valid) return
        this.billDialog = false
        let billDetailParams = {
          settleOrderNo: this.settlementDetailForm.settleOrderNo,
          soureType: 'settleOrder',
        }
        if (this.billDialogForm.billType == 'bill') {
          return generateBill({ ...this.billDialogForm, ...billDetailParams }).then((res) => {
            if (res.data.length) {
              if (res.data.length === 1) {
                this.routerPush('BillDetail', { billId: res.data[0].orderBillId })
              } else {
                this.settleOrderBillIds = res.data.map((item) => item.orderBillNo).toString()
                this.resultDialogOption.show = true
              }
            }
          })
        }
        this.routerPush('SettlementBillDetail', {
          billDetailParams: JSON.stringify({ ...this.billDialogForm, ...billDetailParams }),
        })
      })
    },
    billTypeChange(val) {
      console.log(val)
      if (val === 'bill') {
        this.billDialogForm.billFeeType = 'fee_amt'
      }
    },
    // 对账单列表
    openBillList() {
      this.routerPush('SettlementBillList', {
        settleOrderNo: this.settlementDetailForm.settleOrderNo,
        settleOrderId: this.settlementDetailForm.settleOrderId,
      })
      console.log('this.settlementDetailForm.settleOrderNo:', this.settlementDetailForm.settleOrderNo)
    },
    // 释放未销费用    部分核销，未关闭，未锁定的 需要支持释放未销费用
    releaseSettleOrder() {
      this.$confirmWarn(this.$t('Settle.unexpensedTips'), () => {
        this.loading = true
        releaseSettleOrder({ settleOrderId: this.settleOrderId })
          .then((res) => {
            this.$msgSucClose(this.$t('Settle.outstanding'))
            this.getData()
          })
          .finally(() => (this.loading = false))
      })
    },
    // 删除结算单
    splitSettleOrder() {
      this.$confirmWarn(this.$t('Settle.splitting'), () => {
        this.loading = true
        splitSettleOrder({ settleOrderId: this.settleOrderId })
          .then((res) => {
            this.$msgSucClose(this.$t('Settle.splitSuc'))
            this.routerDelBack(true)
          })
          .finally(() => (this.loading = false))
      })
    },
    // 删除结算单
    settlementDelete() {
      this.$confirmWarn(this.$t('Settle.confDelTips'), () => {
        this.loading = true
        close({ settleOrderIds: [this.settleOrderId] })
          .then((res) => {
            this.$msgSucClose(this.$t('Settle.deleteSuc'))
            this.routerDelBack(true)
          })
          .finally(() => (this.loading = false))
      })
    },
    // 确认结算单
    settlementConfirm() {
      if (this.isDetailPageChange()) {
        return this.$msgErrClose(this.$t('Settle.savefirst'))
      }
      this.$confirmWarn(this.$t('Settle.statementConfTips'), () => {
        this.loading = true
        confirm({ settleOrderId: this.settlementDetailForm.settleOrderId })
          .then((res) => {
            this.$msgSucClose(this.$t('Settle.stateConfSuc'))
            this.refreshView('SettlementList')
            this.getData()
          })
          .finally(() => (this.loading = false))
      })
    },
    // 撤销确认结算单
    settlementCancelConfirm() {
      this.$confirmWarn(this.$t('Settle.revokeTips'), () => {
        this.loading = true
        cancelConfirm({ settleOrderId: this.settlementDetailForm.settleOrderId })
          .then((res) => {
            this.$msgSucClose(this.$t('Settle.revokeSuc'))
            this.refreshView('SettlementList')
            this.getData()
          })
          .finally(() => (this.loading = false))
      })
    },
    cancel(refresh, del) {
      if (del === 'delete') this.delVisitedView()
      if (this.$route.query.back == 2) {
        this.routerDelBack(true, true)
        return
      }
      // 实现在结算单详情操作（坏账/对冲）申请成功，返回结算单列表要更新列表数据，使该结算单消失（状态改变）
      // this.$route.query.applySuccess = true // temp
      console.log('this.$route.query.applySuccess: ', this.$route.query.applySuccess)
      if (this.$route.query.applySuccess) {
        refresh = true
      }
      // 使用routerMixin里面的返回
      if (refresh) {
        // 此处特殊处理生成结算单返回订单费用刷新数据的问题
        this.isJumpRouteFromPage = true
      }
      this.routerBack(refresh)
      return
    },
    // 确认开票
    invoiceConfirm(val) {
      // if (this.isDetailPageChange()) {
      //   return this.$msgErrClose(this.$t('Settle.savefirst'))
      // }
      // this.loading = true
      // let data = { settleOrderIds: [this.settleOrderId], isIssueInvoice: val }
      // invoiceConfirm(data)
      //   .then((res) => {
      //     if (res.data.allFinish) {
      //       this.$msgSucClose(val === 'yes' ? '确认开票成功！' : '确认不开票成功！')
      //     } else {
      //       this.$msgSucClose(val === 'yes' ? '确认开票成功，已过滤不可开票费用！' : '确认不开票成功，已过滤不可开票费用！')
      //     }
      //     this.getData()
      //   })
      //   .finally((err) => this.loading = false)
    },
    // 查看发票详情
    showInvoiceApplyDetail(obj) {
      // let data = {
      //   currPage: 1,
      //   pageSize: 10,
      //   columns: [],
      //   query: [
      //     { column: 'invoiceReceivableApplyNo', type: 'like', value: obj.invoiceReceivableApplyNo },
      //     { column: 'confirmStatus', type: 'eq', value: 'pass' },
      //   ],
      // }
      // listPage(data).then((res) => {
      //   if (res.data.list && !res.data.list.length) {
      //     return this.$msgErrClose('无查看此发票的权限！')
      //   }
      //   let row = res.data.list && res.data.list.length ? res.data.list[0] : {}
      //   // 未提交且未关闭，进入申请页面，其它进入详情页面
      //   if (row.commitStatus === 'no' && row.invoiceApplyStatus !== 'close') {
      //     let query = {
      //       source: 'draft',
      //       invoiceReceivableApplyId: row.invoiceReceivableApplyId,
      //     }
      //     this.routerPush('InvoiceReceivableApply', query)
      //   } else {
      //     let query = {
      //       source: 'apply',
      //       invoiceReceivableApplyId: row.invoiceReceivableApplyId,
      //     }
      //     this.routerPush('InvoiceReceivableApplyDetail', query)
      //   }
      // })
    },
    // 费用代收付下拉
    handleAgent(type) {
      this[type]()
    },
    // 费用代收付
    openAgentReceipayDialog() {
      let data = { settleOrderNo: this.settleOrderNo }
      settleOrderAgentConfirmValidate(data).then((res) => {
        this.agentReceipayDialogVisible = true
      })
    },
    // 费用代收付-确定
    setAgentCompany() {
      this.$refs.agentForm.validate((valid) => {
        if (valid) {
          let data = {
            settleOrderNo: this.settleOrderNo,
            agentCompCode: this.agentForm.agentCompCode,
          }
          this.btnLoading = true
          settleOrderAgentConfirm(data)
            .then((res) => {
              this.agentReceipayDialogVisible = false
              this.getData()
              this.$msgSucClose(this.$t('Settle.paymentSuc'))
            })
            .finally(() => (this.btnLoading = false))
        }
      })
    },
    // 撤销代收付
    cancelAgentCompany() {
      let bool = this.settlementDetailForm.agentCompCode ? true : false
      if (!bool) {
        return this.$msgErrClose(this.$t('FeeList.noNeedTips'))
      }
      this.$confirmWarn(this.$t('Settle.revokedTips'), () => {
        let data = { settleOrderNo: this.settleOrderNo }
        settleOrderAgentCancel(data).then((res) => {
          this.getData()
          this.$msgSucClose(this.$t('FeeList.cancelTips'))
        })
      })
    },
    // 付款申请
    payApply() {
      if (this.isDetailPageChange()) {
        return this.$msgErrClose(this.$t('Settle.savefirst'))
      }
      if (this.settlementDetailForm.confirmStatus !== 'yes') {
        return confirm({ settleOrderId: this.settlementDetailForm.settleOrderId }).then((res) => {
          this.refreshView('SettlementList')
          this.getData()
          this.payApply2()
        })
      }
      this.payApply2()
    },
    payApply2() {
      validPayApplySettle({ settleOrderIds: [this.settlementDetailForm.settleOrderId] }).then(res => {
        if (res.data.validResult !== 'pass') {
          return this.$msgErrClose(res.data.failReason)
        }
        let str = '' // '确认付款申请？'
        if (res.data.hasBlack === 'yes') {
          str = res.data.warnMsg // `结算单位：${res.data.hasBlackSettleUnitName}，已是黑名单请确认是否发起付款申请？`
          this.$confirmWarn(str, () => {
            this.routerPush('SettlementPayApply', { settleOrderId: this.settleOrderId })
          })
        } else {
          this.routerPush('SettlementPayApply', { settleOrderId: this.settleOrderId })
        }
      })
    },
    // 对冲申请
    createGedging() {
      if (this.isDetailPageChange()) {
        return this.$msgErrClose(this.$t('Settle.savefirst'))
      }
      this.routerPush('CreateGedging', {
        source: 'createGedging',
        settleOrderId: this.settleOrderId,
        settleOrderFeeIds: JSON.stringify(this.option1.data.map((item) => item.settleOrderFeeId)),
      })
    },
    // 坏账申请
    badApply() {
      if (this.isDetailPageChange()) {
        return this.$msgErrClose(this.$t('Settle.savefirst'))
      }
      this.routerPush('SettleOrderBadApply', {
        source: 'createSettleOrderBaddebt',
        settleOrderNo: this.settlementDetailForm.settleOrderNo,
      })
    },
    // 开票申请
    invoiceApply() {
      // if (this.isDetailPageChange()) {
      //   return this.$msgErrClose(this.$t('Settle.savefirst'))
      // }
      // let arr = this.multipleSelection1.filter((item) => item.feeCode.toUpperCase() !== 'HZSS')
      // if (arr.length > 0) {
      //   let taxRate = arr[0].taxRate
      //   let bool = arr.every((item) => item.taxRate === taxRate)
      //   if (!bool) {
      //     return this.$msgErrClose('各条费用的税率不一致，不能一起开票！')
      //   }
      //   let list = arr.filter((v) => !v.invisible)
      //   this.settleOrderInvoiceFeeList(list)
      // } else {
      //   let list = this.option1.data.filter((v) => !v.invisible && v.feeCode.toUpperCase() !== 'HZSS')
      //   let taxRate = list[0].taxRate
      //   let bool = list.every((item) => item.taxRate === taxRate)
      //   if (!bool) {
      //     return this.$msgErrClose('各条费用的税率不一致，不能一起开票！')
      //   }
      //   this.settleOrderInvoiceFeeList(list)
      // }
    },
    settleOrderInvoiceFeeList(list) {
      // let data = { settleOrderIds: [this.settleOrderId], settleOrderFeeIds: list.map((item) => item.settleOrderFeeId) }
      // settleOrderInvoiceFeeList(data).then((res) => {
      //   if (!res.data.settleOrderFeeList.find((item) => item.openerReceiveInvoice === 'yes')) {
      //     return this.$msgErrClose('不存在可开票的费用名称！')
      //   }
      //   if (!res.data.invoiceBalance) {
      //     return this.$msgErrClose('费用扎差后无可开票金额！')
      //   }
      //   if (res.data.settleOrderFeeList.find((item) => item.openerReceiveInvoice === 'no')) {
      //     this.$confirmWarn('存在不可开票费用名称，确认是否继续开票？', () => {
      //       this.goPageInvoiceApply(list)
      //     })
      //   } else {
      //     this.goPageInvoiceApply(list)
      //   }
      // })
    },
    goPageInvoiceApply(list) {
      this.routerPush('InvoiceReceivableApply', {
        source: 'settleInvoice',
        settleOrderId: JSON.stringify([this.settleOrderId]),
        settleOrderFeeIds: JSON.stringify(list.map((item) => item.settleOrderFeeId)),
      })
    },
    // 内部转移对冲
    interTransApply() {
      if (this.isDetailPageChange()) {
        return this.$msgErrClose(this.$t('Settle.savefirst'))
      }
      this.$confirmWarn(this.$t('Settle.hedrecognized'), () => {
        interTransApply({ settleOrderId: this.settleOrderId }).then((res) => {
          this.$msgSucClose(this.$t('Settle.hedgeApproval'))
          this.getData()
        })
      })
    },
    // 打开添加费用弹框
    openAddFeeDialog() {
      this.existFeeIds = this.option1.data.map((item) => item.feeId)
      this.addFeeDialogVisible.show = true
    },
    relationRegDialog() {
      this.lsLoading = true
      listReceivableRegForWriteoff({
        settleOrderIds: [this.settleOrderId],
        settleOrderFeeIds: this.settleOrderFeeIds,
      })
        .then((res) => {
          this.settleRegList = res.data
          this.relationRegDialogVisible.show = true
        })
        .finally(() => (this.lsLoading = false))
    },
    clearSearch() {
      this.search()
    },
    settleCorpObjChange(newVal) {
      this.settlementDetailForm.settleCycle = newVal.settleCycle
    },
    saveSettlement() {
      try {
        if (this.isGedgingHide) {
          this.$refs.settlementForm.validateField('exchangeRateType', (valid) => {
            this.$msgErrClose(this.$t('Hedge.exchangeTips'))
            throw new Error('')
          })
        }
        if (this.isGedging) {
          let { offsetPayType, exchangeRateType } = this.settlementDetailForm
          if ((offsetPayType === this.$t('FeeList.receivable') && exchangeRateType === 'pay') || (offsetPayType === this.$t('FeeList.payable') && exchangeRateType === 'receive')) {
            this.$confirmWarn({ body: this.$t('Settle.becomesta'), confirm: this.$t('Common.yes'), cancel: this.$t('Common.no') }, () => this.saveSettlement0())
            return
          }
        }
        this.saveSettlement0()
      } catch (error) { }
    },
    // 保存结算单
    saveSettlement0() {
      let taxRates = [...new Set(this.option1.data.map((v) => v.taxRate))]
      if (taxRates.length > 1) {
        this.$confirmWarn({ body: this.$t('Settle.inconsistent'), confirm: this.$t('Common.yes'), cancel: this.$t('Common.no') }, () => this.saveSettlement1())
        return
      }
      this.saveSettlement1()
    },
    // 保存结算单-通过税率提醒
    async saveSettlement1() {
      let compConfirmValidate = await this.compConfirmValidate()
      if (compConfirmValidate === false) { // 未提示“当结算单中包含海外分公司和国内分公司的费用”，才判断是否生成集团结算单
        let settleCompCode = this.settlementDetailForm.settleCompObj.settleCompCode || this.settlementDetailForm.settleCompCode
        let settleCompName = this.settlementDetailForm.settleCompObj.settleCompName || this.settlementDetailForm.settleCompName
        let arrSet = [...new Set(this.option1.data.map((v) => v.settleCompCode))]
        console.log(arrSet, settleCompCode, settleCompName, this.sourceType === 'express_bill', this.$route.query.settleCompCode)
        if (arrSet.length > 1) {
          this.$confirmWarn({ body: this.$t('Settle.groupGen'), confirm: this.$t('Common.yes'), cancel: this.$t('Common.no') }, () => this.saveSettlement2())
          return
        } else if (arrSet[0] !== settleCompCode) {
          this.$confirmWarn({ body: this.$t('Settle.groupGen'), confirm: this.$t('Common.yes'), cancel: this.$t('Common.no') }, () => this.saveSettlement2())
          return
        }
        //  {
        //   if (this.sourceType === 'express_bill') {
        //     if (arrSet[0] !== this.$route.query.settleCompCode) {
        //       this.$confirmWarn({ body: this.$t('Settle.groupGen'), confirm: this.$t('Common.yes'), cancel: this.$t('Common.no') }, () => this.saveSettlement2())
        //       return
        //     }
        //   } else if (arrSet[0] !== this.$store.state.user.userInfo.settleCompanyCode) {
        //     this.$confirmWarn({ body: this.$t('Settle.groupGen'), confirm: this.$t('Common.yes'), cancel: this.$t('Common.no') }, () => this.saveSettlement2())
        //     return
        //   }
        // }
        this.saveSettlement2()
      } else {
        this.saveSettlement2()
      }
    },
    // 保存结算单-通过集团结算单提醒
    saveSettlement2() {
      let data = {
        // settleOrderNo: this.settlementDetailForm.settleOrderNo, // 无需传此字段
        exchangeRateType: this.settlementDetailForm.exchangeRateType,
        settleCurrency: this.settlementDetailForm.settleCurrency,
        settleCycle: this.settlementDetailForm.settleCycle,
        exchangeRateList: this.exchangeRateList,
        settleOrderFeeList: this.option1.data,
        sourceType: this.sourceType,
        sourceOrderBillNo: this.sourceOrderBillNo,
        latestPayDate: this.settlementDetailForm.latestPayDate
          ? dateFormat('yyyy-mm-dd', this.settlementDetailForm.latestPayDate)
          : '',
        settleCorpCode: this.settlementDetailForm.settleCorpObj.settleCorpCode || this.settlementDetailForm.settleCorpCode,
        settleCorpName: this.settlementDetailForm.settleCorpObj.settleCorpName || this.settlementDetailForm.settleCorpName,
        settleCompCode: this.settlementDetailForm.settleCompObj.settleCompCode || this.settlementDetailForm.settleCompCode,
        settleCompName: this.settlementDetailForm.settleCompObj.settleCompName || this.settlementDetailForm.settleCompName,
      }
      // let { settleCompCode, settleCompName } = this.$route.query
      // if (settleCompCode && this.sourceType === 'express_bill') {
      //   data.settleCompCode = settleCompCode
      //   data.settleCompName = settleCompName
      // }
      if (!this.isDetailPage) {
        if (this.source === 'createSettlementFromBill') {
          data.orderBillId = this.billId
        }
        this.submitDisabled = true
        settleOrderAdd(data)
          .then((res) => {
            this.$msgSucClose(this.$t('Settle.statementSuc'))
            // // 此情况相当于点击跳转路由（测试提返回订单的全部费用页面刷新结算单编号）---不使用该方法，使用下面的方法
            // this.isJumpRouteFromPage = true
            // // 添加判断,如果是从费用单生成结算单，返回时不再更新from，to，如果更新会在费用单详情和结算单详情来回跳
            // if(["createSettlementFromFinBill","createSettlementFromSupplierBill","createSettlementFromExpressBill"].indexOf(this.source) > -1){
            //   this.isJumpRouteFromPage = false
            // }
            if (!this.checkAuth('SettlementDetail')) {
              setTimeout(() => {
                this.submitDisabled = false
                if (!this.$route.query.newWdo) {
                  this.delVisitedView(this.$route)
                } else {
                  window.close()
                }
              }, 600)
            } else {
              this.submitDisabled = false
              this.isJumpRouteFromPage = true
              this.delVisitedView(this.$route)
              this.routerPush('SettlementDetail', { source: 'settlementDetail', settleOrderNo: res.data, back: 2 })
            }
          })
          .catch((err) => {
            console.log(err)
            this.submitDisabled = false
          })
      } else {
        data.settleOrderId = this.settleOrderId
        this.submitDisabled = true
        settleOrderUpdate(data)
          .then((res) => {
            this.submitDisabled = false
            this.$msgSucClose(this.$t('Settle.saveStaSuc'))
            this.handleData(res)
          })
          .catch((err) => {
            console.log(err)
            this.submitDisabled = false
            // this.delVisitedView(this.$route)
            // this.cancel()
          })
      }
    },
    search(list) {
      this.$nextTick(() => {
        this.currencyChange(this.settlementDetailForm.settleCurrency)
      })
    },
    isDetailPageChange() {
      if (this.isDetailPage && this.canEdit) {
        let list = JSON.parse(JSON.stringify(this.option1.data))
        let { settleOrderFeeList, settleCorpCode, settleCycle, settleCorpName } = this.backupData || {}
        let formSettleCorpCode = this.settlementDetailForm.settleCorpObj.settleCorpCode || this.settlementDetailForm.settleCorpCode
        if (settleCorpCode !== formSettleCorpCode
          || settleCycle !== this.settlementDetailForm.settleCycle
          || settleOrderFeeList.length !== list.length) {
          console.log(settleCorpCode, settleCycle, settleCorpName, settleOrderFeeList.length, list.length);
          console.log(formSettleCorpCode, this.settlementDetailForm.settleCycle, this.settlementDetailForm.settleCorpName);
          return true
        }
        let flag = false
        settleOrderFeeList.forEach((item, index) => {
          let feeItem = list.find(v => item.feeId === v.feeId)
          if (!feeItem) {
            flag = true
            return
          }
          if (item.settleAmt != feeItem.settleAmt || item.settleCurrency !== feeItem.settleCurrency || item.exchangeRate !== feeItem.exchangeRate) {
            console.log(item.feeId, feeItem.feeId, item.settleAmt, feeItem.settleAmt, item.settleCurrency, feeItem.settleCurrency, item.exchangeRate, feeItem.exchangeRate);
            flag = true
          }
        })
        return flag
      }
    },
  },
  computed: {
    canEdit() {
      // console.log(
      //   !this.isDetailPage ||
      //   this.settlementDetailForm.agentEditPermission ||
      //   (this.settlementDetailForm.agentStatus !== 'yes' && this.settlementDetailForm.confirmStatus == 'no')
      // )
      return (
        !this.isDetailPage ||
        this.settlementDetailForm.agentEditPermission ||
        (this.settlementDetailForm.agentStatus !== 'yes' && this.settlementDetailForm.confirmStatus == 'no')
      )
    },
    isBadDebt() {
      return this.settlementDetailForm.badStatus === 'yes'
    },
    isGedging() {
      console.log(this.rateType, this.isGedgingSettle(this.rateType));
      return this.isGedgingSettle(this.rateType)
      let list = this.option1.data || []
      let receipayType = [...new Set(list.map((item) => item.receipayType))]
      if (receipayType.length > 1) return true
      let amtArr = list.filter((item) => item.feeAmt > 0)
      if (amtArr.length !== list.length) return true
      return false
    },
    feeAllPay() {
      return this.option1.data.every(v => v.receipayType === 'pay')
    },
    feeAllRec() {
      return this.option1.data.every(v => v.receipayType === 'receive')
    },
    exchangeRateTypeDisabled() {
      let list = this.option1.data || []
      return list.every(v => v.currency === v.settleCurrency)
    },
    isGedgingHide() {
      return this.isGedging && !this.settlementDetailForm.exchangeRateType && this.canEdit && !this.exchangeRateTypeDisabled
    },
    detailAmtSummaryOption() {
      return {
        sumKey: 'sumAmt',
        labelWidth: 230,
        sumList: [
          { label: this.$t('Settle.originalAmt'), list: this.orignalRecFeeSumList || [], color: 'red' },
          { label: this.$t('Settle.originapayableAmt'), list: this.orignalPayFeeSumList || [], color: 'green' },
          { label: this.$t('Settle.totalsettlement'), list: this.settleRecFeeSumList || [], color: 'red' },
          { label: this.$t('Settle.totalpayable'), list: this.settlePayFeeSumList || [], color: 'green' },
        ],
      }
    },
  },
}