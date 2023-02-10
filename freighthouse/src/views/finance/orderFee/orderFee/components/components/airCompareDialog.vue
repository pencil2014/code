<template>
  <el-dialog title="查看价格对比" :visible.sync="dialogOption.show" :append-to-body="true" width="600px">
    <div>
      <h4>最新订舱价/出货价对比</h4>
      <FinanceTable :option="option1" />
      <h4>订舱价确认记录</h4>
      <FinanceTable :option="option2" />
      <h4>出货价确认记录</h4>
      <FinanceTable :option="option3" />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogOption.show = false" size="mini">关闭</el-button>
    </span>
  </el-dialog>
</template>
<script>
// import { specFeeMngApply } from '@/api/fin/specfee'
// import { saveOrderSpecialFee } from '@/api/fin/feeAdjust'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'

export default {
  name: 'specFeeMngApplyDialog',
  mixins: [mixin],
  props: {
    dialogOption: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      option1: {},
      option2: {},
      option3: {},
    }
  },
  components: {
    FinanceTable,
  },
  created() {
    let operationBtns = Object.assign(this.option.operationBtns, { show: false })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'option1',
      data: [],
      tips: { text: '', show: false },
      operationBtns,
      selection: { show: false },
      maxHeight: 300,
      styleCfg: { padding: '0' },
      columns: [
        { prop: 'unitPrice', label: '订舱单价', type: 'text', width: '20%' },
        { prop: 'unitCurrency', label: '订舱价币种', type: 'text', width: '20%' },
        { prop: 'unitPrice2', label: '出货单价', type: 'text', width: '20%' },
        { prop: 'unitCurrency2', label: '出货价币种', type: 'text', width: '20%' },
        { prop: 'diff', label: '差额', type: 'text', width: '20%' },
      ],
    })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2',
      $name: 'option2',
      data: [],
      tips: { text: '', show: false },
      operationBtns,
      selection: { show: false },
      maxHeight: 300,
      styleCfg: { padding: '0' },
      columns: [
        { prop: 'unitPrice', label: '订舱单价', type: 'text', width: '25%' },
        { prop: 'unitCurrency', label: '币种', type: 'text', width: '25%' },
        { prop: 'createdName', label: '确认人', type: 'text', width: '25%' },
        { prop: 'createdTime', label: '确认时间', type: 'text', width: '25%' },
      ],
    })
    this.option3 = Object.assign({}, this.option, {
      id: 'option3',
      $name: 'option3',
      data: [],
      tips: { text: '', show: false },
      operationBtns,
      selection: { show: false },
      maxHeight: 300,
      styleCfg: { padding: '0' },
      columns: [
        { prop: 'unitPrice', label: '出货单价', type: 'text', width: '25%' },
        { prop: 'unitCurrency', label: '币种', type: 'text', width: '25%' },
        { prop: 'createdName', label: '确认人', type: 'text', width: '25%' },
        { prop: 'createdTime', label: '确认时间', type: 'text', width: '25%' },
      ],
    })
  },
  methods: {},
  watch: {
    'dialogOption.show'(val) {
      if (val) {
        let { bookPriceList = [], deliverPriceList = [] } = this.dialogOption
        this.option2.data = bookPriceList
        this.option3.data = deliverPriceList
        let bookPrice = bookPriceList[0] || {}
        let deliverPrice = deliverPriceList[0] || {}
        if (bookPriceList[0] || deliverPriceList[0]) {
          this.option1.data = [
            {
              unitPrice: bookPrice.unitPrice,
              unitCurrency: bookPrice.unitCurrency,
              unitPrice2: deliverPrice.unitPrice,
              unitCurrency2: deliverPrice.unitCurrency,
              diff:
                !bookPrice.unitCurrency || !deliverPrice.unitCurrency
                  ? ''
                  : bookPrice.unitCurrency === deliverPrice.unitCurrency
                  ? new LSnum(deliverPrice.unitPrice).minus(bookPrice.unitPrice)
                  : '币种不同不算差额',
            },
          ]
        } else {
          this.option1.data = []
        }
      }
    },
  },
}
</script>
<style lang="scss" scoped>
h4 {
  color: #222;
  padding: 18px 0 8px;
}
::v-deep {
  .el-dialog__body {
    padding-top: 2px;
    padding-bottom: 20px;
    min-height: 160px;
  }
  .el-dialog__footer {
    .el-button {
      padding: 3px 7px;
    }
  }
}
</style>