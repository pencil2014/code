<template>
  <div
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    class="finance-tab-page"
    v-loading="loading"
  >
    <FinanceSearch :searchOption="searchOption1" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button
              type="primary"
              v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderWriteOffPreview')"
              @click="writeOffPreview('refuse')"
              class="finance-btn"
              size="mini"
            >付款核销</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              type="primary"
              v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderPrintCreate')"
              @click="batchPrintCreate"
              class="finance-btn"
              size="mini"
            >标记受理</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              type="purple"
              v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderCanclePayOrder')"
              @click="canclePayOrder"
              class="finance-btn"
              size="mini"
            >撤销标记受理</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderExport')"
              class="finance-btn"
              @click="handleExport('payOrderListExport')"
              size="mini"
            >列表导出</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderExport')"
              class="finance-btn"
              @click="handleExport('payOrderExternalPaymentExport')"
              size="mini"
            >银行实付汇总导出</el-button>
          </el-button-group>
          <!-- <el-button-group>
            <el-button v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderPrint')" @click="handlePrint" class="finance-btn" size="mini">批量打印</el-button>
          </el-button-group>-->
          <el-button-group v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderPrint')">
            <div class="finance-btn select-template-box">
              <el-dropdown trigger="click" @command="handlePrint">
                <span class="el-dropdown-link">
                  打印
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="(item, index) in handlePrintList"
                    :key="'handlePrintList' + index"
                    :command="item.value"
                  >{{item.label}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <!-- <el-button class="finance-btn" @click="handlePaySeparately" size="mini">拆分付款</el-button> -->
            <el-button
              v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderRefusePay')"
              type="danger"
              @click="refusePay"
              class="finance-btn"
              size="mini"
            >拒绝付款</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderDownLoadInvoice')"
              @click="handleDownLoadInvoice"
              size="mini"
            >批量下载水单</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              v-if="checkAuth($route.name, 'tab-orderList', 'btn-bankseqFileFn')"
              @click="handleBankseqFileFn"
              size="mini"
            >发送水单</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderMerge')"
              @click="handleMerge"
              class="finance-btn"
              size="mini"
            >合并付款</el-button>
            <!-- <el-button class="finance-btn" @click="handlePaySeparately" size="mini">拆分付款</el-button> -->
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderRefund')"
              @click="handleRefund"
              class="finance-btn"
              size="mini"
            >预付退款</el-button>
          </el-button-group>
          <!-- <el-button-group>
            <el-button v-if="checkAuth($route.name, 'tab-orderList', 'btn-batchPay')" @click="batchPay" class="finance-btn" size="mini">批量付款</el-button>
            需求改变
          </el-button-group>-->
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{ key: 'prop', label: 'label' }"
        @close="customColumnsPopClose"
        ref="CustomColumns"
      />
    </div>
    <PaySeparately
      :paySeparatelyDialog="paySeparatelyDialog"
      :paySeparatelyForm="paySeparatelyForm"
      @close-pay-separately-dialog="closePaySeparatelyDialog"
    />
    <el-dialog :title="'申请不通过'" :visible.sync="rejectDialogVisible" width="600px">
      <el-form :model="query" label-width="80px" ref="query">
        <el-form-item
          :rules="{
            required: true,
            message: '拒绝原因不能为空',
            trigger: 'blur'
          }"
          label="拒绝原因"
          prop="refuseReason"
        >
          <el-input :maxlength="500" show-word-limit type="textarea" v-model="query.refuseReason"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="rejectSubmit" size="mini" type="primary">确定</el-button>
        <el-button @click="rejectDialogVisible = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="refusePayOpen" class="refuse-dialog" title="拒绝付款" width="600px">
      <el-form :model="refusePayForm" label-width="80px" ref="refusePayForm">
        <el-form-item
          :rules="{
            required: true,
            message: '拒绝原因不能为空',
            trigger: 'blur'
          }"
          label="拒绝原因:"
          prop="refusePayReason"
        >
          <el-input
            :maxlength="500"
            show-word-limit
            type="textarea"
            v-model="refusePayForm.refusePayReason"
          ></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="refusePaySubmit" size="mini" type="primary">确定</el-button>
        <el-button @click="closeRefusePay" size="mini">取消</el-button>
      </span>
    </el-dialog>
    <!-- <div v-if="acceptancePayOrderShow"> 20220810 modal reason 注释 -->
    <AcceptancePayOrder
      :payOrderNoList="payOrderNoList"
      :dialogShow="dialogShow"
      @payOrderNoListClose="payOrderNoListClose"
    />
    <!-- </div> -->
    <!-- <BankseqFile v-if="dialogVisibleBankseqFile" :bankseqFileList="bankseqFileList" :bankseqFileData="bankseqFileData" :dialogVisibleBankseqFile='dialogVisibleBankseqFile'  @bankseqFiletClose="bankseqFiletClose"/> -->
    <BankseqFile
      v-if="bankseqFileList.show"
      :tableData="bankseqFileList"
      @cancel="bankseqFiletClose"
    />
  </div>
</template>
<script>
// import excel from '@/utils/excel'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import PaySeparately from '@/views/finance/pay/order/components/paySeparately'
import AcceptancePayOrder from '@/views/finance/pay/order/components/acceptancePayOrder'
import CustomColumns from '@/components/customColumns/index'
import BankseqFile from '@/views/finance/pay/order/components/bankseqFile'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import {
  queryPayOrderPage,
  acceptancePayOrder,
  queryPayOrderList,
  mergeMultiPayOrder,
  queryPayOrderPageSummary,
  refusePay,
  queryPayBankseqFileReceiInfo,
} from '@/api/fin/pay.js'
import { bankAccountListAll } from '@/api/fin/settleUnitBankAcct'
function multiFn(obj, arr) {
  arr.forEach((key) => {
    obj[key + '_multiValue'] = obj[key] instanceof Array ? obj[key] : (obj[key] || '').split(',') // 返回的是数组
    // 发票号特殊处理
    if (key === 'invoiceNoJoin') {
      obj['invoiceNoJoinIds'] = []
      obj['invoiceNoJoin_multiValue'] = obj['invoiceNoJoin_multiValue'].map((ele) => {
        const arr = ele.split('/')
        obj['invoiceNoJoinIds'].push(arr[0])
        return arr[1]
      })
    }
    // obj[key + '_multiValue'] = (obj[key] || '').split(',')
  })
  return obj
}
export default {
  name: 'OrderList',
  props: ['isJumpRouteFromPage'],
  mixins: [mixin, mixin2],
  data() {
    return {
      pageSizeUrl: queryPayOrderPage('geturl'),
      keyDownActive: true,
      paySeparatelyDialog: false,
      paySeparatelyForm: {},
      query: {
        applyNo: '',
        confirmStatus: '',
        refuseReason: '',
      },
      //发送水单
      bankseqFileList: {
        show: false,
        data: [],
      },
      bankseqFileData: {
        show: false,
        payOrderNoList: [],
        contactInfoVoList: [
          {
            name: '',
            email: '',
          },
        ],
      },
      rejectDialogVisible: false,
      option1: {},
      searchOption1: {},
      isAddPay: false,
      multipleSelection1: [],
      multipleSelection2: [],
      exportList: [],
      form: {
        orderNo: '',
        creationDate: '',
        billNo: '',
        settleCorpName: '',
        settleCorpCode: '',
      },
      orderNo: '',
      refundQuery: {},
      showBillDetail: false,
      selectedOptionItem: '',
      dialogVisible: false,
      bankseqStatusCfg: [
        { label: '有', value: 'yes' },
        { label: '无', value: 'no' },
      ],
      confirmStatusCfg: [
        { label: '已受理', value: 'pass' },
        { label: '未受理', value: 'pending' },
      ],
      hasInvoiceCfg: [
        { label: '已关联', value: 'yes' },
        { label: '未关联', value: 'no' },
      ],
      writeoffStatusCfg: [
        { label: '已核销', value: 'yes' },
        { label: '未核销', value: 'no' },
      ],
      errorDisposalStatus: [
        { label: '已处理', value: 'yes' },
        { label: '未处理', value: 'no' },
      ],
      handlePrintList: [
        { label: '批量打印', value: 'PayOrderPrint' },
        { label: '批量打印+附件', value: 'PayOrderFileNoPrint' },
        { label: '打印专项单', value: 'PayOrderPrints' },
      ],
      bankseqFileSendList: [
        { label: '已发送', value: 'yes' },
        { label: '未发送', value: 'no' },
      ],
      // 升序
      ascColumns: [],
      // 降序
      descColumns: ['defOrderTime'],
      // 初始表头
      selfColumnsBase: [
        {
          disabled: true,
          prop: 'payOrderNo',
          label: '付款单号',
          width: 146,
          type: 'button',
          operationBtns: {
            show: true,
            callback: (fn, index, row) => {
              this.showDetail(row)
            },
          },
        },
        { prop: 'orderType', label: '付款单类型', width: 100 },
        {
          prop: 'settleOrderType',
          label: '结算类型',
          type: 'select',
          width: 110,
          // propInDict:"settleOrderType"
          formatter: ({ row }) => {
            let settleOrderType = []
            row.settleOrderType.split(',').forEach((subItem) => {
              if (subItem && subItem !== 'null') {
                settleOrderType.push(this.dictMapObj.settleOrderType[subItem])
              }
            })
            return settleOrderType.toString()
          },
          sortable: false,
        },
        {
          prop: 'hasAgentPay',
          label: '是否代收付',
          type: 'select',
          propInDict: 'yesNo',
        },
        {
          prop: 'sourceApplyNo',
          label: '申请单号',
          width: 150,
          type: 'columnTip',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            callback: (applyNo, componentProps) => {
              this.componentProps = componentProps
              let row = componentProps.row
              // 结算付款和预付抵账，预付款，退款
              if (row.orderType === '预付付款' || row.orderType === '付错转预付') {
                this.$emit('update:isJumpRouteFromPage', true)
                this.$router.push({
                  name: 'PrepayDetail',
                  query: { applyNo, source: '' },
                })
                return
                // return this.routerPush('PrepayDetail', { applyNo, source: '' })
              }
              if (row.orderType === '结算付款' || row.orderType === '预付抵账') {
                this.$emit('update:isJumpRouteFromPage', true)
                this.$router.push({
                  name: 'SettleDetail',
                  query: { applyNo, source: '' },
                })
                return
                // return this.routerPush('SettleDetail', { applyNo, source: '' })
              }
              if (row.orderType === '退款付款') {
                this.$emit('update:isJumpRouteFromPage', true)
                this.$router.push({
                  name: 'RefundDetail',
                  query: { applyNo, source: '' },
                })
                return
                // return this.routerPush('RefundDetail', { applyNo, source: '' })
              }
              // 另外两种情况无单号 付错转预付，预付抵账
            },
          },
        },
        {
          prop: 'confirmStatus',
          label: '受理状态',
          formatter: ({ row }) => {
            const status = row.confirmStatus
            if (status === '已受理') {
              return '<span style="color:#33B18A">' + status + '</span>'
            } else if (status === '未受理') {
              return '<span style="color:#CD4130">' + status + '</span>'
            } else {
              return status
            }
          },
        },
        {
          prop: 'confirmName',
          label: '受理人',
          type: 'text',
          sortable: false,
        },
        {
          prop: 'confirmTime',
          label: '受理时间',
          type: 'text',
          width: 125,
        },
        {
          prop: 'mbl',
          label: 'MBL',
          type: 'text',
          sortable: false,
        },
        {
          prop: 'hbl',
          label: 'HBL',
          type: 'text',
          sortable: false,
        },
        {
          prop: 'payStatus',
          label: '付款状态',
          width: 100,
          type: 'select',
          // propInDict: 'payStatusType'
          formatter: ({ row }) => {
            const val = row.payStatus
            if (val === '已支付') {
              return '<span style="color:#33B18A">' + val + '</span>'
            } else if (val === '未支付') {
              return '<span style="color:#CD4130">' + val + '</span>'
            } else if (val === '支付中') {
              return '<span style="color:#EDB534">' + val + '</span>'
            } else {
              return val
            }
          },
        },
        { prop: 'payWay', label: '付款方式', type: 'select' },
        {
          label: '账户结算方式',
          type: 'select',
          prop: 'settleMode',
          propInDict: 'bankAccountSettleMode',
          width: 100,
          multi: true,
        },
        {
          prop: 'currency',
          label: '付款币种',
          propInDict: 'validCurrency',
        },
        { prop: 'realPayAmt', label: '实付金额' },
        { prop: 'applyAmt', label: '付款申请金额' },
        { prop: 'differenceType', label: '差额类型' },
        { prop: 'differenceAmt', label: '差额' },
        {
          prop: 'differenceDealway',
          label: '差额处理方式',
          type: 'select',
          propInDict: 'payDifferenceDealway',
          width: 120,
        },
        {
          prop: 'diffecHasPrepayRefund',
          label: '差额预付退款',
          width: 120,
          type: 'text',
          formatter: ({ row }) => {
            return row.diffecHasPrepayRefund === 'yes' ? '已退款' : row.diffecHasPrepayRefund ? '未退款' : ''
          },
        },
        { prop: 'differenceRefundAmt', label: '差额退款金额', width: 120 },

        { prop: 'recvCorpName', label: '结算单位', width: 150 },
        { prop: 'payCompName', label: '所属分公司', type: 'text', width: 150 },
        { prop: 'payBankName', label: '付款银行', width: 150 },
        // {	prop: 'payAccountName', label: '付款银行简称',	width:150,	type: 'text',},
        { prop: 'payAccountName', label: '付款账户名', width: 150 },
        { prop: 'payAccountNo', label: '付款账号', width: 125 },
        { prop: 'recvBankName', label: '收款银行', width: 125 },
        { prop: 'recvBankBranch', label: '收款银行支行', type: 'text', width: 120 },
        { prop: 'recvAccountName', label: '收款账户名', width: 150 },
        { prop: 'recvAccountNo', label: '收款账号', width: 120 },
        { prop: 'hasInvoice', label: '关联发票状态', type: 'select', propInDict: 'payRelaInvoiceStatus', width: 100 },
        {
          prop: 'invoiceNoJoin',
          label: '发票号',
          type: 'columnTip',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            callback: (no, componentProps, index) => {
              this.componentProps = componentProps
              const invoicePaymentId = componentProps.row.invoiceNoJoinIds[index]
              this.$emit('update:isJumpRouteFromPage', true)
              this.$router.push({
                name: 'InvoicePaymentListDetail',
                query: { invoicePaymentId },
              })
            },
          },
        },
        { prop: 'invoiceFinishAmt', label: '已开票金额', width: 100, sortable: false },
        { prop: 'noInvoiceAmt', label: '未开票金额', width: 100, sortable: false },
        {
          prop: 'bankseqFileNo',
          label: '水单状态',
          type: 'button',
          operationBtns: {
            show: true,
            callback: (action, $index, row) => {
              window.open(`/base/fileView/preview/${row.bankseqFileNo}/sowoll`)
            },
            data: [{ label: '有' }],
          },
        },
        { prop: 'bankseqFileReceiMail', label: '接收水单邮箱', width: 100 },
        {
          prop: 'bankseqFileSendStatus',
          label: '发送水单状态',
          width: 100,
          formatter: ({ row }) => {
            return row.bankseqFileSendStatus === 'yes' ? '已发送' : row.bankseqFileSendStatus ? '未发送' : ''
          },
        },
        { prop: 'payWriteoffStatus', label: '核销状态' },
        {
          prop: 'writeoffReceipayNo',
          label: '付款核销号',
          width: 125,
          type: 'button',
          operationBtns: {
            show: true,
            callback: (fn, index, { writeoffReceipayNo, orderType }) => {
              // TODO
              // 根据付款单类型可跳转到结算付款核销（结算、预付抵账）、退款/预付付款（退款、预付、付错转预付）
              const str =
                orderType == '结算付款' ? 'DetailSettle' : orderType == '预付抵账' ? 'PrepayWriteOffDetail' : 'DetailPrepay'
              // this.routerPush(str, { writeoffReceipayNo })

              this.$emit('update:isJumpRouteFromPage', true)
              this.$router.push({
                name: 'WritePayDetail',
                query: { writeoffReceipayNo },
              })
              // if (['预付付款', '退款付款', '付错转预付'].indexOf(orderType) > -1) {
              //   this.routerPush('DetailPrepay', { writeoffReceipayNo })
              // } else if (['结算付款', '预付抵账'].indexOf(orderType) > -1) {
              //   this.routerPush(['结算付款', '预付抵账'].indexOf(orderType) > -1 ? 'DetailSettle' : 'DetailPrepay', {
              //     writeoffReceipayNo,
              //   })
              // }
            },
          },
        },
        {
          prop: 'orderNo',
          label: '工作单号',
          width: 140,
          type: 'columnTip',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, { row }, index) => {
              console.log(row)
              let orderNoList = row.orderNo_multiValue
              let sourceTypeList = row.sourceType_multiValue
              let orderNo = orderNoList[index]
              let sourceType = sourceTypeList[index]
              let sourceBizNo = orderNo
              // this.$emit('update:isJumpRouteFromPage', true)
              this.showOneNoDetail(sourceType, sourceBizNo, { feeId: '' })
            },
          },
          sortable: false,
        },
        { prop: 'bdEmployeeName', label: '销售', width: 100, type: 'text', sortable: false },
        { prop: 'custName', label: '委托单位', width: 150, type: 'text', hasTag: true, sortable: false },
        { prop: 'writeoffFinishAmt', label: '已核销金额', width: 100 },
        { prop: 'noWriteoffAmt', label: '未核销金额', width: 100 },
        { prop: 'hasPrepayRefund', label: '预付退款' },
        { prop: 'refundAmt', label: '退款金额' },
        { prop: 'errorStatus', label: '付错标识' },
        { prop: 'errorType', label: '付错原因' },
        {
          prop: 'refPayOrderNo',
          label: '关联付款单号',
          type: 'button',
          width: 118,
          operationBtns: {
            show: true,
            callback: (fn, index, row) => {
              this.showDetail(row, row.refPayOrderNo)
            },
          },
        },
        { prop: 'errorDisposalType', label: '处理方式' },
        { prop: 'errorDisposalStatus', label: '处理状态' },
        { prop: 'printCount', label: '打印次数', type: 'text' },
        { prop: 'printTime', label: '打印时间', type: 'text', width: 135 },
        { prop: 'applyEmpName', label: '申请人', width: 100, sortable: false },
        { prop: 'payApplyConfirmName', label: '付款单审核人', width: 100, sortable: false },
        { prop: 'createdName', label: '创建人', width: 100 },
        { prop: 'createdTime', label: '创建时间', width: 125 },
        // { prop: 'confirmName', label: '付款人', width: 100 }, // 改用受理人
        { prop: 'payTime', label: '付款时间', width: 125 },
      ],
      rightFilterBtns: [true, false, false, false, false],
      refusePayForm: {
        refusePayReason: '',
      },
      refusePayOpen: false,
      loading: false,
      // 标记受理
      payOrderNoList: [],
      dialogShow: false,
      acceptancePayOrderShow: false,
    }
  },
  created() {
    console.log(this.dictMapObj.payOrderType)
    this.searchOption1 = {
      saveShow: true,
      saveName: 'writeoffPayListSettle',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        // 初始搜索条件数
        defaultSearchLength: 7,
        // 条件数组
        searchInputGroup: [
          {
            key: 'allNo',
            value: '',
            range: { min: '', max: '' },
          },
          {
            key: 'payStatus',
            value: '',
            range: { min: '', max: '' },
          },
          {
            key: 'payBankName',
            value: '',
            range: { min: '', max: '' },
          },
          {
            key: 'payWay',
            value: '',
            range: { min: '', max: '' },
          },
          {
            key: 'payAmt',
            value: '',
            range: { min: '', max: '' },
          },
          {
            key: 'applyDate',
            value: '',
            range: { min: '', max: '' },
          },
          {
            key: 'orderType',
            value: '',
            range: { min: '', max: '' },
          },
        ],
        // 左侧下拉框及对应右侧配置
        filterGroups: {
          allNo: { label: '各类单号', type: 'input', placeholder: '多个单号用空格或逗号分隔' },
          payOrderNo: { label: '付款单号', type: 'input' },
          orderNo: { label: '工作单号', type: 'input' },
          sourceApplyNo: { label: '申请单号', type: 'input' },
          writeoffReceipayNo: {
            label: '付款核销号',
            type: 'input',
          },
          invoiceNo: { label: '发票号', type: 'input' },
          // 2
          payStatus: {
            label: '付款单状态',
            type: 'select',
            multiple: true,
            prop: 'payStatusType',
          },
          confirmStatus: {
            label: '受理状态',
            selectOptions: this.confirmStatusCfg,
            type: 'select',
          },
          hasInvoice: {
            label: '关联发票状态',
            // selectOptions: this.hasInvoiceCfg,
            prop: 'payRelaInvoiceStatus',
            type: 'select',
          },
          payWriteoffStatus: {
            label: '核销状态',
            selectOptions: this.writeoffStatusCfg,
            type: 'select',
          },
          errorDisposalStatus: {
            label: '处理状态',
            selectOptions: this.errorDisposalStatus,
            type: 'select',
          },
          settleOrderType: { label: '结算类型', type: 'select', prop: 'settleOrderType', multiple: true },
          // hasAgentPay: {  label: '是否代收付',  type: 'select', prop: 'yesNo' },
          recvBankName: {
            label: '收款银行',
            type: 'input',
          },
          recvAccountName: {
            label: '收款账户名',
            type: 'input',
          },
          recvAccountNo: { label: '收款账号', type: 'input' },
          payBankName: { label: '付款银行', type: 'input' },
          payAccountName: { label: '付款账户名', type: 'input' },
          payAccountNo: {
            label: '付款银行简称',
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.bankAccountListAll(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.bankAccountListAll(queryString, item)
            },
            remoteSelectList: [],
          },
          // payAccountNo: { label: '付款账号', type: 'input' },
          // 4
          payWay: {
            label: '付款方式',
            type: 'select',
            multiple: true,
            prop: 'payWay',
          },
          currency: {
            label: '付款币种',
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
          payAmt: { label: '付款申请金额', type: 'range' },
          writeoffAmt: { label: '已核销金额', type: 'range' },
          noWriteoffAmt: { label: '未核销金额', type: 'range' },
          applyDate: { label: '创建时间', type: 'daterange', format: 'yyyy-MM-dd' },
          payDate: { label: '付款时间', type: 'daterange', format: 'yyyy-MM-dd' },
          orderType: {
            label: '付款单类型',
            type: 'select',
            multiple: true,
            prop: 'payOrderType',
          },
          recvCorpCode: {
            label: '结算单位',
            type: 'remoteSelect',
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

          payCompCode: {
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
          settleMode: { label: '账户结算方式', type: 'select', propInDict: 'bankAccountSettleMode', r: true, multiple: true },
          bdEmployeeId: {
            label: '销售',
            type: 'remoteSelect',
            remoteSelectList: [],
						remoteMethod: (queryString, item) => this.listByRole(queryString, item, 'bd') ,
						visibleChange: (queryString, item) => this.listByRole(queryString, item, 'bd') ,
          },
          mbl: { label: 'MBL', type: 'input' },
          hbl: { label: 'HBL', type: 'input' },
          payApplyConfirmName: { label: '付款单审核人', type: 'input' },
          applyEmpName: { label: '申请人', type: 'input' },
          errorStatus: {
            label: '付错标识',
            type: 'select',
            prop: 'yesNo',
          },
          errorType: {
            label: '付错原因',
            type: 'select',
            prop: 'payErrorType',
          },
          bankseqStatus: {
            label: '水单状态',
            type: 'select',
            selectOptions: this.bankseqStatusCfg,
          },
          bankseqFileSendStatus: {
            label: '发送水单状态',
            type: 'select',
            selectOptions: this.bankseqFileSendList,
          },
          // // select 远程数据
          // employeeId: {
          //   label: '所属员工',
          //   type: 'remoteSelect',
          //   remoteMethod: this.getEmployeeList,
          //   remoteSelectList: this.employeeOptions,
          //   showType: '1',
          // },
          confirmBy: {
            label: '受理人',
            type: 'remoteSelect',
            clearable: true,
            multiple: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          confirmTime: { label: '受理时间', type: 'daterange', format: 'yyyy-MM-dd' },
        },
      },
    }
    const listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '详情',
          show: true,
          action: 'showDetail',
        },
      ],
    })
    const pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'payOrderList',
      data: [],
      sortable: true,
      customColumns: {
        show: true,
        handleCustomColumns: () => this.handleCustomColumns(),
      },
      operationBtns,
      pagination,
      listAmtSummary,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      emptyText: '数据将在查询后显示',
    })
    const columns = [...this.selfColumnsBase]
    // .filter((item) => item.disabled)
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    // console.log(this.configColumns)
    // this.selfColumnsBase.forEach(item => (item.sortable = true))
    this.option1.columns = columns

    // 导出配置
    this.columnsBackup = [...columns]
    this.columnsBackup.splice(-4)
    this.exportParams = {
      title: this.columnsBackup.map((item) => item.label),
      key: this.columnsBackup.map((item) => item.prop),
      autoWidth: true,
      filename: '付款单',
    }
    // this.getData()
  },
  methods: {
    showColumnDetail(params) {
      this.showColumnDetailHandle(params)
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    // 退款按钮
    handleRefund() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要预付退款的项！')
      }
      if (this.multipleSelection1.length > 1) {
        return this.$msgErrClose('一次只能勾选一个预付退款！')
      }
      if (this.multipleSelection1[0].payStatus === '已关闭') {
        return this.$msgErrClose('付款单已关闭状态，不可操作！')
      }
      if (this.multipleSelection1[0].payWay === '现金' && this.multipleSelection1[0].orderType === '预付付款') {
        return this.$msgErrClose('付款单类型为预付付款且付款方式为现金的，暂时不可操作预付退款！')
      }
      const status =
        this.multipleSelection1[0].payWriteoffStatus === '已核销' &&
        (this.multipleSelection1[0].orderType === '预付付款' ||
          this.multipleSelection1[0].orderType === '付错转预付' ||
          this.multipleSelection1[0].differenceType === '多付')
      if (!status) {
        return this.$msgErrClose('已核销的预付付款、付错转预付、多付的付款单才能操作预付退款！')
      }
      const row = this.multipleSelection1[0]
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: 'OrderRefund',
        query: { payOrderNo: row.payOrderNo },
      })
      // this.routerPush('OrderRefund', { payOrderNo: row.payOrderNo })
    },
    writeOffPreview() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要付款核销的项！')
      }
      if (this.multipleSelection1.length > 1) {
        return this.$msgErrClose('一次只能勾选一个付款核销！')
      }
      if (this.multipleSelection1[0].payStatus === '已关闭') {
        return this.$msgErrClose('付款单已关闭状态，不可操作！')
      }
      if (this.multipleSelection1[0].confirmStatus === '未受理') {
        return this.$msgErrClose('付款单未受理，不可操作核销！')
      }
      const payWriteoffStatus = this.multipleSelection1.map((item) => item.payWriteoffStatus)
      console.log(payWriteoffStatus)
      if (payWriteoffStatus[0] == '已核销') {
        return this.$msgErrClose('已核销！无需重复核销！')
      }
      const payOrderNo = this.multipleSelection1.map((item) => {
        return item.payOrderNo
      })
      const query = {
        payOrderNo: payOrderNo[0],
        orderType: this.multipleSelection1[0].orderTypeName,
      }
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: 'OrderDetails',
        query,
      })
      // this.routerPush('WriteOffPreview', query)
    },
    // 合并付款按钮
    handleMerge() {
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: '请勾选需要合并付款的项！',
          type: 'error',
          showClose: true,
        })
        return
      }
      if (this.multipleSelection1.length < 2) {
        this.$message({
          message: '至少勾选两个合并付款！',
          type: 'error',
          showClose: true,
        })
        return
      }
      for (let i = 0; i < this.multipleSelection1.length; i++) {
        if (this.multipleSelection1[i].payStatus === '已关闭') {
          return this.$msgErrClose('付款单已关闭状态，不可操作！')
        }
        if (this.multipleSelection1[i].confirmStatus === '已受理') {
          return this.$msgErrClose('已受理状态，不可参与合并付款！')
        }
      }
      const orderTypeList = this.multipleSelection1.map((item) => {
        return item.orderType
      })
      const orderType = [...new Set(orderTypeList)]
      if (orderType.length !== 1) {
        return this.$msgErrClose('合并付款必须是付款单类型一致！')
      }
      const payOrderNoList = this.multipleSelection1.map((item) => {
        return item.payOrderNo
      })
      mergeMultiPayOrder({ payOrderNoList: payOrderNoList }).then((res) => {
        if (res.code === 0) {
          this.$message({ message: '合并付款提交成功', type: 'success' })
          this.getData()
        }
      })
    },
    rejectSubmit() {
      this.$refs.query.validate((valid) => {
        if (valid) {
          approvePayApplySettle(this.query).then(() => {
            this.$message({ message: '拒绝申请提交成功', type: 'success' })
            this.rejectDialogVisible = false
          })
        }
      })
    },
    payOrderNoListClose(val, isBreak) {
      this.acceptancePayOrderShow = false
      this.dialogShow = false
      if (isBreak === true) {
        this.getData()
      }
    },
    // 标记受理
    batchPrintCreate() {
      const len = this.multipleSelection1.length
      if (!len) {
        return this.$msgErrClose('请勾选需要标记受理的项！')
      }
      const payStatus = this.multipleSelection1.some((item) => {
        return item.payStatus === '已关闭'
      })
      if (payStatus) {
        return this.$msgErrClose('存在已关闭的付款单，不可操作！')
      }
      const confirmStatus = this.multipleSelection1.some((item) => {
        return item.confirmStatus === '已受理'
      })
      if (confirmStatus) {
        return this.$msgErrClose('存在已标记受理的付款单，请不要重复标记受理！')
      }
      this.payOrderNoList = []
      this.multipleSelection1.forEach((item) => {
        this.payOrderNoList.push({
          currency: item.currency,
          applyAmt: item.applyAmt,
          payOrderNo: item.payOrderNo,
          orderType: item.orderTypeName,
          payWay: item.payWayName,
          settleMode: item.settleMode,
          payAccountShortName: item.payAccountShortName,
          payBankName: item.payBankName,
          payAccountName: item.payAccountName,
          payAccountNo: item.payAccountNo,
          payCompCode: item.payCompCode,
          payAccountData: '',
          recvBankName: item.recvBankName,
          recvBankBranch: item.recvBankBranch,
          recvAccountNo: item.recvAccountNo,
          recvAccountName: item.recvAccountName,
          swiftCode: item.swiftCode,
          bankAccountSettleModeList: [],
          recvIdNo: item.recvIdNo,
          recvMobileNo: item.recvMobileNo,
          thirdPayChannelCode: item.thirdPayChannelCode,
          transferFeeDeductWay: item.transferFeeDeductWay,
          settleOrderType: item.settleOrderType,
        })
      })
      this.dialogShow = true
    },
    // 撤销标记受理
    canclePayOrder() {
      const len = this.multipleSelection1.length
      if (!len) {
        return this.$msgErrClose('请勾选需要撤销标记受理的数据!')
      }
      const payWriteoffStatus = this.multipleSelection1.every((item) => {
        return item.payWriteoffStatus === '未核销'
      })
      if (!payWriteoffStatus) {
        return this.$msgErrClose('只有未核销的付款单可操作撤销标记受理！')
      }
      const confirmStatus = this.multipleSelection1.every((item) => {
        return item.confirmStatus === '已受理'
      })
      if (!confirmStatus) {
        return this.$msgErrClose('只有已受理付款单可操作撤销标记受理！')
      }
      const data = []
      this.multipleSelection1.forEach((item) => {
        data.push({
          confirmStatus: 'pending',
          payOrderNo: item.payOrderNo,
          payWay: item.payWayName,
          payAccountNo: item.payAccountNo,
        })
      })
      this.$confirmWarn('确定要撤销标记受理吗?', () => {
        acceptancePayOrder(data).then((res) => {
          this.$msgSucClose('撤销标记受理成功！')
          this.getData()
        })
      })
    },
    getData(isSearch) {
      const data = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption1, undefined, 'rangeMinMax')
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({
          column: 'payStatus',
          type: 'eq',
          value: this.buttonSearch,
        })
      }
      this.loading = true
      queryPayOrderPage(data)
        .then(({ data }) => {
          this.finCommonColumns({ data })
          let list = []
          data.list.forEach((item) => {
            item.sourceType_multiValue = item.orderNo.split(',').map((subItem) => {
              let arr = subItem.split('/')
              return arr[1] ? arr[1] : arr[0]
            })
            item.orderNo_multiValue = item.orderNo.split(',').map((subItem) => {
              let arr = subItem.split('/')
              return arr[0]
            })
            if (item.whitelistFlag === 'yes') {
              item._tagArr = [
                {
                  type: 'tag-pass',
                  text: '白',
                },
              ]
            }
            list.push(item)
          })
          this.option1.data = this.convertRes(list, true)
          // console.log(this.option1.data)
          Object.assign(this.option1.pagination, data)
          // this.option1.pagination.currPage = data.currPage
          // this.option1.pagination.pageSize = data.pageSize
          // this.option1.pagination.totalCount = data.totalCount
        })
        .finally(() => {
          this.loading = false
        })
      // this.debounceLs(() => {
      //   this.getListAmtSummary(data)
      // },1300)
    },
    // 请求到数据就进行转换，不再利用table内转换，主要是将此方法通用到导出功能
    convertRes(data, multi) {
      return data.map((item) => {
        // if (multi) return multiFn(item, ['sourceApplyNo', 'invoiceNos'])

        item.payWayName = item.payWay
        item.orderTypeName = item.orderType
        item.confirmStatusName = item.confirmStatus
        item.orderType = this.dictMapObj.payOrderType[item.orderType] || ''
        item.payStatus = this.dictMapObj.payStatusType[item.payStatus] || ''
        item.payWay = this.dictMapObj.payWay[item.payWay] || ''
        item.payWriteoffStatus = item.payWriteoffStatus == 'yes' ? '已核销' : item.payWriteoffStatus != 'no' ? '' : '未核销'
        item.hasPrepayRefund = item.hasPrepayRefund == 'yes' ? '已退款' : item.hasPrepayRefund != 'no' ? '' : '未退款'
        item.errorStatus = this.dictMapObj.yesNo[item.errorStatus] || ''
        item.errorType = this.dictMapObj.payErrorType[item.errorType] || ''
        item.errorDisposalType = this.dictMapObj.payErrorDisposalType[item.errorDisposalType] || ''
        item.errorDisposalStatus = item.errorDisposalStatus == 'yes' ? '已处理' : item.errorDisposalStatus != 'no' ? '' : '未处理'
        item.confirmStatus = item.confirmStatus == 'pass' ? '已受理' : item.confirmStatus == 'pending' ? '未受理' : ''
        // item.hasInvoice =
        //   item.hasInvoice == 'yes'
        //     ? '已关联'
        //     : item.hasInvoice != 'no'
        //       ? ''
        //       : '未关联'
        return multiFn(item, ['sourceApplyNo', 'invoiceNoJoin'])
      })
    },
    sendMulti(data) {
      this.multipleSelection1 = data

      const data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      const ids = this.multipleSelection1.map((item) => item.payOrderNo).join(',')
      if (ids) {
        data2.query.push({ column: 'payOrderNoList', type: 'eq', value: ids })
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
      queryPayOrderPageSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let data = {
            payAmtSummaryList: [],
            notWriteoffAmtSummaryList: [],
          }
          data = Object.assign(data, res.data)
          const labelObj = {
            payAmtSummaryListLabel: '付款金额',
            notWriteoffAmtSummaryListLabel: '未核销金额',
          }
          const colorObj = {
            payAmtSummaryListColor: 'red', // 支持red, green, black三种值
            notWriteoffAmtSummaryListColor: 'green',
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
    // 打印
    handlePrint(val) {
      const len = this.multipleSelection1.length
      if (!len) {
        return this.$msgErrClose('请先勾选1条数据，再进行打印！')
      }
      if (len > 50) {
        return this.$msgErrClose('一次最多只能勾选50条数据进行批量打印，请重新选择！')
      }
      // if (len > 1) {
      //   return this.$msgErrClose('一次只能勾选1条数据进行打印，请重新选择！')
      // }
      const payOrderNo = this.multipleSelection1.map((item) => {
        return item.payOrderNo
      })
      let routerName = 'PayOrderPrint'
      let hasSpecialRefund = ''
      if (val === 'PayOrderPrints') {
        routerName = 'PayOrderPrints'
      }
      if (val === 'PayOrderFileNoPrint') {
        routerName = 'PayOrderFileNoPrint'
      }
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: routerName,
        query: {
          payOrderNo,
          hasSpecialRefund: val === 'PayOrderPrints' ? 'yes' : '',
        },
      })
    },
    showDetail(row, payOrderNo) {
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: 'OrderDetails',
        query: { payOrderNo: payOrderNo || row.payOrderNo },
      })
      // this.routerPush('OrderDetails', { payOrderNo: payOrderNo || row.payOrderNo })
    },
    // 导出按钮
    handleExport(code) {
      const data = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      data.query = JSON.parse(JSON.stringify(this.searchBackup || []))
      if (this.buttonSearch) {
        data.query.push({
          column: 'payStatus',
          type: 'eq',
          value: this.buttonSearch,
        })
      }
      if (this.multipleSelection1.length) {
        data.query = [{ column: 'payOrderNo', type: 'in', value: this.multipleSelection1.map((v) => v.payOrderNo).join(',') }]
      }
      // 查询对象的配置编码
      data.query.push({
        column: 'queryDataModuleCode',
        value: code,
      })
      let text = code === 'payOrderListExport' ? '是否确认导出付款单?' : '是否确认导出银行实付汇总?'
      let title = code === 'payOrderListExport' ? '导出付款单' : '导出银行实付汇总'
      this.$confirm(text, title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        lockScroll: 'true',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          this.$store
            .dispatch('finance/downloadBlobFilePost', {
              uri: 'fin/common/queryDataExportExcel',
              data: { data },
            })
            .then((res) => {
              this.loading = false
              console.log(res)
              const link = document.createElement('a')
              link.href = window.URL.createObjectURL(res)
              let name = code === 'payOrderListExport' ? '付款单.xlsx' : '银行实付汇总.xlsx'
              link.download = name
              link.click()
            })
            .catch(() => {
              this.loading = false
              this.$message({ message: '导出失败', type: 'error' })
            })
        })
        .catch(() => {})
    },
    // 自定义表头
    handleCustomColumns() {
      this.customColumnsPopShow = true
    },
    // 拆分付款
    handlePaySeparately() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要拆分付款的项！')
      }
      if (this.multipleSelection1.length > 1) {
        return this.$msgErrClose('一次只能勾选一个拆分付款！')
      }
      this.paySeparatelyDialog = true
      Object.assign(this.paySeparatelyForm, {}, this.multipleSelection1[0])
    },
    closePaySeparatelyDialog(val, isBreak) {
      this.paySeparatelyDialog = val
      if (isBreak === true) {
        this.getData()
      }
    },
    // 拒绝付款
    refusePay() {
      const len = this.multipleSelection1.length
      if (!len) {
        return this.$msgErrClose('请勾选需要拒绝付款的数据!')
      }
      const payStatus = this.multipleSelection1.some((item) => {
        return item.payStatus === '已关闭'
      })
      if (payStatus) {
        return this.$msgErrClose('已关闭的付款单，不能拒绝付款！')
      }
      const confirmStatus = this.multipleSelection1.every((item) => {
        return item.confirmStatus === '未受理'
      })
      if (!confirmStatus) {
        return this.$msgErrClose('只有未受理付款单才能拒绝付款！')
      }
      const orderType = this.multipleSelection1.some((item) => {
        return item.orderType === '退款付款'
      })
      // if (orderType) {
      //   return this.$msgErrClose('退款付款不能拒绝付款！')
      // }
      this.$confirm('您是否确认拒绝该笔付款？', '拒绝付款', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          const payOrderNoList = this.multipleSelection1.map((item) => {
            return item.payOrderNo
          })
          const refuseReason = this.refusePayForm.refusePayReason
          const data = {
            payOrderNoList,
          }
          refusePay(data)
            .then((res) => {
              if (res.code === 0) {
                this.$msgSucClose('拒绝付款成功！')
                this.getData()
              }
            })
            .catch()
        })
        .catch(() => {})

      // this.refusePayOpen = true
    },
    // 拒绝付款提交
    refusePaySubmit() {
      this.$refs.refusePayForm.validate((valid) => {
        if (valid) {
          const payOrderNoList = this.multipleSelection1.map((item) => {
            return item.payOrderNo
          })
          const refuseReason = this.refusePayForm.refusePayReason
          const data = {
            payOrderNoList,
            refuseReason,
          }
          refusePay(data)
            .then((res) => {
              if (res.code === 0) {
                this.$msgSucClose('拒绝付款成功！')
                this.getData()
                this.closeRefusePay()
              }
            })
            .catch()
        }
      })
    },
    //发送水单返回
    bankseqFiletClose() {
      this.bankseqFileList.show = false
      this.getData()
    },
    //发送水单
    handleBankseqFileFn() {
      let len = this.multipleSelection1
      if (len.length === 0) {
        return this.$msgErrClose('请勾选需要发送水单的项！')
      }
      if (len > 30) {
        return this.$msgErrClose('一次最多只支持发送30条！')
      }
      let sta = len.some((item) => !item.bankseqFileNo)
      if (sta) {
        return this.$msgErrClose('勾选的数据中存在无水单的项，请重新选择！')
      }
      this.loading = true
      let payOrderNoList = len.map((item) => {
        return item.payOrderNo
      })
      queryPayBankseqFileReceiInfo({ payOrderNoList })
        .then((res) => {
          this.bankseqFileList.data = res.data
          this.bankseqFileList.show = true
        })
        .finally(() => {
          this.loading = false
        })
    },
    bankAccountListAll(accountShortName, item) {
      let data = { currPage: 1, pageSize: 30, accountShortName, currency: '', status: 'effect', unitType: 'company' }
      bankAccountListAll(data).then((res) => {
        let data = res.data.map((item) => ({ label: `${item.accountShortName}(${item.accountNo})`, value: item.accountNo }))
        this.remoteSelectCommon(item, data)
      })
    },
    //批量下载
    handleDownLoadInvoice() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要下载付款单水单的项！')
      }
      // for (let i = 0; i < this.multipleSelection1.length; i++) {
      //   if (this.multipleSelection1[i].status === 'pending') {
      //     return this.$msgErrClose('待审核状态不可批量下载！')
      //   }
      // }
      let data = {
        payOrderNoList: this.multipleSelection1.map((item, index) => {
          return item.payOrderNo
        }),
      }
      let payOrderNoList = []
      for (let i = 0; i < this.multipleSelection1.length; i++) {
        if (!this.multipleSelection1[i].bankseqFileNo) {
          return this.$msgErrClose('请勾选有水单的付款单，请重新选择！')
        }
        if (!this.multipleSelection1[i].bankseqFileNo) {
          payOrderNoList.push(this.multipleSelection1[i].payOrderNo)
        }
      }
      this.$confirm(
        payOrderNoList.length
          ? '您有' + payOrderNoList.toString() + '付款单号未上传水单，不能被下载，是否确认下载已上传的水单！'
          : '您是否确定批量下载水单吗?',
        '下载水单',
        {
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '执行中...'
              setTimeout(() => {
                this.$store
                  .dispatch('finance/downloadBlobFilePost', {
                    uri: '/fin/pay/order/downloadPayBankseqFile',
                    data: { data },
                  })
                  .then((res) => {
                    let link = document.createElement('a')
                    link.href = window.URL.createObjectURL(res)
                    link.download = '水单.zip'
                    link.click()
                    done()
                    instance.confirmButtonLoading = false
                  })
                  .catch((err) => {
                    done()
                    instance.confirmButtonLoading = false
                  })
              }, 500)
            } else {
              done()
            }
          },
        }
      )
        .then((err) => {})
        .catch(() => {})
    },
    // 关闭拒绝付款弹窗
    closeRefusePay() {
      this.refusePayOpen = false
      this.$refs.refusePayForm.resetFields()
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    CustomColumns,
    PaySeparately,
    AcceptancePayOrder,
    BankseqFile,
  },
  watch: {
    // 监听点击过来获取数据
    // isJumpRouteFromPage: {
    // 	handler (val) {
    // 		if (!val) {
    // 			this.$nextTick(() => {
    // 				this.getData()
    // 			})
    // 		}
    // 	},
    // 	immediate: true
    // }
  },
  activated() {
    // if (!this.$route.meta.isUseCache) { // 20220810 不自动加载数据注释
    //   this.getData()
    // }
  },
}
</script>
<style lang="scss">
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
.app-wrapper {
  .finance-page {
    .refuse-dialog {
      textarea,
      .el-textarea__inner {
        height: 60px !important;
        min-height: auto !important;
      }
    }
  }
}
</style>
<style type="text/css" media="print">
.finance-tab-page .el-button--purple {
  color: #ffffff;
  background-color: #674dc9;
  border-color: #674dc9;
}
.finance-tab-page .el-button--purple:hover,
.finance-tab-page .el-button--purple:focus {
  background: #8571d4;
  border-color: #8571d4;
  color: #ffffff;
}
</style>
