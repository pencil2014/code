<template>
  <!-- <el-dialog
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
      <el-button @click="close" size="mini" type="primary">{{$t('Common.close')}}</el-button>
    </div>
  </el-dialog> -->
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
        { prop: 'dzgCompName', label: this.$t('Hedge.daZg'), type: 'text' },
        { prop: 'internalDzgAmt', label: this.$t('PreClose.transferAmt'), type: 'text' },
        { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text' },
        {
          prop: 'transferAllotAmtStr',
          label: this.$t('PreClose.feeshare'),
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
