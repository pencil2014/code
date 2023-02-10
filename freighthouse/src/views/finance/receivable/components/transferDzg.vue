<template>
  <el-dialog :visible.sync="dialogOption.show" class="transfer-dialog" title="余额转大掌柜" width="800px">
    <div class="transfer-cnt">
      <el-button @click="addTransfer" size="mini" type="primary">新增</el-button>
      <FinanceTableMass v-if="dialogOption.show" :option="option1" />
    </div>
    <div class="dialog-footer" slot="footer">
      <el-button @click="submit" size="mini" type="primary">提交</el-button>
      <el-button @click="close" size="mini">取消</el-button>
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
    dialogOption: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      option1: {}
    }
  },
  created() {
    const operationBtn1 = Object.assign({}, this.operationBtns, {
      width: 100,
      data: [
        {
          label: '删除',
          type: 'text',
          action: 'Delete',
          showFn: row => row.relationType !== 'temporary'
        }
      ],
      fixed: 'right',
      show: true,
      callback: (action, $index, row, option) => {
        if (action === 'Delete') {
          this.option1.data.splice($index, 1)
        }
      }
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'transferDzg',
      data: this.dialogOption.data,
      tips: false,
      selection: false,
      operationBtns: operationBtn1,
      pagination: false,
      edit: true,
      columns: [
        {
          prop: 'dzgCompCode',
          label: '大掌柜',
          type: 'select',
          propInDict: 'dzgCompCode'
        },
        {
          prop: 'internalDzgAmt',
          label: '金额',
          type: 'input',
          inputType: 'number',
          // validateInput: (val, row, item, change) => {
          //   if (change && val) {
          //     if (!/^\d+(\.\d{0,2})?$/.test(val)) {
          //       this.$msgErrClose('请输入正确的金额！')
          //     }
          //   }
          // }
        },
        { prop: 'dzgWriteoffNo', label: '核销编号', type: 'input', needTrim: true }
      ]
    })
  },
  methods: {
    addTransfer() {
      this.option1.data.push({
        dzgCompCode: '',
        internalDzgAmt: '',
        dzgWriteoffNo: '',
        edit: true
      })
    },
    submit() {
      // 验证每个大掌柜只能新增一条数据
      const dzgCompCodes = this.option1.data.map(item => item.dzgCompCode)
      const dzgCompCodes2 = [...new Set(dzgCompCodes)]
      if (dzgCompCodes.length !== dzgCompCodes2.length) {
        return this.$msgErrClose('数据重复，每个大掌柜只能新增一条数据')
      }
      // 验证金额的合法性
      let status = false
      const len = this.option1.data.length
      for (let index = 0; index < len; index++) {
        const val = this.option1.data[index].internalDzgAmt
        if (!/^\d+(\.\d{0,2})?$/.test(val)) {
          status = true
          break
        }
      }
      if (status) {
        return this.$msgErrClose('金额不正确，请调整后再提交')
      }
      // 总金额验证
      const total = this.option1.data.reduce(
        (pre, cur) => {
          return pre = new LSnum(pre).plus(cur.internalDzgAmt).toNum(2)
        },
        0
      )
      if (total > this.dialogOption.unusedAmt) {
        return this.$msgErrClose('转大掌柜金额大于剩余未用金额，请调整后再提交')
      }
      // 验证空的金额不允许提交

      const data = this.option1.data
      this.$emit('submit', data, total)
    },
    close() {
      this.$emit('close')
    }
  },
  watch:{
    'dialogOption.data' (data) {
      if (data) {
        this.option1.data = data
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.transfer-dialog ::v-deep {
  .finance-table .el-input--suffix .el-input__inner {
    text-align: center;
  }
}
</style>
