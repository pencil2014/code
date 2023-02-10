<template>
  <el-dialog :title="titleCfg[dialogOption.type]" :visible.sync="dialogOption.show" width="460px">
    <FinanceTable class="diy-table" :option="tableOption" :maxHeight="'400px'" />
    <span slot="footer" class="dialog-footer">
      <el-button v-if="dialogOption.change" type="primary" size="mini" @click="sure">{{$t('Common.submit')}}</el-button>
      <el-button @click="cancel" size="mini">{{$t('Common.cancel')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'

export default {
  name: 'exchangeRateDialog',
  mixins: [mixin],
  components: {
    FinanceTable,
    FinanceSearch,
  },
  props: {
    dialogOption: {
      type: Object,
      default: () => ({ data: [], show: false, type: '' }),
    },
  },
  data() {
    return {
      tableOption: {},
      titleCfg: {
        diy: this.$t('Settle.settleExRate'),
        lock: this.$t('Settle.settleExRate'),
        system: this.$t('Settle.systemrate'),
        cash: this.$t('Hedge.customerRate'),
        gedging: this.$t('Hedge.hedgingRates'),
      },
    }
  },
  computed: {
    hasDiff() {
      return this.tableOption.data.find((item) => item.originCurrency != item.settleCurrency)
    },
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
    this.tableOption.columns = [
      { label: this.$t('Settle.orignalCurrency'), prop: 'originCurrency', type: 'text' },
      { label: this.$t('Settle.settleCurrency'), prop: 'settleCurrency', type: 'text' },
      { label: this.$t('Settle.settleExRate'), prop: 'exhangeRate', type: 'input' },
    ]
    if(this.dialogOption.type === 'gedging'){
      this.tableOption.columns = [
        { label: this.$t('Settle.orignalCurrency'), prop: 'originCurrency', type: 'text' },
        { label: this.$t('Settle.settleCurrency'), prop: 'settleCurrency', type: 'text' },
        { label: this.$t('PreClose.exRates'), prop: 'exhangeRate', type: 'input' },
      ]
    }
    console.log(this.dialogOption.data);
    this.tableOption.data = this.dialogOption.data.map((item) => {
      let [originCurrency, settleCurrency] = item.settlementRateTitle.split('-')
      let exhangeRate = ['diy', 'cash', 'gedging'].includes(this.dialogOption.type) ? item.settlementRate : item.systemRate
      // return { originCurrency, settleCurrency, exhangeRate, edit: originCurrency != settleCurrency }
      return { ...item, originCurrency, settleCurrency, exhangeRate, edit: originCurrency === settleCurrency ? false : true }
    })
    // console.log(this.tableOption)
  },
  methods: {
    sure() {
      // this.$attrs.noLimit 表示不需要判断上下限，用于结算单详情应付类型
      if ((this.dialogOption.type === 'diy' || this.dialogOption.type === 'gedging') && !this.$attrs.noLimit) {
        let arr = this.tableOption.data.filter(v=>!v.invisible).filter(
          (item) => (item.exhangeRate < item.lowerRate || item.exhangeRate > item.upperRate) && !item.disabled && !item.noLimit
        )
        if (arr.length) {
          let str = arr.map((v) => this.$t('Settle.rateExceed',{currency: `${v.settlementRateTitle}`, rate: `${v.lowerRate}~${v.upperRate}`})).join('；')
          // let str = arr.map((v) => `${v.settlementRateTitle}汇率不能超过系统范围：${v.lowerRate}~${v.upperRate}`).join('；')
          return this.$msgErrClose(str)
        }
      }
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