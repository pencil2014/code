<template>
  <div class="finance-page" v-loading="lsLoading">
    <div class="finance-payorderFileNo-print payorder-base-item-apply" v-if="infoList.length">
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
          <div :id="'PayOrderPrint'+index" :style="printIsNo ? 'margin-top:20px;': ''">
            <div class="finance-payorderFileNo-print-cnt">
              <div class="logo">
                <img src="../../../../../assets/bill_logo.png" />
                <h1 class="pay_comp_name">{{item.payCompName}}</h1>
              </div>
              <div class="title">
                <div
                  class="base-item payorder-base-item-apply-no-left"
                >第{{ item.printCount ? isPrinting ? item.printCount : item.printCount - 1 : 0 }}次打印</div>
                <h1>付款单</h1>
                <div class="base-item payorder-base-item-apply-no">付款单号：{{ item.payOrderNo }}</div>
              </div>
              <div class="print-info-box">
                <div class="base-item">结算单号：{{ item.settleOrderNo }}</div>
                <div class="base-item">结算方式：{{ dictMapObj.payWay[item.payWay] }}</div>
                <div class="base-item"></div>
                <div class="base-item">对方户名：{{ item.recvAccountName }}</div>
                <div class="base-item">对方开户行支行：{{ item.recvBankBranch }}</div>
                <div class="base-item">对方账号：{{ item.recvAccountNo }}</div>
                <template v-if="item.orderType === 'special_refund'">
                  <div class="base-item">结算币种：{{ item.settleCurrency }}</div>
                  <div class="base-item">结算金额：{{ item.settleAmt }}</div>
                  <div class="base-item">实付金额：{{ item.realPayAmt }}</div>
                </template>
                <template v-else>
                  <div class="base-item">我司户名：{{ item.payAccountName }}</div>
                  <div class="base-item">我司开户行支行：{{ item.payBankBranch }}</div>
                  <div class="base-item">我司账号：{{ item.payAccountNo }}</div>
                </template>
              </div>
              <div class="print-table-total">
                <b class="text">合计：</b>
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
                  <div class="base-item">申请日期：{{ item.createdTime }}</div>
                  <div class="base-item">申请人：{{ item.createdName }}</div>
                  <div class="base-item">审核时间：{{ item.confirmTime }}</div>
                  <div class="base-item">审核人：{{ item.confirmName }}</div>
                </template>
                <template v-else>
                  <div class="base-item">申请日期：{{ item.createdTime }}</div>
                  <div class="base-item">发票登记日期：{{ item.invoiceRegisterTime }}</div>
                  <div class="base-item">受理时间：{{ item.confirmTime }}</div>
                  <div class="base-item">审核人：{{ item.confirmName }}</div>
                  <div class="base-item">发票登记人:{{ item.invoiceRegisterName }}</div>
                  <div class="base-item">受理人：{{ item.createdName }}</div>
                </template>
              </div>
            </div>

            <div
              v-show="item.completeTask.length"
              class="finance-payorderFileNo-print-cnt order_img_container"
              :style="printIsNo ? 'margin-top:1580px;height:790px' : 'padding: 0;'"
              v-for="(it,index) in item.completeTask"
              :key="index"
            >
              <span>第{{it.printCount - 1}}次打印</span>
              <img width="1020" :src="it.url" style="margin-top:20px;border:none;" />
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
      <div class="carousel-bottom" v-if="total>1">
        <div>
          <el-button size="mini" @click="prev" :disabled="preDisabled" icon="el-icon-arrow-left"></el-button>
          <span style="margin:0 32px;">第 {{currIndex}} 张/{{total}}张</span>
          <el-button size="mini" @click="next" :disabled="nextDisabled" icon="el-icon-arrow-right"></el-button>
        </div>
      </div>

      <div class="print-btn-box">
        <el-button
          class="finance-btn"
          size="mini"
          type="primary"
          @click="handlePrintFn"
          v-print="handlePrint"
        >打印全部</el-button>
        <el-tooltip class="item" effect="dark" :content="'打印半张纸建议使用左边打印全部的按钮'" placement="top">
          <el-button
            class="finance-btn"
            size="mini"
            type="primary"
            @click="printObjFn"
            v-print="printObj"
          >打印</el-button>
        </el-tooltip>
        <el-button @click="cancel" class="finance-btn" size="mini">返回</el-button>
      </div>
      <div id="PayOrderPrintList" v-show="isPrint">
        <div class="one_page_print">
          <div v-for="(item, index) in infoList" :key="index">
            <div class="finance-payorderFileNo-print-cnt">
              <div class="logo">
                <img src="../../../../../assets/bill_logo.png" />
                <h1 class="pay_comp_name">{{item.payCompName}}</h1>
              </div>
              <div class="title">
                <div
                  class="base-item payorder-base-item-apply-no-left"
                >第{{ item.printCount ? item.printCount : 0 }}次打印</div>
                <h1>付款单</h1>
                <div class="base-item payorder-base-item-apply-no">付款单号：{{ item.payOrderNo }}</div>
              </div>
              <div class="print-info-box">
                <div class="base-item">结算单号：{{ item.settleOrderNo }}</div>
                <div class="base-item">结算方式：{{ dictMapObj.payWay[item.payWay] }}</div>
                <div class="base-item"></div>
                <div class="base-item">对方户名：{{ item.recvAccountName }}</div>
                <div class="base-item">对方开户行：{{ item.recvBankName }}</div>
                <div class="base-item">对方账号：{{ item.recvAccountNo }}</div>
                <template v-if="item.orderType === 'special_refund'">
                  <div class="base-item">结算币种：{{ item.settleCurrency }}</div>
                  <div class="base-item">结算金额：{{ item.settleAmt }}</div>
                  <div class="base-item">实付金额：{{ item.realPayAmt }}</div>
                </template>
                <template v-else>
                  <div class="base-item">我司户名：{{ item.payAccountName }}</div>
                  <div class="base-item">我司开户行：{{ item.payBankName }}</div>
                  <div class="base-item">我司账号：{{ item.payAccountNo }}</div>
                </template>
              </div>
              <div class="print-table-total">
                <b class="text">合计：</b>
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
                  <div class="base-item">申请日期：{{ item.createdTime }}</div>
                  <div class="base-item">申请人：{{ item.createdName }}</div>
                  <div class="base-item">审核时间：{{ item.confirmTime }}</div>
                  <div class="base-item">审核人：{{ item.confirmName }}</div>
                </template>
                <template v-else>
                  <div class="base-item">申请日期：{{ item.createdTime }}</div>
                  <div class="base-item">发票登记日期：{{ item.invoiceRegisterTime }}</div>
                  <div class="base-item">受理时间：{{ item.confirmTime }}</div>
                  <div class="base-item">审核人：{{ item.confirmName }}</div>
                  <div class="base-item">发票登记人:{{ item.invoiceRegisterName }}</div>
                  <div class="base-item">受理人：{{ item.createdName }}</div>
                </template>
              </div>
            </div>
            <div
              v-show="item.completeTask.length"
              class="finance-payorderFileNo-print-cnt order_img_container"
              v-for="(it,index) in item.completeTask"
              :key="index"
            >
              <span>第{{it.printCount}}次打印</span>
              <img class width="1020" :src="it.url" style="border:none" />
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
      printIsNo: false,
      numArr: [],
      tableArr: [],
      currIndex: this.$route.query.payOrderNo.length,
      isPrint: false,
      lsLoading: false,
      payOrderNo: '',
      infoList: [],
      handlePrint: {
        id: 'PayOrderPrintList',
        popTitle: '付款单',
        type: 'html',
        extraCss: '',
        printCallback: this.printCallbackList,
        printCallbackBefore: this.printCallbackBefore,
        extraHead: '',
        isNew: true,
      },
      printObj: {
        id: 'PayOrderPrint',
        popTitle: '付款单',
        type: 'html',
        extraCss: '',
        printCallback: this.printCallback,
        printCallbackBefore: this.printCallbackBefore,
        extraHead: '',
        isNew: true,
      },
      columns1: [
        { prop: 'bdName', label: '销售', type: 'text' },
        { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 130 },
        { prop: 'receipayType', label: '类型', type: 'select', propInDict: 'receipayType' },
        { prop: 'orderNo', label: '业务编号', type: 'text', width: 130 },
        { prop: 'putNo', label: '提单号', type: 'text' },
        { prop: 'feeName', label: '费用名称', type: 'text' },
        { prop: 'originalCurrency', label: '结算币种', type: 'text' },
        { prop: 'settleAmt', label: '结算金额', type: 'text' },
        { prop: 'invoiceNo', label: '发票号', type: 'text' },
        { prop: 'sysLineName', label: '航线', type: 'text' },
        { prop: 'reciStatus', label: '收款状态', type: 'select', propInDict: 'feeSettleStatus' },
      ],
      columns2: [
        { prop: 'bdName', label: '销售', type: 'text' },
        { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 130 },
        { prop: 'orderNo', label: '业务编号', type: 'text', width: 130 },
        { prop: 'feeName', label: '费用名称', type: 'text' },
        { prop: 'originalCurrency', label: '币种', type: 'text' },
        { prop: 'settleAmt', label: '请款金额', type: 'text' },
        { prop: 'settleExRate', label: '结算汇率', type: 'text' },
        { prop: 'exSettleAmt', label: '折合金额', type: 'text' },
        { prop: 'sysLineName', label: '航线', type: 'text' },
        { prop: 'containerCount', label: '箱型箱量', type: 'text' },
        { prop: 'orderProfit', label: '利润', type: 'text' },
        { prop: 'reciStatus', label: '收款状态', type: 'select', propInDict: 'feeSettleStatus' },
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
      this.bannerHeight = document.body.clientHeight - 110
    }
  },
  mounted() {
    window.onresize = () => {
      return (() => {
        window.screenHeight = window.innerHeight
        this.bannerHeight = window.screenHeight - 110
      })()
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
      })
    },
    handlePrintFn() {
      this.isPrint = true
    },
    // 返回
    cancel() {
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
          this.infoList = res.data
          res.data.forEach((item, index) => {
            item.option1 = this.initOption()
            if (item.invoiceFileNoList.length) {
              item.completeTask = item.invoiceFileNoList.filter(it => it.invoiceImgFileNo).map((it) => {
                return {
                  url: `/base/fileView/preview/${it.invoiceImgFileNo}/sowoll`,
                  printCount: it.printCount
                }
                return `/base/fileView/preview/${it}/sowoll`
                // return `/base/fileView/preview/ee10bf726d79472488f872e12bd45dc3/sowoll`
              })
            } else {
              item.completeTask = []
            }
            if (item.orderType === 'special_refund') {
              this.infoList[index].option1.columns = this.columns2
            } else {
              this.infoList[index].option1.columns = this.columns1
            }
            this.infoList[index].option1.data = item.settleOrderFeeList || []
          })
        })
        .finally(() => {
          this.lsLoading = false
        })
        .catch(() => {
          this.delVisitedView()
          this.cancel()
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
      this.isPrinting = false
      this.printIsNo = false
      let payOrderNo = this.infoList.map((item) => item.payOrderNo)
      printConfirm({ payOrderNoList: payOrderNo, hasPrintInvoice: 'yes' }).then((res) => this.getData())
    },
    // 打印次数统计
    printCallback() {
      this.printIsNo = false
      this.isPrinting = false
      let payOrderNo = this.infoList[this.currIndex - 1].payOrderNo
      printConfirm({ payOrderNoList: [payOrderNo], hasPrintInvoice: 'yes' }).then((res) => this.getData())
    },
    printObjFn() {
      this.printIsNo = true
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
.finance-payorderFileNo-print {
  width: 1020px;
  margin: 0 auto;
  position: relative;
  /* padding-bottom: 40px; */
}
.one_page_print {
  width: 100%;
  height: 1588px;
  /* position: relative; */
  page-break-after: always;
}
.one_page_print .finance-payorderFileNo-print-cnt {
  /* position: absolute; */
  /* height: 50%; */
  height: 794px;
  padding-top: 32px;
}
.one_page_print .finance-payorderFileNo-print-cnt:nth-of-type(2) {
  /* top: 50%; */
}
.finance-payorderFileNo-print-cnt {
  width: 1020px;
  /* padding-top: 20px; */
  font-size: 14px;
  /* page-break-before: auto; */
  /* page-break-after: always; */
  padding-right: 18px;
}
.finance-payorderFileNo-print .el-carousel__item {
  overflow-y: auto;
  overflow-x: hidden;
}
.finance-payorderFileNo-print-cnt .logo {
  padding-top: 5px;
  padding-bottom: 0px;
  border-bottom: 1px solid #d8d8d8;
  position: relative;
}
.finance-payorderFileNo-print-cnt .logo img {
  position: absolute;
  top: 16px;
}
.finance-payorderFileNo-print-cnt .logo .pay_comp_name {
  font-size: 20px;
  font-weight: 500;
  color: #222222;
  text-align: center;
}
.finance-payorderFileNo-print-cnt .title {
  margin: 20px 0;
  position: relative;
}
.finance-payorderFileNo-print-cnt .title h1 {
  font-size: 20px;
  font-weight: 600;
  color: #222222;
  text-align: center;
}
.finance-payorderFileNo-print-cnt .print-info-box {
  display: flex;
  flex-wrap: wrap;
}
.finance-payorderFileNo-print-cnt .print-info-box .base-item {
  flex: 1;
  flex-basis: calc(33% - 24px);
  margin-bottom: 10px;
  margin-right: 24px;
  word-wrap: break-word;
  word-break: break-all;
}
.finance-payorderFileNo-print-cnt .print-table {
  /* margin-top: 10px; */
}
.finance-payorderFileNo-print-cnt .print-table .finance-table {
  padding: 0;
}
.finance-payorderFileNo-print-cnt .print-table-total {
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
.finance-payorderFileNo-print-cnt .print-table-total .text {
  flex: 1;
  text-align: right;
}
.finance-payorderFileNo-print-cnt .print-table-total .total-box {
  min-width: 400;
}
.finance-payorderFileNo-print-cnt .print-table-total .total-box .total-item {
  margin-left: 15px;
}
.finance-payorderFileNo-print-cnt .print-apply-info {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
}
.finance-payorderFileNo-print-cnt .print-apply-info .base-item {
  width: 25%;
  margin-bottom: 10px;
}
.finance-payorderFileNo-print .print-btn-box {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  vertical-align: middle;
  position: absolute;
  top: 0;
  right: 18px;
  z-index: 999;
}
.finance-payorderFileNo-print .print-btn-box .finance-btn {
  margin-left: 10px;
  min-width: 50px;
  /* line-height: 25px; */
  /* height: 25px; */
  padding: 0 4px;
}
</style>

<style lang="scss">
.finance-payorderFileNo-print-cnt {
  &.order_img_container{
    position: relative;
    padding: 0;
    &>span{
      position: absolute;
      left: 920px;
      top: 20px;
    }
  }
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
