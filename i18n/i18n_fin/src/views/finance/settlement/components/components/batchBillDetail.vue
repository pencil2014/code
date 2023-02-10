<template>
  <div class="fin-print-batch-bill">
    <div id="printBatchBill">
      <BillDetail v-for="(item, index) in batchBillData" :key="'billDetail' + index" :propBillData="item" :isFromProp="true" />
    </div>
    <div class="finance-bill-detail-btns">
      <el-button class="finance-btn" v-print="printObj" type="primary" size="mini">{{$t('Common.print')}}</el-button>
      <el-button class="finance-btn" @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
    </div>
  </div>
</template>
<script>
import BillDetail from '@/views/finance/orderFee/orderFee/components/billDetail'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { getBillDetailBacth } from '@/api/fin/bill'

export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      orderBillIds: [],
      batchBillData: [],
      printObj: {
        id: "printBatchBill",
        popTitle: this.$t('Settle.billPrint'),
        extraCss: '',
        // extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
        extraHead: '<style media="print">@page {size: portrait !important; margin: 4mm 1mm 4mm 5mm;}table tr td {border-bottom: 1px solid #4A4A4A;}.finance-table .vxe-table--render-default .vxe-table--border-line {border: 1px solid #4A4A4A;}.bill-title-arrow {display: none;}#printBatchBill{width: 794px !important;}#printBatchBill .finance-bill-detail{margin:0;}#printBatchBill .fin-bill-change{display:none;}.finance-bill-detail-main{width: 794px !important;}.el-form-item__label{height: 20px !important;line-height:20px !important;}.el-form-item__content{line-height:20px !important;}.finance-bill-detail-selectshow{display:none;}.fin-bill-switch-remark{display:none;}</style>', // .el-table thead.is-group th {text-align: center} // table tr th {border-bottom: 1px solid #4A4A4A;} 竖向打印要控制在794px以内
      },
    }
  },
  created() {
    this.cTimestamp = new Date().getTime()
    this.init()
    this.getData()
  },
  methods: {
    init() {
      let orderBillIds = this.$route.query.orderBillIds
      this.orderBillIds = orderBillIds.split(',')
      console.log(this.orderBillIds)
    },
    getData() {
      let data = {
        orderBillIds: this.orderBillIds
      }
      getBillDetailBacth(data).then(res => {
        this.batchBillData = res.data
      })
    },
    cancel() {
      this.routerBack()
    }
  },
  components: {
    BillDetail
  },
  computed: {
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 300) {
      this.init()
      this.getData()
    }
  },
}
</script>
<style lang="scss">
.fin-print-batch-bill {
  .el-button {
    font-size: 12px;
    height: 20px;
    padding: 3px 7px !important;
  }
}
</style>