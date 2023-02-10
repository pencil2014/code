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
          >{{$t('Collect.receiptsWf')}}</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-prerevList', 'btn-transerSettleCorp')"
            class="finance-btn"
            @click="exchangeCorpShow"
            size="mini"
            type="primary"
          >{{$t('Collect.prereceipts')}}</el-button>
          <!-- v-if="checkAuth($route.name, 'tab-writeoffRecvList', 'btn-handleExport')" -->
          <el-button
            class="finance-btn"
            @click="handleExport"
            size="mini"
            v-if="checkAuth($route.name, 'tab-prerevList', 'btn-handleExport')"
          >{{$t('Common.export')}}</el-button>
        </div>
        <div class="money-box-right">
          <el-button
            class="finance-btn"
            @click="handleRefund"
            size="mini"
            v-if="checkAuth($route.name, 'tab-prerevList', 'btn-refund')"
            type="danger"
          >{{$t('Collect.refund')}}</el-button>
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
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
    <el-dialog :visible.sync="exchangeCorpDialog" class="self-dialog" :title="$t('Collect.prereceipts')" width="500px">
      <el-form :model="corpForm" ref="corpForm" :rules="corpRules" label-suffix=":" size="mini" :inline="false">
        <el-form-item :label="$t('FeeList.settleCorp')" prop="settleCorp">
          <el-select
            style="width: 100%;"
            v-model="corpForm.settleCorp"
            value-key="value"
            :placeholder="$t('Common.plSelect')"
            filterable
            remote
            :remote-method="(val) => settleCorpSelectRemote(val)"
            @visible-change="(val) => val && settleCorpSelectRemote('')"
          >
            <el-option
              v-for="(item,index) in settleCorpSelectList"
              :key="item.value+item.label+index"
              :label="item.label"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('Collect.transferReason')" prop="reason">
          <el-input
            v-model="corpForm.reason"
            type="textarea"
            :placeholder="$t('Common.plEnter')"
            size="mini"
            clearable
            show-word-limit
            maxlength="300"
          ></el-input>
        </el-form-item>
        <el-form-item
          v-if="isShowUpload"
          :label="$t('Common.attachment')"
          prop="fileNo"
          class="invoice-payment-add-form-upload"
          style="position:relative;"
        >
          <el-input
            v-model="corpForm.fileNo"
            style="position:absolute;right:0;top:0;width:1px;height:1px;opacity:0;"
          ></el-input>
          <FinanceUploadEmbed
            :upload-api="uploadApi2"
            :upload-params="uploadParams2"
            :limit="1"
            :width="450"
            @send-res-file-list="sendResFileList"
          />
        </el-form-item>
      </el-form>
      <div class="dialog-footer" slot="footer">
        <el-button @click="exchangeCorp" size="mini" type="primary">{{$t('Common.sure')}}</el-button>
        <el-button @click="exchangeCorpDialog = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </div>
    </el-dialog>
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
export default {
  name: 'prerev',
  // props: ['isJumpRouteFromPage'],
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: receivablePrerevList('geturl'),
      keyDownActive: true,
      isShowUpload: true,
      uploadApi2: '/base/webapi/file/upload',
      uploadParams2: {},
      exchangeCorpDialog: false,
      corpForm: { settleCorp: '', fileNo: '', reason: '' },
      corpRules: {
        settleCorp: [{ required: true, message: ' ', trigger: 'change' }],
        reason: [{ required: true, message: ' ', trigger: 'change' }],
        fileNo: [{ required: true, message: this.$t('Common.required'), trigger: 'change' }],
      },
      settleCorpSelectList: [],
      previewDialog: {
        show: false,
        title: this.$t('Common.previewVoucher'),
        seqNo: '',
        showData: {},
      },
      searchBackup: [],
      currentComponent: '',
      receivablePrerevId: 0,
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
          label: this.$t('Collect.advanceNo'),
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
          label: this.$t('Settle.branchCompany'),
          type: 'text',
          width: 150,
          sortable: true,
        },
        {
          prop: 'payAccountName',
          label: this.$t('Collect.accountName'),
          type: 'text',
          width: '130px',
          sortable: true,
        },
        {
          prop: 'payBankName',
          label: this.$t('Collect.paymentBank'),
          width: '124px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'payAccountNo',
          label: this.$t('Collect.accountNumber'),
          width: '104px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'receiveAmt',
          label: this.$t('Collect.originalAmt'),
          width: '124px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'accountNo',
          label: this.$t('Settle.recvAccountNo'),
          width: '114px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'accountShortName',
          label: this.$t('Collect.abbreviationCol'),
          width: '130px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'bankName',
          label: this.$t('Collect.ourReceivingBank'),
          width: '114px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'recvDate',
          label: this.$t('FeeList.receivePayDates'),
          width: '114px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'preceiveAmt',
          label: this.$t('Collect.amountReceipts'),
          width: '124px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'balance',
          label: this.$t('Collect.preceiveBalance'),
          width: '124px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'refundAmt',
          label: this.$t('Collect.refundAmt'),
          width: '104px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'writeoffAmt',
          label: this.$t('Collect.writtenoffAmount'),
          width: '104px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'currency',
          label: this.$t('Collect.prereceiptCur'),
          width: '104px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'settleCorpName',
          label: this.$t('FeeList.settleCorp'),
          width: 150,
          sortable: true,
          type: 'text',
        },
        {
          prop: 'settleCorpType',
          label: this.$t('FeeList.settleCorpType'),
          width: '124px',
          sortable: false,
          type: 'text',
        },
        {
          prop: 'isTemporary',
          label: this.$t('Collect.isVirtual'),
          width: '124px',
          sortable: true,
          type: 'select',
          propInDict: 'yesNo',
        },
        {
          prop: 'isTransfer',
         label: this.$t('Collect.transferAdv'),
          width: '134px',
          sortable: true,
          type: 'select',
          propInDict: 'yesNo',
        },
        { prop: 'assistedCompName', label: this.$t('Collect.branchCollect'), width: '150px', sortable: true },
        {
          prop: 'writeoffReceipayNo',
         label: this.$t('Hedge.writeoffNo'),
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
          label: this.$t('Hedge.voucherNumber'),
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
          label: this.$t('Collect.receivableRegNo'),
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
          label: this.$t('Collect.newAdvance'),
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
          label: this.$t('Collect.sourcesAdvance'),
          width: '104px',
          sortable: true,
          type: 'select',
          propInDict: 'receivablePrerevSourceType',
        },
        {
          prop: 'lockStatus',
          label: this.$t('Collect.lockStatus'),
          width: '104px',
          sortable: true,
          type: 'select',
          propInDict: 'finLockStatus',
        },
        {
          prop: 'lockReason',
          label: this.$t('FeeList.lockReason'),
          width: '124px',
          sortable: true,
          type: 'tooltip',
        },
        // {
        //   prop: 'invoiceNos',
        //   label: this.$t('FeeList.invoiceNo'),
        //   type: 'columnTip',
        //   width: 140,
        //   sortable: false,
        //   component: 'ColumnTip',
        //   componentProps: {
        //     show: false,
        //     callback: (no, componentProps, index) => {
        //       let row = componentProps.row
        //       let invoiceReceivableIds = row.invoiceReceivableIds_multiValue
        //         ? row.invoiceReceivableIds_multiValue
        //         : row.invoiceNos_multiValue
        //       let invoiceReceivableId = invoiceReceivableIds[index]
        //       let query = {
        //         source: 'detail',
        //         invoiceReceivableId,
        //       }
        //       this.$emit('update:isJumpRouteFromPage', true)
        //       this.$router.push({
        //         path: '/finance/receivable/invoiceReceivableDetail',
        //         query,
        //       })
        //     },
        //   },
        // },
        {
          prop: 'bankseqFileCode',
          label: this.$t('Collect.waterBill'),
          type: 'button',
          width: '80px',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              window.open(`/base/fileView/preview/${row.bankseqFileCode}/sowoll`)
            },
            data: [{ label: this.$t('Common.view'), type: 'text', show: true }],
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
              window.open(`/base/fileView/preview/${row.payBankseqFileNo}/sowoll`)
            },
            data: [{ label: this.$t('Common.view'), type: 'text', show: true }],
          },
          sortable: false,
        },
        {
          prop: 'createdName',
          label: this.$t('Common.createdBy'),
          width: '104px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'createdTime',
          label: this.$t('Common.createTime'),
          width: '130px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'updatedName',
          label: this.$t('Common.updatedBy'),
          width: '104px',
          sortable: true,
          type: 'text',
        },
        {
          prop: 'updatedTime',
          label: this.$t('Common.updateTime'),
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
          allNo: { label: this.$t('FeeList.allNo'), type: 'input' },
          receivablePrerevNo: { label: this.$t('Collect.advanceNo'), type: 'input' },
          newReceivablePrerevNo: { label: this.$t('Collect.newAdvance'), type: 'input' },
          writeoffReceipayNo: {label: this.$t('Hedge.writeoffNo'), type: 'input' },
          voucherNo: { label: this.$t('Hedge.voucherNumber'), type: 'input' },
          receivableRegNo: { label: this.$t('Collect.receivableRegNo'), type: 'input' },
          // invoiceNo: { label: this.$t('FeeList.invoiceNo'), type: 'input' },
          sourceType: { label: this.$t('Collect.sourcesAdvance'), type: 'select', prop: 'receivablePrerevSourceType' },
          isTransfer: { label: this.$t('Collect.transferAdv'), type: 'select', prop: 'yesNo' },
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
          assistedCompCode: {
            label: this.$t('Collect.branchCollect'),
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
            label: this.$t('Settle.branchCompany'),
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
          settleCorpType: { label: this.$t('FeeList.settleCorpType'), type: 'select', prop: 'settleUnitType', multiple: true },
          isTemporary: { label: this.$t('Collect.isVirtual'), type: 'select', prop: 'yesNo' },
          payBankName: { label: this.$t('Collect.paymentBank'), type: 'input' },
          payAccountName: { label: this.$t('Collect.accountName'), type: 'input' },
          payAccountNo: { label: this.$t('Collect.accountNumber'), type: 'input' },
          accountNo: { label: this.$t('Settle.recvAccountNo'), type: 'input' },
          accountShortName: { label: this.$t('Collect.abbreviationCol'), type: 'input' },
          bankName: { label: this.$t('Collect.ourReceivingBank'), type: 'input' },
          recvDate: { label: this.$t('FeeList.receivePayDates'), type: 'lsDaterange', format: 'yyyy-MM-dd' },
          currency: {
            label: this.$t('Collect.prereceiptCur'),
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
          preceiveAmt: { label: this.$t('Collect.amountReceipts'), type: 'range' },
          receiveAmt: { label: this.$t('Collect.originalAmt'), type: 'range' },
          balance: { label: this.$t('Collect.preceiveBalance'), type: 'range' },
          refundAmt: { label: this.$t('Collect.refundAmt'), type: 'range' },
          writeoffAmt: { label: this.$t('Collect.writtenoffAmount'), type: 'range' },
          hasBankseqFile: { label: this.$t('Collect.waterBill'), type: 'select', prop: 'hasNo' },
          hasPayBankseqFile: { label: this.$t('Collect.paymentWaterBill'), type: 'select', prop: 'hasNo' },
          lockStatus: { label: this.$t('Collect.lockStatus'), type: 'select', prop: 'finLockStatus' },
          createdBy: {
            label: this.$t('Common.createdBy'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          createdTime: { label: this.$t('Common.createTime'), type: 'daterange', format: 'yyyy-MM-dd' },
          updatedTime: { label: this.$t('Common.updateTime'), type: 'daterange', format: 'yyyy-MM-dd' },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: this.$t('Common.details'),
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
      emptyText: this.$t('Common.emptyText'),
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
        return this.$msgErrClose(this.$t('Collect.refundCheck'))
      }
      if (this.multipleSelection1.length > 1) {
        return this.$msgErrClose(this.$t('Collect.checkedTips'))
      }
      if (this.multipleSelection1[0].lockStatus === 'lock') {
        return this.$msgErrClose(this.$t('Collect.refund') + ': ' + this.multipleSelection1[0].lockReason)
      }
      if (this.multipleSelection1[0].balance == 0) {
        return this.$msgErrClose(this.$t('Collect.balanceTips'))
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
            unitCode: this.multipleSelection1[0].settleCorpCode,
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
          title: this.$t('Collect.refundableAmt'),
          receivablePrerevId: item.receivablePrerevId,
          preceiveAmt: new LSnum(item.balance).toNum(2), // new LSnum(item.balance).minus(item.interTransferFee).toNum(2),
          recvCompCode: item.recvCompCode,
          currency: item.currency,
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
          settleCorpCode: item.settleCorpCode,
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
      // this.debounceLs(() => {
      //   this.getListAmtSummary(data)
      // })
    },
    getListAmtSummary(data) {
      getPrerevListAmtSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let labelObj = {
            preceiveAmtListLabel: this.$t('Collect.prereceivedAmt'),
            preceiveBalanceAmtListLabel: this.$t('Collect.availableadvAmt'),
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
            this.$msgSucClose(this.$t('Collect.rejectionSuc'))
            this.rejectDialogVisible = false
          })
        }
      })
    },
    //预收款核销按钮
    receivablePrerevWriteoff() {
      if (this.multipleSelection1.length === 0) {
        this.$msgErrClose(this.$t('Collect.needwritten'))
        return
      }
      if (this.multipleSelection1.length > 1) {
        this.$msgErrClose(this.$t('Collect.oneitemcan'))
        return
      }
      if (this.multipleSelection1[0].lockStatus !== 'unlock') {
        return this.$msgErrClose(this.multipleSelection1[0].lockReason + ' ,'+ this.$t('Collect.performed'))
      }
      if (this.multipleSelection1[0].balance == 0) {
        this.$msgErrClose(this.$t('Collect.canbemade'))
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
          this.aTagClick(window.URL.createObjectURL(res), `${this.$t('Collect.listofAdvance')}.xlsx`)
        })
        .finally(() => (this.lsLoading = false))
    },
    exchangeCorpShow() {
      let rows = this.multipleSelection1
      if (rows.length !== 1) {
        return this.$msgErrClose(this.$t('Collect.operationone'))
      }
      let row = rows[0]
      // if (row.isTemporary !== 'yes') {
      //   return this.$msgErrClose('请勾选虚拟的结算单位进行操作！')
      // }
      if (row.lockStatus !== 'unlock') {
        return this.$msgErrClose(row.lockReason + ' ,'+ this.$t('Collect.performed'))
      }
      this.receivablePrerevId = row.receivablePrerevId
      this.transferSettleCorpCode = row.settleCorpCode
      this.exchangeCorpDialog = true
    },
    settleCorpSelectRemote(queryString) {
      this.$store.dispatch('dict/querySettleUnit', { queryString }).then((data) => {
        this.settleCorpSelectList = data.map((item) => ({ label: item.value, value: item.key }))
      })
    },
    // 修改结算单位
    exchangeCorp() {
      console.log(this.corpForm)
      this.$refs.corpForm.validate((valid) => {
        if (!valid) return
        if (this.transferSettleCorpCode === this.corpForm.settleCorp.newSettleCorpCode) {
          return this.$msgErrClose(this.$t('Collect.billingunit'))
        }
        let { value: newSettleCorpCode, label: newSettleCorpName } = this.corpForm.settleCorp
        let receivablePrerevId = this.receivablePrerevId
        transferSettleCorp({ ...this.corpForm, receivablePrerevId, newSettleCorpCode, newSettleCorpName }).then((res) => {
          this.$msgSucClose(this.$t('Collect.transferSuc'))
          this.getData()
          this.exchangeCorpDialog = false
        })
      })
    },
    sendResFileList(val) {
      console.log(val)
      this.corpForm.fileId = val && val.length > 0 ? val[0].fileNo : ''
      this.corpForm.fileNo = val && val.length > 0 ? val[0].fileNo : ''
      this.corpForm.fileName = val && val.length > 0 ? val[0].name : ''
    },
  },
  watch: {
    exchangeCorpDialog(val) {
      this.isShowUpload = val
      if (val) {
        this.corpForm.settleCorp = ''
        this.corpForm.fileNo = ''
        this.corpForm.fileName = ''
        this.corpForm.reason = ''
        this.$nextTick(() => this.$refs.corpForm.clearValidate())
      }
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
  },
}
</script>
<style>
</style>