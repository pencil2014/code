<template>
  <el-dialog :title="dialogOption.title" :visible.sync="dialogOption.show" width="460px">
    <FinanceTable class="diy-table" :option="tableOption" :maxHeight="'400px'" />
    <span slot="footer" class="dialog-footer">
      <el-button v-if="dialogOption.change" type="primary" size="mini" @click="sure">提交</el-button>
      <el-button @click="cancel" size="mini">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'

export default {
  name: 'exchangeRateDialog',
  mixins: [mixin],
  components: { FinanceTable },
  props: {
    dialogOption: {
      type: Object,
      default: () => ({ data: [], show: false, type: '' }),
    },
  },
  data() {
    return {
      tableOption: {},
    }
  },
  created() {
    // console.log(this.dialogOption.data)
    this.tableOption = {
      ...this.option,
      id: 'option1',
      $name: 'exchangeRateDialog',
      pagination: false,
      operationBtns: false,
      selection: false,
    }
    if (this.dialogOption.change) {
      this.tableOption.edit = true
    }
    this.tableOption.columns = this.dialogOption.columns || [
      { label: '原币种', prop: 'originCurrency', type: 'text' },
      { label: '付款币种', prop: 'settleCurrency', type: 'text' },
      { label: '汇率', prop: 'settleRate', type: 'input' },
    ]
    this.tableOption.data = this.dialogOption.data.map((item) => {
      let [originCurrency, settleCurrency] = item.settlementRateTitle.split('-')
      return { ...item, originCurrency, settleCurrency, edit: originCurrency === settleCurrency ? false : true }
    })
  },
  methods: {
    sure() {
      // this.$attrs.noLimit 表示不需要判断上下限，用于结算单详情应付类型
      // if (this.dialogOption.type === 'diy' && !this.$attrs.noLimit) {
      //   let arr = this.tableOption.data
      //     .filter((v) => !v.invisible)
      //     .filter(
      //       (item) => (item.exhangeRate < item.lowerRate || item.exhangeRate > item.upperRate) && !item.disabled && !item.noLimit
      //     )
      //   if (arr.length) {
      //     let str = arr.map((v) => `${v.settlementRateTitle}汇率不能超过系统范围：${v.lowerRate}~${v.upperRate}`).join('；')
      //     return this.$msgErrClose(str)
      //   }
      // }
      this.$emit('close', this.tableOption.data, this.dialogOption.type)
      this.close()
    },
    cancel() {
      this.close()
    },
    close() {
      this.dialogOption.show = false
      this.dialVmN()
    },
  },
}
</script>
<style lang="scss" scoped>
.el-select .el-input {
  width: 130px;
}
.el-form-item.to-block {
  display: block;
}
.mid-title {
  font-size: 16px;
  font-weight: bold;
  color: #222222;
}
.diy-search {
  padding: 0;
}
.diy-table {
  margin: 0;
}
</style>