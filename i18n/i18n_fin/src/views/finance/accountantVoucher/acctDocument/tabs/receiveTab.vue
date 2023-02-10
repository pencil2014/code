<template>
  <div
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-receivable-reg-list">
      <FinanceSearch :searchOption="searchOption" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
        <div class="money-box">
          <div class="money-box-left">
            <el-button
              v-if="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-voucherView')"
              class="finance-btn"
              @click="generateVoucher(true)"
              size="mini"
              type="primary"
            >{{$t('PayApplyList.previewVoucher')}}</el-button>
            <el-button
              v-if="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-voucherCreate')"
              class="finance-btn"
              @click="generateVoucher"
              size="mini"
              type="primary"
            >{{$t('PayApplyList.generateVoucher')}}</el-button>
            <el-button
              v-if="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-voucherDel')"
              class="finance-btn"
              @click="delVoucher"
              size="mini"
              type="danger"
            >{{$t('PayApplyList.deleteVoucher')}}</el-button>
            <el-button
              v-if="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-handleExport')"
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
        <FinanceTable :option="option1" @send-multi="sendMulti" />
      </div>
    </div>
    <!-- 凭证弹框组件 -->
    <PreviewDialog
      ref="PreviewDialog"
      :dialogOption="previewDialog"
      @generate="generateVoucher"
      :bizNo="true"
      :showDel="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-voucherDel')"
      :showCreate="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-voucherCreate')"
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
import { exReceipayWriteOffGenerate, exVoucherDelete } from '@/api/fin/voucher'
import { listAccountantExPage, getListAmtSummary, getAccountantExListAmtSummary } from '@/api/fin/writeoffRecv'
import { querySourceTypeByNo } from '@/api/fin/fee'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { bankAccountListAll } from '@/api/fin/settleUnitBankAcct'
import { listByRole } from '@/api/base'
export default {
  name: 'writeoffRecvList',
  label: '收款核销',
  mixins: [mixin, mixin2, routerMixin],
  data() {
    let isVoucherRoute = true
    return {
      pageSizeUrl: listAccountantExPage('geturl'),
      keyDownActive: true,
      hasVoucher: '', //tab选项，凭证状态
      isVoucherRoute,
      searchBackup: [],
      receivablePrerevId: -1,
      currentComponent: '',
      receivableRegId: -1,
      option1: {},
      searchOption: {},
      table1DataBackup: [],
      multipleSelection1: [],
      orderNo: '',
      orderBillId: '',
      showInvoiceDetail: false,
      selectedOptionItem: '',
      writeoffReceipayId: 0,
      rowData: '',
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
      // 自定义表头弹框
      customColumnsPopShow: false,
      selfColumnsBase: [
        {
          prop: 'writeoffReceipayNo',
          label: this.$t('Hedge.writeoffNo'),
          type: 'button',
          action: 'showAttachment',
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
          prop: 'voucherNo',
          label: this.$t('Hedge.voucherNumber'),
          type: 'columnTip',
          sortable: true,
          customColumnHide: isVoucherRoute,
          fixed: isVoucherRoute ? 'left' : '',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, { row }, index) => {
              let acctVoucherSeqno = row.acctVoucherSeqno_multiValue
              let seqNo = acctVoucherSeqno[index]
              if (!seqNo) return
              this.initShowVoucher(this.previewDialog, seqNo, '', '')
            },
          },
        },
        {
          prop: 'settleCompName',
          label: this.$t('FeeList.settleComp'),
          type: 'text',
          width: 150,
          sortable: true,
        },
        {
          prop: 'groupSettleCompName',
          label: this.$t('PayApplyList.interSettleBranch'),
          type: 'text',
          width: 150,
          sortable: true,
        },
        {
          prop: 'settleCorpName',
          label: this.$t('FeeList.settleCorp'),
          type: 'text',
          sortable: true,
          width: 150,
        },
        {
          prop: 'settleCorpType',
          label: this.$t('FeeList.settleCorpType'),
          type: 'select',
          sortable: false,
          width: '104px',
          propInDict: 'unitType',
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
              // if (row.writeoffSource === 'receivable_reg') {
              this.routerPush('WriteoffRecvDetail', { receivableRegId: row.receivableRegId, receivableRegNo: row.regNo }, true)
              // } else {
              //   this.routerPush(
              //     'PrerevWriteoff',
              //     { receivablePrerevId: row.receivablePrerevId, receivablePrerevNo: row.regNo },
              //     true
              //   )
              // }
            },
          },
        },
        {
          prop: 'receivablePrerevNo',
          label: '预收款登记号',
          width: '155px',
          type: 'button',
          sortable: true,
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              // if (row.writeoffSource === 'receivable_reg') {
              //   this.routerPush('WriteoffRecvDetail', { receivableRegId: row.receivableRegId, receivableRegNo: row.regNo }, true)
              // } else {
              this.routerPush(
                'PrerevWriteoff',
                { receivablePrerevId: row.receivablePrerevId, receivablePrerevNo: row.regNo },
                true
              )
              // }
            },
          },
        },
        {
          prop: 'prerevHasVoucher',
          label: this.$t('Collect.receiptVoucher'),
          type: 'select',
          sortable: false,
          width: '134px',
          propInDict: 'voucherYesNoPart',
        },
        {
          prop: 'realAmt',
          label: this.$t('Collect.amtReceived'),
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'accountShortName',
          label: this.$t('Collect.abbreviat'),
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'accountPublicType',
          label: this.$t('Collect.ourAccountType'),
          type: 'select',
          sortable: true,
          propInDict: 'accountType',
          width: '104px',
        },
        {
          prop: 'accountNo',
          label: this.$t('Collect.receivingBank'),
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'bankSeqNo',
          label: this.$t('Collect.bankFlowNumber'),
          type: 'text',
          width: '104px',
        },
        {
          prop: 'payAccountName',
          label: this.$t('Collect.accountName'),
          type: 'text',
          width: '104px',
        },
        {
          prop: 'totalWirteoffAmt',
          label: this.$t('Charge.writeoffAmt'),
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'interTransferFee',
          label: this.$t('Collect.interTransferFee'),
          sortable: false,
          type: 'text',
          width: '104px',
        },
        {
          prop: 'outerTransferFee',
          label: this.$t('Collect.externalFee'),
          sortable: true,
          type: 'text',
          width: '100px',
        },
        // {
        //   prop: 'hasInternalDzg',
        //   label: '转移大掌柜',
        //   type: 'select',
        //   propInDict: 'yesNo',
        //   width: '104px',
        // },
        // {
        //   prop: 'internalDzgAmt',
        //   label: '大掌柜金额',
        //   type: 'text',
        //   width: '104px',
        // },
        // {
        //   prop: 'dzgWriteoffNo',
        //   label: '大掌柜核销编号',
        //   type: 'text',
        //   width: '155px',
        // },
        {
          prop: 'lessRecvAmt',
          label: this.$t('Collect.shortAmt'),
          type: 'text',
          width: '104px',
        },
        {
          prop: 'currency',
          label: this.$t('FeeList.currency'),
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'receivePayDate',
          label: this.$t('PayApplyList.receivePayDate'),
          type: 'text',
        },
        {
          prop: 'writeoffSubType',
          label: this.$t('PayApplyList.writeoffSubType'),
          type: 'select',
          sortable: true,
          width: '104px',
          propInDict: 'recWriteoffSubType',
        },
        {
          prop: 'recheckStatus',
          label: this.$t('FinBill.approvalResult'),
          type: 'select',
          sortable: true,
          width: '104px',
          propInDict: 'writeoffRecheckStatus',
        },
        {
          prop: 'hasVoucher',
          label: this.$t('Hedge.voucherStatus'),
          customColumnHide: isVoucherRoute,
          fixed: isVoucherRoute ? 'left' : '',
          type: 'select',
          propInDict: 'voucherStatus',
        },
        {
          prop: 'writeoffDate',
          label: this.$t('FeeList.writeOffDate'),
          type: 'text',
        },
        {
          prop: 'settleOrderNo',
          label: this.$t('Collect.associaSNO'),
          type: 'columnTip',
          width: 155,
          sortable: false,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            callback: (no, componentProps) => {
              const query = { settleOrderNo: no, source: 'settlementDetail' }
              this.routerPushTab('SettlementDetail', query)
            },
          },
        },
        {
          prop: 'invoiceNos',
          label: this.$t('Collect.assInvoiceNumber'),
          type: 'columnTip',
          width: 140,
          sortable: false,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps, index) => {
              const row = componentProps.row
              const invoiceReceivableIds = row.invoiceReceivableIds_multiValue
                ? row.invoiceReceivableIds_multiValue
                : row.invoiceNos_multiValue
              const invoiceReceivableId = invoiceReceivableIds[index]
              const query = { source: 'detail', invoiceReceivableId }
              this.routerPushTab('InvoiceReceivableDetail', query)
            },
          },
        },
        { prop: 'invoiceAmt', label: this.$t('Collect.invoicedAmt'), type: 'text', sortable: false, width: '104px' },
        { prop: 'noInvoiceAmt', label: this.$t('Collect.uninvoicedAmount'), type: 'text', sortable: false, width: '104px' },
        // {
        //   prop: 'writeoffReverseNo',
        //   label: this.$t('Hedge.writeoffReverseNo'),
        //   type: 'text',
        //   sortable:true,
        //   width: '104px',
        // },
        {
          prop: 'sourceBizNo',
          label: this.$t('FeeList.orderNo'),
          width: 138,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              querySourceTypeByNo({ sourceBizNo: no }).then((res) => {
                if (res.code === 0) {
                  this.showOneNoDetail(res.data.sourceType, res.data.sourceBizNo)
                }
              })
            },
          },
        },
        { prop: 'bdEmployeeName', label: this.$t('FeeList.bdEmployeeId'), type: 'text', sortable: false, width: 130 },
        { prop: 'recvCreatedName', label: this.$t('Collect.payeeRegistrant'), type: 'text', sortable: true, width: 104 },
        { prop: 'recvCreatedTime', label: this.$t('Collect.registrationTime'), type: 'text', sortable: true, width: 150 },
        {
          prop: 'writeoffName',
          label: this.$t('Hedge.writeoffs'),
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'writeoffTime',
          label: this.$t('Hedge.writeoffTime'),
          type: 'text',
          sortable: true,
          width: 150,
        },
        {
          prop: 'recheckName',
          label: this.$t('Hedge.reviewer'),
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'recheckTime',
          label: this.$t('Collect.reviewTime'),
          type: 'text',
          sortable: true,
          width: 150,
        },
        {
          prop: 'bankseqFileCode',
          label: this.$t('Collect.waterBill'),
          type: 'button',
          width: '80px',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              if (action === 'showAttachment' && row.bankseqFileCode) {
                let href = `/base/fileView/preview/${row.bankseqFileCode}/sowoll`
                window.open(href)
              }
            },
            data: [{ label: this.$t('PayApplyList.have'), type: 'text', show: true, action: 'showAttachment' }],
          },
          sortable: false,
        },
        {
          prop: 'payBankseqFileNo',
          label: this.$t('Collect.paymentWaterBill'),
          type: 'button',
          width: '80px',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              if (action === 'showAttachment' && row.payBankseqFileNo) {
                let href = `/base/fileView/preview/${row.payBankseqFileNo}/sowoll`
                window.open(href)
              }
            },
            data: [{ label: this.$t('PayApplyList.have'), type: 'text', show: true, action: 'showAttachment' }],
          },
          sortable: false,
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
          sortable: true,
          width: '104px',
        },
        {
          prop: 'recvRemark',
          label: this.$t('Collect.transRemarks'),
          type: 'text',
          sortable: true,
          width: '104px',
        },
      ],
      exportTypeList: [
        { label: this.$t('Common.list'), value: 'writeoffRecvListExport' },
        { label: this.$t('Common.det'), value: 'writeoffRecvDetailExport' },
        { label: this.$t('Collect.desInvoice'), value: 'writeoffRecvInvoiceExport' },
      ],
    }
  },
  created() {
    let searchArr = ['allNo', 'writeoffSubType', 'totalWirteoffAmt', 'currency', 'settleCorpCode', 'writeoffTime']
    // 搜索配置
    this.searchOption = {
      // saveDefault: true,
      saveShow: true,
      saveName: 'writeoffRecvList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        // 初始搜索条件数
        defaultSearchLength: 6,
        // 条件数组
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          allNo: { label: this.$t('FeeList.allNo'), type: 'input' },
          writeoffReceipayNo: { label: this.$t('Hedge.writeoffNo'), type: 'input' },
          sourceBizNo: { label: this.$t('FeeList.orderNo'), type: 'input', showType: '1' },
          voucherNo: { label: this.$t('Hedge.voucherNumber'), type: 'input' },
          receivableRegNo: { label: '收款登记号', type: 'input' },
          receivablePrerevNo: { label: '预收款登记号', type: 'input' },
          prerevHasVoucher: { label: this.$t('Collect.receiptVoucher'), type: 'select', prop: 'voucherYesNoPart' },
          settleOrderNo: { label: this.$t('Collect.associaSNO'), type: 'input' },
          invoiceNo: { label: this.$t('Collect.assInvoiceNumber'), type: 'input' },
          writeoffSubType: { label: this.$t('PayApplyList.writeoffSubType'), type: 'select', prop: 'recWriteoffSubType', multiple: true },
          recheckStatus: {
            label: this.$t('FinBill.approvalResult'),
            type: 'select',
            selectOptions: [
              { label: this.$t('Collect.notreviewed'), value: 'no_check', en: 'no_check' },
              { label: this.$t('Collect.reviewed'), value: 'checked', en: 'checked' },
            ],
            multiple: true,
          },
          // hasVoucher: { label: this.$t('Hedge.voucherStatus'), type: 'select', prop: 'voucherStatus', multiple: true },
          totalWirteoffAmt: { label: this.$t('Charge.writeoffAmt'), type: 'range' },
          realAmt: { label: this.$t('Collect.amtReceived'), type: 'range' },
          accountShortName: {
            label: this.$t('Collect.abbreviat'),
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.bankAccountListAll(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.bankAccountListAll('', item)
            },
            remoteSelectList: [],
          },
          accountPublicType: { label: this.$t('Collect.ourAccountType'), type: 'select', prop: 'accountType' },
          accountNo: { label: this.$t('Collect.receivingBank'), type: 'input' },
          payAccountName: { label: this.$t('Collect.accountName'), type: 'input' },
          bankSeqNo: { label: this.$t('Collect.bankFlowNumber'), type: 'input' },
          // 4
          currency: {
            label: this.$t('FeeList.currency'),
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
          settleCompCode: {
            label: this.$t('FeeList.settleComp'),
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
          settleCorpCode: {
            label: this.$t('FeeList.settleCorp'),
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
          settleCorpType: { label: this.$t('FeeList.settleCorpType'), type: 'select', prop: 'settleUnitType', multiple: true },
          writeoffDate: { label: this.$t('FeeList.writeOffDate'), type: 'lsDaterange', format: 'yyyy-MM-dd' },
          writeoffTime: { label: this.$t('Hedge.writeoffTime'), type: 'lsDaterange', format: 'yyyy-MM-dd' },
          recheckTime: { label: this.$t('Collect.reviewTime'), type: 'lsDaterange', format: 'yyyy-MM-dd' },
          receivePayDate: { label: this.$t('PayApplyList.receivePayDate'), type: 'lsDaterange', format: 'yyyy-MM-dd' },
          bdEmployeeId: {
            label: this.$t('FeeList.bdEmployeeId'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getSellers(queryString, item, 'bd'),
            visibleChange: (queryString, item) => this.getSellers(queryString, item, 'bd'),
          },
          recvCreatedBy: {
            label: this.$t('Collect.payeeRegistrant'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item),
          },
          recvCreatedTime: { label: this.$t('Collect.registrationTime'), type: 'lsDaterange', format: 'yyyy-MM-dd', gle: true, hms: true },
          writeoffName: { label: this.$t('Hedge.writeoffs'), type: 'input' },
          recheckName: { label: this.$t('Hedge.reviewer'), type: 'input' },
          hasBankseqFile: { label: this.$t('Collect.waterBill'), type: 'select', prop: 'hasNo' },
          hasPayBankseqFile: { label: this.$t('Collect.paymentWaterBill'), type: 'select', prop: 'hasNo' },
          //  hasBankseqFile: {
          //     label: '水单状态',
          //     type: 'select',
          //     selectOptions: [
          //       { label: this.$t('PayApplyList.have'), value: 'yes' },
          //       { label: '无', value: 'no' },
          //     ],
          //   },
          // hasInternalDzg: { label: '转移大掌柜', type: 'select', prop: 'yesNo' },
          // internalDzgAmt: { label: '大掌柜金额', type: 'range' },
          // dzgWriteoffNo: { label: '大掌柜核销编号', type: 'input' },
          lessRecvAmt: { label: this.$t('Collect.shortAmt'), type: 'range' },
          compareStatus: { label: this.$t('Collect.reconcStatus'), type: 'select', prop: 'recvPayCompareStatus' },
          // compareTime: { label: this.$t('Collect.reconcTime'), type: 'lsDaterange', format: 'yyyy-MM-dd', gle: true, hms: true },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [{ label: this.$t('Common.details'), type: 'text', show: true, width: '60px', action: 'showDetail' }],
    })
    if (!this.checkAuth(this.$route.name, 'tab-writeoffRecvList', 'btn-detail')) {
      operationBtns = false
    }
    const pagination = Object.assign({}, this.option.pagination, { show: true, isNew: true })
    const listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
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
      $name: 'writeoffRecvList',
      data: [...this.option.data],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
      sortable: true,
      listAmtSummary,
      maxHeight: this.getFinanceTableMaxHeight,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      needTimeSort: true,
      emptyText: this.$t('Common.emptyText'),
      colorColumns: ['voucherStatus'],
    })
    let columns = [...this.selfColumnsBase]
    if (this.isVoucherRoute) {
      this.configColumns.push(...this.selfColumnsBase.filter((item) => !item.customColumnHide).map((item) => item.prop))
    } else {
      this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    }
    this.option1.columns = columns
    if (!this.searchOption.saveShow) {
      this.getData()
    }
    this.cTimestamp = new Date().getTime()
  },
  methods: {
    // 删除凭证
    delVoucher() {
      console.log(this.$store.state.user)
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
    // 生成凭证
    generateVoucher(preview, bizNo) {
      // 凭证预览内的删除也走这个回调，refresh表示删除成功，刷新列表
      if (preview === 'refresh') {
        this.getData()
        return
      }
      const isPreview = preview === true
      if (!bizNo) this.previewDialog.show = false
      const selectRow = this.multipleSelection1
      if (!selectRow.length) {
        return this.$msgErrClose(isPreview ? this.$t('PreClose.previewTips') : this.$t('Payment.generateTips'))
      }
      if (selectRow.length && isPreview) {
        let hasVoucher, noVoucher
        selectRow.forEach((v) => {
          if (v.hasVoucher === 'yes' && !(v.noVoucherCompanyCodes || '').split(',').includes(this.storeSettleCode)) {
            hasVoucher = true
          } else {
            noVoucher = true
          }
        })
        if (hasVoucher && noVoucher) {
          return this.$msgErrClose(this.$t('Hedge.ungeneratedTips'))
        }
      }
      if (
        selectRow.filter(
          (v) => v.hasVoucher === 'yes' && !(v.noVoucherCompanyCodes || '').split(',').includes(this.storeSettleCode)
        ).length
      ) {
        if (isPreview) {
          console.log(selectRow.map((v) => v.voucherNo))
          this.initShowVoucher(this.previewDialog, '', selectRow.map((v) => v.acctVoucherSeqno).join(','), '')
        } else {
          this.$msgErrClose(this.$t('Collect.recordsvoucher'))
        }
        return
      }
      const data = {
        writeoffReceipayNos: bizNo && bizNo !== 'all' ? [bizNo] : selectRow.map((item) => item.writeoffReceipayNo),
        bizType: 'receive_writeoff',
      }
      if (isPreview) {
        data.preview = 'yes'
        this.lsLoading = true
        exReceipayWriteOffGenerate(data)
          .then((res) => {
            if (!res.data || !res.data.length) {
              return this.$msgErrClose(this.$t('Hedge.genVouchersTips'))
            }
            this.initShowVoucher(this.previewDialog, '', '', res.data)
          })
          .finally(() => (this.lsLoading = false))
        return
      }
      this.$confirmWarn({ body: this.$t('Collect.voucherGen'), title: this.$t('Common.generateVouchers') }, () => {
        this.$refs.PreviewDialog.lsLoading = true
        exReceipayWriteOffGenerate(data)
          .then(() => {
            this.$msgSucClose(this.$t('Hedge.processedTips'))
            !isPreview && !bizNo && this.getData()
          })
          .finally(() => (this.$refs.PreviewDialog.lsLoading = false))
      })
    },
    querySettleUnit(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString).then((data) => {
        cb(data)
      })
    },
    querySettleUnit1(queryString, cb) {
      this.$store.dispatch('dict/currencyList', queryString || '').then((data) => {
        cb(data)
      })
    },
    // 获取收款核销列表
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      if (this.debounceLsFn()) return Promise.resolve()
      this.lsLoading = true
      const data = {
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
      if (this.isVoucherRoute) {
        this.hasVoucher && data.query.push({ column: 'hasVoucher', type: 'in', value: this.hasVoucher })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || data.query
      return listAccountantExPage(data)
        .then((res) => {
          this.finCommonColumns(res, undefined, undefined, undefined, {
            configColumns: res.data.configColumns.filter((v) => {
              return !this.isVoucherRoute || !['hasVoucher', 'voucherNo'].includes(v)
            }),
          })
          // if (res.data.configColumns && res.data.configColumns.length) {
          //   let columns = res.data.configColumns
          //   this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
          //   this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
          //   this.configColumns = res.data.configColumns.filter((v) => {
          //     return !this.isVoucherRoute || !['hasVoucher', 'voucherNo'].includes(v)
          //   })
          // }
          if (this.isVoucherRoute) {
            let columns = []
            if (res.data.configColumns && res.data.configColumns.length) {
              columns = res.data.configColumns.filter((v) => !['hasVoucher', 'voucherNo'].includes(v))
            } else {
              columns = this.selfColumnsBase.map((v) => v.prop).filter((v) => !['hasVoucher', 'voucherNo'].includes(v))
            }
            columns = ['hasVoucher', 'voucherNo', ...columns]
            if (this.columnsBackup !== columns.toString()) {
              this.option1.columns = columns
                .map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
                .filter((v) => v)
            }
            this.columnsBackup = columns.toString()
            // columns = ['hasVoucher', 'voucherNo', ...columns]
            // this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
          }
          if (customerList) return
          if (res.code === 0) {
            const { list } = res.data
            const data = []
            list.forEach((item) => {
              // item.invoiceNo_multiValue = item.invoiceNo.split(',')
              item.invoiceNos_multiValue = item.invoiceNos.split(',').map((subItem) => {
                const arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.invoiceReceivableIds_multiValue = item.invoiceNos.split(',').map((subItem) => {
                const arr = subItem.split('/')
                return arr[0]
              })
              item.voucherNo_multiValue = item.voucherNo.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.acctVoucherSeqno_multiValue = item.voucherNo.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[0]
              })
              item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
              // 转字典
              const settleCorpTypeName = item.settleCorpType.split(',')
              item.settleCorpType = settleCorpTypeName
                .map((it) => {
                  const unitTypeObj = this.dictMap['unitType'].find((el) => el.value === it)
                  return unitTypeObj && unitTypeObj['label']
                })
                .toString()
              data.push(item)
            })
            this.option1.data = data
            this.table1DataBackup = [...this.option1.data]
            this.$set(this.option1, 'emptyText', this.$t('Common.noData'))
            Object.assign(this.option1.pagination, res.data)
            // this.option1.pagination.currPage = res.data.currPage
            // this.option1.pagination.pageSize = res.data.pageSize
            // this.option1.pagination.totalCount = res.data.totalCount
          }
        })
        .finally(() => {
          this.lsLoading = false
        })
    },
    getListAmtSummary(data) {
      getAccountantExListAmtSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          const labelObj = {
            writeoffAmtListLabel: this.$t('Charge.writeoffAmt'),
            noInvoiceAmtListlabel: this.$t('Collect.uninvoicedAmount'),
          }
          const colorObj = {
            writeoffAmtListColor: 'green', // 支持red, green, black三种值
            noInvoiceAmtListColor: 'red',
          }
          const data = res.data
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
      // console.log(data, option)
      if (option === this.option1) this.multipleSelection1 = data
      const data2 = { ascColumns: [], descColumns: [], query: [] }
      const ids = this.multipleSelection1.map((item) => item.writeoffReceipayId).join(',')
      if (ids) {
        data2.query.push({ column: 'writeoffReceipayIds', type: 'eq', value: ids })
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
    // 详情
    showDetail(row) {
      const params = { writeoffNo: row.writeoffReceipayNo }
      const query = {
        source: 'writeoffRecv',
        receivableRegId: row.receivableRegId,
        writeoffReceipayId: row.writeoffReceipayId,
      }
      this.routerPush('WriteoffRecvDetail2', query, true, params)
    },
    //导出
    handleExport() {
      const data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        columns: this.option1.columns.map((v) => v.prop),
        query: [],
      }
      if (!this.ascColumns.length && !this.descColumns.length) {
        data.descColumns = ['createdTime']
      }
      this.finCommonSearch(data.query, this.searchOption)
      if (this.isVoucherRoute) {
        this.hasVoucher && data.query.push({ column: 'hasVoucher', type: 'in', value: this.hasVoucher })
      }
      if (this.multipleSelection1.length) {
        let value = this.multipleSelection1.map((v) => v.writeoffReceipayId).join(',')
        data.query = [{ column: 'writeoffReceipayIds', type: 'in', value }]
      }
      data.query.push({ column: 'queryDataModuleCode', value: 'writeoffRecvAccExListExport' })
      this.$confirm(this.$t('Payment.exportWf'), this.$t('Supplier.exportReceiptWf'), {
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        lockScroll: 'true',
        type: 'warning',
      })
        .then(() => {
          this.lsLoading = true
          this.$store
            .dispatch('finance/downloadBlobFilePost', {
              uri: '/fin/common/queryDataExportExcel',
              data: { data },
            })
            .then((res) => {
              this.lsLoading = false
              console.log(res)
              const link = document.createElement('a')
              link.href = window.URL.createObjectURL(res)
              link.download = `${this.$t('Supplier.receiptform')}.xlsx`
              link.click()
            })
            .catch(() => {
              this.lsLoading = false
              this.$message({ message: this.$t('FeeList.exportFailed'), type: 'error' })
            })
        })
        .catch(() => {})
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params, { isTab: true })
    },
    bankAccountListAll(accountShortName, item) {
      let data = { currPage: 1, pageSize: 30, accountShortName, currency: '', status: 'effect', unitType: 'company' }
      bankAccountListAll(data).then((res) => {
        let data = res.data.map((item) => ({
          label: `${item.accountShortName}(${item.accountNo})`,
          value: item.accountShortName,
        }))
        this.remoteSelectCommon(item, data)
      })
    },
    // 获取销售
    getSellers(name = '', item, role) {
      let query = [{ column: 'roleCode', type: 'eq', value: role }] // column: 'roleCode', type: 'in', value: 'bd,obd'
      name && query.push({ column: 'name', type: 'eq', value: name })
      listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data: { list } }) => {
        list = list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList = list
      })
    },
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
  activated() {
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache || (this.$route.meta.refresh && timestamp - this.cTimestamp > 300)) {
      this.handleCurrentChange(1)
    }
  },
  components: {
    FinanceTable,
    FinanceSearch,
    PreviewDialog,
    CustomColumns,
  },
}
</script>
