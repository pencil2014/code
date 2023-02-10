<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-table
      :data="data"
      class="table-class-cs"
      border
      style="width: 100%">
      <el-table-column
        prop="type"
        label="类型"
        width="100px"
        >
      </el-table-column>
      <el-table-column
        prop="totalUsdPayAmt"
        label="成本USD"
        width="100px"
      >
      </el-table-column>
      <el-table-column
        prop="totalCnyPayAmt"
        label="成本RMB"
        width="100px"
      >
      </el-table-column>
      <el-table-column
        prop="totalUsdReceiveAmt"
        label="卖价USD"
        width="100px"
        >
      </el-table-column>
      <el-table-column
        prop="totalCnyReceiveAmt"
        label="卖价RMB"
        width="100px"
        >
      </el-table-column>
      <el-table-column
        prop="cargoValue"
        label="贷款">
        <template slot-scope="scope">
          <el-input-number 
            v-model="scope.row.cargoValue"
            size="mini"
            :controls="false" 
            :precision='2'
            style="width: 60%;"
          >
          </el-input-number>
          <el-select style="width: 35%;margin-left: 5px;" v-model="scope.row.cargoValueCurrency" size="mini" clearable placeholder="请选择">
            <el-option v-for="item in currencyList" :label="item.code" :value="item.code" :key="item.code"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        prop="totalLocalCnyAmt"
        label="Local应收"
        width="200px"
      >
      </el-table-column>
      <el-table-column
        prop="totalUsdProfit"
        label="利润USD"
        width="200px"
        >
      </el-table-column>
      <el-table-column
        prop="totalCnyProfit"
        label="利润RMB"
        width="200px"
        >
      </el-table-column>
    </el-table>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { getOrderFollowProfit, followCargoValueSave } from '@/api/order/followItems'
import { baseCurrencyList } from '@/api/base'
export default {
  props: {
    orderNo: {
      type: String,
      default: ''
    }
  },
  components: {
    BaseDialog,
  },
  created() {
    this.getList()
    this.getCurrencyList()
  },
  data() {
    return {
      dialogConfig: {
				title: '查看成本&卖价&利润',
				show: true,
				size: 'medium',
				width: '1400px',
        btns: [
          { label: '确定', action: 'Confirm', type: 'primary'},
          { label: '关闭', action: 'Cancel'}
        ]
			},
      data: [],
      currencyList: []
    }
  },
  methods: {
    // 币别下拉列表
    getCurrencyList() {
      baseCurrencyList('', 'valid').then(response => {
        this.currencyList = response.data
      })
    },
    getList() {
      getOrderFollowProfit({
        orderNo: this.orderNo
      })
      .then(res => {
        if (res.data) {
          let cargoValue = res.data.cargoValue || undefined
          this.data.push({
            type: '金额',
            cargoValueCurrency: '',
            ...res.data,
            cargoValue
          })
        }
      })
    },
    close(action, value) {
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        if (!this.data.length) {
          this.close('Cancel')
        } else if (!Number(this.data[0].cargoValue)){
          return this.$message.error('请输入贷款金额')
        } else if (!this.data[0].cargoValueCurrency) {
          return this.$message.error('请选择币种')
        } else {
          followCargoValueSave({
            orderNo: this.orderNo,
            cargoValue: this.data[0].cargoValue,
            cargoValueCurrency: this.data[0].cargoValueCurrency
          })
          .then(res => {
            this.$message.success('修改成功')
            this.close('Confirm')
          })
        }
        
      } else {
        this.close('Cancel')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.table-class-cs {
  /deep/.el-input--mini .el-input__inner {
    height: 20px;
    line-height: 20px;
  }
  /deep/.el-input--mini .el-input__icon {
    height: 25px;
  }
}

</style>