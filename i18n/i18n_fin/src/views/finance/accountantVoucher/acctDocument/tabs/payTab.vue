<template>
  <div
    class="finance-tab-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption1" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button
            v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-voucherView')"
            class="finance-btn"
            @click="generateVoucher(true)"
            size="mini"
            type="primary"
          >{{$t('PayApplyList.previewVoucher')}}</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-voucherCreate')"
            class="finance-btn"
            @click="generateVoucher"
            size="mini"
            type="primary"
          >{{$t('PayApplyList.generateVoucher')}}</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-voucherDel')"
            class="finance-btn"
            @click="delVoucher"
            size="mini"
            type="danger"
          >{{$t('PayApplyList.deleteVoucher')}}</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-handleExport')"
            class="finance-btn"
            @click="handleExport"
            size="mini"
          >{{$t('Common.export')}}</el-button>
        </div>
        <div class="money-box-right">
          <el-radio-group v-model="hasVoucher" size="mini">
            <el-radio-button label>{{$t('Common.all')}}</el-radio-button>
            <el-radio-button label="no">{{$t('Common.notGenerated')}}</el-radio-button>
            <el-radio-button label="yes">{{$t('Common.generated')}}</el-radio-button>
          </el-radio-group>
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <PreviewDialog
      ref="PreviewDialog"
      :dialogOption="previewDialog"
      @generate="generateVoucher"
      :bizNo="true"
      :showDel="checkAuth($route.name, 'tab-writeoffPayList', 'btn-delVoucher') || checkAuth($route.name, 'tab-writeoffPayList', 'btn-voucherDel')"
      :showCreate="checkAuth($route.name, 'tab-writeoffPayList', 'btn-Voucher') || checkAuth($route.name, 'tab-writeoffPayList', 'btn-voucherCreate')"
    />
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
import {
  queryWriteoffPayPageList,
  queryWriteoffPayPageSummary,
  exAcctWriteoffPayPageList,
  exAcctWriteoffPayPageSummary,
} from '@/api/fin/pay'
import { exReceipayWriteOffGenerate, exVoucherDelete } from '@/api/fin/voucher/'
import { bankList, listByRole } from '@/api/base'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import { bankAccountListAll } from '@/api/fin/settleUnitBankAcct'
export default {
  name: 'writeoffPayList',
  label: '付款核销',
  mixins: [mixin, mixin2, routerMixin],
  data() {
    let isVoucherRoute = true
    return {
      pageSizeUrl: isVoucherRoute ? exAcctWriteoffPayPageList('geturl') : queryWriteoffPayPageList('geturl'),
      keyDownActive: true,
      hasVoucher: '',
      isVoucherRoute,
      writeoffReceipayNo: '',
      writeoffReceipayId: 0,
      query: {
        writeoffReceipayNos: [],
        bizType: '',
      },
      searchBackup: [],
      currentComponent: '',
      rejectDialogVisible: false,
      option1: {},
      option2: {},
      searchOption1: {},
      table1DataBackup: [],
      table2DataBackup: [],
      isAddPay: false,
      multipleSelection1: [],
      multipleSelection2: [],
      form: {
        orderNo: '',
        creationDate: '',
        billNo: '',
        settleCorpName: '',
        settleCorpCode: '',
      },
      orderNo: '',
      selectedOptionItem: '',
      dialogVisible: false,
      previewDialog: {
        show: false,
        title: this.$t('Common.previewVoucher'),
        seqNos: '',
        seqNo: '',
        showData: {},
        isEx: true,
      },
      // 升序
      ascColumns: [],
      // 降序
      descColumns: [],
      // 初始表头
      selfColumnsBase: [
        {
          disabled: true,
          prop: 'writeoffReceipayNo',
          label: this.$t('Hedge.writeoffNo'),
          width: '150px',
          type: 'button',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'recvCorpName',
          label: this.$t('FeeList.settleCorp'),
          width: '150px',
          type: 'text',
        },
        {
          prop: 'unitType',
          label: this.$t('FeeList.settleCorpType'),
          width: '120px',
          type: 'select',
          sortable: false,
          propInDict: 'settleUnitType',
          formatter: ({ row }, column) => {
            let list = row.unitType.split(',')
            if (list.length) {
              let data = []
              list.forEach((item) => {
                data.push(this.dictMapObj.settleUnitType[item])
              })
              return data.toString()
            }
          },
        },
        {
          prop: 'isTemporarySettleUnit',
          label: this.$t('Collect.isVirtual'),
          type: 'select',
          propInDict: 'yesNo',
        },
        {
          prop: 'payOrderNo',
          label: this.$t('Settle.payOrderNo'),
          width: '150px',
          type: 'button',
          action: 'showDetail',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              if (action === 'showDetail') {
                let query = {
                  payOrderNo: row.payOrderNo,
                }
                // this.routerPush('OrderDetails', query)
                this.$emit('update:isJumpRouteFromPage', true)
                this.$router.push({ name: 'OrderDetails', query })
              }
            },
          },
        },
        {
          prop: 'orderNo',
          label: this.$t('FeeList.orderNo'),
          width: 140,
          type: 'columnTip',
          sortable: false,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, { row }, index) => {
              let orderNoList = row.orderNo_multiValue
              let sourceTypeList = row.sourceType_multiValue
              let orderNo = orderNoList[index]
              let sourceType = sourceTypeList[index]
              let sourceBizNo = orderNo
              this.$emit('update:isJumpRouteFromPage', true)
              this.showOneNoDetail(sourceType, sourceBizNo, { feeId: '' })
            },
          },
        },
        { prop: 'bdEmployeeName', label: this.$t('FeeList.bdEmployeeId'), width: 100, type: 'text', sortable: false },
        { prop: 'custName', label: this.$t('FeeList.custId'), width: 150, type: 'text', sortable: false },
        {
          prop: 'mbl',
          label: 'MBL',
          type: 'tooltip',
          sortable: false,
        },
        {
          prop: 'hbl',
          label: 'HBL',
          type: 'tooltip',
          sortable: false,
        },
        {
          prop: 'payWay',
          label: this.$t('Settle.payWay'),
          width: 100,
          type: 'select',
          propInDict: 'payWay',
        },
        {
          label: this.$t('Settle.settleMode'),
          type: 'select',
          prop: 'settleMode',
          propInDict: 'bankAccountSettleMode',
          width: 100,
          multi: true,
        },
        {
          prop: 'orderType',
          label: this.$t('PayApplyList.payOrderType'),
          width: 100,
          type: 'select',
          propInDict: 'payOrderType',
        },
        {
          prop: 'settleCompName',
          label: this.$t('Settle.branchCompany'),
          type: 'text',
          width: 150,
        },
        {
          prop: 'differenceType',
          label: this.$t('PayApplyList.differenceType'),
          type: 'select',
          width: 100,
        },
        {
          prop: 'differenceAmt',
          label: this.$t('Supplier.balance'),
          type: 'text',
        },
        {
          prop: 'differenceDealway',
          label: this.$t('PayApplyList.differenceDealway'),
          type: 'select',
          width: 120,
          propInDict: 'payDifferenceDealway',
        },
        {
          prop: 'groupSettleCompName',
          label: this.$t('PayApplyList.interSettleBranch'),
          type: 'text',
          width: 150,
        },
        // {
        // 	prop: 'recheckStatus',
        // 	label: '核销状态',
        // 	type: 'select',
        // 	propInDict: "writeoffRecheckStatus"
        // },
        {
          prop: 'writeoffSubType',
          label: this.$t('PayApplyList.writeoffSubType'),
          width: 100,
          type: 'select',
          propInDict: 'writeoffSubType',
        },
        {
          prop: 'payBankName',
          label: this.$t('PayApplyList.payBankName'),
          type: 'text',
        },
        {
          prop: 'payAccountShortName',
          label: this.$t('PayApplyList.payAccountShortName'),
          width: 120,
          type: 'text',
        },
        // {
        // 	prop: 'payAccountShortName',
        // 	label: this.$t('Collect.accountName'),
        // 	width:120,
        // 	type: 'text',
        // },
        {
          prop: 'payAccountNo',
          label: this.$t('PayApplyList.payAccountNo'),
          width: 120,
          type: 'text',
        },
        { prop: 'recvBankName', label: this.$t('PayApplyList.recvBankName'), width: 125 },
        { prop: 'recvBankBranch', label: this.$t('PayApplyList.recvBankBranch'), type: 'text', width: 120 },
        { prop: 'recvAccountName', label: this.$t('PayApplyList.recvAccountName'), width: 150 },
        { prop: 'recvAccountNo', label: this.$t('PayApplyList.recvAccountNo'), width: 120 },
        {
          prop: 'applyAmt',
          label: this.$t('PayApplyList.applyAmt'),
          type: 'text',
        },
        {
          prop: 'realPayAmt',
          label: this.$t('PayApplyList.realPayAmt'),
          type: 'text',
        },
        {
          prop: 'totalWirteoffAmt',
          label: this.$t('Charge.writeoffAmt'),
          type: 'text',
        },
        {
          prop: 'currency',
          label: this.$t('FeeList.currency'),
          type: 'text',
        },
        {
          prop: 'receivePayDate',
          label: this.$t('PayApplyList.receivePayDate'),
          type: 'text',
        },
        {
          prop: 'voucherStatus',
          label: this.$t('Hedge.voucherStatus'),
          customColumnHide: isVoucherRoute,
          fixed: isVoucherRoute ? 'left' : '',
          sortable: false,
          type: 'select',
          // formatter: ({row}) => {
          //   let yes = row['voucherStatus'] === 'yes'
          //   if (isVoucherRoute) {
          //     return `<span class="ls_${yes ? 'green' : 'red'}">${yes ? '已生成' : '未生成'}</span>`
          //   } else {
          //     return yes ? '已生成' : '未生成'
          //   }
          // }
        },
        {
          prop: 'sourceApplyNo',
          label: this.$t('PayApplyList.applyNo'),
          type: 'columnTip',
          width: '150px',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (subItem, componentProps) => {
              this.componentProps = componentProps
              let row = componentProps.row
              console.log(row.orderType)
              this.$emit('update:isJumpRouteFromPage', true)
              //请款类型为【预付付款】跳转到预付款申请详情页
              if (row.orderType === 'prepay') {
                let query = {
                  applyNo: subItem,
                  source: 'createRegPrepayFrom',
                }
                return this.$router.push({
                  name: 'PrepayDetail',
                  query,
                })
              }
              //请款类型为【结算付款|预付抵账】跳转到结算付款申请详情页
              if (row.orderType === 'refund_pay') {
                let query = {
                  applyNo: subItem,
                  payApplyReceiveRefundId: row.payApplyReceiveRefundId,
                  source: 'createRegPrepayFrom',
                }
                return this.$router.push({
                  name: 'RefundDetail',
                  query,
                })
              }
              //请款类型为【结算付款|预付抵账】跳转到结算付款申请详情页
              return this.$router.push({
                name: 'SettleDetail',
                query: {
                  applyNo: subItem,
                  confirmStatus: row.confirmStatus,
                },
              })
            },
          },
        },
        {
          prop: 'voucherNo',
          customColumnHide: isVoucherRoute,
          fixed: isVoucherRoute ? 'left' : '',
          label: this.$t('Hedge.voucherNumber'),
          type: 'columnTip',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps, index) => {
              this.componentProps = componentProps
              let row = componentProps.row
              let acctVoucherSeqno = row.acctVoucherSeqno_multiValue
              let seqNo = acctVoucherSeqno[index]
              if (!seqNo) return
              this.initShowVoucher(this.previewDialog, seqNo, '', '')
              // this.previewDialog.showData = ''
              // this.previewDialog.seqNos = ''
              // this.previewDialog.seqNo = seqNo
              // this.previewDialog.show = true
            },
          },
        },
        // {
        //   prop: 'invoiceNoAppend',
        //   label: this.$t('FeeList.invoiceNo'),
        //   type: 'columnTip',
        //   component: 'ColumnTip',
        //   componentProps: {
        //     show: false,
        //     data: [],
        //     callback: (subItem, componentProps, index) => {
        //       this.componentProps = componentProps
        //       let row = componentProps.row
        //       let invoicePaymentId = row.invoiceNoAppendIds[index]
        //       this.$emit('update:isJumpRouteFromPage', true)
        //       this.$router.push({
        //         name: 'InvoicePaymentListDetail',
        //         query: {
        //           invoicePaymentId,
        //         },
        //       })
        //     },
        //   },
        // },
        {
          prop: 'hasInvoiceAmt',
          label: this.$t('Collect.invoicedAmt'),
          width: 100,
          type: 'text',
          sortable: false,
        },
        {
          prop: 'noInvoiceAmt',
          label: this.$t('Collect.uninvoicedAmount'),
          width: 100,
          type: 'text',
          sortable: false,
        },
        // {
        //   disabled: false,
        //   prop: 'transferDzg',
        //   sortable: false,
        //   label: '大掌柜',
        //   type: 'select',
        //   propInDict: 'yesNo',
        // },
        // {
        //   disabled: false,
        //   prop: 'transferDzgAmt',
        //   sortable: false,
        //   label: '大掌柜金额',
        //   type: 'text',
        // },
        {
          prop: 'interTransferFeeStr',
          label: this.$t('Collect.interTransferFee'),
          sortable: false,
          type: 'text',
        },
        {
          prop: 'exterCutTransferFeeStr',
          label: this.$t('Collect.externalFee'),
          sortable: false,
          type: 'text',
        },
        // {
        //   prop: 'writeoffReverseNo',
        //   label: this.$t('Hedge.writeoffReverseNo'),
        //   width: 120,
        //   type: 'text',
        // },
        {
          prop: 'writeoffName',
          label: this.$t('Hedge.writeoffs'),
          type: 'text',
        },
        {
          prop: 'writeoffDate',
          label: this.$t('FeeList.writeOffDate'),
          type: 'text',
        },
        {
          prop: 'recheckStatus',
          label: this.$t('Hedge.reviewStatus'),
          type: 'select',
          propInDict: 'writeoffRecheckStatus',
        },
        {
          prop: 'recheckName',
          label: this.$t('Hedge.reviewer'),
          type: 'text',
        },
        {
          prop: 'recheckTime',
          label: this.$t('Collect.reviewTime'),
          type: 'text',
        },
        { prop: 'compareStatus', label: this.$t('Collect.reconcStatus'), type: 'select', width: 80, propInDict: 'recvPayCompareStatus' },
        {
          prop: 'compareTime',
          label: this.$t('Collect.reconcTime'),
          type: 'text',
          sortable: true,
          width: 130,
        },
        {
          prop: 'remark',
          label: this.$t('Collect.wfRemarks'),
          type: 'text',
        },
        // {
        // 	prop: 'payApplyConfirmName',
        // 	label: '付款单审核人',
        // 	width: 100,
        // },
        {
          prop: 'deduePrepayVoucherStatus',
          label: this.$t('PayApplyList.deduePrepayVoucherStatus'),
          type: 'select',
          key: 'invoiceDate',
          width: 140,
          propInDict: 'voucherYesNoPart',
        },
      ],
      rightFilterBtns: [true, false, false, false],
      loading: false,
      exportTypeList: [
        { label: this.$t('Common.list'), value: 'writeoffPayListExport' },
        { label: this.$t('Common.det'), value: 'writeoffPayDetailExport' },
        { label: this.$t('Collect.desInvoice'), value: 'writeoffPayDetailHasInvoiceExport' },
      ],
    }
  },
  created() {
    this.searchOption1 = {
      saveShow: true,
      saveName: 'writeoffPayListWriteoff',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        // 初始搜索条件数
        defaultSearchLength: 6,
        // 条件数组
        searchInputGroup: [
          { key: 'allNo', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'writeoffSubType', value: '', showType: '2', range: { min: '', max: '' } },
          { key: 'recvCorpCode', value: '', showType: '3', range: { min: '', max: '' } },
          { key: 'currency', value: '', showType: '4', range: { min: '', max: '' } },
          { key: 'writeoffAmt', value: '', showType: '5', range: { min: '', max: '' } },
          { key: 'writeoffDate', value: '', showType: '6', range: { min: '', max: '' } },
        ],
        filterGroups: {
          //1
          allNo: { label: this.$t('FeeList.allNo'), type: 'input', placeholder: this.$t('Settle.multipleTips'), showType: '1' },
          writeoffReceipayNo: { label: this.$t('Hedge.writeoffNo'), type: 'input', showType: '1' },
          // writeoffReverseNo: { label: this.$t('Hedge.writeoffReverseNo'), type: 'input', showType: '1' },
          orderNo: { label: this.$t('FeeList.orderNo'), type: 'input', showType: '1' },
          payOrderNo: { label: this.$t('Settle.payOrderNo'), type: 'input', showType: '1' },
          sourceApplyNo: { label: this.$t('PayApplyList.applyNo'), type: 'input', showType: '1' },
          voucherNo: { label: this.$t('Hedge.voucherNumber'), type: 'input', showType: '1' },
          invoiceNo: { label: this.$t('FeeList.invoiceNo'), type: 'input', showType: '1' },
          mbl: { label: 'MBL', type: 'input', showType: '1' },
          // payApplyConfirmName: { label: '付款单审核人',  type: 'input',  showType: '1'},
          writeoffName: { label: this.$t('Hedge.writeoffs'), type: 'input', showType: '1' },

          //2
          writeoffSubType: { label: this.$t('PayApplyList.writeoffSubType'), multiple: true, type: 'select', prop: 'payWriteoffSubType', showType: '2' },
          orderType: { label: this.$t('PayApplyList.payOrderType'), multiple: true, type: 'select', prop: 'payOrderType', showType: '2' },
          recheckStatus: { label: this.$t('Hedge.reviewStatus'), multiple: true, type: 'select', prop: 'writeoffRecheckStatus', showType: '2' },
          // transferDzg: { label: '大掌柜', type: 'select', prop: 'yesNo', showType: '2' },
          // voucherStatus: {
          //   label: this.$t('Hedge.voucherStatus'),
          //   type: 'select',
          //   prop: 'voucherStatus',
          // },
          payWay: { label: this.$t('Settle.payWay'), type: 'select', multiple: true, prop: 'payWay', showType: '2' },
          settleMode: { label: this.$t('Settle.settleMode'), type: 'select', propInDict: 'bankAccountSettleMode', r: true, multiple: true },
          //3
          recvCorpCode: {
            label: this.$t('FeeList.settleCorp'),
            type: 'remoteSelect',
            showType: '3',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'customer,supplier,company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'customer,supplier,company' }, item)
            },
            remoteSelectList: [],
          },
          bdEmployeeId: {
            label: this.$t('FeeList.bdEmployeeId'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => {
              this.getSellers(queryString, item, 'bd')
            },
            visibleChange: (queryString, item) => {
              this.getSellers(queryString, item, 'bd')
            },
          },
          payBankCode: {
            label: this.$t('PayApplyList.payBankName'),
            type: 'remoteSelect',
            showType: '3',
            remote: true,
            multiple: true,
            remoteMethod: (value, item, row) => {
              bankList({
                currPage: 1,
                pageSize: 1000,
                query: [{ column: 'cname', type: 'like', value }],
              }).then((res) => {
                item.remoteSelectList = ((res.data && res.data.list) || []).map((item) => {
                  return { ...item, label: item.cname, value: item.bankCode }
                })
              })
            },
            visibleChange: (value, item, row) => {
              bankList({
                currPage: 1,
                pageSize: 1000,
                query: [{ column: 'cname', type: 'like', value }],
              }).then((res) => {
                item.remoteSelectList = ((res.data && res.data.list) || []).map((item) => {
                  return { ...item, label: item.cname, value: item.bankCode }
                })
              })
            },
            remoteSelectList: [],
          },
          payAccountNo: {
            label: this.$t('PayApplyList.payAccountShortName'),
            type: 'remoteSelect',
            showType: '3',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.bankAccountListAll(queryString, item)
              // this.$store.dispatch('dict/bankAccountList', {"accountName":queryString, "receipayType":"pay","status": "effect"}).then((data) => {
              // 	item.remoteSelectList = ((data) || []).map((item) => {
              // 		return { ...item, label: item.accountShortName, value: item.accountNo }
              // 	})
              // })
            },
            visibleChange: (queryString, item, row) => {
              this.bankAccountListAll(queryString, item)
              // this.$store.dispatch('dict/bankAccountList', {"accountName":queryString, "receipayType":"pay", "status": "effect"}).then((data) => {
              // 	item.remoteSelectList = ((data) || []).map((item) => {
              // 		return { ...item, label: item.accountShortName, value: item.accountNo }

              // 	})
              // })
            },
            remoteSelectList: [],
          },
          // accountName: { label: this.$t('Collect.accountName'), type: 'input', showType: '3' },
          unitType: { label: this.$t('FeeList.settleCorpType'), multiple: true, type: 'select', prop: 'settleUnitType', showType: '3' },
          isTemporarySettleUnit: { label: this.$t('Collect.isVirtual'), type: 'select', prop: 'yesNo', showType: '3' },
          // settleCompName: { label: this.$t('Settle.branchCompany'), type: 'input', showType: '3' },
          settleCompCode: {
            label: this.$t('Settle.branchCompany'),
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            remoteSelectList: [],
          },
          groupSettleCompCode: {
            label: this.$t('PayApplyList.interSettleBranch'),
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
          //4
          currency: { label: this.$t('FeeList.currency'), type: 'select', selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL') },
          //5
          writeoffAmt: { label: this.$t('Charge.writeoffAmt'), type: 'range', showType: '5' },
          // transferDzgAmt: { label: '大掌柜金额', type: 'range', showType: '5' },
          payAmt: { label: this.$t('PayApplyList.applyAmt'), type: 'range', showType: '5' },
          realPayAmt: { label: this.$t('PayApplyList.realPayAmt'), type: 'range', showType: '5' },
          hasInvoiceAmt: { label: this.$t('Collect.invoicedAmt'), type: 'range', showType: '5' },
          noInvoiceAmt: { label: this.$t('Collect.uninvoicedAmount'), type: 'range', showType: '5' },
          //6
          receivePayDate: { label: this.$t('PayApplyList.receivePayDate'), type: 'lsDaterange', format: 'yyyy-MM-dd' },
          writeoffDate: { label: this.$t('FeeList.writeOffDate'), type: 'lsDaterange', format: 'yyyy-MM-dd' },
          recheckTime: { label: this.$t('Collect.reviewTime'), type: 'lsDaterange', format: 'yyyy-MM-dd' },
          compareStatus: { label: this.$t('Collect.reconcStatus'), type: 'select', prop: 'recvPayCompareStatus' },
          // compareTime: { label: this.$t('Collect.reconcTime'), type: 'lsDaterange', format: 'yyyy-MM-dd', gle: true, hms: true },
          deduePrepayVoucherStatus: { label: this.$t('PayApplyList.deduePrepayVoucherStatus'), type: 'select', prop: 'voucherYesNoPart' },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: this.$t('Common.details'),
          type: 'text',
          showFn: () => this.checkAuth(this.$route.name, 'tab-writeoffPayList', 'btn-detail'),
          action: 'showDetail',
        },
      ],
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'writeoffPayList',
      data: [...this.option.data],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
      listAmtSummary,
      sortable: true,
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
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      needTimeSort: true,
      emptyText: this.$t('Common.emptyText'),
      colorColumns: ['voucherStatus', 'voucherYesNoPart'],
    })
    let columns = [...this.selfColumnsBase]
    if (this.isVoucherRoute) {
      this.configColumns.push(...this.selfColumnsBase.filter((item) => !item.customColumnHide).map((item) => item.prop))
    } else {
      this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    }
    // this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    // console.log(this.configColumns)
    // this.selfColumnsBase.forEach((item) => (item.sortable = true))
    this.option1.columns = columns
  },
  methods: {
    querySettleUnit1(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString).then((data) => {
        cb(data)
      })
    },
    submit() {},
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    // 删除凭证
    delVoucher() {
      let selectRow = this.multipleSelection1
      if (!selectRow.length) {
        return this.$msgErrClose(this.$t('Hedge.deletedTips'))
      }
      let arr = selectRow.filter((item) => item.voucherNo)
      if (!arr.length) {
        return this.$msgErrClose(this.$t('Hedge.generatedTips'))
      }
      let voucherNos = []
      let voucherSeqNos = []
      arr.forEach((val) => {
        voucherNos.push(...val.voucherNo_multiValue)
        voucherSeqNos.push(...val.acctVoucherSeqno_multiValue)
      })
      voucherNos = [...new Set(voucherNos)].filter((v) => v !== 'null')
      voucherSeqNos = [...new Set(voucherSeqNos)]
      // return console.log(voucherSeqNos);
      this.$confirmWarn(this.$t('Hedge.detailsTips', {voucherNos: voucherNos.join(',')}), () => {
        exVoucherDelete({ voucherSeqNos }).then((res) => {
         this.$msgErrClose(this.$t('Settle.deleteSuc'))
          this.getData()
        })
      })
    },
    generateVoucher(preview, bizNo) {
      // 凭证预览内的删除也走这个回调，refresh表示删除成功，刷新列表
      if (preview === 'refresh') {
        this.getData()
        return
      }
      let isPreview = preview === true
      if (!bizNo) this.previewDialog.show = false
      let selectRow = this.multipleSelection1
      if (this.multipleSelection1.length === 0) {
        this.$msgErrClose(isPreview ? this.$t('PreClose.previewTips') : this.$t('Payment.generateTips'))
        return
      }
      if (selectRow.length && isPreview) {
        let hasVoucher, noVoucher
        selectRow.forEach((v) => {
          if (v.voucherStatus === 'yes' && !(v.noVoucherCompanyCodes || '').split(',').includes(this.storeSettleCode)) {
            hasVoucher = true
          } else {
            noVoucher = true
          }
        })
        if (hasVoucher && noVoucher) {
          return this.$msgErrClose(this.$t('Hedge.ungeneratedTips'))
        }
      }
      let arr = selectRow.filter(
        (v) => v.voucherStatus !== 'yes' || (v.noVoucherCompanyCodes || '').split(',').includes(this.storeSettleCode)
      )
      if (!arr.length) {
        if (isPreview) {
          console.log(selectRow.map((v) => v.acctVoucherSeqno_multiValue.join(',')).join(','))
          this.initShowVoucher(
            this.previewDialog,
            '',
            selectRow.map((v) => v.acctVoucherSeqno_multiValue.join(',')).join(','),
            ''
          )
        } else {
          this.$msgErrClose(this.$t('PayApplyList.selectItemSUNoVoucher'))
        }
        return
      }
      let data = {
        writeoffReceipayNos: bizNo && bizNo !== 'all' ? [bizNo] : this.multipleSelection1.map((item) => item.writeoffReceipayNo),
        bizType: 'pay_writeoff',
        preview: 'no',
      }
      if (isPreview) {
        data.preview = 'yes'
        this.loading = true
        exReceipayWriteOffGenerate(data)
          .then((res) => {
            this.initShowVoucher(this.previewDialog, '', '', res.data)
          })
          .finally(() => (this.loading = false))
        return
      }
      this.$confirm(this.$t('Collect.voucherGen'), this.$t('Common.generateVouchers'), {
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        lockScroll: 'true',
        type: 'warning',
      })
        .then(() => {
          this.$refs.PreviewDialog.lsLoading = true
          return exReceipayWriteOffGenerate(data)
        })
        .then(() => {
          this.$msgSucClose(this.$t('Hedge.processedTips'))
          !isPreview && !bizNo && this.getData()
        })
        .finally(() => (this.$refs.PreviewDialog.lsLoading = false))
    },
    querySettleUnit(queryString, cb) {
      this.$store.dispatch('dict/currencyList', queryString).then((data) => {
        cb(data)
      })
    },
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      if (this.debounceLsFn()) {
        return Promise.resolve()
      }
      this.loading = true
      let data = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption1, '', 'rangeMinMax')
      if (this.isVoucherRoute) {
        this.hasVoucher &&
          data.query.push({
            column: 'voucherStatus',
            type: 'like',
            value: this.hasVoucher,
          })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || data.query
      if (this.buttonSearch) {
        data.query.push({ column: 'recheckStatus', type: 'eq', value: this.buttonSearch })
      }
      let method = this.isVoucherRoute ? exAcctWriteoffPayPageList : queryWriteoffPayPageList
      return method(data)
        .then(({ data }) => {
          this.finCommonColumns({ data }, undefined, undefined, undefined, {
            configColumns: data.configColumns.filter((v) => {
              return !this.isVoucherRoute || !['voucherStatus', 'voucherNo'].includes(v)
            }),
          })
          if (this.isVoucherRoute) {
            let columns = []
            if (data.configColumns && data.configColumns.length) {
              columns = data.configColumns.filter((v) => !['voucherStatus', 'voucherNo'].includes(v))
            } else {
              columns = this.selfColumnsBase.map((v) => v.prop).filter((v) => !['voucherStatus', 'voucherNo'].includes(v))
            }
            columns = ['voucherStatus', 'voucherNo', ...columns]
            if (this.columnsBackup !== columns.toString()) {
              this.option1.columns = columns
                .map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
                .filter((v) => v)
            }
            this.columnsBackup = columns.toString()
          }
          if (customerList) return
          let list = []
          data.list.forEach((item) => {
            item.sourceApplyNo_multiValue = item.sourceApplyNo.split(',')
            // 发票号处理
            item.invoiceNoAppendIds = []
            item.invoiceNoAppend_multiValue = item.invoiceNoAppend.split(',').map((ele) => {
              let arr = ele.split('/')
              item.invoiceNoAppendIds.push(arr[0])
              return arr[1]
            })
            item.voucherNo_multiValue = item.voucherNo.split(',').map((subItem) => {
              let arr = subItem.split('/')
              return arr[1] ? arr[1] : arr[0]
            })
            item.acctVoucherSeqno_multiValue = item.voucherNo.split(',').map((subItem) => {
              let arr = subItem.split('/')
              return arr[0]
            })
            item.sourceType_multiValue = item.orderNo.split(',').map((subItem) => {
              let arr = subItem.split('/')
              return arr[1] ? arr[1] : arr[0]
            })
            item.orderNo_multiValue = item.orderNo.split(',').map((subItem) => {
              let arr = subItem.split('/')
              return arr[0]
            })
            list.push(item)
          })
          this.option1.data = list
          this.table1DataBackup = [...this.option1.data]
          this.$set(this.option1, 'emptyText', this.$t('Common.noData'))
          Object.assign(this.option1.pagination, data)
        })
        .finally(() => {
          this.loading = false
        })
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
      let data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      let ids = this.multipleSelection1
        .map((item) => {
          return item.writeoffReceipayNo
        })
        .join(',')
      if (ids) {
        data2.query.push({
          column: 'writeoffReceipayNoList',
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
    getListAmtSummary(data) {
      let method = this.isVoucherRoute ? exAcctWriteoffPayPageSummary : queryWriteoffPayPageSummary
      method(data).then((res) => {
        if (res.code === 0 && res.data) {
          let data = {
            payAmtSummaryList: [],
            notInvoiceAmtSummaryList: [],
          }
          data = Object.assign(data, res.data)
          let labelObj = {
            payAmtSummaryListlabel: this.$t('PayApplyList.applyAmt'),
            notInvoiceAmtSummaryListlabel: this.$t('Collect.uninvoicedAmount'),
          }
          let colorObj = {
            payAmtSummaryListColor: 'red', // 支持red, green, black三种值
            notInvoiceAmtSummaryListColor: 'green',
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
    search(data, index) {
      this.buttonSearch = data
      this.option1.pagination.currPage = 1
      this.getData(true)
      if (index || index === 0) {
        this.rightFilterBtns = [false, false, false]
        this.rightFilterBtns[index] = true
      }
    },
    showDetail(row) {
      console.log(row.orderType)
      if (row.orderType === 'prepay_refund') {
        return
      }
      this.routerPushTab('WritePayDetail', { writeoffReceipayNo: row.writeoffReceipayNo })
    },
    // 导出按钮
    handleExport() {
      const data = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: this.option1.columns.map((v) => v.prop),
        query: [],
      }
      this.finCommonSearch(data.query, this.searchOption1, '', 'rangeMinMax')
      if (this.isVoucherRoute) {
        this.hasVoucher &&
          data.query.push({
            column: 'voucherStatus',
            type: 'like',
            value: this.hasVoucher,
          })
      }
      if (this.multipleSelection1.length) {
        data.query = [
          { column: 'writeoffReceipayNo', type: 'in', value: this.multipleSelection1.map((v) => v.writeoffReceipayNo).join(',') },
        ]
      }
      // 查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'exAcctWriteoffPayListExport' })
      this.$confirm(this.$t('PayApplyList.exportPayWriteoffTip'), this.$t('Payment.exportPayment'), {
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        lockScroll: 'true',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          this.$store
            .dispatch('finance/downloadBlobFilePost', {
              uri: '/fin/common/queryDataExportExcel',
              data: { data },
            })
            .then((res) => {
              this.loading = false
              console.log(res)
              const link = document.createElement('a')
              link.href = window.URL.createObjectURL(res)
              link.download = `${this.$t('PayApplyList.payWriteOffOrder')}.xlsx`
              link.click()
            })
            .catch(() => {
              this.loading = false
              this.$message({ message: this.$t('FeeList.exportFailed'), type: 'error' })
            })
        })
        .catch(() => {})
    },
    bankAccountListAll(accountShortName, item) {
      let data = { currPage: 1, pageSize: 30, accountShortName, currency: '', status: 'effect', unitType: 'company' }
      bankAccountListAll(data).then((res) => {
        let data = res.data.map((item) => ({ label: `${item.accountShortName}(${item.accountNo})`, value: item.accountNo }))
        this.remoteSelectCommon(item, data)
      })
    },
    // 获取销售
    getSellers(name = '', item, role) {
      let query = [{ column: 'roleCode', type: 'eq', value: role }] // column: 'roleCode', type: 'in', value: 'bd,obd'
      name && query.push({ column: 'name', type: 'eq', value: name })
      listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data: { list } }) => {
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
  },
  activated() {
    if (!this.$route.meta.isUseCache) {
      this.getData()
    }
  },
  watch: {
    'previewDialog.show'(val) {
      !val && this.previewDialog._refresh && this.getData()
      this.previewDialog._refresh = false
    },
    hasVoucher() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
  },
  computed: {
    storeSettleCode() {
      return this.$store.state.user?.userInfo?.settleCompanyCode
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    PreviewDialog,
    CustomColumns,
  },
}
</script>
<style lang="scss" scoped>
.select-template-box {
  float: left;
  // display: inline-block;
}
.select-template-box .el-dropdown {
  margin-left: 0;
  margin-bottom: 0;
  border-radius: 0;
  font-size: 12px;
  /* line-height: 26px; */
  border: 1px solid #d9d9d9;
  //   border-right: none;
  border-radius: 4px;
}
.select-template-box:hover .el-dropdown {
  background: rgb(236, 245, 255);
  color: rgb(64, 158, 255);
}
.select-template-box .el-dropdown-link {
  cursor: pointer;
  padding-left: 5px;
  line-height: 18px;
  display: inline-block;
}
.select-template-box .el-icon--right {
  margin-left: 0;
}
.select-template-box .el-dropdown-link:focus {
  outline: none;
}
.batch-print-create .el-dialog__body {
  padding: 40px 80px 22px;
}
.batch-print-create .el-dialog__footer {
  padding-bottom: 32px;
  text-align: center;
}
.batch-print-create .el-form .el-input {
  width: 320px;
}
.manual-regist-invoice .el-form .el-date-editor.el-input {
  width: 162px;
}
.manual-regist-invoice .el-form .el-select {
  width: 162px;
}
</style>
