<template>
  <div class="invoice-preview-print">
    <el-dialog title="发票预览" :visible.sync="dialogVisibleO.show" width="1180px">
      <div>
        <div
          class="invoice-preview-container"
          :class="{'invoice-e':$attrs.isElec === 'electronic','invoice-s':$attrs.isElec === 'special'}"
        >
          <!-- 购买方 -->
          <span
            class="invoice-preview-text need__scale"
            v-for="(item, index) in invoicePreviewInfo.customerInfo"
            :key="'customerInfo' + index"
            :style="{left: item.left, top: item.top}"
          >
            <i v-scaleText>{{item.value}}</i>
          </span>
          <!-- 销售方 -->
          <span
            class="invoice-preview-text seller__div need__scale"
            v-for="(item, index) in invoicePreviewInfo.sellerInfo"
            :key="'sellerInfo' + index"
            :style="{left: item.left, top: item.top}"
          >
            <i v-scaleText>{{item.value}}</i>
          </span>
          <!-- 费用列表 -->
          <span
            class="invoice-preview-text"
            v-for="(item, index) in invoicePreviewInfo.applyItemGroupList"
            :key="'applyItemGroupList' + index"
            :style="{left: item.left, top: item.top}"
            :class="['prop__'+item.prop]"
          >{{item.value}}</span>
          <!-- 小写 -->
          <span
            class="invoice-preview-text"
            :style="{left: invoicePreviewInfo.totalInvoiceAmtApply.left, top: invoicePreviewInfo.totalInvoiceAmtApply.top}"
          >{{invoicePreviewInfo.totalInvoiceAmtApply.value}}</span>
          <!-- 大写 -->
          <span
            class="invoice-preview-text"
            :style="{left: invoicePreviewInfo.amtCapitalizedWords.left, top: invoicePreviewInfo.amtCapitalizedWords.top}"
          >{{invoicePreviewInfo.amtCapitalizedWords.value}}</span>
          <!-- 合计 -->
          <span
            class="invoice-preview-text prop__amtWithoutTax"
            :style="{left: invoicePreviewInfo.amtExclusiveTax.left, top: invoicePreviewInfo.amtExclusiveTax.top}"
          >{{invoicePreviewInfo.amtExclusiveTax.value}}</span>
          <!-- 税 -->
          <span
            class="invoice-preview-text prop__taxAmt"
            :style="{left: invoicePreviewInfo.taxAmt.left, top: invoicePreviewInfo.taxAmt.top}"
          >{{invoicePreviewInfo.taxAmt.value}}</span>
          <!-- 发票代码 -->
          <span
            class="invoice-preview-text invoicecode__div need__scale"
            :style="{left: invoicePreviewInfo.invoiceCode.left, top: invoicePreviewInfo.invoiceCode.top, }"
          >
            <i v-scaleText>{{invoicePreviewInfo.invoiceCode.value}}</i>
          </span>
          <!-- 发票号 -->
          <span
            class="invoice-preview-text"
            :style="{left: invoicePreviewInfo.invoiceNo.left, top: invoicePreviewInfo.invoiceNo.top, }"
          >{{invoicePreviewInfo.invoiceNo.value}}</span>
          <!-- 开票日期 -->
          <span
            class="invoice-preview-text"
            :style="{left: invoicePreviewInfo.invoiceDate.left, top: invoicePreviewInfo.invoiceDate.top}"
          >{{invoicePreviewInfo.invoiceDate.value}}</span>
          <!-- 收款人 -->
          <span
            class="invoice-preview-text"
            :style="{left: invoicePreviewInfo.receiver.left, top: invoicePreviewInfo.receiver.top}"
          >{{invoicePreviewInfo.receiver.value}}</span>
          <!-- 复核 -->
          <span
            class="invoice-preview-text"
            :style="{left: invoicePreviewInfo.reviewer.left, top: invoicePreviewInfo.reviewer.top}"
          >{{invoicePreviewInfo.reviewer.value}}</span>
          <!-- 开票人 -->
          <span
            class="invoice-preview-text"
            :style="{left: invoicePreviewInfo.createdName.left, top: invoicePreviewInfo.createdName.top}"
          >{{invoicePreviewInfo.createdName.value}}</span>
          <!-- 备注 -->
          <span
            class="invoice-preview-text invoice-preview-text-remark"
            :style="{left: invoicePreviewInfo.remark.left, top: invoicePreviewInfo.remark.top }"
          >{{invoicePreviewInfo.remark.value}}</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <div class="carousel-bottom" v-if="total>1">
          <span>共{{total}}张发票 第{{currIndex}}/{{total}}张</span>
          <div>
            <el-button size="mini" @click="currIndex--" :disabled="preDisabled">上一张</el-button>
            <el-button size="mini" @click="currIndex++" :disabled="nextDisabled">下一张</el-button>
          </div>
        </div>
        <el-button v-if="$attrs.isPrint" type="primary" size="mini" @click="printInvoice">打印</el-button>
        <el-button
          v-if="list.length && !$attrs.hideSave"
          size="mini"
          @click="dialogVisibleO.show = false"
        >取消</el-button>
        <el-button
          v-if="list.length && !$attrs.hideSave"
          type="primary"
          size="mini"
          @click="printInvoice"
        >{{$attrs.commitStatus==='yes'? '保存并提交':'保存'}}</el-button>
        <el-button v-else size="mini" @click="dialogVisibleO.show = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { smalltoBIG, dateFormat } from '@/views/finance/utils/finance'
import { mapGetters } from 'vuex'
import { decimalFixed2 } from '@/views/finance/utils/finance'
import { getInvoicePeopers } from '@/api/fin/invoiceReceivable'

export default {
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    dialogVisibleO: {
      type: Object,
      default: () => ({ show: false }),
    },
    customerInfo: {
      type: Object,
      default: () => ({}),
    },
    sellerInfo: {
      type: Object,
      default: () => ({}),
    },
    applyItemGroupList: {
      type: Array,
      default: () => [],
    },
    otherInvoiceInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    let common = { prop: '', value: '', left: '', top: '' }
    return {
      currIndex: 1,
      invoicePreviewInfo: {
        customerInfo: [{ ...common }, { ...common }, { ...common }, { ...common }],
        sellerInfo: [{ ...common }, { ...common }, { ...common }, { ...common }],
        applyItemGroupList: [],
        totalInvoiceAmtApply: { ...common }, // 价税合计
        amtCapitalizedWords: { ...common }, // 价税合计大写
        amtExclusiveTax: { ...common }, // 不含税合计
        taxAmt: { ...common },
        invoiceDate: { ...common },
        invoiceNo: { ...common },
        invoiceCode: { ...common },
        receiver: { ...common },
        reviewer: { ...common },
        createdName: { ...common },
        remark: { ...common },
      },
    }
  },
  methods: {
    printInvoice() {
      this.$emit('print-invoice')
    },
    computeData() {
      let scaleNum = 1
      // 初始化购买方、销售方数据
      let left = 178 * scaleNum + 'px'
      let scaleFn = (num) => num * scaleNum + 'px'
      let initInfo = (type) => {
        let isS = type === 'sellerInfo' // 是否是销售方信息
        let { unitName = '', taxNo = '', accountNo = '', addr = '', bankName = '', tel = '', title = '' } = this[type]
        this.invoicePreviewInfo[type] = [
          { prop: 'unitName', value: unitName || title, left, top: scaleFn(isS ? 468 : 138) }, // 乘以0.9是因为原尺寸设置为1000*650，而现尺寸设置为900*585
          { prop: 'taxNo', value: taxNo, left, top: scaleFn(isS ? 492 : 162) },
          { prop: 'addrAndTel', value: addr + ' ' + tel, left, top: scaleFn(isS ? 516 : 188) },
          { prop: 'bankNameAndAccountNo', value: bankName + ' ' + accountNo, left, top: scaleFn(isS ? 540 : 212) },
        ]
      }
      initInfo('customerInfo')
      initInfo('sellerInfo')
      // 初始化中间表格数据
      this.invoicePreviewInfo.applyItemGroupList = []
      // console.log(this.applyItemGroupList)
      this.applyItemGroupList.forEach((item, index) => {
        let { itemName, unit, price, count, amt, taxRate } = item
        price = Number(price)
        amt = Number(amt)
        taxRate = Number(taxRate)
        let obj = this.dictMap.feeUnit.find((item) => item.value === unit)
        unit = obj && obj.label
        let leftBase = 40
        let topBase = 262
        let topStep = 20
        topBase = topBase + index * topStep
        let top = topBase * scaleNum + 'px'
        let taxRateFn = (num, tax) => ((num / (1 + taxRate)) * (tax || 1)).toFixed(2)
        let leftFn = (num) => (leftBase + num) * scaleNum + 'px'
        let arr = [
          { prop: 'itemName', value: `*经纪代理服务*${itemName}`, left: leftFn(0), top },
          { prop: 'unit', value: unit, left: leftFn(466), top },
          { prop: 'count', value: count, left: leftFn(550), top },
          // { prop: 'priceWithoutTax', value: decimalFixed2(price / (1 + taxRate)), left: leftFn(614), top }, // 单价不含税
          { prop: 'priceWithoutTax', value: decimalFixed2(new LSnum(price).div(1 + taxRate).val), left: leftFn(614), top }, // 单价不含税
          // { prop: 'priceExclusiveTax', value: taxRateFn(price), left: leftFn(440), top },
          // { prop: 'amtWithoutTax', value: decimalFixed2(amt / (1 + taxRate)), left: leftFn(728), top }, // 金额
          { prop: 'amtWithoutTax', value: decimalFixed2(new LSnum(amt).div(1 + taxRate).val), left: leftFn(728), top }, // 金额
          // { prop: 'amt', value: taxRateFn(amt), left: leftFn(540), top },
          { prop: 'taxRate', value: taxRate == '0' ? '免税' : taxRate * 100 + '%', left: leftFn(920), top },
          // { prop: 'tax', value: taxRate, left: leftFn(650), top },
          // { prop: 'taxAmt', value: decimalFixed2((amt / (1 + taxRate)) * taxRate), left: leftFn(1000), top }, // 税额
          { prop: 'taxAmt', value: decimalFixed2(new LSnum(amt).div(1 + taxRate).times(taxRate).val), left: leftFn(1000), top }, // 税额
          // { prop: 'taxAmt', value: taxRateFn(amt, taxRate), left: leftFn(720), top },
        ]
        arr.forEach((item) => this.invoicePreviewInfo.applyItemGroupList.push(item))
      })

      // otherInvoiceInfo， 发票其他信息
      let { invoiceNo, invoiceCode, invoiceDate, remark } = this.otherInvoiceInfo
      let totalInvoiceAmtApply = decimalFixed2(
        this.applyItemGroupList.reduce((total, curr) => {
          return total.plus(curr.amt)
        }, BIGZERO).val
      )
      let amtCapitalizedWords = 'Ⓧ' + smalltoBIG(totalInvoiceAmtApply)
      // console.log(this.applyItemGroupList)
      let amtExclusiveTax = this.applyItemGroupList.reduce((total, curr) => total.plus(curr.amtWithoutTax), BIGZERO).toNum(2)
      let taxAmt = this.applyItemGroupList.reduce((total, curr) => total.plus(curr.taxAmt), BIGZERO).toNum(2)
      // let currencySymbol = currency === 'USD' ? '$' : '¥'
      // let currencyFn = (num, fixed) => currencySymbol + ' ' + (fixed ? num.toFixed(2) : num)
      // let totalTax = totalInvoiceAmtApply / (1 + taxRate)
      let objCfg = {
        totalInvoiceAmtApply: { value: '¥' + totalInvoiceAmtApply, left: 1000, top: 430 }, // 发票总申请小写
        amtCapitalizedWords: { value: amtCapitalizedWords, left: 330, top: 430 }, //大写
        amtExclusiveTax: { value: '¥' + amtExclusiveTax, left: 768, top: 392 }, // 合计金额
        taxAmt: { value: '¥' + taxAmt, left: 1040, top: 392 }, // 合计税额
        // totalInvoiceAmtApply: { value: currencyFn(totalInvoiceAmtApply), left: 738, top: 448 },
        // amtCapitalizedWords: { value: currencyFn(smalltoBIG(totalInvoiceAmtApply)), left: 322, top: 448 },
        // amtExclusiveTax: { value: currencyFn(totalTax, true), left: 650, top: 422 },
        // taxAmt: { value: currencyFn(totalTax * taxRate, true), left: 830, top: 422 },
        invoiceCode: { value: invoiceCode || '', left: 1022, top: 28 },
        invoiceNo: { value: invoiceNo || '', left: 1022, top: 46 },
        invoiceDate: {
          value: dateFormat('yyyy年mm月dd日', invoiceDate ? new Date(invoiceDate) : new Date()),
          left: 1022,
          top: 66,
        }, //开票日期
        receiver: { value: '', left: 122, top: 576 }, // 收款人
        reviewer: { value: '', left: 450, top: 576 }, // 复核
        createdName: { value: '', left: 750, top: 576 }, // 开票人
        // remark: { value: remark, left: 750, top: 466 },
        remark: { value: remark, left: 750, top: 462 },
      }
      for (let key in objCfg) {
        let { value, left, top } = objCfg[key]
        if (['receiver', 'reviewer', 'createdName'].includes(key)) {
          this.invoicePreviewInfo[key].left = scaleFn(left)
          this.invoicePreviewInfo[key].top = scaleFn(top)
          this.invoicePreviewInfo[key].prop = key
        } else {
          this.invoicePreviewInfo[key] = { prop: key, value, left: scaleFn(left), top: scaleFn(top) }
        }
      }
    },
  },
  computed: {
    ...mapGetters(['dictMap']),
    total() {
      return this.list.length
    },
    preDisabled() {
      return this.currIndex == 1
    },
    nextDisabled() {
      return this.currIndex - this.total >= 0
    },
  },
  watch: {
    customerInfo(newVal) {
      this.computeData()
    },
    sellerInfo(newVal) {
      this.computeData()
    },
    applyItemGroupList(newVal) {
      // console.log(newVal)
      this.computeData()
    },
    'dialogVisibleO.show': {
      handler(val) {
        this.invoicePreviewInfo.receiver.value = this.invoicePreviewInfo.reviewer.value = ''
        // console.log(val)
        // setTimeout(() => {
        //   console.log(this.invoicePreviewInfo.receiver.value, this.invoicePreviewInfo.reviewer.value)
        // }, 2000)
        this.currIndex = 1
        if (val && this.applyItemGroupList && this.applyItemGroupList.length) {
          let invoiceReceivableId = this.applyItemGroupList[0].invoiceReceivableId
          invoiceReceivableId &&
            getInvoicePeopers({ invoiceReceivableId }).then((res) => {
              this.invoicePreviewInfo.receiver.value = res.data.payee
              this.invoicePreviewInfo.reviewer.value = res.data.reviewer
              this.invoicePreviewInfo.createdName.value = res.data.issueName
            })
          console.log(this.applyItemGroupList[0])
        }
      },
      immediate: true,
      deep: true,
    },
    currIndex(val) {
      // console.log(val)
      let item = this.list[val - 1]
      if (item) {
        if (item.forceChangeOther) {
          this.otherInvoiceInfo.invoiceCode = item.invoiceCode
          this.otherInvoiceInfo.invoiceNo = item.invoiceNo
          this.otherInvoiceInfo.invoiceDate = item.invoiceDate
        }
        this.otherInvoiceInfo.remark = item.remark
        this.applyItemGroupList.splice(0, 100, ...item.applyItemGroupList)
      }
    },
  },
}
</script>
<style scoped lang="scss">
.invoice-preview-print ::v-deep .el-dialog {
  margin-top: 5vh !important;
  width: 1000px !important;
  .el-dialog__body {
    padding: 0 10px;
    & > div {
      width: 100%;
      height: 480px;
      position: relative;
      overflow: hidden;
      // border: 1px solid black;
    }
  }
}
.invoice-preview-container {
  display: inline-block;
  left: 50%;
  top: 50%;
  width: 1250px;
  height: 617px;
  background-image: url(../../../../assets/invoice-blank.png);
  background-size: 100% 100%;
  position: absolute;
  transform: scale(0.8) translate(-62.5%, -63%);
  transform-origin: 50% 50%;
  // border: 1px solid red;
  // 电子发票 electronic
  &.invoice-e {
    background-image: url(../../../../assets/invoice-blank-e.png);
  }
  // 专用发票 special
  &.invoice-s {
    background-image: url(../../../../assets/invoice-blank-s.png);
  }
}
.invoice-preview-text {
  position: absolute;
  font-size: 15px;
  color: #606266;
}
.invoice-preview-text.need__scale {
  width: 660px;
  /* border: 1px solid red;
  height: 24px; */
}
.invoice-preview-text.need__scale.seller__div {
  width: 530px;
}
.invoice-preview-text.need__scale.invoicecode__div {
  width: 208px;
}
.invoice-preview-text.need__scale i {
  white-space: nowrap;
  font-style: normal;
  display: inline-block;
  transform-origin: left 50%;
}
.invoice-preview-text-remark.invoice-preview-text {
  /* height: 86px;
  overflow: auto; */
  width: 468px;
  height: 90px;
  // font-size: 14px;
  /* transform: scale(.8);
  transform-origin: 0 0; */
  /* width: 356px; */
}
/* priceWithoutTax amtWithoutTax  taxRate taxAmt */
.prop__priceWithoutTax,
.prop__amtWithoutTax,
.prop__taxRate,
.prop__taxAmt {
  display: inline-block;
  text-align: right;
  /* border: 1px solid red; */
}
.prop__priceWithoutTax {
  width: 90px;
}
.prop__amtWithoutTax,
.prop__taxAmt {
  width: 168px;
}
.prop__taxRate {
  width: 50px;
}
.carousel-bottom {
  float: left;
  text-align: left;
  display: inline-block;
  width: 820px;
  position: relative;
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  & > span {
    // line-height: 28px;
    color: #999;
  }
  & > div {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    text-align: center;
    .el-button {
      margin-left: 100px;
    }
    .el-button + .el-button {
      margin-left: 20px;
    }
  }
}
</style>