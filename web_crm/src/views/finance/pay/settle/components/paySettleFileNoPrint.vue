<template>
  <div class="finance-page" v-loading="lsLoading">
    <!-- <div class="money-box">
			<div class="money-box-left"></div>
			<div class="money-box-right"></div>
    </div>-->
    <div class="finance-payorder-print finance-paySettlePrint-print" v-if="infoList.length">
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
          <div
            :id="'printPaySettle'+index"
            class="finance-paySettlePrint-print-cnt"
            :style="printIsNo ? 'margin-top:20px;': ''"
          >
            <div class="logo">
              <img src="../../../../../assets/bill_logo.png" />
              <h1 class="pay_comp_name">{{item.payCompName}}</h1>
            </div>
            <div class="title">
              <div
                class="base-item base-item-apply-no-left"
              >第{{ isPrinting ? item.printCount : item.printCount - 1 }}次打印</div>
              <h1>结算付款申请单</h1>
              <div
                v-if="item.payOrderNo"
                class="base-item base-item-apply-no"
              >付款单号：{{ item.payOrderNo }}</div>
            </div>
            <PrintTopDetail :item="item" />
            <div class="print-table-total">
              <b class="text">合计：</b>
              <div class="total-box" v-if="item.orderType === 'special_refund'">
                <div class="total-item" v-for="it in item.settleAmtSummarys" :key="it.currency">
                  {{ it.originalCurrency }}: {{ it.settleAmt }} -
                  {{ it.exSettleAmt }}
                </div>
              </div>
              <div class="total-box" v-else>
                <div class="total-item" v-if="item.settleAmt">
                  {{item.settleCurrency}}
                  {{item.settleAmt}}
                </div>
              </div>
            </div>
            <div class="print-table">
              <FinanceTableMass :option="item.option1" />
            </div>
            <PrintBottomDetail :item="item" />
            <div
              v-show="item.completeTask.length"
              class="finance-paySettlePrint-print-cnt img_container"
              :style="printIsNo ? 'margin-top:1580px;height:790px' : 'padding:10px 0;'"
              v-for="(it,index) in item.completeTask"
              :key="index"
            >
              <span>第{{isPrinting ? it.printCount : it.printCount - 1}}次打印</span>
              <img width="1020" :src="it.url" style="margin-top:20px;border:none;" />
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
      <div id="printPaySettleList" v-show="isPrint" class="one_page_print">
        <!-- <div class="one_page_print"> -->
        <div v-for="(item,index) in infoList" :key="index">
          <div class="finance-paySettlePrint-print-cnt">
            <div class="logo">
              <img src="../../../../../assets/bill_logo.png" />
              <h1 class="pay_comp_name">{{item.payCompName}}</h1>
            </div>
            <div class="title">
              <div
                class="base-item base-item-apply-no-left"
              >第{{ item.printCount ? item.printCount : 0 }}次打印</div>
              <h1>结算付款申请单</h1>
              <div
                v-if="item.payOrderNo"
                class="base-item base-item-apply-no"
              >付款单号：{{ item.payOrderNo }}</div>
            </div>
            <PrintTopDetail :item="item" />
            <div class="print-table-total">
              <b class="text">合计：</b>
              <div class="total-box" v-if="item.orderType === 'special_refund'">
                <div class="total-item" v-for="it in item.settleAmtSummarys" :key="it.currency">
                  {{ it.originalCurrency }}: {{ it.settleAmt }} -
                  {{ it.exSettleAmt }}
                </div>
              </div>
              <div class="total-box" v-else>
                <div class="total-item" v-if="item.settleAmt">
                  {{item.settleCurrency}}
                  {{item.settleAmt}}
                </div>
              </div>
            </div>
            <div class="print-table">
              <FinanceTableMass :option="item.option1" />
            </div>
            <PrintBottomDetail :item="item" />
          </div>
          <div
            v-show="item.completeTask.length"
            class="finance-paySettlePrint-print-cnt img_container"
            v-for="(it,index) in item.completeTask"
            :key="index"
          >
            <span>第{{it.printCount}}次打印</span>
            <img class width="1020" :src="it.url" style="border:none" />
          </div>
        </div>
        <!-- </div> -->
      </div>
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
          type="primary"
          size="mini"
          @click="handlePrintFn"
          v-print="handlePrint"
        >打印全部</el-button>
        <el-tooltip class="item" effect="dark" :content="'打印半张纸建议使用左边打印全部的按钮'" placement="top">
          <el-button
            class="finance-btn"
            type="primary"
            size="mini"
            @click="printObjFn"
            v-print="printObj"
          >打印</el-button>
        </el-tooltip>
        <el-button class="finance-btn" size="mini" @click="cancel">返回</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import PrintBottomDetail from './printBottomDetail'
import PrintTopDetail from './printTopDetail'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mapGetters } from 'vuex'
import { settleQueryPrintInfo, settlePrintConfirm } from '@/api/fin/pay'
import { dateFormat } from '@/views/finance/utils/finance'

export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
    PrintBottomDetail,
    PrintTopDetail,
  },
  data() {
    return {
      bannerHeight: '650',
      numArr: [],
      tableArr: [],
      currIndex: this.$route.query.applyNoList.length,
      isPrinting: false,
      isPrint: false,
      printIsNo: false,
      lsLoading: false,
      payOrderNo: '',
      applyNo: '',
      infoList: [],
      handlePrint: {
        id: 'printPaySettleList',
        popTitle: '结算付款申请单',
        type: 'html',
        extraCss: '',
        printCallback: this.printCallbackList,
        printCallbackBefore: this.printCallbackBefore,
        isNew: true,
      },
      printObj: {
        id: 'printPaySettle',
        popTitle: '结算付款申请单',
        type: 'html',
        extraCss: '',
        printCallback: this.printCallback,
        printCallbackBefore: this.printCallbackBefore,
        isNew: true,
        // extraHead: '.finance-paySettlePrint-print-cnt{width: 794px !important;}'
      },
      option1: {},
      columns1: [
        {
          prop: 'bdName',
          label: '销售',
          type: 'text',
          fixed: '',
        },
        {
          prop: 'settleCorpName',
          label: '结算单位',
          type: 'text',
          width: 100,
        },
        {
          prop: 'receipayType',
          label: '类型',
          type: 'select',
          propInDict: 'receipayType',
        },
        {
          prop: 'orderNo',
          label: '业务编号',
          type: 'text',
          width: 120,
        },
        {
          prop: 'putNo',
          label: '提单号',
          type: 'text',
          width: 120,
        },
        {
          prop: 'feeName',
          label: '费用名称',
          type: 'text',
        },
        {
          prop: 'settleCurrency',
          label: '付款币种',
          type: 'text',
        },
        {
          prop: 'exSettleAmt',
          label: '付款金额',
          type: 'text',
        },
        {
          prop: 'invoiceNo',
          label: '发票号',
          type: 'text',
        },
        {
          prop: 'sysLineName',
          label: '航线',
          type: 'text',
        },
        {
          prop: 'reciStatus',
          label: '收款状态',
          type: 'select',
          propInDict: 'feeSettleStatus',
        },
      ],
      columns2: [
        {
          prop: 'bdName',
          label: '销售',
          type: 'text',
          fixed: '',
        },
        {
          prop: 'settleCorpName',
          label: '结算单位',
          type: 'text',
          width: 130,
        },
        {
          prop: 'orderNo',
          label: '业务编号',
          type: 'text',
          width: 130,
        },
        {
          prop: 'feeName',
          label: '费用名称',
          type: 'text',
        },
        {
          prop: 'originalCurrency',
          label: '币种',
          type: 'text',
        },
        {
          prop: 'settleAmt',
          label: '请款金额',
          type: 'text',
        },
        {
          prop: 'settleExRate',
          label: '结算汇率',
          type: 'text',
        },
        {
          prop: 'exSettleAmt',
          label: '折合金额',
          type: 'text',
        },
        {
          prop: 'sysLineName',
          label: '航线',
          type: 'text',
        },
        {
          prop: 'containerCount',
          label: '箱型箱量',
          type: 'text',
        },
        {
          prop: 'orderProfit',
          label: '利润',
          type: 'text',
        },
        {
          prop: 'reciStatus',
          label: '收款状态',
          type: 'select',
          propInDict: 'feeSettleStatus',
        },
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
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'PaySettlePrint',
      columns: [],
      data: [],
      disableFixedIndex0: true,
      tips: {
        text: '',
        show: false,
      },
      selection: false,
      operationBtns: false,
      rootTipsHide: true,
      showOverflow: false,
      maxHeight: 9999,
    })
  },
  activated() {
    if (!this.$route.meta.isUseCache) {
      this.applyNoList = this.$route.query.applyNoList
      this.infoList = []
      this.currIndex = 1
      this.getData()
      this.bannerHeight = document.body.clientHeight - 150
    }
    // this.change(this.$route.query.applyNoList.length - 1)
  },
  mounted() {
    window.onresize = () => {
      return (() => {
        window.screenHeight = window.innerHeight
        this.bannerHeight = window.screenHeight - 150
      })()
    }
  },
  methods: {
    initOption() {
      return Object.assign({}, this.option, {
        id: 'option1',
        $name: 'PaySettlePrint',
        columns: [],
        data: [],
        disableFixedIndex0: true,
        tips: {
          text: '',
          show: false,
        },
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
    printObjFn() {
      this.printIsNo = true
    },
    // 返回
    cancel() {
      this.routerBack()
    },
    // 获取数据详情
    getData() {
      this.lsLoading = true
      let data = {
        applyNoList: this.applyNoList,
      }
      settleQueryPrintInfo(data)
        .then((res) => {
          // this.infoList = res.data
          this.isPrinting = false
          const list = []
          res.data.forEach((item, index) => {
            item.option1 = this.initOption()
            if (item.invoiceFileNoList.length) {
              item.completeTask = item.invoiceFileNoList.map((it) => {
                return {
                  printCount: it.printCount,
                  url: `/base/fileView/preview/${it.invoiceImgFileNo}/sowoll`,
                }
                // 打标记方便后面改回来,  nameToSowollForViewImg
                // url: `/base/fileView/preview/${it.invoiceImgFileNo}/${it.fileName}`
                return `/base/fileView/preview/${it}/sowoll`
                // return `/base/fileView/preview/ee10bf726d79472488f872e12bd45dc3/sowoll`
              })
            } else {
              item.completeTask = []
            }
            if (item.orderType === 'special_refund') {
              item.option1.columns = this.columns2
            } else {
              item.option1.columns = this.columns1
            }
            item.option1.data = item.settleOrderFeeList
            list.push(item)
          })
          this.infoList = list
          this.lsLoading = false
        })
        .catch(() => {
          this.lsLoading = false
          this.delVisitedView()
          this.cancel()
        })
    },
    printCallbackList() {
      this.isPrint = false
      const applyNoList = this.applyNoList
      let data = {
        applyNoList,
        printTime: dateFormat('yyyy-mm-dd HH:MM:SS', new Date()),
        hasPrintInvoice: 'yes',
      }
      settlePrintConfirm(data).then((res) => {
        this.getData()
      })
    },
    // 打印次数统计
    printCallback() {
      this.printIsNo = false
      const applyNoList = [this.infoList[this.currIndex - 1].applyNo]
      let data = {
        applyNoList,
        printTime: dateFormat('yyyy-mm-dd HH:MM:SS', new Date()),
        hasPrintInvoice: 'yes',
      }
      settlePrintConfirm(data).then((res) => {
        // { applyNoList: [applyNoList] }
        this.getData()
      })
    },
    printCallbackBefore(fn) {
      this.isPrinting = true
      fn && fn()
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
    // handlePrint() {
    // }
  },
  watch: {
    currIndex: {
      handler(val) {
        this.printObj.id = 'printPaySettle' + (val - 1)
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
  margin-top: 20px;
  margin: 0 auto;
  position: relative;
  padding-bottom: 40px;
}
.one_page_print {
  width: 100%;
}
.one_page_print .finance-paySettlePrint-print-cnt {
  /* position: absolute; */
  padding-top: 32px;
  height: 1508px;
  page-break-after: always;
}
.one_page_print .finance-paySettlePrint-print-cnt:nth-of-type(2) {
  /* top: 50%; */
}
.finance-paySettlePrint-print-cnt {
  width: 1020px;
  /* padding-top: 20px; */
  font-size: 14px;
  /* page-break-before: auto; */
  /* page-break-after: always; */
  padding-right: 18px;
}
.finance-payorder-print .el-carousel__item {
  overflow-y: auto;
  overflow-x: hidden;
}
.finance-paySettlePrint-print-cnt .logo {
  padding-top: 5px;
  padding-bottom: 0px;
  border-bottom: 1px solid #d8d8d8;
  position: relative;
}
.finance-paySettlePrint-print-cnt .logo img {
  position: absolute;
  top: 16px;
}
.finance-paySettlePrint-print-cnt .logo .pay_comp_name {
  font-size: 20px;
  font-weight: 500;
  color: #222222;
  text-align: center;
}
.finance-paySettlePrint-print-cnt .title {
  margin: 20px 0;
  position: relative;
}
.finance-paySettlePrint-print-cnt .title h1 {
  font-size: 20px;
  font-weight: 600;
  color: #222222;
  text-align: center;
}
.finance-paySettlePrint-print-cnt .print-table {
  /* margin-top: 10px; */
}
.finance-paySettlePrint-print-cnt .print-table .finance-table {
  padding: 0;
}
.finance-paySettlePrint-print-cnt .print-table-total {
  background: #e7eeff;
  padding: 6px 0;
  margin-top: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #222222;
  display: flex;
  padding-right: 15px;
  -webkit-print-color-adjust: exact !important;
}
.finance-paySettlePrint-print-cnt .print-table-total .text {
  flex: 1;
  text-align: right;
}
.finance-paySettlePrint-print-cnt .print-table-total .total-box {
  min-width: 400;
}
.finance-paySettlePrint-print-cnt .print-table-total .total-box .total-item {
  margin-left: 15px;
}
.finance-payorder-print .print-btn-box {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
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
.finance-paySettlePrint-print-cnt.img_container {
  position: relative;
}
.finance-paySettlePrint-print-cnt.img_container > span {
  position: absolute;
  top: 32px;
  left: 920px;
}
.finance-paySettlePrint-print-cnt {
  .finance-table {
    .finance-el-table {
      padding: 8px 0;
    }
  }
  .base-item-apply-no {
    position: absolute;
    top: 4px;
    right: 0;
  }
  .base-item-apply-no-left {
    position: absolute;
    top: 4px;
    left: 0;
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
  font-size: 14px;
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
.finance-paySettlePrint-print {
  .el-carousel__item {
    height: 100%;
    overflow-y: auto;
    transform: scaleX(1) translateX(0) !important;
    background: white;
  }
}
</style>
