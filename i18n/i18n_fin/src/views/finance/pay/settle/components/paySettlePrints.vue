<template>
  <div class="finance-page" v-loading="lsLoading">
    <div class="finance-payorder-print" v-if="info">
      <div id="printPaySettle">
        <div class="finance-paySettlePrints-print-cnt">
          <div class="logo">
            <img src="../../../../../assets/bill_logo.png" />
            <h1 class="pay_comp_name">{{info.payCompName}}</h1>
          </div>
          <div class="title">
            <div class="base-item base-item-apply-no-left">
              {{$t('PayApplyList.nthPrint1')}}{{ isPrint ? info.printCount : info.printCount - 1 }}{{$t('PayApplyList.nthPrint2')}}
              <span
                style="margin-left:12px;"
              >{{$t('PayApplyList.printTime')}}：{{info.printTime}}</span><!-- margin-left:16px -->
            </div>
            <h1>{{$t('PayApplyList.paySettleOrderRefund')}}</h1><!-- 结算付款申请单-退款申请 -->
            <div class="base-item base-item-apply-no">{{$t('PayApplyList.payOrderNo')}}：{{ info.applyNo }}</div>
          </div>
          <div class="print-info-box">
            <div class="base-item">{{$t('PayApplyList.settleOrderNo')}}：{{ info.settleOrderNo }}</div>
            <div class="base-item">{{$t('PayApplyList.payWay')}}：{{ dictMapObj.payWay[info.payWay] }}</div><!-- 结算方式 -->
            <div class="base-item">{{$t('PayApplyList.settleCurrency')}}：{{ info.settleCurrency }}</div><!-- 结算币种 -->
            <div class="base-item">{{$t('PayApplyList.settleAmt')}}：{{ info.settleAmt }}</div><!-- 结算金额 -->
            <div class="base-item">{{$t('PayApplyList.realPayAmt')}}：{{ info.realPayAmt }}</div><!-- 实付金额 -->
            <div class="base-item">{{$t('PayApplyList.specialTransferFee')}}：{{ info.lessPayAmt }}</div>
            <div class="base-item">{{$t('PayApplyList.recvAccountName')}}：{{ info.recvAccountName }}</div><!-- 收款户名 -->
            <div class="base-item">{{$t('PayApplyList.recvBankName')}}：{{ info.recvBankName }}</div><!-- 收款银行 -->
            <div class="base-item">{{$t('PayApplyList.recvBankBranch')}}：{{ info.recvBankBranch }}</div><!-- 收款银行支行 -->
            <div class="base-item">{{$t('PayApplyList.recvAccountNo')}}：{{ info.recvAccountNo }}</div><!-- 收款账号 -->
            <div
              class="base-item"
            >{{$t('PayApplyList.handlingFeeBearer')}}：{{ dictMapObj.specialDeductRechtstraeger[info.specialDeductRechtstraeger] }}</div>
            <div
              class="base-item"
              style="width:11em;word-wrap:break-word;word-break:break-all;"
            >{{$t('PayApplyList.originalCurrency')}}：{{ info.originalCurrency }}</div>
            <div
              class="base-item"
              style="width:11em;word-wrap:break-word;word-break:break-all;"
            >{{$t('PayApplyList.originalCurrSettleAmt')}}：{{ info.originalCurrencySettleAmtStr }}</div><!-- 原币结算合计金额 -->
            <div
              class="base-item"
              style="width:11em;word-wrap:break-word;word-break:break-all;"
            >{{$t('PayApplyList.settleExRate')}}：{{ info.settleExRateStr }}</div><!-- 结算汇率 -->
            <!-- 海外版不显示
            <div
              class="base-item"
              style="width:11em;word-wrap:break-word;word-break:break-all;"
            >收款人证件号：{{ info.recvIdNo }}</div>
            <div
              class="base-item"
              style="width:11em;word-wrap:break-word;word-break:break-all;"
            >收款人手机号：{{ info.recvMobileNo }}</div>
            <div
              class="base-item"
              style="width:11em;word-wrap:break-word;word-break:break-all;"
            >收款人标识码：{{ info.thirdPayChannelCode }}</div> -->
            <!-- <div class="base-item"></div> -->
          </div>
          <div class="print-table-total">
            <b class="text">{{$t('PayApplyList.totalPayAmt')}}：</b><!-- 付款金额合计 -->
            <div class="total-box">
              <div class="total-item" v-if="info.settleAmt">
                {{info.settleCurrency}}
                {{info.settleAmt}}
              </div>
            </div>
          </div>
          <div class="print-table">
            <FinanceTableMass :option="option1" />
          </div>
          <div class="print-info-box">
            <template>
              <div class="base-item">{{$t('PayApplyList.createdTime')}}：{{ info.createdTime }}</div>
              <div class="base-item">{{$t('PayApplyList.createdName')}}：{{ info.createdName }}</div>
              <div class="base-item">{{$t('OrderFee.approvalTime')}}：{{ info.confirmTime }}</div>
              <div class="base-item">{{$t('OrderFee.approver')}}：{{ info.confirmName }}</div>
            </template>
          </div>
        </div>
        <div
          v-show="info.trustImgFileNoList && checkedPrint"
          v-for="(it,index) in info.trustImgFileNoList"
          :key="index"
          class="finance-paySettlePrints-print-cnt spec_img_container"
          :style="isPrint ? 'height: 1550px;' : ''"
        >
          <span>{{$t('PayApplyList.nthPrint1')}}{{it.printCount}}{{$t('PayApplyList.nthPrint2')}}</span>
          <img class width="1020" :src="it.url" style="border:none" />
        </div>
      </div>
      <div class="print-btn-box">
        <div class="print-btn-box1">
          <el-button class="finance-btn" type size="mini" @click="handlePrintExport">{{$t('PayApplyList.exportFeeDetail')}}</el-button>
          <el-button class="finance-btn" size="mini" @click="cancel">{{$t('Common.back')}}</el-button>
        </div>
        <div class="print-btn-box1">
          <el-checkbox v-model="checkedPrint">{{$t('PayApplyList.isPrintAttach')}}</el-checkbox>
          <el-button class="finance-btn" type="primary" size="mini" v-print="printObj">{{$t('Common.print')}}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mapGetters } from 'vuex'
import { settleQueryPrintInfo, settlePrintConfirm } from '@/api/fin/pay'
import { dateFormat } from '@/views/finance/utils/finance'

export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
  },
  data() {
    return {
      checkedPrint: false,
      payOrderNo: '',
      applyNoList: '',
      info: {},
      isPrint: false,
      lsLoading: false,
      printObj: {
        id: 'printPaySettle',
        popTitle: this.$t('PayApplyList.paySettleOrder'), // '结算付款申请单',
        type: 'html',
        extraCss: '',
        printCallback: this.printCallback,
        printCallbackBefore: this.printCallbackBefore,
        // extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
      },
      option1: {},
      columns1: [
        {
          prop: 'bdName',
          label: this.$t('FeeList.bdEmployeeId'),
          type: 'text',
          forceWidth: 70
        },
        {
          prop: 'settleCorpName',
          label: this.$t('FeeList.settleCorp'),
          type: 'text',
          width: 110
        },
        {
          prop: 'orderNo',
          label: this.$t('PreClose.bizNo'),
          type: 'text',
          minWidth: 110, // 116,
        },
        {
          prop: 'feeEnName',
          label: this.$t('FeeList.feeEname'),
          type: 'text',
          width: 80
        },
        // {
        // 	prop: 'originalCurrency',
        // 	label: this.$t('Settle.orignalCurrency'),
        // 	type: 'text',
        // },
        // {
        // 	prop: 'settleAmt',
        // 	label: '结算金额',
        // 	type: 'text',
        // },
        // {
        // 	prop: 'settleExRate',
        // 	label: this.$t('Settle.settleExRate'),
        // 	type: 'text',
        // },
        {
          prop: 'settleCurrency',
          label: this.$t('Settle.settleCurrency'),
          type: 'text',
          minWidth: 80,
        },
        {
          prop: 'exSettleAmt',
          label: this.$t('Settle.applyPayAmt'),
          type: 'text',
          minWidth: 80,
        },
        // {
        // 	prop: 'exSettleAmt',
        // 	label: '折合金额',
        // 	type: 'text',
        // },
        {
          prop: 'sysLineName',
          label: this.$t('PayApplyList.sysLineName'), // '航线',
          type: 'text',
          forceWidth: 50
        },
        {
          prop: 'containerCount',
          label: this.$t('PayApplyList.containerCount'), // '箱型相量',
          type: 'text',
          width: 80
        },
        {
          prop: 'orderProfit',
          label: this.$t('PayApplyList.profit'), // '利润',
          type: 'text',
          forceWidth: 50
        },
        {
          prop: 'reciStatus',
          label: this.$t('PayApplyList.receiptStatus'), // '收款状态',
          type: 'select',
          propInDict: 'feeSettleStatus',
          forceWidth: 50
        },
        {
          prop: 'originalCurrency',
          label: this.$t('PayApplyList.originalCurrency'), // '原币',
          type: 'text',
          // minWidth: 40,
          width: 80
        },
        {
          prop: 'settleAmt',
          label: this.$t('PayApplyList.originalCurrSettleAmt'), // '原币结算金额',
          type: 'text',
          width: 80
        },
        {
          prop: 'realPayAmt',
          label: this.$t('PayApplyList.realPayAmt'),
          type: 'text',
          // minWidth: 60,
          width: 80
        },
      ],
      columns2: [
        {
          prop: 'bdName',
          label: this.$t('FeeList.bdEmployeeId'),
          type: 'text',
          forceWidth: 70
        },
        {
          prop: 'settleCorpName',
          label: this.$t('FeeList.settleCorp'),
          type: 'text',
          width: 110, // 130,
        },
        {
          prop: 'orderNo',
          label: this.$t('PayApplyList.orderNo'), // '业务编号',
          type: 'text',
          width: 110, // 130,
        },
        {
          prop: 'feeEnName',
          label: this.$t('FeeList.feeEname'),
          type: 'text',
          width: 80
        },
        {
          prop: 'originalCurrency',
          label: this.$t('FeeList.currency'),
          type: 'text',
          forceWidth: 70
        },
        {
          prop: 'settleAmt',
          label: this.$t('PayApplyList.applyPayAmt'), // '请款金额',
          type: 'text',
          // minWidth: 60,
          width: 80
        },
        {
          prop: 'settleExRate',
          label: this.$t('Settle.settleExRate'),
          type: 'text',
          // minWidth: 60,
          width: 80
        },
        {
          prop: 'exSettleAmt',
          label: this.$t('PayApplyList.exSettleAmt'), // '折合金额',
          type: 'text',
          forceWidth: 60
        },
        {
          prop: 'sysLineName',
          label: this.$t('PayApplyList.sysLineName'), // '航线',
          type: 'text',
          forceWidth: 50
        },
        {
          prop: 'containerCount',
          label: this.$t('PayApplyList.containerCount'), // '箱型箱量',
          type: 'text',
          forceWidth: 60
        },
        {
          prop: 'orderProfit',
          label: this.$t('PayApplyList.profit'), // '利润',
          type: 'text',
          forceWidth: 50
        },
        {
          prop: 'reciStatus',
          label: this.$t('PayApplyList.receiptStatus'), // '收款状态',
          type: 'select',
          propInDict: 'feeSettleStatus',
          forceWidth: 50
        },
        {
          prop: 'originalCurrency',
          label: this.$t('PayApplyList.originalCurrency'), // '原币',
          type: 'text',
          // minWidth: 60,
          forceWidth: 70
        },
        {
          prop: 'settleAmt',
          label: this.$t('PayApplyList.originalCurrSettleAmt'), // '原币结算金额',
          type: 'text',
          width: 80
        },
        {
          prop: 'realPayAmt',
          label: this.$t('PayApplyList.realPayAmt'),
          type: 'text',
          // minWidth: 60,
          forceWidth: 70
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['dictMapObj']),
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      maxHeight: 99999,
      columns: [],
      data: [],
      tips: { text: '', show: false },
      selection: { show: false },
      operationBtns: { show: false, data: [] },
      rootTipsHide: true,
      showOverflow: false,
      tdMinWidth: 50
    })
  },
  activated() {
    this.applyNoList = this.$route.query.applyNoList
    this.getData()
  },
  methods: {
    // 返回
    cancel() {
      this.routerBack()
    },
    handlePrintExport() {
      let data = {
        currPage: 1,
        pageSize: 10,
        query: [
          { column: 'queryDataModuleCode', type: 'eq', value: 'payApplyPrintFeeDetailExportList' },
          { column: 'applyNo', type: 'eq', value: this.info.applyNo },
          { column: 'hasSpecialRefund', type: 'eq', value: 'yes' },
        ],
      }
      this.$confirm(this.$t('PayApplyList.sureExportSpecialPay'), this.$t('OrderFee.tip'), { // 是否确认导出付款申请专项单费用明细?', '导出费用明细'
        showCancelButton: true,
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        lockScroll: 'true',
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = `${this.$t('OrderFee.processing')}...`
            setTimeout(() => {
              this.option1.loading = true
              this.$store
                .dispatch('finance/downloadBlobFilePost', {
                  uri: '/fin/common/queryDataExportExcel',
                  data: { data },
                })
                .then((res) => {
                  this.option1.loading = false
                  console.log(res)
                  let link = document.createElement('a')
                  link.href = window.URL.createObjectURL(res)
                  link.download = `${this.$t('PayApplyList.specialPayFeeDetail')}.xlsx`
                  link.click()
                  done()
                  instance.confirmButtonLoading = false
                })
                .catch(() => {
                  this.option1.loading = false
                  this.$message({ message: this.$t('OrderFee.exportFailed'), type: 'error' }) // '导出失败'
                  done()
                  instance.confirmButtonLoading = false
                })
            }, 10)
          } else {
            done()
            instance.confirmButtonLoading = false
          }
        },
      })
        .then(() => {})
        .catch(() => {})
    },
    // 获取数据详情
    getData() {
      let data = {
        applyNoList: this.applyNoList,
        hasSpecialRefund: 'yes',
      }
      this.lsLoading = true
      settleQueryPrintInfo(data)
        .then((res) => {
          this.isPrint = false
          this.info = res.data[0]
          let trustFileList = []
          res.data[0].invoiceFileNoList.forEach((item) => {
            if (item) {
              trustFileList.push({ url: `/base/fileView/preview/${item.invoiceImgFileNo}/sowoll`, printCount: item.printCount })
            }
          })
          this.info.trustImgFileNoList = trustFileList
          if (this.info.orderType === 'special_refund') {
            this.option1.columns = this.columns2
          } else {
            this.option1.columns = this.columns1
          }
          let settleOrderFeeList = []
          res.data[0].settleOrderFeeList.forEach((item) => {
            item.receipayType = item.receipayType ? this.dictMapObj.receipayType[item.receipayType] : ''
            item.reciStatus = item.reciStatus ? this.dictMapObj.feeSettleStatus[item.reciStatus] : ''
            settleOrderFeeList.push(item)
          })
          this.option1.data = settleOrderFeeList || []
        })
        .finally(() => {
          this.lsLoading = false
        })
        .catch(() => {
          this.delVisitedView()
          this.cancel()
        })
    },
    // 打印次数统计
    printCallback() {
      const applyNoList = [this.info.applyNo]
      let data = {
        applyNoList,
        printTime: dateFormat('yyyy-mm-dd HH:MM:SS', new Date()),
        hasPrintInvoice: this.checkedPrint ? 'yes' : 'no',
      }
      settlePrintConfirm(data).then((res) => this.getData())
    },
    printCallbackBefore(fn) {
      console.log(this.$route.name, this.info.printCount)
      if (this.$route.name === 'PaySettlePrints') {
        this.printCallbackBeforeCommon(
          this.info.printCount,
          () => (this.isPrint = true),
          fn,
          () => (this.isPrint = false)
        )
      } else {
        this.isPrint = true
        fn && fn()
      }
    },
  },
}
</script>

<style media="print" lang="scss" scoped>
@media print {
  @page {
    /* size: landscape; */
    size: portrait;
    margin: 5mm 10mm 5mm;
  }
}
.finance-payorder-print {
  width: 1000px;
  /* margin-top: 20px; */
  margin: 0 auto;
  position: relative;
  padding-bottom: 40px;
}
.finance-paySettlePrints-print-cnt {
  width: 1020px;
  padding-top: 0px;
  font-size: 14px;
  page-break-before: auto;
  page-break-after: always;
  padding-right: 18px;
}
.finance-paySettlePrints-print-cnt .logo {
  padding-top: 5px;
  padding-bottom: 0px;
  border-bottom: 1px solid #d8d8d8;
  position: relative;
}
.finance-paySettlePrints-print-cnt .logo img {
  position: absolute;
  top: 16px;
}
.finance-paySettlePrints-print-cnt .logo .pay_comp_name {
  font-size: 20px;
  font-weight: 500;
  color: #222222;
  text-align: center;
}
.finance-paySettlePrints-print-cnt .title {
  margin: 20px 0;
}
.finance-paySettlePrints-print-cnt .title h1 {
  font-size: 20px;
  font-weight: 600;
  color: #222222;
  text-align: center;
}
.finance-paySettlePrints-print-cnt .print-info-box {
  display: flex;
  flex-wrap: wrap;
}
.finance-paySettlePrints-print-cnt .print-info-box .base-item {
  flex: 1;
  flex-basis: calc(33% - 24px);
  max-width: calc(33% - 24px);
  margin-bottom: 10px;
  margin-right: 24px;
  // word-wrap: break-word;
  // word-break: break-all;
}
.finance-paySettlePrints-print-cnt .print-table {
  /* margin-top: 10px; */
}
.finance-paySettlePrints-print-cnt .print-table .finance-table {
  padding: 0;
}
.finance-paySettlePrints-print-cnt .print-table-total {
  background: #e7eeff;
  padding: 6px 0;
  margin-top: 14px;
  font-size: 16px;
  font-weight: 600;
  color: #222222;
  display: flex;
  padding-right: 15px;
  -webkit-print-color-adjust: exact !important;
}
.finance-paySettlePrints-print-cnt .print-table-total .text {
  flex: 1;
  text-align: right;
}
.finance-paySettlePrints-print-cnt .print-table-total .total-box {
  min-width: 400;
}
.finance-paySettlePrints-print-cnt .print-table-total .total-box .total-item {
  margin-left: 15px;
}
.finance-paySettlePrints-print-cnt .print-apply-info {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
}
.finance-paySettlePrints-print-cnt .print-apply-info .base-item {
  width: 25%;
  margin-bottom: 10px;
}
/* .finance-payorder-print .el-checkbox {
  margin-top: 4px;
} */
.finance-payorder-print .print-btn-box {
  // display: flex;
  // justify-content: flex-end;
  margin-top: 6px; // 20px;
  vertical-align: middle;
  position: absolute;
  top: 0;
  right: 0px;
  .print-btn-box1 {
    display: flex;
    justify-content: flex-end;
    // margin-top: 6px;
  }
}
.finance-payorder-print .print-btn-box .finance-btn {
  margin-left: 10px;
  min-width: 50px;
  /* line-height: 25px; */
  /* height: 25px; */
  padding: 0 4px;
  margin-bottom: 5px;
}
</style>

<style lang="scss">
.finance-paySettlePrints-print-cnt {
  &.spec_img_container {
    position: relative;
    & > span {
      position: absolute;
      left: 920px;
      top: 2px;
    }
  }
  .finance-table {
    .finance-el-table {
      padding: 8px 0;
    }
  }
  .base-item-apply-no {
    float: right;
    margin-top: -32px;
  }
  .base-item-apply-no-left {
    position: absolute;
    left: 0;
    line-height: 150%;
  }
}
.finance-table .el-table th {
  -webkit-print-color-adjust: exact !important;
}
@media print {
  .print-table .vxe-table--header,
  .print-table .vxe-table--body {
    border-collapse: collapse;
    border: none;
    color: #000;
  }
  .print-table table tr td,
  .print-table table tr th {
    border: 1px solid #000;
    color: #000;
  }
  .print-table .ls-vxe-th {
    background-color: none;
    color: #000 !important;
  }
  .print-table .vxe-table--header-wrapper tr .vxe-resizable {
    display: none;
  }
  .vxe-table--render-default.border--default .vxe-body--column,
  .vxe-table--render-default.border--default .vxe-footer--column,
  .vxe-table--render-default.border--default .vxe-header--column,
  .vxe-table--render-default.border--inner .vxe-body--column,
  .vxe-table--render-default.border--inner .vxe-footer--column,
  .vxe-table--render-default.border--inner .vxe-header--column {
    background-image: none;
    background-color: #fff;
  }
  .print-table .finance-table .vxe-table--render-default tr td {
    color: #000;
  }
  .vxe-table--render-default.border--inner .vxe-table--border-line {
    border: none;
  }
  .print-table .vxe-table--header-wrapper {
    position: static;
  }
  .print-table .vxe-table--header-wrapper tr th {
    border-bottom: none;
  }
}
</style>