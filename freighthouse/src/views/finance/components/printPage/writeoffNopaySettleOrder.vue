<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance_print_page print-table" id="printDetail">
      <div class="finance_print_btns">
        <div class="fr">
          <el-button class="finance-btn" size="mini" type="primary" v-print="printObj">打印</el-button>
          <el-button @click="cancel" class="finance-btn" size="mini">返回</el-button>
        </div>
      </div>
      <div class="logo">
        <img src="../../../../assets/bill_logo.png" />
        <h1>深圳市长帆供应链有限公司</h1>
      </div>
      <div class="title">
        <h1>提成预销单明细</h1>
      </div>
      <FinanceTableMass :option="option1" />
    </div>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { baddebtPreOrderListPage as listPage } from '@/api/fin/settleOrderBaddebt'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
  },
  data() {
    return {
      routeQueryStr: '',
      reqMethod: '',
      reqData: '',
      pageType: '',
      bannerHeight: '650',
      carouselStyle: {},
      option1: {},
      isPrint: false,
      printObj: {
        id: 'printDetail',
        popTitle: '提成预销单明细',
        type: 'html',
        extraCss: '',
        printCallback: this.printCallback,
        excludes: '.finance_print_btns',
        extraHead: '',
      },
    }
  },
  computed: {
    total() {
      return this.tableArr.length
    },
    preDisabled() {
      return this.currIndex == 1
    },
    nextDisabled() {
      return this.currIndex == this.tableArr.length
    },
  },
  created() {
    this.option1 = this.initOption(1)
    this.option1.columns = [
      { prop: 'settleCompName', label: '分公司', type: 'text', forceWidth: 122 },
      { prop: 'settleCorpName', label: '结算单位', type: 'text', forceWidth: 122 },
      { prop: 'bdEmployeeName', label: '销售', type: 'text', forceWidth: 76 },
      { prop: 'settleOrderNo', label: '结算单号', type: 'text', forceWidth: 128 },
      // { prop: 'gedgingCurrency', label: '币种', type: 'text', forceWidth: 40 },
      { prop: 'writeOffAmt', label: '核销金额', type: 'text', forceWidth: 90 },
      { prop: 'writeoffNopayNo', label: '核销编号', type: 'text', forceWidth: 128 },
      { prop: 'auditTime', label: '核销时间', type: 'text', forceWidth: 76 },
      { prop: 'badReason', label: '坏账原因', type: 'select', propInDict: 'baddebtReason', forceWidth: 82 },
      { prop: 'createdName', label: '申请人', type: 'text', forceWidth: 76 },
      { prop: 'auditName', label: '审核人', type: 'text', forceWidth: 76 },
    ]
  },
  activated() {
    setTimeout(() => {
      this.routeQuery = this.$route.query
      let str = JSON.stringify(this.routeQuery)
      this.routeQueryStr = str
      this.pageType = this.routeQuery.type
      this.reqMethod = listPage
      this.reqData = JSON.parse(this.routeQuery.params || '')
      this.getData()
    }, 0)
  },
  methods: {
    initOption(index) {
      return Object.assign({}, this.option, {
        id: 'option' + index,
        $name: 'PrintPageList',
        columns: [],
        data: [],
        disableFixedIndex0: true,
        tips: { text: '', show: false },
        selection: { show: false, fixed: 'left' },
        operationBtns: { show: false, data: [] },
        rootTipsHide: true,
        showOverflow: false,
        maxHeight: 99999,
        index: { show: true },
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
      this.reqMethod(this.reqData)
        .then((res) => {
          this.lsLoading = false
          this.option1.data = res.data.list || []
          console.log(this.option1.data)
        })
        .catch(() => {
          this.lsLoading = false
          this.routerDelBack()
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
  },
}
</script>

<style scoped media="print" lang="scss">
@media print {
  @page {
    /* size: landscape; */
    size: portrait;
    margin: 4mm 10mm;
  }
}
.finance-page {
  .finance_print_page {
    background: white;
    ::v-deep .finance-table {
      padding: 0 !important;
      .vxe-cell {
        overflow: visible !important;
        white-space: pre-wrap;
      }
      // .vxe-body--column {
      //   padding: 4px 0;
      // }
      // .vxe-table--render-default tr .vxe-cell {
      //   line-height: 16px;
      // }
    }
    position: relative;
    .finance_print_btns {
      height: 40px;
      width: 100%;
      position: absolute;
      z-index: 10;
      .fr {
        padding-top: 14px;
        padding-right: 8px;
        float: right;
      }
    }
    width: 1020px;
    margin: 0 auto;
    position: relative;
    padding-bottom: 40px;
    h1 {
      margin: 0;
      font-size: 20px;
      color: #222222;
      text-align: center;
    }
    .logo {
      padding: 8px 0;
      border-bottom: 1px solid #d8d8d8;
      line-height: 30px;
      position: relative;
      img {
        position: absolute;
        top: 8px;
      }
    }
    .title {
      margin: 20px 0;
      h1 {
        font-size: 16px;
      }
    }
  }
}
@media print {
  .vxe-cell {
    overflow: visible !important;
    white-space: pre-wrap !important;
  }
  .finance_print_page {
    width: 1020px !important;
  }
  .finance-table {
    .vxe-cell {
      overflow: visible !important;
      white-space: pre-wrap !important;
    }
    padding: 0 !important;
    ::v-deep {
      .vxe-cell {
        overflow: visible !important;
        white-space: pre-wrap !important;
      }
    }
    // .vxe-body--column {
    //   padding: 4px 0;
    // }
    // .vxe-table--render-default tr .vxe-cell {
    //   line-height: 16px;
    // }
  }
  h1 {
    margin: 0;
    font-size: 20px;
    color: #222222;
    text-align: center;
  }
  .logo {
    padding: 8px 0;
    border-bottom: 1px solid #d8d8d8;
    line-height: 30px;
    position: relative;
    img {
      position: absolute;
      top: 8px;
    }
  }
  .title {
    margin: 20px 0;
    h1 {
      font-size: 16px;
    }
  }
  .print-table ::v-deep {
    .vxe-table--header,
    .vxe-table--body {
      width: 100% !important;
      border-collapse: collapse;
      border: none;
      color: #000;
    }
    .ls-vxe-th {
      background-color: none;
      color: #000 !important;
    }
    table tr {
      td,
      th {
        border: 1px solid #000 !important;
        color: #000;
      }
    }
    .vxe-table--header-wrapper tr .vxe-resizable {
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
    .vxe-table--render-default tr td {
      color: #000;
    }
    .vxe-table--render-default.border--inner .vxe-table--border-line {
      border: none;
    }
    .vxe-table--header-wrapper {
      position: static;
    }
    .vxe-table--header-wrapper tr th {
      border-bottom: none;
    }
    .nodata .vxe-table--render-default .vxe-table--body-wrapper {
      border: 1px solid #000;
    }
    .vxe-table--body-wrapper.body--wrapper {
      overflow-x: hidden;
    }
  }
}
</style>
