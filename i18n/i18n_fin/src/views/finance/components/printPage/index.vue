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
          <el-button class="finance-btn" size="mini" type="primary" v-print="printObj">{{$t('Common.print')}}</el-button>
          <el-button @click="cancel" class="finance-btn" size="mini">{{$t('Common.back')}}</el-button>
        </div>
      </div>
      <div class="logo">
        <img src="../../../../assets/bill_logo.png" />
        <h1>{{$t('Hedge.longsail')}}</h1>
      </div>
      <div class="title">
        <h1>{{$t('Hedge.schedule')}}</h1>
      </div>
      <FinanceTableMass :option="option1" />
    </div>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { listPage } from '@/api/fin/writeoffNopay'
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
        popTitle: this.$t('Hedge.schedule'),
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
      { prop: 'writeoffNopayNo', label: this.$t('Hedge.writeoffNo'), type: 'text', forceWidth: 120 },
      { prop: 'gedgingApplyNo', label: this.$t('Hedge.hedgeNumber'), type: 'text', forceWidth: 110 },
      { prop: 'rivalCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', forceWidth: 120 },
      { prop: 'gedgingType', label: this.$t('Hedge.gedgingType'), type: 'select', forceWidth: 70 },
      { prop: 'gedgingSubType', label: this.$t('Hedge.hedgeSubtypes'), type: 'select', forceWidth: 80 },
      { prop: 'gedgingCurrency', label: this.$t('FeeList.currency'), type: 'text', forceWidth: 60 },
      { prop: 'sumDescript', label: this.$t('Hedge.hedgeAmount'), type: 'text', forceWidth: 128 },
      { prop: 'createdName', label: this.$t('Settle.applicant'), type: 'text', forceWidth: 70 },
      { prop: 'createdTime', label: this.$t('Settle.applicationDate'), type: 'text', forceWidth: 76 },
      { prop: 'writeoffName', label: this.$t('FinBill.approverName'), type: 'text', forceWidth: 70 },
      { prop: 'writeoffTime', label: this.$t('FinBill.approveEndTime'), type: 'text', forceWidth: 76 },
    ]

    this.routeQuery = this.$route.query
    let str = JSON.stringify(this.routeQuery)
    // if (this.routeQueryStr && this.routeQueryStr === str) {
    //   return
    // }
    this.routeQueryStr = str
    this.pageType = this.routeQuery.type
    this.reqMethod = listPage
    this.reqData = JSON.parse(this.routeQuery.params || '')
    this.getData()
  },
  activated() {
    this.routeQuery = this.$route.query
    let str = JSON.stringify(this.routeQuery)
    // if (this.routeQueryStr && this.routeQueryStr === str) {
    //   return
    // }
    this.routeQueryStr = str
    this.pageType = this.routeQuery.type
    this.reqMethod = listPage
    this.reqData = JSON.parse(this.routeQuery.params || '')
    this.getData()
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
        index: { show: true, fixed: false },
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
        word-break: normal;
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
