<template>
  <el-dialog
    :visible.sync="transferFeeOption.show"
    @close="close"
    class="transfer-dialog"
    title="大掌柜分摊手续费"
    width="800px"
  >
    <div class="transfer-fee">
      <FinanceTableMass :option="option1" v-if="transferFeeOption.show" />
    </div>
    <div class="dialog-footer" slot="footer">
      <el-button @click="close" size="mini" type="primary">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
export default {
  components: {
    FinanceTableMass
  },
  mixins: [mixin],
  props: {
    transferFeeOption: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      option1: {}
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'transferFee',
      data: this.transferFeeOption.data,
      tips: false,
      selection: false,
      operationBtns: false,
      pagination: false,
      columns: [
        { prop: 'dzgCompName', label: '大掌柜', type: 'text' },
        { prop: 'internalDzgAmt', label: '转移金额', type: 'text' },
        { prop: 'currency', label: '币种', type: 'text' },
        {
          prop: 'transferAllotAmtStr',
          label: '手续费分摊金额',
          type: 'text',
          formatter: ({ cellValue }) => {
            return cellValue || 0
          }
        }
      ]
    })
  },
  methods: {
    close() {
      this.$emit('close')
    }
  },
  watch: {
    'transferFeeOption.data'(list) {
      if (list) {
        this.option1.data = list
      }
    }
  }
}
</script>
