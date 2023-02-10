<template>
  <div class="finance-bill-detail finance-page">
    <div class="finance-bill-detail-main" id="printBillDetail" style="width:994px;">
      <div class="finance-bill-detail-fee" style="width:794px;margin:0 auto;">
        <div v-for="(item, index) in invoiceImgFileNos" :key="'invoiceImgFileNos'+index">
          <span>{{$t('Settle.printNum', {num: isPrinting ? item.printCount : item.printCount-1})}}</span>
          <img width="100%" :src="`/base/fileView/preview/${item.fileNo}/sowoll`" />
          <div class="finance-search-list-gap"></div>
        </div>
      </div>
    </div>
    <div class="finance-bill-detail-btns">
      <el-button class="finance-btn" type="primary" v-print="printObj" size="mini">{{$t('Common.print')}}</el-button>
      <el-button class="finance-btn" @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
    </div>
  </div>
</template>
<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { invoicePrintConfirm } from '@/api/fin/invoicePayment'

export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      invoiceImgFileNos: [],
      isPrinting: false,
      printObj: {
        id: 'printBillDetail',
        popTitle: this.$t('Common.bill'),
        extraCss: '',
        isNew: true,
        // extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
        extraHead:
          '<style media="print">@page {size: portrait !important; margin: 4mm 1mm 4mm 5mm !important;}.finance-bill-detail-fee>div{margin:0 0 10px 0 !important;}table tr td {border-bottom: 1px solid #4A4A4A;}.finance-table .vxe-table--render-default .vxe-table--border-line {border: 1px solid #4A4A4A;}.bill-title-arrow {display: none;}.finance-bill-detail-main{width: 794px !important;}.el-form-item__label{height: 20px !important;line-height:20px !important;}.el-form-item__content{line-height:20px !important;}.fin-bill-switch-remark{display:none;}</style>',
        printCallback: this.printCallback,
        printCallbackBefore: this.printCallbackBefore,
      },
    }
  },
  created() {
    this.init()
    this.cTimestamp = new Date().getTime()
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 300) {
      this.init()
    }
  },
  methods: {
    init() {
      this.invoiceImgFileNos = JSON.parse(this.$route.query.invoiceImgFileNos || '[]')
    },
    printCallbackBefore(fn) {
      this.isPrinting = true
      fn && fn()
    },
    printCallback() {
      invoicePrintConfirm({ invoicePaymentIds: this.invoiceImgFileNos.map((item) => item.id) }).then((res) => {
        // [{"invoicePaymentId":1573,"printCount":3}]
        this.refreshView('InvoicePaymentList', 'from')
        this.isRefresh = true
        if (res.data && res.data.length) {
          res.data.forEach((v) => {
            let find = this.invoiceImgFileNos.find((item) => item.id == v.invoicePaymentId)
            this.$set(find, 'printCount', v.printCount)
          })
        }
        this.isPrinting = false
      })
    },
    cancel() {
      this.routerBack(this.isRefresh)
      this.isRefresh = false
    },
  },
}
</script>
<style lang="scss">
@import '~@/views/finance/style/bill.scss';
.finance-bill-detail-fee > div {
  position: relative;
  margin-top: 16px;
}
.finance-bill-detail-fee > div > span {
  position: absolute;
  left: 708px;
  top: 2px;
}
</style>
<style scoped>
#printBillDetail {
  padding-top: 0;
}
.detail-info-item {
  /* width: 262px; */
  width: calc(33% - 14px);
  margin-right: 14px;
  margin-bottom: 4px;
}
.detail-info-other {
  margin-bottom: 14px;
}
.finance-bill-detail-totalfee {
  height: 40px;
  text-align: right;
  padding: 8px 90px;
  font-size: 14px;
  font-weight: 600;
  color: #222222;
  line-height: 24px;
}
.finance-bill-detail-totalfee span {
  margin-right: 12px;
}
</style>
