<template>
  <div class="finance-page" v-loading="lsLoading">
    <div class="finance-payorder-print payorder-base-item-apply" v-if="infoList.length">
      <el-carousel
        ref="carousel"
        indicator-position="none"
        arrow="never"
        :loop="false"
        :autoplay="false"
        @change="change"
        :height="bannerHeight+'px'"
      >
        <!-- :initial-index="currIndex" -->
        <el-carousel-item v-for="(item,index) in infoList" :key="item.key">
          <div class="finance-print-cnt" :id="'PayOrderPrint'+index">
            <div class="logo">
              <img src="../../../../../assets/bill_logo.png" />
              <h1 class="pay_comp_name">{{item.payCompName}}</h1>
            </div>
            <div class="title">
              <div
                class="base-item payorder-base-item-apply-no-left"
              >{{$t('PayApplyList.nthPrint1')}}{{ item.printCount ? isPrinting ? item.printCount : item.printCount - 1 : 0 }}{{$t('PayApplyList.nthPrint2')}}</div>
              <h1>{{$t('PayApplyList.payOrder')}}</h1>
              <div class="base-item payorder-base-item-apply-no">{{$t('PayApplyList.payOrderNo')}}：{{ item.payOrderNo }}</div>
            </div>
            <div class="print-info-box">
              <div class="base-item">{{$t('PayApplyList.settleOrderNo')}}：{{ item.settleOrderNo }}</div>
              <div class="base-item">{{$t('PayApplyList.payWay')}}：{{ dictMapObj.payWay[item.payWay] }}</div><!-- 结算方式 -->
              <div class="base-item"></div>
              <div class="base-item">{{$t('PayApplyList.recvAccountName')}}：{{ item.recvAccountName }}</div><!-- 对方户名 -->
              <div class="base-item">{{$t('PayApplyList.recvBankBranch')}}：{{ item.recvBankBranch }}</div><!-- 对方开户行支行 -->
              <div class="base-item">{{$t('PayApplyList.recvAccountNo')}}：{{ item.recvAccountNo }}</div><!-- 对方账号 -->
              <template v-if="item.orderType === 'special_refund'">
                <div class="base-item">{{$t('PayApplyList.settleCurrency')}}：{{ item.settleCurrency }}</div><!-- 结算币种 -->
                <div class="base-item">{{$t('PayApplyList.settleAmt')}}：{{ item.settleAmt }}</div><!-- 结算金额 -->
                <div class="base-item">{{$t('PayApplyList.realPayAmt')}}：{{ item.realPayAmt }}</div><!-- 实付金额 -->
              </template>
              <template v-else>
                <div class="base-item">{{$t('PayApplyList.payAccountName')}}：{{ item.payAccountName }}</div><!-- 我司户名 -->
                <div class="base-item">{{$t('PayApplyList.payBankBranch')}}：{{ item.payBankBranch }}</div><!-- 我司开户行支行 -->
                <div class="base-item">{{$t('PayApplyList.payAccountNo')}}：{{ item.payAccountNo }}</div><!-- 我司账号 -->
              </template>
            </div>
            <div class="print-table-total">
              <b class="text">{{$t('OrderFee.total')}}：</b><!-- 合计 -->
              <div class="total-box" v-if="item.orderType === 'special_refund'">
                <div :key="it.currency" class="total-item" v-for="it in item.settleAmtSummarys">
                  {{ it.originalCurrency }}: {{ it.settleAmt }} -
                  {{ it.exSettleAmt }}
                </div>
              </div>
              <div class="total-box" v-else>
                <div class="total-item">{{item.settleCurrency}}:{{item.settleAmt}}</div>
              </div>
              <!-- <div
                    :key="item.currency"
                    class="total-item"
                    v-for="item in info.settleAmtSummarys"
              >{{ item.settleCurrency }}: {{ item.settleAmt }}</div>-->
            </div>
            <div class="print-table">
              <FinanceTableMass :option="item.option1" />
            </div>
            <div class="print-info-box">
              <template v-if="item.orderType === 'special_refund'">
                <div class="base-item">{{$t('PayApplyList.createdTime')}}：{{ item.createdTime }}</div><!-- 申请日期 -->
                <div class="base-item">{{$t('PayApplyList.createdName')}}：{{ item.createdName }}</div><!-- 申请人 -->
                <div class="base-item">{{$t('OrderFee.approvalTime')}}：{{ item.confirmTime }}</div><!-- 审核时间 -->
                <div class="base-item">{{$t('PayApplyList.acceptor')}}：{{ item.confirmName }}</div><!-- 受理人 -->
              </template>
              <template v-else>
                <div class="base-item">{{$t('PayApplyList.createdTime')}}：{{ item.createdTime }}</div><!-- 申请日期 -->
                <!-- <div class="base-item">发票登记日期：{{ item.invoiceRegisterTime }}</div> 海外版不显示 -->
                <div class="base-item">{{$t('PayApplyList.acceptanceTime')}}：{{ item.confirmTime }}</div><!-- 受理时间 -->
                <div class="base-item">{{$t('OrderFee.approver')}}：{{ item.confirmName }}</div><!-- 审核人 -->
                <!-- <div class="base-item">发票登记人:{{ item.invoiceRegisterName }}</div> 海外版不显示 -->
                <div class="base-item">{{$t('PayApplyList.acceptor')}}：{{ item.createdName }}</div><!-- 受理人 -->
              </template>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
      <div class="carousel-bottom" v-if="total>1">
        <div>
          <el-button size="mini" @click="prev" :disabled="preDisabled" icon="el-icon-arrow-left"></el-button>
          <span style="margin:0 32px;">{{$t('PayApplyList.nthPage1')}}{{currIndex}}{{$t('PayApplyList.nthPage2')}}/{{$t('PayApplyList.totalPage1')}}{{total}}{{$t('PayApplyList.totalPage2')}}</span><!-- 第 {{currIndex}} 张/{{total}}张 -->
          <el-button size="mini" @click="next" :disabled="nextDisabled" icon="el-icon-arrow-right"></el-button>
        </div>
      </div>

      <div class="print-btn-box">
        <el-button
          v-if="total>1"
          class="finance-btn"
          size="mini"
          type="primary"
          @click="handlePrintFn"
          v-print="handlePrint"
        >{{$t('PayApplyList.printAll')}}</el-button>
        <el-button class="finance-btn" size="mini" type="primary" v-print="printObj">{{$t('Common.print')}}</el-button>
        <el-button @click="cancel" class="finance-btn" size="mini">{{$t('Common.back')}}</el-button>
      </div>
      <div id="PayOrderPrintList" v-show="isPrint">
        <div class="one_page_print" v-for="(list, index) in infoListArr" :key="index">
          <div class="finance-print-cnt" v-for="(item,index) in list" :key="index">
            <div class="logo">
              <img src="../../../../../assets/bill_logo.png" />
              <h1 class="pay_comp_name">{{item.payCompName}}</h1>
            </div>
            <div class="title">
              <div
                class="base-item payorder-base-item-apply-no-left"
              >{{$t('PayApplyList.nthPrint1')}}{{ item.printCount ? item.printCount : 0 }}{{$t('PayApplyList.nthPrint2')}}</div>
              <h1>{{$t('PayApplyList.payOrder')}}</h1>
              <div class="base-item payorder-base-item-apply-no">{{$t('PayApplyList.payOrderNo')}}：{{ item.payOrderNo }}</div>
            </div>
            <div class="print-info-box">
              <div class="base-item">{{$t('PayApplyList.settleOrderNo')}}：{{ item.settleOrderNo }}</div><!-- 结算单号 -->
              <div class="base-item">{{$t('PayApplyList.payWay')}}：{{ dictMapObj.payWay[item.payWay] }}</div><!-- 结算方式 -->
              <div class="base-item"></div>
              <div class="base-item">{{$t('PayApplyList.recvAccountName')}}：{{ item.recvAccountName }}</div><!-- 对方户名 -->
              <div class="base-item">{{$t('PayApplyList.recvBankName')}}：{{ item.recvBankName }}</div><!-- 对方开户行 -->
              <div class="base-item">{{$t('PayApplyList.recvAccountNo')}}：{{ item.recvAccountNo }}</div><!-- 对方账号 -->
              <template v-if="item.orderType === 'special_refund'">
                <div class="base-item">{{$t('PayApplyList.settleCurrency')}}：{{ item.settleCurrency }}</div><!-- 结算币种 -->
                <div class="base-item">{{$t('PayApplyList.settleAmt')}}：{{ item.settleAmt }}</div><!-- 结算金额 -->
                <div class="base-item">{{$t('PayApplyList.realPayAmt')}}：{{ item.realPayAmt }}</div><!-- 实付金额 -->
              </template>
              <template v-else>
                <div class="base-item">{{$t('PayApplyList.payAccountName')}}：{{ item.payAccountName }}</div><!-- 我司户名 -->
                <div class="base-item">{{$t('PayApplyList.payBankName')}}：{{ item.payBankName }}</div><!-- 我司开户行 -->
                <div class="base-item">{{$t('PayApplyList.payAccountNo')}}：{{ item.payAccountNo }}</div><!-- 我司账号 -->
              </template>
            </div>
            <div class="print-table-total">
              <b class="text">{{$t('OrderFee.total')}}：</b>
              <div class="total-box" v-if="item.orderType === 'special_refund'">
                <div :key="it.currency" class="total-item" v-for="it in item.settleAmtSummarys">
                  {{ it.originalCurrency }}: {{ it.settleAmt }} -
                  {{ it.exSettleAmt }}
                </div>
              </div>
              <div class="total-box" v-else>
                <div class="total-item">{{item.settleCurrency}}:{{item.settleAmt}}</div>
              </div>
              <!-- <div
                  :key="item.currency"
                  class="total-item"
                  v-for="item in info.settleAmtSummarys"
              >{{ item.settleCurrency }}: {{ item.settleAmt }}</div>-->
            </div>
            <div class="print-table">
              <FinanceTableMass :option="item.option1" />
            </div>
            <div class="print-info-box">
              <template v-if="item.orderType === 'special_refund'">
                <div class="base-item">{{$t('PayApplyList.createdTime')}}：{{ item.createdTime }}</div>
                <div class="base-item">{{$t('PayApplyList.createdName')}}：{{ item.createdName }}</div>
                <div class="base-item">{{$t('OrderFee.approvalTime')}}：{{ item.confirmTime }}</div>
                <div class="base-item">{{$t('PayApplyList.approver')}}：{{ item.confirmName }}</div>
              </template>
              <template v-else>
                <div class="base-item">{{$t('PayApplyList.createdTime')}}：{{ item.createdTime }}</div>
                <!-- <div class="base-item">发票登记日期：{{ item.invoiceRegisterTime }}</div> 海外版不显示 -->
                <div class="base-item">{{$t('PayApplyList.acceptanceTime')}}：{{ item.confirmTime }}</div>
                <div class="base-item">{{$t('OrderFee.approver')}}：{{ item.confirmName }}</div>
                <!-- <div class="base-item">发票登记人:{{ item.invoiceRegisterName }}</div> 海外版不显示 -->
                <div class="base-item">{{$t('PayApplyList.acceptor')}}：{{ item.createdName }}</div>
              </template>
            </div>
          </div>
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
import { queryPrintInfo, printConfirm } from '@/api/fin/pay'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
  },
  data() {
    return {
      isPrinting: false,
      bannerHeight: '650',
      numArr: [],
      tableArr: [],
      currIndex: 1,
      isPrint: false,
      lsLoading: false,
      payOrderNo: '',
      infoList: [],
      handlePrint: {
        id: 'PayOrderPrintList',
        popTitle: this.$t('PayApplyList.payOrder'), // '付款单',
        type: 'html',
        extraCss: '',
        printCallback: this.printCallbackList,
        printCallbackBefore: this.printCallbackBefore,
        extraHead: '',
      },
      printObj: {
        id: 'PayOrderPrint',
        popTitle: this.$t('PayApplyList.payOrder'), // '付款单',
        type: 'html',
        extraCss: '',
        printCallback: this.printCallback,
        printCallbackBefore: this.printCallbackBefore,
        extraHead: '',
      },
      columns1: [
        { prop: 'bdName', label: this.$t('FeeList.bdEmployeeId'), type: 'text', width: 80 },
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 130 },
        { prop: 'receipayType', label: this.$t('OrderFee.receipayType'), type: 'select', propInDict: 'receipayType', width: 80 }, // 类型
        { prop: 'orderNo', label: this.$t('OrderFee.orderNo'), type: 'text', width: 130 }, // 业务编号
        { prop: 'putNo', label: this.$t('OrderFee.blId'), type: 'text' }, // 提单号
        { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text' },
        { prop: 'originalCurrency', label: this.$t('Settle.settleCurrency'), type: 'text', width: 80 },
        { prop: 'settleAmt', label: this.$t('PayApplyList.settleAmt'), type: 'text', width: 80 }, // 结算金额
        // { prop: 'invoiceNo', label: this.$t('FeeList.invoiceNo'), type: 'text' }, // 海外版不显示
        { prop: 'sysLineName', label: this.$t('PayApplyList.sysLineName'), type: 'text', width: 80 }, // 航线
        { prop: 'reciStatus', label: this.$t('PayApplyList.receiptStatus'), type: 'select', propInDict: 'feeSettleStatus', width: 80 }, // 收款状态
      ],
      columns2: [
        { prop: 'bdName', label: this.$t('FeeList.bdEmployeeId'), type: 'text', width: 80 },
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 130 },
        { prop: 'orderNo', label: this.$t('OrderFee.orderNo'), type: 'text', width: 130 }, // 业务编号
        { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text' },
        { prop: 'originalCurrency', label: this.$t('FeeList.currency'), type: 'text', width: 80 },
        { prop: 'settleAmt', label: this.$t('PayApplyList.applyPayAmt'), type: 'text', width: 80 }, // 请款金额
        { prop: 'settleExRate', label: this.$t('Settle.settleExRate'), type: 'text', width: 80 },
        { prop: 'exSettleAmt', label: this.$t('PayApplyList.exSettleAmt'), type: 'text', width: 80 }, // 折合金额
        { prop: 'sysLineName', label: this.$t('PayApplyList.sysLineName'), type: 'text', width: 80 }, // '航线'
        { prop: 'containerCount', label: this.$t('PayApplyList.containerCount'), type: 'text', width: 80 }, // 箱型箱量
        { prop: 'orderProfit', label: this.$t('PayApplyList.profit'), type: 'text', width: 80 }, // 利润
        { prop: 'reciStatus', label: this.$t('PayApplyList.receiptStatus'), type: 'select', propInDict: 'feeSettleStatus', width: 80 },
      ],
    }
  },
  computed: {
    ...mapGetters(['dictMapObj']),
    total() {
      return this.infoList.length
    },
    preDisabled() {
      return this.currIndex == 1
    },
    nextDisabled() {
      return this.currIndex == this.infoList.length
    },
    infoListArr() {
      let arr = []
      this.infoList.forEach((item) => {
        let len = arr.length
        if (!arr[len - 1]) {
          arr.push([item])
        } else {
          if (arr[len - 1].length == 2) {
            arr.push([item])
          } else {
            arr[len - 1].push(item)
          }
        }
      })
      console.log(arr)
      return arr
    },
  },
  created() {},
  activated() {
    if (!this.$route.meta.isUseCache) {
      this.payOrderNo = this.$route.query.payOrderNo
      this.infoList = []
      this.currIndex = 1
      this.getData()
    }
  },
  methods: {
    initOption() {
      return Object.assign({}, this.option, {
        id: 'option1',
        $name: 'PayOrderPrintList',
        columns: [],
        data: [],
        disableFixedIndex0: true,
        tips: { text: '', show: false },
        selection: false,
        operationBtns: false,
        rootTipsHide: true,
        showOverflow: false,
        maxHeight: 9999,
        tdMinWidth: 50
      })
    },
    handlePrintFn() {
      this.isPrint = true
    },
    // 返回
    cancel(close) {
      if (close === true) this.delVisitedView()
      this.routerBack()
    },
    // 获取数据详情
    getData() {
      this.lsLoading = true
      const data = {
        payOrderNoList: this.payOrderNo,
        hasSpecialRefund: this.$route.query.hasSpecialRefund,
      }
      queryPrintInfo(data)
        .then((res) => {
          this.isPrinting = false
          this.lsLoading = false
          this.infoList = res.data
          res.data.forEach((item, index) => {
            item.option1 = this.initOption()
            if (item.orderType === 'special_refund') {
              this.infoList[index].option1.columns = this.columns2
            } else {
              this.infoList[index].option1.columns = this.columns1
            }
            this.infoList[index].option1.data = item.settleOrderFeeList || []
          })
        })
        .catch(() => {
          this.lsLoading = false
          this.cancel(true)
        })
    },
    change(val) {
      this.currIndex = +val + 1
    },
    next() {
      this.$refs.carousel.next()
    },
    prev() {
      this.$refs.carousel.prev()
    },
    // 打印次数全部统计
    printCallbackList() {
      this.isPrint = false
      let payOrderNo = this.infoList.map((item) => item.payOrderNo)
      printConfirm({ payOrderNoList: payOrderNo }).then((res) => this.getData())
    },
    // 打印次数统计
    printCallback() {
      let payOrderNo = this.infoList[this.currIndex - 1].payOrderNo
      printConfirm({ payOrderNoList: [payOrderNo] }).then((res) => this.getData())
    },
    printCallbackBefore(fn) {
      this.isPrinting = true
      fn && fn()
    },
  },
  watch: {
    currIndex: {
      handler(val) {
        this.printObj.id = 'PayOrderPrint' + (val - 1)
      },
      immediate: true,
    },
  },
}
</script>

<style media="print" scoped>
@media print {
  @page {
    /* size: landscape; */
    size: portrait;
    margin: 0 10mm;
  }
}
.finance-payorder-print {
  width: 1020px;
  margin: 0 auto;
  position: relative;
  padding-bottom: 40px;
}
.one_page_print {
  width: 100%;
  height: 1580px;
  position: relative;
  page-break-after: always;
}
.one_page_print .finance-print-cnt {
  position: absolute;
  height: 50%;
  padding-top: 32px;
}
.one_page_print .finance-print-cnt:nth-of-type(2) {
  top: 50%;
}
.finance-print-cnt {
  width: 1020px;
  padding-top: 20px;
  font-size: 14px;
  /* page-break-before: auto; */
  /* page-break-after: always; */
  padding-right: 18px;
}
.finance-payorder-print .el-carousel__item {
  overflow-y: auto;
  overflow-x: hidden;
}
.finance-print-cnt .logo {
  padding-top: 5px;
  padding-bottom: 0px;
  border-bottom: 1px solid #d8d8d8;
  position: relative;
}
.finance-print-cnt .logo img {
  position: absolute;
  top: 16px;
}
.finance-print-cnt .logo .pay_comp_name {
  font-size: 20px;
  font-weight: 500;
  color: #222222;
  text-align: center;
}
.finance-print-cnt .title {
  margin: 20px 0;
  position: relative;
}
.finance-print-cnt .title h1 {
  font-size: 20px;
  font-weight: 600;
  color: #222222;
  text-align: center;
}
.finance-print-cnt .print-info-box {
  display: flex;
  flex-wrap: wrap;
}
.finance-print-cnt .print-info-box .base-item {
  flex: 1;
  flex-basis: calc(33% - 24px);
  margin-bottom: 10px;
  margin-right: 24px;
}
.finance-print-cnt .print-table {
  /* margin-top: 10px; */
}
.finance-print-cnt .print-table .finance-table {
  padding: 0;
}
.finance-print-cnt .print-table-total {
  background: #e7eeff;
  padding: 6px 0;
  font-size: 16px;
  margin-top: 14px;
  font-weight: 600;
  color: #222222;
  display: flex;
  padding-right: 15px;
  -webkit-print-color-adjust: exact !important;
}
.finance-print-cnt .print-table-total .text {
  flex: 1;
  text-align: right;
}
.finance-print-cnt .print-table-total .total-box {
  min-width: 400;
}
.finance-print-cnt .print-table-total .total-box .total-item {
  margin-left: 15px;
}
.finance-print-cnt .print-apply-info {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
}
.finance-print-cnt .print-apply-info .base-item {
  width: 25%;
  margin-bottom: 10px;
}
.finance-payorder-print .print-btn-box {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
  vertical-align: middle;
  position: absolute;
  top: 0;
  right: 18px;
  z-index: 999;
}
.finance-payorder-print .print-btn-box .finance-btn {
  margin-left: 10px;
  min-width: 50px;
  /* line-height: 25px; */
  /* height: 25px; */
  padding: 0 4px;
}
</style>

<style lang="scss">
.finance-print-cnt {
  .finance-table {
    .finance-el-table {
      padding: 8px 0;
    }
  }
}
.payorder-base-item-apply-no-left {
  position: absolute;
  top: 4px;
  left: 0;
}
.payorder-base-item-apply-no {
  position: absolute;
  top: 4px;
  right: 0;
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
  .nodata .vxe-table--render-default .vxe-table--body-wrapper {
    border: 1px solid #000;
  }
  .print-table .vxe-table--header,
  .print-table .vxe-table--body {
    width: 100% !important;
  }
}
.carousel-bottom {
  position: relative;
  margin-top: 20px;
  height: 28px;
  font-size: 12px;
  & > span {
    line-height: 28px;
    color: #999;
  }
  & > div {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    text-align: center;
    .el-button + .el-button {
      margin-left: 20px;
    }
  }
}
.payorder-base-item-apply {
  .el-carousel__item {
    height: 100%;
    overflow-y: auto;
    transform: scaleX(1) translateX(0) !important;
    background: white;
  }
}
</style>
