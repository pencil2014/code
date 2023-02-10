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
            <el-button type="primary" v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderWriteOffPreview')" @click="writeOffPreview('refuse')" class="finance-btn" size="mini">{{$t('PayApplyList.payWriteOff')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button type="primary" v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderPrintCreate')" @click="batchPrintCreate" class="finance-btn" size="mini">{{$t('PayApplyList.markAcceptance')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button type="purple" v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderCanclePayOrder')"  @click="canclePayOrder" class="finance-btn" size="mini">{{$t('PayApplyList.cancelAcceptance')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderExport')" class="finance-btn" @click="handleExport('payOrderListExport')" size="mini"
							>{{$t('OrderFee.list')+$t('OrderFee.enspace')+$t('OrderFee.export')}}</el-button
            ><!-- 列表导出 -->
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderExport')" class="finance-btn" @click="handleExport('payOrderExternalPaymentExport')" size="mini"
							>{{$t('PayApplyList.exportPayExtSum')}}</el-button
            ><!-- 对外付款汇总导出->银行实付汇总导出 -->
          </el-button-group>
          <!-- <el-button-group>
            <el-button v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderPrint')" @click="handlePrint" class="finance-btn" size="mini">批量打印</el-button>
          </el-button-group> -->
          <el-button-group v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderPrint')">
            <div class="finance-btn select-template-box">
						 <el-dropdown trigger="click" @command="handlePrint">
                <span class="el-dropdown-link">
                {{$t('PayApplyList.print')}}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="(item, index) in handlePrintList" :key="'handlePrintList' + index"
                    :command="item.value">
                    {{item.label}}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
					</el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <!-- <el-button class="finance-btn" @click="handlePaySeparately" size="mini">拆分付款</el-button> -->
            <el-button v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderRefusePay')" type="danger" @click="refusePay" class="finance-btn" size="mini">{{$t('PayApplyList.refusePay')}}</el-button><!-- 拒绝付款 -->
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderDownLoadInvoice')" @click="handleDownLoadInvoice" size="mini">{{$t('PayApplyList.batchDownBankSlip')}}</el-button><!-- 批量下载水单 -->
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-orderList', 'btn-bankseqFileFn')" @click="handleBankseqFileFn" size="mini">{{$t('PayApplyList.sendBankSlip')}}</el-button><!-- 发送水单 -->
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderMerge')" @click="handleMerge" class="finance-btn" size="mini">{{$t('PayApplyList.combinedPayment')}}</el-button><!-- 合并付款 -->
            <!-- <el-button class="finance-btn" @click="handlePaySeparately" size="mini">拆分付款</el-button> -->
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'tab-orderList', 'btn-orderRefund')" @click="handleRefund" class="finance-btn" size="mini">{{$t('PayApplyList.prepayRefund')}}</el-button><!-- 预付退款 -->
          </el-button-group>
          <!-- <el-button-group>
            <el-button v-if="checkAuth($route.name, 'tab-orderList', 'btn-batchPay')" @click="batchPay" class="finance-btn" size="mini">批量付款</el-button>
            需求改变
          </el-button-group> -->
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="refreshListPage"
              size="mini"
              type="primary"
            >{{$t('Common.refresh')}}</el-button>
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
    <el-dialog :title="$t('OrderFee.notPassed')" :visible.sync="rejectDialogVisible" width="600px"><!-- 申请不通过 -->
      <el-form :model="query" label-width="80px" ref="query">
        <el-form-item
          :rules="{
            required: true,
            message: ' ',
            trigger: 'blur'
          }"
          :label="$t('OrderFee.refuseReason')"
          prop="refuseReason"
        >
          <el-input :maxlength="500" show-word-limit type="textarea" v-model="query.refuseReason"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="rejectSubmit" size="mini" type="primary">{{$t('OrderFee.confirm')}}</el-button>
        <el-button @click="rejectDialogVisible = false" size="mini">{{$t('OrderFee.cancel')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="refusePayOpen" class="refuse-dialog" :title="$t('PayApplyList.refusePay')" width="600px"><!-- 拒绝付款 -->
      <el-form :model="refusePayForm" label-width="80px" ref="refusePayForm">
        <el-form-item
          :rules="{
            required: true,
            message: ' ',
            trigger: 'blur'
          }"
          :label="$t('OrderFee.refuseReason')"
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
        <el-button @click="refusePaySubmit" size="mini" type="primary">{{$t('OrderFee.confirm')}}</el-button>
        <el-button @click="closeRefusePay" size="mini">{{$t('OrderFee.cancel')}}</el-button>
      </span>
    </el-dialog>
    <!-- <div v-if="acceptancePayOrderShow"> 20220810 modal reason 注释 -->
      <AcceptancePayOrder :payOrderNoList="payOrderNoList" :dialogShow="dialogShow" @payOrderNoListClose="payOrderNoListClose" />
    <!-- </div> -->
    <!-- <BankseqFile v-if="dialogVisibleBankseqFile" :bankseqFileList="bankseqFileList" :bankseqFileData="bankseqFileData" :dialogVisibleBankseqFile='dialogVisibleBankseqFile'  @bankseqFiletClose="bankseqFiletClose"/> -->
    <BankseqFile v-if="bankseqFileList.show" :tableData="bankseqFileList" @cancel="bankseqFiletClose"/>
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
  queryPayBankseqFileReceiInfo
} from '@/api/fin/pay.js'
import { listByRole, bankList } from '@/api/base'
import { bankAccountListAll } from '@/api/fin/settleUnitBankAcct'
import { dateFormat } from '@/views/finance/utils/finance'
function multiFn(obj, arr) {
  arr.forEach(key => {
    obj[key + '_multiValue'] =
      obj[key] instanceof Array ? obj[key] : (obj[key] || '').split(',') // 返回的是数组
    // 发票号特殊处理
    if (key === 'invoiceNoJoin') {
      obj['invoiceNoJoinIds'] = []
      obj['invoiceNoJoin_multiValue'] = obj['invoiceNoJoin_multiValue'].map(
        ele => {
          const arr = ele.split('/')
          obj['invoiceNoJoinIds'].push(arr[0])
          return arr[1]
        }
      )
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
        refuseReason: ''
      },
      //发送水单
      bankseqFileList:{
        show: false,
        data: []
      },
      bankseqFileData:{
        show:false,
        payOrderNoList:[],
        contactInfoVoList:[
          {
            name:"",
            email:''
          }
        ]
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
        settleCorpCode: ''
      },
      orderNo: '',
      refundQuery: {},
      showBillDetail: false,
      selectedOptionItem: '',
      dialogVisible: false,
      bankseqStatusCfg: [
        { label: this.$t('OrderFee.yes'), value: 'yes' }, // '有'
        { label: this.$t('OrderFee.no'), value: 'no' } // '无'
      ],
      confirmStatusCfg: [
        { label: this.$t('PayApplyList.accepted'), value: 'pass' }, // '已受理'
        { label: this.$t('PayApplyList.waitAccepted'), value: 'pending' } // '未受理'
      ],
      // hasInvoiceCfg: [ // 海外版不显示
      //   { label: '已关联', value: 'yes' },
      //   { label: '未关联', value: 'no' }
      // ],
      writeoffStatusCfg: [
        { label: this.$t('OrderFee.yes'), value: 'yes' }, // '已核销'
        { label: this.$t('OrderFee.no'), value: 'no' } // '未核销'
      ],
      errorDisposalStatus: [
        { label: this.$t('PayApplyList.hasHandled'), value: 'yes' }, // '已处理'
        { label: this.$t('PayApplyList.notHandled'), value: 'no' } // '未处理'
      ],
      handlePrintList:[
        { label: this.$t('PayApplyList.batchPrint'), value: 'PayOrderPrint' }, // '批量打印'
        { label: this.$t('PayApplyList.batchPrintAndAttach'), value: 'PayOrderFileNoPrint' }, // '批量打印+附件'
				{ label: this.$t('PayApplyList.printSpecial'), value: 'PayOrderPrints' }, // '打印专项单'
      ],
      bankseqFileSendList: [
        { label: this.$t('OrderFee.yes'), value: 'yes' }, // '已发送'
        { label: this.$t('OrderFee.no'), value: 'no' } // '未发送'
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
          label: this.$t('Settle.payOrderNo'),
          width: 146,
          type: 'button',
          operationBtns: {
            show: true,
            callback: (fn, index, row) => {
              this.showDetail(row)
            }
          }
        },
        { prop: 'orderType', label: this.$t('PayApplyList.payOrderType'), width: 150, type: 'select', propInDict: 'payOrderType' }, // '付款单类型'
        {
          prop: 'settleOrderType',
          label: this.$t('PayApplyList.settleOrderType'), // '结算类型',
          type: 'select',
          width: 115,
          // propInDict:"settleOrderType"
          formatter:({row})=>{
            let settleOrderType = []
            row.settleOrderType.split(',').forEach(subItem => {
              if(subItem && subItem !== 'null'){
                settleOrderType.push(this.dictMapObj.settleOrderType[subItem])
              }
            })
            return settleOrderType.toString()
          },
          sortable: false
        },
        {
          prop: 'hasAgentPay',
          label: this.$t('PayApplyList.isPaidOnBehalf'), // '是否代收付',
          type: 'select',
          propInDict:"yesNo",
          width: 170
        },
        {
          prop: 'sourceApplyNo',
          label: this.$t('PayApplyList.payApplyNo'), // '申请单号',
          width: 150,
          type: 'columnTip',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            callback: (applyNo, componentProps) => {
              this.componentProps = componentProps
              let row = componentProps.row
              // 结算付款和预付抵账，预付款，退款
              if (row.orderType === 'prepay' || row.orderType === 'transfer_prepay') { // if (row.orderType === '预付付款' || row.orderType === '付错转预付') {
                this.$emit('update:isJumpRouteFromPage', true)
                this.$router.push({
                  name: 'PrepayDetail',
                  query: { applyNo, source: '' }
                })
                return
                // return this.routerPush('PrepayDetail', { applyNo, source: '' })
              }
              if (row.orderType === 'settle_pay' || row.orderType === 'prepay_to_repay') { // if (row.orderType === '结算付款' || row.orderType === '预付抵账') {
                this.$emit('update:isJumpRouteFromPage', true)
                this.$router.push({
                  name: 'SettleDetail',
                  query: { applyNo, source: '' }
                })
                return
                // return this.routerPush('SettleDetail', { applyNo, source: '' })
              }
              if (row.orderType === 'refund_pay') { // if (row.orderType === '退款付款') {
                this.$emit('update:isJumpRouteFromPage', true)
                this.$router.push({
                  name: 'RefundDetail',
                  query: { applyNo, source: '' }
                })
                return
                // return this.routerPush('RefundDetail', { applyNo, source: '' })
              }
              // 另外两种情况无单号 付错转预付，预付抵账
            }
          }
        },
        { 
          prop: 'confirmStatus',
          label: this.$t('PayApplyList.acceptanceStatus'), // '受理状态',
          formatter:({row})=>{
            const status = row.confirmStatus
            if (status === 'pass') { // if (status === '已受理') {
              return '<span style="color:#33B18A">'+this.$t('PayApplyList.accepted')+'</span>' // +status+
            } else if (status === 'pending') { // } else if (status === '未受理') {
              return '<span style="color:#CD4130">'+this.$t('PayApplyList.waitAccepted')+'</span>' // +status+
            } else {
              return status
            }
          },
          width: 140
        },
        {
          prop: 'confirmName',
          label: this.$t('PayApplyList.acceptor'), // '受理人',
          type: 'text',
          sortable: false
        },
        {
          prop: 'confirmTime',
          label: this.$t('PayApplyList.acceptanceTime'), // '受理时间',
          type: 'text',
          width: 130
        },
        {
          prop: 'mbl',
          label: 'MBL',
          type: 'text',
          sortable: false
        },
        {
          prop: 'hbl',
          label: 'HBL',
          type: 'text',
          sortable: false
        },
        {
          prop: 'payStatus',
          label: this.$t('PayApplyList.payStatus'), // '付款状态',
          width: 120,
          type: 'select',
          // propInDict: 'payStatusType'
          formatter:({row})=>{
            const val = row.payStatus
            let title = this.dictMapObj.payStatusType[val]
            if (val === 'pay_done') { // 已支付
              return '<span style="color:#33B18A">'+title+'</span>' // +val+
            } else if (val === 'no_pay') { // 未支付
              return '<span style="color:#CD4130">'+title+'</span>' // +val+
            } else if (val === 'paying') { // 支付中
              return '<span style="color:#EDB534">'+title+'</span>' // +val+
            } else if (val === 'pay_close') {
              return title
            } else {
              return val
            }
          }
        },
        { prop: 'payWay', label: this.$t('PayApplyList.payWay'), type: 'select', width: 120 }, // '付款方式'
        {
          label: this.$t('PayApplyList.settleMode'), // '账户结算方式',
          type: 'select',
          prop: 'settleMode',
          propInDict: 'bankAccountSettleMode',
          width: 130,
          multi: true,
        },
        {
          prop: 'currency',
          label: this.$t('PayApplyList.paymentCurrency'),
          propInDict: 'validCurrency',
          width: 100
        },
        { prop: 'realPayAmt', label: this.$t('PayApplyList.realPayAmt'), width: 130 }, // '实付金额'
        { prop: 'differenceType', label: this.$t('PayApplyList.differenceType'), width: 130 }, // '差额类型'
        { prop: 'differenceAmt', label: this.$t('PayApplyList.differenceAmt'), width: 130 }, // '差额'
        {
          prop: 'differenceDealway',
          label: this.$t('PayApplyList.differenceDealway'), // '差额处理方式',
          type: 'select',
          propInDict: 'payDifferenceDealway',
          width: 140
        },
        {
          prop: 'diffecHasPrepayRefund',
          label: this.$t('PayApplyList.diffecHasPrepayRefund'), // '差额预付退款',
          width: 160,
          type: 'select',
          propInDict: 'yesNo'
          // formatter: ({row}) => {
          //   return row.diffecHasPrepayRefund === 'yes'
          //     ? '已退款'
          //     : row.diffecHasPrepayRefund
          //       ? '未退款'
          //       : ''
          // }
        },
        { prop: 'differenceRefundAmt', label: this.$t('PayApplyList.differenceRefundAmt'), width: 150 }, // '差额退款金额'
        
        { prop: 'recvCorpName', label: this.$t('OrderFee.settleCorpName'), width: 150 },
        { prop: 'payCompName', label: this.$t('PayApplyList.payCompName'), type: 'text', width: 150 },
        { prop: 'payBankName', label: this.$t('PayApplyList.payBankName'), width: 150,}, // '付款银行'
        // {	prop: 'payAccountName', label: this.$t('PayApplyList.payAccountShortName'),	width:150,	type: 'text',},
        { prop: 'payAccountName', label: this.$t('PayApplyList.payAccountName'), width: 150 }, // '付款账户名'
        { prop: 'payAccountNo', label: this.$t('PayApplyList.payAccountNo'), width: 125,}, // '付款账号'
        { prop: 'recvBankName', label: this.$t('PayApplyList.recvBankName'), width: 125, }, // '收款银行'
        { prop: 'recvBankBranch',  label: this.$t('PayApplyList.recvBankBranch'),  type: 'text',  width: 120,}, // '收款银行支行'
        { prop: 'recvAccountName', label: this.$t('PayApplyList.recvAccountName'), width: 150 }, // '收款账户名'
        { prop: 'recvAccountNo', label: this.$t('PayApplyList.recvAccountNo'), width: 130,}, // '收款账号'
        // 海外版不显示
        // { prop: 'hasInvoice', label: '关联发票状态', type:'select', propInDict:"payRelaInvoiceStatus", width: 100 },
        // {
        //   prop: 'invoiceNoJoin',
        //   label: this.$t('FeeList.invoiceNo'),
        //   type: 'columnTip',
        //   component: 'ColumnTip',
        //   componentProps: {
        //     show: false,
        //     callback: (no, componentProps, index) => {
        //       this.componentProps = componentProps
        //       const invoicePaymentId =  componentProps.row.invoiceNoJoinIds[index]
        //       this.$emit('update:isJumpRouteFromPage', true)
        //       this.$router.push({
        //         name: 'InvoicePaymentListDetail',
        //         query: { invoicePaymentId }
        //       })
        //     }
        //   }
        // },
        // { prop: 'invoiceFinishAmt', label: this.$t('Collect.invoicedAmt'), width: 100, sortable: false },
        // { prop: 'noInvoiceAmt', label: this.$t('Collect.uninvoicedAmount'), width: 100, sortable: false },
        {
          prop: 'bankseqFileNo',
          label: this.$t('PayApplyList.bankSlipStatus'), // '水单状态',
          type: 'button',
          operationBtns: {
            show: true,
            callback: (action, $index, row) => {
              window.open(
                `/base/fileView/preview/${row.bankseqFileNo}/sowoll`
              )
            },
            data: [{ label: this.$t('PayApplyList.have') }] // '有'
          },
          width: 130
        },
        { prop: 'bankseqFileReceiMail', label: this.$t('PayApplyList.bankseqFileReceiMail'), width: 130}, // '接收水单邮箱'
        { prop: 'bankseqFileSendStatus', label: this.$t('PayApplyList.bankseqFileSendStatus'), width: 130,  type: 'select', propInDict: 'yesNo'
          // formatter: ({row}) => { // '发送水单状态'
          //   return row.bankseqFileSendStatus === 'yes'
          //     ? '已发送'
          //     : row.bankseqFileSendStatus
          //       ? '未发送'
          //       : ''
          // }
        },
        { prop: 'payWriteoffStatus', label: this.$t('PayApplyList.payWriteoffStatus'), type: 'select', width: 130 }, // '核销状态'
        {
          prop: 'writeoffReceipayNo',
          label: this.$t('PayApplyList.writeoffReceipayNo'), // '付款核销号',
          width: 130,
          type: 'button',
          operationBtns: {
            show: true,
            callback: (fn, index, { writeoffReceipayNo, orderType }) => {
              // TODO
              // 根据付款单类型可跳转到结算付款核销（结算、预付抵账）、退款/预付付款（退款、预付、付错转预付）
              const str =
                orderType == 'settle_pay' // orderType == '结算付款'
                  ? 'DetailSettle'
                  : orderType == 'prepay_to_repay' // orderType == '预付抵账'
                    ? 'PrepayWriteOffDetail'
                    : 'DetailPrepay'
              // this.routerPush(str, { writeoffReceipayNo })

              this.$emit('update:isJumpRouteFromPage', true)
              this.$router.push({
                name: 'WritePayDetail',
                query: { writeoffReceipayNo }
              })
              // if (['预付付款', '退款付款', '付错转预付'].indexOf(orderType) > -1) {
              //   this.routerPush('DetailPrepay', { writeoffReceipayNo })
              // } else if (['结算付款', '预付抵账'].indexOf(orderType) > -1) {
              //   this.routerPush(['结算付款', '预付抵账'].indexOf(orderType) > -1 ? 'DetailSettle' : 'DetailPrepay', {
              //     writeoffReceipayNo,
              //   })
              // }
            }
          }
        },
        {
          prop: 'orderNo',
          label: this.$t('PayApplyList.orderNo'),
          width: 140,
					type: 'columnTip',
          component: 'ColumnTip',
					componentProps: {
            show: false,
            data: [],
						callback: (no, { row }, index) => {
              console.log(row);
              let orderNoList = row.orderNo_multiValue
              let sourceTypeList = row.sourceType_multiValue
              let orderNo = orderNoList[index]
              let sourceType = sourceTypeList[index]
							let sourceBizNo = orderNo
              // this.$emit('update:isJumpRouteFromPage', true)
							this.showOneNoDetail(sourceType, sourceBizNo, { feeId: '' })
						},
          },
          sortable: false
        },
        { prop: 'bdEmployeeName',  label: this.$t('PayApplyList.bdEmployeeName'),  width: 100,  type: 'text', sortable: false }, // '销售'
        { prop: 'custName',  label: this.$t('PayApplyList.custName'),  width: 150,  type: 'text', hasTag: true, sortable: false }, // '委托单位'
        { prop: 'writeoffFinishAmt', label: this.$t('PayApplyList.writeoffAmt'), width: 110 }, // '已核销金额'
        { prop: 'noWriteoffAmt', label: this.$t('PayApplyList.noWriteoffAmt'), width: 120 }, // '未核销金额'
        { prop: 'hasPrepayRefund', label: this.$t('PayApplyList.hasPrepayRefund'), type: 'select', propInDict: 'yesNo', width: 140 }, // '预付退款'
        { prop: 'refundAmt', label: this.$t('PayApplyList.refundAmt'), width: 120 }, // '退款金额'
        { prop: 'errorStatus', label: this.$t('PayApplyList.errorStatus'), type: 'select', propInDict: 'yesNo', width: 150 }, // '付错标识'
        { prop: 'errorType', label: this.$t('PayApplyList.errorType'), type: 'select', propInDict: 'payErrorType', width: 150 }, // '付错原因'
        {
          prop: 'refPayOrderNo',
          label: this.$t('PayApplyList.refPayOrderNo'), // '关联付款单号',
          type: 'button',
          width: 130,
          operationBtns: {
            show: true,
            callback: (fn, index, row) => {
              this.showDetail(row, row.refPayOrderNo)
            }
          }
        },
        { prop: 'errorDisposalType', label: this.$t('PayApplyList.errorDisposalType'), type: 'select', propInDict: 'payErrorDisposalType', width: 150 }, // '处理方式'
        { prop: 'errorDisposalStatus', label: this.$t('PayApplyList.errorDisposalStatus'), type: 'select', width: 150, formatter: ({cellValue}) => { if (cellValue === 'yes') { return 'Dealt with' } else if (cellValue === 'no') { return 'Not Handled' } else { return '' } } }, // '处理状态' // propInDict: 'yesNo'
        { prop: 'printCount', label: this.$t('PayApplyList.printCount'), type: 'text', width: 110 }, // '打印次数'
        { prop: 'printTime',  label: this.$t('PayApplyList.printTime'),  type: 'text', width: 135,}, // '打印时间'
        { prop: 'applyEmpName', label: this.$t('PayApplyList.applyEmpName'), width: 100, sortable: false }, // '申请人'
        { prop: 'payApplyConfirmName', label: this.$t('PayApplyList.approver'), width: 100, sortable: false }, // '付款单审核人'
        { prop: 'createdName', label: this.$t('Common.createdBy'), width: 100, },
        { prop: 'createdTime', label: this.$t('Common.createTime'), width: 125 },
        // { prop: 'confirmName', label: '付款人', width: 100 }, // 改用受理人
        { prop: 'payTime', label: this.$t('PayApplyList.payTime'), width: 125 }
      ],
      rightFilterBtns: [true, false, false, false, false],
      refusePayForm: {
        refusePayReason: ''
      },
      refusePayOpen: false,
      loading: false,
      // 标记受理
      payOrderNoList:[],
      dialogShow:false,
      acceptancePayOrderShow:false,
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
            showType: '1',
            range: { min: '', max: '' }
          },
          {
            key: 'payStatus',
            value: '',
            showType: '2',
            range: { min: '', max: '' }
          },
          {
            key: 'payBankName',
            value: '',
            showType: '3',
            range: { min: '', max: '' }
          },
          {
            key: 'payWay',
            value: '',
            showType: '4',
            range: { min: '', max: '' }
          },
          {
            key: 'payAmt',
            value: '',
            showType: '5',
            range: { min: '', max: '' }
          },
          {
            key: 'applyDate',
            value: '',
            showType: '6',
            range: { min: '', max: '' }
          },
          {
            key: 'orderType',
            value: '',
            showType: '7',
            range: { min: '', max: '' }
          }
        ],
        // 左侧下拉框及对应右侧配置
        filterGroups: {
          // 1
          allNo: { label: this.$t('PayApplyList.allNo'), type: 'input', showType: '1' }, // '各类单号', placeholder:"多个单号用空格或逗号分隔"
          payOrderNo: { label: this.$t('Settle.payOrderNo'), type: 'input', showType: '1' },
          orderNo: { label: this.$t('FeeList.orderNo'), type: 'input', showType: '1' },
          sourceApplyNo: { label: this.$t('PayApplyList.payApplyNo'), type: 'input', showType: '1' }, // '申请单号'
          writeoffReceipayNo: {
            label: this.$t('PayApplyList.writeoffReceipayNo'), // '付款核销号',
            type: 'input',
            showType: '1'
          },
          // invoiceNo: { label: this.$t('FeeList.invoiceNo'), type: 'input', showType: '1' }, // 海外版不显示
          // 2
          payStatus: {
            label: this.$t('PayApplyList.payStatus'), // '付款单状态',
            type: 'select',
            multiple: true,
            showType: '2',
            prop: 'payStatusType'
          },
          confirmStatus: {
            label: this.$t('PayApplyList.acceptanceStatus'), // '受理状态',
            selectOptions: this.confirmStatusCfg,
            type: 'select',
            showType: '2'
          },
          // hasInvoice: { // 海外版不显示
          //   label: '关联发票状态',
          //   // selectOptions: this.hasInvoiceCfg,
          //   prop:"payRelaInvoiceStatus",
          //   type: 'select',
          //   showType: '2'
          // },
          payWriteoffStatus: {
            label: this.$t('PayApplyList.payWriteoffStatus'), // '核销状态',
            // selectOptions: this.writeoffStatusCfg,
            prop: 'payWriteoffStatus',
            type: 'select',
            showType: '2'
          },
          errorDisposalStatus: {
            label: this.$t('PayApplyList.errorDisposalStatus'), // '处理状态',
            selectOptions: this.errorDisposalStatus,
            type: 'select',
            showType: '2'
          },
          settleOrderType: {  label: this.$t('PayApplyList.settleOrderType'),  type: 'select', prop:"settleOrderType", multiple:true, showType: '2' }, // '结算类型'
          // hasAgentPay: {  label: '是否代收付',  type: 'select', prop: 'yesNo' },
          // 3
          recvBankName: {
            label: this.$t('PayApplyList.recvBankName'), // '收款银行',
            type: 'input',
            showType: '1'
          },
          // recvBankCode: { 
          //   label: this.$t('PayApplyList.recvBankName'), 
          //   type: 'remoteSelect',
					// 	showType: '3',
					// 	// remote: true,
					// 	// multiple: true,
					// 	remoteMethod: (value, item, row) => {
					// 		bankList({
					// 			currPage: 1,
					// 			pageSize: 1000,
					// 			query: [{ column: 'cname', type: 'like', value }],
					// 		}).then((res) => {
					// 			item.remoteSelectList = ((res.data && res.data.list) || []).map((item) => {
					// 			return { ...item, label: item.cname, value: item.bankCode }
					// 			})
					// 		})
					// 	},
					// 	visibleChange: (value, item, row) => {
					// 		bankList({
					// 			currPage: 1,
					// 			pageSize: 1000,
					// 			query: [{ column: 'cname', type: 'like', value }],
					// 		}).then((res) => {
					// 			item.remoteSelectList = ((res.data && res.data.list) || []).map((item) => {
					// 			return { ...item, label: item.cname, value: item.bankCode }
					// 			})
					// 		})
					// 	},
					// 	remoteSelectList: []
					// },
          recvAccountName: {
            label: this.$t('PayApplyList.recvAccountName'), // '收款账户名',
            type: 'input',
            showType: '3'
          },
          recvAccountNo: { label: this.$t('PayApplyList.recvAccountNo'), type: 'input', showType: '3' }, // '收款账号'
          payBankName: { label: this.$t('PayApplyList.payBankName'), type: 'input', showType: '3' }, // '付款银行'
          payAccountName: { label: this.$t('PayApplyList.payAccountName'), type: 'input', showType: '3' }, // '付款账户名'
          payAccountNo: {
						label: this.$t('PayApplyList.payAccountNo'), // '付款银行简称',
						type: 'remoteSelect',
						showType: '3',
						remote: true,
						multiple: true,
						remoteMethod: (queryString, item, row) => {
							this.bankAccountListAll(queryString, item)
						},
						visibleChange: (queryString, item, row) => {
							this.bankAccountListAll(queryString, item)
						},
						remoteSelectList: []
					},
          // payAccountNo: { label: this.$t('PayApplyList.payAccountNo'), type: 'input', showType: '3' },
          // 4
          payWay: {
            label: this.$t('PayApplyList.payWay'), // '付款方式',
            type: 'select',
            multiple: true,
            prop: 'payWay',
            showType: '4'
          },
          currency: {
            label: this.$t('Settle.paymentCurrency'),
            type: 'select', 
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
            showType: '4'
          },
          // 5
          payAmt: { label: this.$t('Settle.applyPayAmt'), type: 'range', showType: '5' },
          writeoffAmt: { label: this.$t('PayApplyList.writeoffAmt'), type: 'range', showType: '5' }, // '已核销金额'
          noWriteoffAmt: { label: this.$t('PayApplyList.noWriteoffAmt'), type: 'range', showType: '5' }, // '未核销金额'
          // 6
          applyDate: { label: this.$t('Common.createTime'), type: 'daterange', showType: '6' },
          payDate: { label: this.$t('FinBill.paymentDate'), type: 'daterange', showType: '6' },
          // 7
          orderType: {
            label: this.$t('PayApplyList.payOrderType'), // '付款单类型',
            type: 'select',
            multiple: true,
            prop: 'payOrderType',
            showType: '7'
          },
          recvCorpCode: {
            label: this.$t('FeeList.settleCorp'),
            type: 'remoteSelect',
            showType: '6',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2(
                { queryString, unitTypes: 'customer,supplier,company' },
                item
              )
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2(
                { queryString, unitTypes: 'customer,supplier,company' },
                item
              )
            },
            remoteSelectList: []
          },
          settleMode:{ label: this.$t('PayApplyList.settleMode'), type: 'select', propInDict: 'bankAccountSettleMode', r: true, multiple: true }, // '账户结算方式'
          bdEmployeeId: {
						label: this.$t('PayApplyList.bdEmployeeName'), // '销售',
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
          mbl: { label: 'MBL',  type: 'input',  showType: '6'},
          hbl: { label: 'HBL',  type: 'input',  showType: '6'},
          payApplyConfirmName: { label: this.$t('PayApplyList.approver'),  type: 'input',  showType: '6'}, // '付款单审核人'
          applyEmpName: { label: this.$t('PayApplyList.applyEmpName'),  type: 'input',  showType: '6'}, // '申请人'
          errorStatus: {
            label: this.$t('PayApplyList.errorStatus'), // '付错标识',
            type: 'select',
            prop: 'yesNo',
            showType: '7'
          },
          errorType: {
            label: this.$t('PayApplyList.errorType'), // '付错原因',
            type: 'select',
            prop: 'payErrorType',
            showType: '7'
          },
          bankseqStatus: {
            label: this.$t('PayApplyList.bankSlipStatus'), // '水单状态',
            type: 'select',
            selectOptions: this.bankseqStatusCfg,
            showType: '7'
          },
          bankseqFileSendStatus: {
            label: this.$t('PayApplyList.bankseqFileSendStatus'), // '发送水单状态',
            type: 'select',
            selectOptions: this.bankseqFileSendList,
            showType: '7'
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
            label: this.$t('PayApplyList.acceptor'), // '受理人',
            type: 'remoteSelect',
            clearable: true,
            multiple: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          confirmTime: { label: this.$t('PayApplyList.acceptanceTime'), type: 'daterange', showType: '8' }, // '受理时间'
        }
      }
    }
    const listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: this.$t('Common.details'),
          show: true,
          action: 'showDetail'
        }
      ]
    })
    const pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'payOrderList',
      data: [],
      sortable: true,
      customColumns: {
        show: true,
        handleCustomColumns: ()=> this.handleCustomColumns()
      },
      operationBtns,
      pagination,
      listAmtSummary,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      emptyText: this.$t('OrderFee.showAfterQuery'), // '数据将在查询后显示',
      colorColumns: ['payWriteoffStatus'],
    })
    const columns = [...this.selfColumnsBase]
    // .filter((item) => item.disabled)
    this.configColumns.push(...this.selfColumnsBase.map(item => item.prop))
    // console.log(this.configColumns)
    // this.selfColumnsBase.forEach(item => (item.sortable = true))
    this.option1.columns = columns

    // 导出配置
    this.columnsBackup = [...columns]
    this.columnsBackup.splice(-4)
    this.exportParams = {
      title: this.columnsBackup.map(item => item.label),
      key: this.columnsBackup.map(item => item.prop),
      autoWidth: true,
      filename: this.$t('PayApplyList.payOrder'), // '付款单'
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
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // '请勾选需要预付退款的项！'
      }
      if (this.multipleSelection1.length > 1) {
        return this.$msgErrClose(this.$t('OrderFee.selectOneRow')) // '一次只能勾选一个预付退款！'
      }
      if (this.multipleSelection1[0].payStatus === 'pay_close') { // '已关闭'
        return this.$msgErrClose(this.$t('PayApplyList.payOrderCloseNotOp')) // '付款单已关闭状态，不可操作！'
      }
      if(this.multipleSelection1[0].payWay === 'cash' && this.multipleSelection1[0].orderType === 'prepay' ){ // if(this.multipleSelection1[0].payWay === '现金' && this.multipleSelection1[0].orderType === '预付付款' ){
        return this.$msgErrClose(this.$t('PayApplyList.prepayCashNotRefund')) // '付款单类型为预付付款且付款方式为现金的，暂时不可操作预付退款！'
      }
      const status =
        this.multipleSelection1[0].payWriteoffStatus === 'yes' && // this.multipleSelection1[0].payWriteoffStatus === '已核销' &&
        (this.multipleSelection1[0].orderType === 'prepay' || // (this.multipleSelection1[0].orderType === '预付付款' ||
          this.multipleSelection1[0].orderType === 'transfer_prepay' || // this.multipleSelection1[0].orderType === '付错转预付' ||
          this.multipleSelection1[0].differenceType === '多付') // 此处不清晰，暂不处理
      if (!status) {
        return this.$msgErrClose(
          this.$t('PayApplyList.writeoffPrepCanRefund') // '已核销的预付付款、付错转预付、多付的付款单才能操作预付退款！'
        )
      }
      const row = this.multipleSelection1[0]
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: 'OrderRefund',
        query: { payOrderNo: row.payOrderNo }
      })
      // this.routerPush('OrderRefund', { payOrderNo: row.payOrderNo })
    },
    writeOffPreview() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // '请勾选需要付款核销的项！'
      }
      if (this.multipleSelection1.length > 1) {
        return this.$msgErrClose(this.$t('OrderFee.selectOneRow')) // '一次只能勾选一个付款核销！'
      }
      if (this.multipleSelection1[0].payStatus === 'pay_close') { // '已关闭'
        return this.$msgErrClose(this.$t('PayApplyList.payOrderCloseNotOp')) // '付款单已关闭状态，不可操作！'
      }
      if (this.multipleSelection1[0].confirmStatus === 'pending') { // if (this.multipleSelection1[0].confirmStatus === '未受理') {
        return this.$msgErrClose(this.$t('PayApplyList.notAccepNotWriteoff')) // '付款单未受理，不可操作核销！'
      }
      const payWriteoffStatus = this.multipleSelection1.map(
        item => item.payWriteoffStatus
      )
      console.log(payWriteoffStatus)
      if (payWriteoffStatus[0] == 'yes') { // if (payWriteoffStatus[0] == '已核销') {
        return this.$msgErrClose(this.$t('PayApplyList.repeatWriteoff')) // '已核销！无需重复核销！'
      }
      const payOrderNo = this.multipleSelection1.map(item => {
        return item.payOrderNo
      })
      const query = {
        payOrderNo: payOrderNo[0],
        orderType: this.multipleSelection1[0].orderTypeName
      }
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: 'OrderDetails',
        query
      })
      // this.routerPush('WriteOffPreview', query)
    },
    // 合并付款按钮
    handleMerge() {
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: this.$t('OrderFee.selectRow'), // '请勾选需要合并付款的项！',
          type: 'error',
          showClose: true
        })
        return
      }
      if (this.multipleSelection1.length < 2) {
        this.$message({
          message: this.$t('OrderFee.selectLeastTwoRow'), // '至少勾选两个合并付款！',
          type: 'error',
          showClose: true
        })
        return
      }
      for (let i = 0; i < this.multipleSelection1.length; i++) {
        if (this.multipleSelection1[i].payStatus === 'pay_close') { // '已关闭'
          return this.$msgErrClose(this.$t('PayApplyList.payOrderCloseNotOp')) // '付款单已关闭状态，不可操作！'
        }
        if (this.multipleSelection1[i].confirmStatus === 'pass') { // if (this.multipleSelection1[i].confirmStatus === '已受理') {
          return this.$msgErrClose(this.$t('PayApplyList.acceptNotCombinedP')) // '已受理状态，不可参与合并付款！'
        }
      }
      const orderTypeList = this.multipleSelection1.map(item => {
        return item.orderType
      })
      const orderType = [...new Set(orderTypeList)]
      if (orderType.length !== 1) {
        return this.$msgErrClose(this.$t('PayApplyList.combinedPSameType')) // '合并付款必须是付款单类型一致！'
      }
      const payOrderNoList = this.multipleSelection1.map(item => {
        return item.payOrderNo
      })
      mergeMultiPayOrder({ payOrderNoList: payOrderNoList }).then(res => {
        if (res.code === 0) {
          this.$message({ message: this.$t('OrderFee.successOp'), type: 'success' }) // '合并付款提交成功'
          this.getData()
        }
      })
    },
    rejectSubmit() {
      this.$refs.query.validate(valid => {
        if (valid) {
          approvePayApplySettle(this.query).then(() => {
            this.$message({ message: this.$t('OrderFee.successOp'), type: 'success' }) // '拒绝申请提交成功'
            this.rejectDialogVisible = false
          })
        }
      })
    },
    // batchPay() {
    //   if (this.multipleSelection1.length === 0) {
    //     return this.$message({
    //       message: '请勾选需要批量付款的项！',
    //       type: 'error',
    //       showClose: true
    //     })
    //   }
    //   if (this.multipleSelection1.some(item => item.payStatus != '支付中' && item.payStatus != 'paying')) {
    //     return this.$message({
    //       message: '付款状态都为支付中才可以批量付款！',
    //       type: 'error',
    //       showClose: true
    //     })
    //   }
    //   if (this.multipleSelection1.some(item => item.settleOrderType != 'customer_special')) {
    //     return this.$message({
    //       message: '结算单类型都为客户专项类才可以批量付款！',
    //       type: 'error',
    //       showClose: true
    //     })
    //   }
    //   let item0 = this.multipleSelection1[0]
    //   if (this.multipleSelection1.some(item => (item.payWay != item0.payWay || item.settleMode != item0.settleMode || item.currency != item0.currency || item.payBankName != item0.payBankName || item.payAccountName != item0.payAccountName))) {
    //     return this.$message({
    //       message: '付款方式、账户结算方式、付款币种、付款银行、付款账户名，一样才可以【批量付款】！',
    //       type: 'error',
    //       showClose: true
    //     })
    //   }
    // },
    payOrderNoListClose(val,isBreak){
      this.acceptancePayOrderShow = false
      this.dialogShow = false
      if(isBreak===true){
        this.getData()
      }
    },
    // 标记受理
    batchPrintCreate() {
      const len = this.multipleSelection1.length
      if (!len) {
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // '请勾选需要标记受理的项！'
      }
      const payStatus = this.multipleSelection1.some(item => {
        return item.payStatus === 'pay_close' // '已关闭'
      })
      if (payStatus) {
        return this.$msgErrClose(this.$t('PayApplyList.payOrderCloseNotOp')) // '存在已关闭的付款单，不可操作！'
      }
      const confirmStatus = this.multipleSelection1.some(item => {
        return item.confirmStatus === 'pass' // '已受理'
      })
      if (confirmStatus) {
        return this.$msgErrClose(this.$t('PayApplyList.acceptedNotRepeat')) // '存在已标记受理的付款单，请不要重复标记受理！'
      }
      this.payOrderNoList = [] 
      this.multipleSelection1.forEach(item=>{
        this.payOrderNoList.push({
          currency:item.currency,
          applyAmt:item.applyAmt,
          payOrderNo:item.payOrderNo,
          orderType:item.orderTypeName,
          payWay:item.payWayName,
          settleMode:item.settleMode,
          payAccountShortName:item.payAccountShortName,
          payBankName:item.payBankName,
          payAccountName:item.payAccountName,
          payAccountNo:item.payAccountNo,
          payCompCode:item.payCompCode,
          payAccountData: "",
          recvBankName:item.recvBankName,
          recvBankBranch:item.recvBankBranch,
          recvAccountNo:item.recvAccountNo,
          recvAccountName:item.recvAccountName,
          swiftCode:item.swiftCode,
          bankAccountSettleModeList: [],
          recvIdNo: item.recvIdNo,
          recvMobileNo: item.recvMobileNo,
          thirdPayChannelCode: item.thirdPayChannelCode,
          transferFeeDeductWay: item.transferFeeDeductWay,
          settleOrderType: item.settleOrderType
        })
      })
      this.dialogShow = true
      // this.acceptancePayOrderShow = true

      // this.$confirm('您确定要标记受理吗?', '警告', {
      //   confirmButtonText: this.$t('Common.sure'),
      //   cancelButtonText: this.$t('Common.cancel'),
      //   lockScroll: 'true',
      //   type: 'warning'
      // })
      //   .then(() => {
      //     return acceptancePayOrder({
      //       confirmStatus: 'pass',
      //       payOrderNoList: this.multipleSelection1.map(item => item.payOrderNo)
      //     })
      //   })
      //   .then(() => {
      //     this.$msgSucClose('受理成功！')
      //     this.getData()
      //   })
      //   .catch(function() {})
    },
    // 撤销标记受理
    canclePayOrder() {
      const len = this.multipleSelection1.length
      if (!len) {
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // '请勾选需要撤销标记受理的数据!'
      }
      const payWriteoffStatus = this.multipleSelection1.every(item => {
        return item.payWriteoffStatus === 'no' // '未核销'
      })
      if (!payWriteoffStatus) {
        return this.$msgErrClose(this.$t('PayApplyList.unwriteoffCancelAccp')) // '只有未核销的付款单可操作撤销标记受理！'
      }
      const confirmStatus = this.multipleSelection1.every(item => {
        return item.confirmStatus === 'pass' // '已受理'
      })
      if (!confirmStatus) {
        return this.$msgErrClose(this.$t('PayApplyList.acceptedCanCancel')) // '只有已受理付款单可操作撤销标记受理！'
      }
      // const data = {
      //   payOrderNoList: this.multipleSelection1.map(item => {
      //     return item.payOrderNo
      //   }),
      //   confirmStatus: 'pending'
      // }
      const data = []
      this.multipleSelection1.forEach(item=>{
          data.push({
            'confirmStatus': 'pending',
            'payOrderNo': item.payOrderNo,
            'payWay':item.payWayName,
            'payAccountNo':item.payAccountNo,
          })
      })
      this.$confirm(this.$t('OrderFee.confirmTip') + this.$t('OrderFee.enspace') + this.$t('PayApplyList.cancelAcceptance'), this.$t('OrderFee.tip'), { // '确定要撤销标记受理吗?', '警告',
        confirmButtonText: this.$t('OrderFee.confirm'),
        cancelButtonText: this.$t('OrderFee.cancel'),
        lockScroll: 'true',
        type: 'warning'
      })
        .then(() => {
          acceptancePayOrder(data)
            .then(res => {
              if (res.code === 0) {
                this.$msgSucClose(this.$t('OrderFee.successOp')) // '撤销标记受理成功！'
                this.getData()
              }
            })
            .catch(() => {})
        })
        .catch(() => {})
    },
    getData(isSearch) {
      const data = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: []
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        const { key, value, range, req, valueReq } = item
        if (range.min || range.max) {
          if (range.min) {
            data.query.push({
              column: key + 'Min',
              type: 'eq',
              value: range.min
            })
          }
          if (range.max) {
            data.query.push({
              column: key + 'Max',
              type: 'eq',
              value: range.max
            })
          }
          return
        }
        if (!value) return
        if (typeof value !== 'object') {
          let filterGroups = this.searchOption1.addFilter.filterGroups
          if(filterGroups[key] && filterGroups[key].type === 'input'){
            data.query.push({column: key,type: 'like',value: (req || value).replace(/[\s+,+，+]+/g, ' '),})
            return
          }
          // 搜索带两值，切换去掉valueReq
          if (
            valueReq &&
            item[valueReq] &&
            item.key === 'recvCorpName' &&
            item.value !== ''
          ) {
            data.query.push({
              column: valueReq,
              type: 'eq',
              value: item[valueReq]
            })
          }
          return data.query.push({
            column: key,
            type: 'eq',
            value: req || value
          })
        }
        if (
          key === 'recvCorpCode' ||
          key === 'orderType' ||
          key === 'payWay' ||
          key === 'payStatus' ||
          key === 'payAccountNo' ||
          key === 'payBankCode' ||
          key === 'settleOrderType' || 
          key === 'settleMode' ||
          key === 'confirmBy'
        ) {
          if (!value.length) return
          data.query.push({
            column: key,
            type: 'eq',
            value: value.join(',')
          })
        } else {
          data.query.push({
            column: key + 'Start',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[0])
          })
          data.query.push({
            column: key + 'End',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[1])
          })
        }
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({
          column: 'payStatus',
          type: 'eq',
          value: this.buttonSearch
        })
      }
      this.loading = true
      queryPayOrderPage(data)
        .then(({ data }) => {
          this.finCommonColumns({data})
          // if (data.configColumns && data.configColumns.length) {
          //   const columns = data.configColumns
          //   this.option1.columns = columns.map(prop =>
          //     this.selfColumnsBase.find(item => item.prop === prop)
          //   )
          //   this.selfColumnsBase.filter(item => columns.indexOf(item.prop) > -1)
          //   this.configColumns = data.configColumns
          // }
          let list = []
          data.list.forEach(item => {
            item.sourceType_multiValue = item.orderNo.split(',').map(subItem => {
							let arr = subItem.split('/')
							return arr[1] ? arr[1] : arr[0]
						})
						item.orderNo_multiValue = item.orderNo.split(',').map(subItem => {
							let arr = subItem.split('/')
							return arr[0]
            })
            if (item.whitelistFlag === 'yes') {
              item._tagArr = [
                {
                  type: 'tag-pass',
                  text: this.$t('PayApplyList.whiteSimple'), // '白'
                }
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
      return data.map(item => {
        // if (multi) return multiFn(item, ['sourceApplyNo', 'invoiceNos'])
        
        item.payWayName = item.payWay
        item.orderTypeName = item.orderType
        item.confirmStatusName = item.confirmStatus
        // item.orderType = this.dictMapObj.payOrderType[item.orderType] || '' // 改为propInDict的正常写法, 20221209
        // item.payStatus = this.dictMapObj.payStatusType[item.payStatus] || '' // 改为propInDict的正常写法, 20221209
        // item.payWay = this.dictMapObj.payWay[item.payWay] || '' // 改为propInDict的正常写法, 20221209
        // item.payWriteoffStatus = // 改为propInDict的正常写法, 20221209
        //   item.payWriteoffStatus == 'yes'
        //     ? '已核销'
        //     : item.payWriteoffStatus != 'no'
        //       ? ''
        //       : '未核销'
        // item.hasPrepayRefund = // 改为propInDict的正常写法, 20221209
        //   item.hasPrepayRefund == 'yes'
        //     ? '已退款'
        //     : item.hasPrepayRefund != 'no'
        //       ? ''
        //       : '未退款'
        // item.errorStatus = this.dictMapObj.yesNo[item.errorStatus] || '' // 改为propInDict的正常写法, 20221209
        // item.errorType = this.dictMapObj.payErrorType[item.errorType] || '' // 改为propInDict的正常写法, 20221209
        // item.errorDisposalType =
        //   this.dictMapObj.payErrorDisposalType[item.errorDisposalType] || '' // // 改为propInDict的正常写法, 20221209
        // item.errorDisposalStatus = // 改为propInDict的正常写法, 20221209
        //   item.errorDisposalStatus == 'yes'
        //     ? '已处理'
        //     : item.errorDisposalStatus != 'no'
        //       ? ''
        //       : '未处理'
        // item.confirmStatus = // 改为propInDict的正常写法, 20221209
        //   item.confirmStatus == 'pass'
        //     ? '已受理'
        //     : item.confirmStatus == 'pending'
        //       ? '未受理'
        //       : ''
        // item.hasInvoice = // 原已注释
        //   item.hasInvoice == 'yes'
        //     ? '已关联'
        //     : item.hasInvoice != 'no'
        //       ? ''
        //       : '未关联'
        return multiFn(item, [ 'sourceApplyNo', 'invoiceNoJoin'])
      })
    },
    sendMulti(data) {
      this.multipleSelection1 = data

      const data2 = {
        ascColumns: [],
        descColumns: [],
        query: []
      }
      const ids = this.multipleSelection1
        .map(item => {
          return item.payOrderNo
        })
        .join(',')
      if (ids) {
        data2.query.push({
          column: 'payOrderNoList',
          type: 'eq',
          value: ids
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
      queryPayOrderPageSummary(data).then(res => {
        if (res.code === 0 && res.data) {
          let data = {
            payAmtSummaryList: [],
            notWriteoffAmtSummaryList: []
          }
          data = Object.assign(data, res.data)
          const labelObj = {
            payAmtSummaryListLabel: this.$t('PayApplyList.payAmt'), // '付款金额',
            notWriteoffAmtSummaryListLabel: this.$t('PayApplyList.noWriteoffAmt'), // '未核销金额'
          }
          const colorObj = {
            payAmtSummaryListColor: 'red', // 支持red, green, black三种值
            notWriteoffAmtSummaryListColor: 'green'
          }
          this.option1.listAmtSummary = Object.assign(
            this.option1.listAmtSummary,
            {
              show: true,
              data,
              labelObj,
              colorObj
            }
          )
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
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // '请先勾选1条数据，再进行打印！'
      }
      if (len > 50) {
        return this.$msgErrClose(this.$t('OrderFee.selectMost50Row')) // '一次最多只能勾选50条数据进行批量打印，请重新选择！'
      }
      // if (len > 1) {
      //   return this.$msgErrClose('一次只能勾选1条数据进行打印，请重新选择！')
      // }
      const payOrderNo = this.multipleSelection1.map(item=>{
        return item.payOrderNo
      })
      let routerName = 'PayOrderPrint'
      let hasSpecialRefund = ''
      if(val === 'PayOrderPrints'){
        routerName = 'PayOrderPrints'
      }
      if( val === 'PayOrderFileNoPrint'){
        routerName = 'PayOrderFileNoPrint'
      }
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: routerName,
        query: { 
          payOrderNo, 
          hasSpecialRefund: val === 'PayOrderPrints' ? 'yes' : ''
        }
      })
    },
    showDetail(row, payOrderNo) {
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: 'OrderDetails',
        query: { payOrderNo: payOrderNo || row.payOrderNo }
      })
      // this.routerPush('OrderDetails', { payOrderNo: payOrderNo || row.payOrderNo })
    },
    // getExport(data) {
    //   if (!data.length) {
    //     return this.$msgErrClose('无数据，请勿重复操作！')
    //   }
    //   const list = []
    //   data.forEach(item => {
    //     item.invoiceNos = item.invoiceNos.toString()
    //     item.bankseqFileNo = item.bankseqFileNo ? '有' : '无'
    //     list.push(item)
    //   })
    //   this.exportParams.data = list
    //   excel.export_array_to_excel(this.exportParams)
    // },
    // 导出按钮
    handleExport(code) {
      const data = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: []
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        const { key, value, range, req, valueReq } = item
        if (range.min || range.max) {
          if (range.min) {
            data.query.push({
              column: key + 'Min',
              type: 'eq',
              value: range.min
            })
          }
          if (range.max) {
            data.query.push({
              column: key + 'Max',
              type: 'eq',
              value: range.max
            })
          }
          return
        }
        if (!value) return
        if (typeof value !== 'object') {
          let filterGroups = this.searchOption1.addFilter.filterGroups
          if(filterGroups[key] && filterGroups[key].type === 'input'){
            data.query.push({column: key,type: 'like',value: (req || value).replace(/[\s+,+，+]+/g, ' '),})
            return
          }
          // 搜索带两值，切换去掉valueReq
          if (
            valueReq &&
            item[valueReq] &&
            item.key === 'recvCorpName' &&
            item.value !== ''
          ) {
            data.query.push({
              column: valueReq,
              type: 'eq',
              value: item[valueReq]
            })
          }
          return data.query.push({
            column: key,
            type: 'eq',
            value: req || value
          })
        }
        if (
          key === 'recvCorpCode' ||
          key === 'orderType' ||
          key === 'payWay' ||
          key === 'payStatus' ||
          key === 'payAccountNo' ||
          key === 'payBankCode'
        ) {
          if (!value.length) return
          data.query.push({
            column: key,
            type: 'eq',
            value: value.join(',')
          })
        } else {
          data.query.push({
            column: key + 'Start',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[0])
          })
          data.query.push({
            column: key + 'End',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[1])
          })
        }
      })
      // if (isSearch) {
      //   this.searchBackup = data.query
      // }
      // data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({
          column: 'payStatus',
          type: 'eq',
          value: this.buttonSearch
        })
      }
      if (this.multipleSelection1.length) {
        data.query = [
          { column: 'payOrderNo', type: 'in', value: this.multipleSelection1.map((v) => v.payOrderNo).join(',') },
        ]
      }
      // 查询对象的配置编码
      data.query.push({
        column: 'queryDataModuleCode',
        value: code
      })
      let text = code === 'payOrderListExport' ? this.$t('PayApplyList.exportPayOrderTip') : this.$t('PayApplyList.exportPayExtSumTip') // '是否确认导出付款单?' : '是否确认导出对外付款汇总?'
      let title = this.$t('OrderFee.tip') // code === 'payOrderListExport' ? '导出付款单' : '导出对外付款汇总'
      this.$confirm(text, title, {
        confirmButtonText: this.$t('OrderFee.confirm'),
        cancelButtonText: this.$t('OrderFee.cancel'),
        lockScroll: 'true',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          this.$store
            .dispatch('finance/downloadBlobFilePost', {
              uri: 'fin/common/queryDataExportExcel',
              data: { data }
            })
            .then(res => {
              this.loading = false
              console.log(res)
              const link = document.createElement('a')
              link.href = window.URL.createObjectURL(res)
              let name =  code === 'payOrderListExport' ? `${this.$t('PayApplyList.payOrder')}.xlsx` : `${this.$t('PayApplyList.payExtSum')}.xlsx` // '付款单.xlsx' : '对外付款汇总.xlsx'
              link.download = name
              link.click()
            })
            .catch((err) => {
              console.log(err)
              this.loading = false
              this.$message({ message: this.$t('OrderFee.exportFailed'), type: 'error' }) // '导出失败'
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
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // '请勾选需要拆分付款的项！'
      }
      if (this.multipleSelection1.length > 1) {
        return this.$msgErrClose(this.$t('OrderFee.selectOneRow')) // '一次只能勾选一个拆分付款！'
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
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // '请勾选需要拒绝付款的数据!'
      }
      const payStatus = this.multipleSelection1.some(item => {
        return item.payStatus === 'pay_close' // '已关闭'
      })
      if (payStatus) {
        return this.$msgErrClose(this.$t('PayApplyList.closeOrderNotOpRefuse')) // '已关闭的付款单，不能拒绝付款！'
      }
      const confirmStatus = this.multipleSelection1.every(item => {
        return item.confirmStatus === 'pending' // '未受理'
      })
      if (!confirmStatus) {
        return this.$msgErrClose(this.$t('PayApplyList.unacceptCanRefusePay')) // '只有未受理付款单才能拒绝付款！'
      }
      const orderType = this.multipleSelection1.some(item => {
        return item.orderType === 'refund_pay' // item.orderType === '退款付款'
      })
      // if (orderType) {
      //   return this.$msgErrClose('退款付款不能拒绝付款！')
      // }
      this.$confirm(this.$t('PayApplyList.refusalPayTip'), this.$t('OrderFee.tip'), { // '您是否确认拒绝该笔付款？', '拒绝付款'
        confirmButtonText: this.$t('OrderFee.confirm'),
        cancelButtonText: this.$t('OrderFee.cancel'),
        type: 'warning'
      })
      .then(() => {
        const payOrderNoList = this.multipleSelection1.map(item => {
            return item.payOrderNo
          })
          const refuseReason = this.refusePayForm.refusePayReason
          const data = {
            payOrderNoList
          }
          refusePay(data).then(res => {
            if (res.code === 0) {
              this.$msgSucClose(this.$t('OrderFee.successOp')) // '拒绝付款成功！'
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
      this.$refs.refusePayForm.validate(valid => {
        if (valid) {
          const payOrderNoList = this.multipleSelection1.map(item => {
            return item.payOrderNo
          })
          const refuseReason = this.refusePayForm.refusePayReason
          const data = {
            payOrderNoList,
            refuseReason
          }
          refusePay(data)
            .then(res => {
              if (res.code === 0) {
                this.$msgSucClose(this.$t('OrderFee.successOp')) // '拒绝付款成功！'
                this.getData()
                this.closeRefusePay()
              }
            })
            .catch()
        }
      })
    },
    //发送水单返回
    bankseqFiletClose(){
      this.bankseqFileList.show = false
      this.getData()
    },
    //发送水单
    handleBankseqFileFn(){
      let len = this.multipleSelection1
      if (len.length === 0) {
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // '请勾选需要发送水单的项！'
      }
      if (len > 30) {
         return this.$msgErrClose(this.$t('OrderFee.selectMost30Row')) // '一次最多只支持发送30条！'
      }
      let sta = len.some(item => !item.bankseqFileNo)
      if (sta) {
        return this.$msgErrClose(this.$t('PayApplyList.notContainNoBankSlip')) // '勾选的数据中存在无水单的项，请重新选择！'
      }
      this.loading = true
      let payOrderNoList = len.map(item=>{
        return item.payOrderNo
      })
      queryPayBankseqFileReceiInfo({payOrderNoList}).then(res=>{
        this.bankseqFileList.data = res.data
        this.bankseqFileList.show = true
      }).finally(()=> {
        this.loading = false
      })
    },
    bankAccountListAll(accountShortName, item) {
			let data = { currPage: 1, pageSize: 30, accountShortName, currency: '', status: 'effect',unitType:'company' }
			bankAccountListAll(data).then((res) => {
				let data = res.data.map(item=> ({label: `${item.accountShortName}(${item.accountNo})`,value:item.accountNo}))
				this.remoteSelectCommon(item, data)
			})
		},
    //批量下载
    handleDownLoadInvoice(){ 
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // '请勾选需要下载付款单水单的项！'
      }
      // for (let i = 0; i < this.multipleSelection1.length; i++) {
      //   if (this.multipleSelection1[i].status === 'pending') {
      //     return this.$msgErrClose('待审核状态不可批量下载！')
      //   }
      // }
      let data = {
        payOrderNoList : this.multipleSelection1.map((item, index) => {
          return item.payOrderNo 
        }),
      }
      let payOrderNoList = []
      for (let i = 0; i < this.multipleSelection1.length; i++) {
        if(!this.multipleSelection1[i].bankseqFileNo){
          return this.$msgErrClose(this.$t('PayApplyList.selectRowWithBankSlip')) // '请勾选有水单的付款单，请重新选择！'
        }
        if(!this.multipleSelection1[i].bankseqFileNo){
          payOrderNoList.push(this.multipleSelection1[i].payOrderNo)
        }
      }
      this.$confirm(this.$t('PayApplyList.dowloadBankSlipTip'), this.$t('OrderFee.tip'), { // payOrderNoList.length ? '您有'+payOrderNoList.toString()+'付款单号未上传水单，不能被下载，是否确认下载已上传的水单！' : '您是否确定批量下载水单吗?' , "下载水单", {
        showCancelButton: true,
        confirmButtonText: this.$t('OrderFee.confirm'),
        cancelButtonText: this.$t('OrderFee.cancel'),
        type: "warning",
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = `${this.$t('OrderFee.processing')}...`;
              setTimeout(() => {
                this.$store
                .dispatch('finance/downloadBlobFilePost', {
                  uri: '/fin/pay/order/downloadPayBankseqFile',
                  data:{data},
                })
                .then((res) => {
                  let link = document.createElement('a');
                  link.href = window.URL.createObjectURL(res);
                  link.download = `${this.$t('PayApplyList.bankSlip')}.zip`;
                  link.click()
                  done();
                  instance.confirmButtonLoading = false;
                })
                .catch((err)=> {
                  done();
                  instance.confirmButtonLoading = false;
                })
              }, 500);
                
          } else {
            done();
          }
        }
      }).then((err)=> {
      }).catch(()=> {
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
    // 关闭拒绝付款弹窗
    closeRefusePay() {
      this.refusePayOpen = false
      this.$refs.refusePayForm.resetFields()
    }
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    CustomColumns,
    PaySeparately,
    AcceptancePayOrder,
    BankseqFile
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
  }
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
  color: #FFFFFF;
  background-color: #674DC9;
  border-color: #674DC9;
}
.finance-tab-page .el-button--purple:hover,
.finance-tab-page .el-button--purple:focus {
    background: #8571D4;
    border-color: #8571D4;
    color: #FFFFFF;
}

</style>
