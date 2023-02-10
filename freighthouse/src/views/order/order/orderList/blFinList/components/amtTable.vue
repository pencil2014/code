<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <FinanceTableMass :option="option1" />
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'

export default {
  name: 'blFinListAmtTable',
  props: ['amtType', 'list'],
  data() {
    return {
      dialogConfig: {
        title: '',
        show: true,
        size: 'medium',
        btns: [{ label: '关闭', action: 'Cancel' }],
      },
      option1: {
        edit: false,
        columns: [],
        data: [],
        operationBtns: false,
        tips: false,
        selection: false,
        pagination: { show: false },
      },
    }
  },
  created() {
    console.log('amtTable created')
    if (this.amtType === 'ArrearAmtDetail') {
      this.dialogConfig.title = '查看超期金额'
      this.option1.showFooter = true
      this.option1.columns = [
        { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 160 },
        { prop: 'currency', label: '超期币种', type: 'text', width: 160 },
        {
          prop: 'amt',
          label: '超期金额',
          type: 'button',
          width: 160,
          callback: (row) => this.dialogCallback('ArrearAmtDetail', row),
        },
      ]
      this.option1.footerMethod = ({columns, data}) => {
        const sums = []
        columns.forEach((column, index) => {
          if (column.property === 'settleCorpName') {
            sums[index] = '合计'
          } else if (column.property === 'amt') {
            const values = data.map(item => item.amt || 0)
            sums[index] = values.reduce((pre, cur) => new LSnum(pre).plus(cur).toNum(2), 0)
          } else {
            sums[index] = ''
          }
        })
        return [sums]
      }
    } else {
      this.dialogConfig.title = '查看超额金额'
      this.option1.showFooter = true
      this.option1.columns = [
        { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 160 },
        { prop: 'currency', label: '超额币种', type: 'text', width: 160 },
        {
          prop: 'amt',
          label: '超额金额',
          type: 'button',
          width: 160,
          callback: (row) => this.dialogCallback('OverQuotaAmtDetail', row),
        },
      ]
      this.option1.footerMethod = ({columns, data}) => {
        const sums = []
        columns.forEach((column, index) => {
          if (column.property === 'settleCorpName') {
            sums[index] = '合计'
          } else if (column.property === 'amt') {
            const values = data.map(item => item.amt || 0)
            sums[index] = values.reduce((pre, cur) => new LSnum(pre).plus(cur).toNum(2), 0)
          } else {
            sums[index] = ''
          }
        })
        return [sums]
      }
    }
    this.option1.data = this.list
  },
  components: {
    BaseDialog,
    FinanceTableMass,
  },
  methods: {
    close(action, value) {
      // console.log(action, value)
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Cancel' || action === 'Close') {
        this.close('Cancel')
      } else {
        this.close(action, done)
      }
    },
  },
}
</script>

<style lang="scss">
</style>
