<template>
  <el-dialog
    class="self-dialog"
    :title="dialogOption.title"
    :visible.sync="dialogOption.show"
    width="1100px"
  >
    <div
      id="printBillDetail"
      v-loading="lsLoading"
      :element-loading-text="eLoadingText"
      :element-loading-spinner="eLoadingSpinner"
      :element-loading-background="eLoadingBackground"
    >
      <el-carousel
        ref="carousel"
        :height="carouselHeight+'px'"
        indicator-position="none"
        arrow="never"
        :loop="false"
        :autoplay="false"
        @change="change"
      >
        <el-carousel-item v-for="(item,index) in tableArr" :key="item.key">
          <div :id="'printBillDetail'+index">
            <div class="sub-title title">{{item.titleOption.settleCompName}}</div>
            <div class="main-title title">{{$t('Finance.bookVouchers')}}</div>
            <div class="date-title title">{{item.titleOption.finDate || ''}}</div>
            <div class="noeq-title title" v-if="!item.titleOption.balance">
              <!-- <div class="noeq-title title"> -->
              <span class="el-icon el-icon-info"></span>
              <span>{{$t('Finance.notequalTips')}}</span>
            </div>
            <div class="preview-header">
              <div class="fl">
                <span v-if="item.titleOption.bizNo && $attrs.bizNo">{{$t('Hedge.writeoffNo')}}：{{item.titleOption.bizNo}}</span>
              </div>
              <div class="fr">
                <div class="voucher__class">
                  {{item.titleOption.voucherClassName || ''}}
                  <span
                    class="voucherno"
                  >{{item.titleOption.voucherNo || ''}}</span>
                </div>
                <el-button
                  key="delVoucher"
                  v-if="!dialogOption.showData && $attrs.showDel"
                  size="mini"
                  type="danger"
                  class="finance-btn voucher__print__btn"
                  @click="delVoucher(item.titleOption.seqNo)"
                >{{$t('Common.del')}}</el-button>
                <el-button
                  v-if="dialogOption.showData && $attrs.showCreate && tableArr.length > 1"
                  key="generateAll"
                  type="primary"
                  size="mini"
                  class="finance-btn"
                  @click="generateAll"
                >{{$t('Finance.allGenerated')}}</el-button>
                <el-button
                  v-if="dialogOption.showData && $attrs.showCreate"
                  key="generate"
                  type="primary"
                  size="mini"
                  class="finance-btn"
                  @click="generate(item.titleOption.bizNo, item.titleOption.precloseId)"
                >{{$t('Common.generateVouchers')}}</el-button>
                <el-button
                  key="printObj"
                  v-else
                  size="mini"
                  plain
                  class="finance-btn voucher__print__btn"
                  v-print="printObj"
                >{{$t('Common.print')}}</el-button>
              </div>
            </div>
            <div class="finance-table inner-table">
              <el-table
                :data="item.tableOption.data"
                show-summary
                :summary-method="sumMethod"
                fit
                ref="table"
              >
                <el-table-column type="index" align="center" class-name="index-class" width="40"></el-table-column>
                <el-table-column
                  v-for="col in item.tableOption.columns"
                  :prop="col.prop"
                  :key="col.id"
                  :label="col.label"
                  :width="col.width"
                  :minWidth="col.minWidth"
                  align="center"
                  header-align="center"
                >
                  <template slot-scope="scope">
                    <template v-if="col.prop==='amt'">
                      {{scope.row.debitCredit === 'debit' && col.label ===$t('Finance.debitAmt') ? scope.row[col.prop] : ''}}
                      {{scope.row.debitCredit === 'credit' && col.label ===$t('Finance.creditAmt') ? scope.row[col.prop] : ''}}
                    </template>
                    <template v-else-if="col.formatter">{{col.formatter(scope.row)}}</template>
                    <template v-else>{{scope.row[col.prop]}}</template>
                  </template>
                  <!-- <div v-if="col.prop == 'amt'"><span style="color:#BFBFBF;'padding-right':50px">{{index}}</span>{{col.prop}}</div> -->
                </el-table-column>
              </el-table>
            </div>
            <!-- 只做展示，不显示名字 -->
            <!-- <div class="preview-footer">
              <span>核准(Approved By)：{{item.titleOption.createdName}}</span>
              <span>核准(Approved By)：{{item.titleOption.createdName}}</span>
              <span>出纳(Cashier)：{{item.titleOption.createdName}}</span>
              <span>制单(Prepared By)：{{item.titleOption.createdName}}</span>
              <span>复核(Checked By)：{{item.titleOption.createdName}}</span>
              <span>签收(Receiver)：{{item.titleOption.createdName}}</span>
            </div>-->
          </div>
        </el-carousel-item>
      </el-carousel>
      <div class="carousel-bottom" v-if="total>1">
        <span>{{$t('Finance.totalVouchers',{total, currIndex})}}</span>
        <div>
          <el-button size="mini" @click="prev" :disabled="preDisabled">{{$t('Common.previous')}}</el-button>
          <el-button size="mini" @click="next" :disabled="nextDisabled">{{$t('Common.next')}}</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin as voucherMixin } from '../mixin.js'
import { voucherView, voucherViews, exVoucherView, exVoucherViews } from '@/api/fin/acct'
import { badDebitPreWriteOffGenerate, voucherDelete, exVoucherDelete } from '@/api/fin/voucher'
export default {
  name: 'voucherDialog',
  mixins: [mixin, voucherMixin],
  props: {
    dialogOption: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      titleOption: {},
      tableOption: {},
      printObj: {
        id: 'printBillDetail',
        popTitle: this.$t('Common.bill'),
        extraCss: '',
        excludes: '.voucher__print__btn',
        extraHead: '<style media="print">@page {size: landscape !important;margin: 0.9cm;}</style>', 
        // extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
      },
      voucherCfg: {},
      numArr: [],
      tableArr: [],
      currIndex: 1,
      carouselHeight: 436,
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
  watch: {
    dialogOption: {
      handler(val) {
        if (!val.show) {
          console.log('hide')
          this.$refs.carousel && this.$refs.carousel.setActiveItem(0)
          this.tableArr = []
          this.carouselHeight = 436
          return
        }
        console.log('show')
        let newVal = val.seqNo
        let seqNos = val.seqNos
        if (newVal.indexOf(',') > -1) seqNos = newVal
        if (seqNos) {
          return this.getData(seqNos, true)
        }
        if (newVal && val.show) {
          if (typeof newVal === 'object' && newVal) {
            return this.getData(newVal.acctVoucherSeqno || newVal.voucherSeqNo)
          }
          this.getData(newVal)
        }
      },
      deep: true,
    },
    'dialogOption.showData': {
      handler(newVal) {
        if (newVal) {
          this.showData(newVal)
        }
      },
      deep: true,
    },
    currIndex: {
      handler(val) {
        this.printObj.id = 'printBillDetail' + (val - 1)
      },
      immediate: true,
    },
  },
  created() {
    // 凭证字
    this.voucherClassList('', () => {}).then((res) => {
      res.forEach((item) => {
        this.voucherCfg[item.value] = item.label
      })
    })
    this.tableOption = {
      columns: [
        { prop: 'summaryInfo', label: this.$t('Finance.abstract'), width: '180px' },
        {
          prop: 'subjectName',
          label: this.$t('Finance.subjects'),
          width: '100px',
          formatter: (row) => row.subjectCode + row.subjectName,
        },
        { prop: 'dimensioinInfo', label: this.$t('Finance.accDimension'), width: '200px' },
        { prop: 'srcCurrency', label: this.$t('FeeList.currency'), width: '100px' },
        { prop: 'exRate', label: this.$t('PreClose.exRates')},
        { prop: 'srcAmt', label: this.$t('Finance.origiCurAmt')},
        { prop: 'amt', label: this.$t('Finance.debitAmt'), width: '100px' },
        { prop: 'amt', label: this.$t('Finance.creditAmt'), width: '100px' },
      ],
      data: [],
    }
  },
  methods: {
    // 导出按钮
    exportBtn(e) {
      // console.log(e) TODO
    },
    // 自定义求和
    sumMethod({ columns, data }) {
      const sums = []
      // console.log(columns)
      // console.log(data)
      columns.forEach((column, index) => {
        if (column.property === 'srcAmt') {
          // 原币金额显示总计
          sums[index] = this.$t('Common.total')
        } else if (column.property === 'amt') {
          // 借方金额、贷方金额显示总计数字
          const values = data.map((item) => {
            if (item.debitCredit === 'debit' && column.label === this.$t('Finance.debitAmt')) {
              return Number(item[column.property]) || 0
            } else if (item.debitCredit === 'credit' && column.label === this.$t('Finance.creditAmt')) {
              return Number(item[column.property]) || 0
            }
            return 0
          })
          sums[index] = values.reduce((prev, curr) => new LSnum(prev).plus(curr).toNum(2), 0)
          sums[index] = sums[index] && sums[index]
        } else {
          sums[index] = ''
        }
      })
      this.numArr = sums
      return sums || 0
    },
    // 获取数据
    getData(seqNo, multi) {
      this.lsLoading = true
      let method
      if (multi) {
        method = this.dialogOption.isEx ? exVoucherViews : voucherViews
        method({ seqNos: seqNo })
          .then((res) => {
            if (res.data && res.data.length) {
              this.showData(res.data)
            }
          })
          .finally(() => {
            this.lsLoading = false
          })
        return
      }
      method = this.dialogOption.isEx ? exVoucherView : voucherView
      method({ seqNo })
        .then((res) => {
          let tableOption = Object.assign({}, this.tableOption, { data: res.data.voucherItemList || [] })
          let titleOption = res.data.voucherRecord || {}
          titleOption.voucherClassName = this.dictMapObj.voucherClass[titleOption.voucherClass] // this.voucherCfg[titleOption.voucherClass]
          if (tableOption.data.length >= 7) {
            this.carouselHeight = 666
          }
          this.tableArr.push({ tableOption, titleOption })
          // this.$nextTick(() => {
          //   this.$refs.table.doLayout() //解决表格错位
          // })
        })
        .finally(() => {
          this.lsLoading = false
        })
    },
    // 获取数据
    showData(data) {
      try {
        console.log(data.map((v) => v.voucherRecord.seqNo))
      } catch (error) {
        console.log(error)
      }
      console.log(data)
      data.forEach((item) => {
        let tableOption = Object.assign({}, this.tableOption, { data: item.voucherItemList || [] })
        let titleOption = item.voucherRecord || {}
        titleOption.voucherClassName = this.dictMapObj.voucherClass[titleOption.voucherClass] // this.voucherCfg[titleOption.voucherClass]
        titleOption.precloseId = item.precloseId
        if (tableOption.data.length >= 7) {
          this.carouselHeight = 666
        }
        this.tableArr.push({ tableOption, titleOption })
        // if (!item.balance) this.$message.error('借贷金额不相等！')
      })
    },
    // 生成凭证
    generate(bizNo, precloseId) {
      this.dialogOption._refresh = true
      this.$emit('generate', '', bizNo, precloseId)
    },
    // 全部生成
    generateAll() {
      this.dialogOption._refresh = true
      this.$emit('generate', '', 'all')
    },
    // 删除凭证
    delVoucher(voucherSeqNos) {
      this.$confirmWarn(this.$t('Finance.credential'), () => {
        let method = this.dialogOption.isEx ? exVoucherDelete : voucherDelete
        method({ voucherSeqNos }).then((res) => {
          this.$msgSucClose(this.$t('Settle.deleteSuc'))
          this.$emit('generate', 'refresh')
          this.dialogOption.show = false
        })
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
    // // 凭证--获取凭证字列表
    // voucherClassList(queryString, cb) {
    //   return this.$store.dispatch('dict/voucherClassList', queryString).then(data => {
    //     cb(data)
    //     return data
    //   })
    // },
  },
}
</script>
<style lang="scss" scoped>
.title {
  color: #222222;
  font-weight: bold;
  text-align: center;
}
.sub-title {
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 4px;
  text-align: center;
}
.main-title {
  font-size: 20px;
  line-height: 30px;
  text-align: center;
}
.date-title {
  font-weight: normal;
  font-size: 12px;
  line-height: 22px;
  // margin-bottom: 6px;
  // position: absolute;
  // left: 0;
  color: #4a4a4a;
}
.noeq-title {
  font-size: 12px;
  color: #be4b39;
  position: absolute;
  top: 80px;
  width: 100%;
}
.preview-header {
  overflow: hidden;
  .fl {
    float: left;
    font-size: 12px;
    color: #222222;
    font-weight: bold;
    padding: 4px 0;
  }
  .fr {
    float: right;
    .voucher__class {
      display: inline-block;
      padding: 4px 86px 12px;
      font-size: 12px;
      color: #222222;
      font-weight: bold;
    }
  }
}
.preview-footer {
  color: #4a4a4a;
  font-size: 13px;
  line-height: 22px;
  margin-top: 20px;
  span {
    padding-right: 20px;
  }
}
/* 用于element计算右侧列高度不准确的情况 */
.el-table__fixed-right {
  min-height: 70px !important;
}
.inner-table ::v-deep {
  .el-table::before {
    // background: #29aee2;
    height: 0;
  }
  .el-table::after {
    // content: '';
    // height: 100%;
    // width: 1px;
    // background: #29aee2;
    // position: absolute;
    // right: 0;
    // top: 0;
  }
  // .el-table .index-class {
  //   color: #e9e9e9;
  //   font-weight: bold;
  // }
  th,
  td {
    border-top: 1px solid #29aee2;
    border-left: 1px solid #29aee2;
    border-bottom: 0;
    &:nth-child(9) {
      border-right: 1px solid #29aee2 !important;
    }
  }
  .el-table__header th {
    background: transparent !important;
  }
  .el-table__footer-wrapper {
    // tr td:nth-last-of-type(3) {
    //   color: #222222;
    // }
    td {
      // font-size: 14px;+
      color: #222222;
      background: transparent;
      // background: #e7eeff;
      font-weight: bold;
      // color: #3e80f5;
      border-bottom: 1px solid #29aee2 !important;
    }
  }
  th.gutter {
    display: table-cell !important;
  }
  colgroup.gutter {
    display: table-cell !important;
  }
}
.self-dialog ::v-deep {
  .el-dialog__body {
    max-height: 80vh;
    padding: 20px 25px;
    overflow: hidden;
    button {
      padding: 3px 7px !important;
    }
  }
  .el-carousel__item {
    height: 100%;
    overflow-y: auto;
    transform: scaleX(1) translateX(0) !important;
    background: white;
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
  // #29AEE2 表格 border
  // #4A4A4A 年月日 字体颜色
}
</style>

<style lang="scss" scoped>
// 注释-20221215
// @media print {
//   @page {
//     size: landscape !important;
//   }
// }
</style>
