<template>
  <el-dialog title="分摊费用" :visible.sync="dialogVisible.show" width="500px" class="addfee__dialog">
    <div>
      <FinanceTable :option="option1" />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible.show = false;dialVmN()" size="mini">关闭</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
export default {
  name: 'addFeeDialog',
  mixins: [mixin],
  props: {
    dialogVisible: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      option1: {},
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'addFeeDialog',
      data: this.dialogVisible.list,
      operationBtns: false,
      selection: false,
      pagination: false,
      columns: [
        {
          prop: 'sourceBizNo',
          label: '单号',
          type: 'button',
          width: 180,
          operationBtns: {
            show: true,
            callback: (action, index, row, option) => {
              this.showOneNoDetail(row.sourceType, row.sourceBizNo, { isTab: true })
            },
          },
        },
        { prop: 'currency', label: '币别', type: 'text' },
        { prop: 'feeAmt', label: '金额', type: 'text' },
      ],
    })
  },
  components: {
    FinanceTable,
  },
}
</script>
<style scoped lang="scss">
.addfee__dialog ::v-deep {
  .finance-table {
    padding: 8px 8px 0;
  }
  .el-dialog__body {
    padding: 20px;
    max-height: 520px;
    font-size: 12px;
  }
}
.addfee__dialog .finance-page {
  margin: 0;
}
</style>