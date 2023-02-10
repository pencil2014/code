<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <div id="cargosDialog">
      <el-table
      show-summary
      :summary-method="getSummaries"
      :data="cargosList"
      style="width: 100%">
      <el-table-column
        prop="cname"
        label="品名"
        width="180">
      </el-table-column>
      <el-table-column
        prop="mark"
        label="唛头"
        width="180">
      </el-table-column>
      <el-table-column
        prop="quantity"
        label="件数">
      </el-table-column>
      <el-table-column
        prop="weight"
        label="毛重(KGS)">
      </el-table-column>
      <el-table-column
        prop="volume"
        label="体积(CBM)">
      </el-table-column>
      <el-table-column
        prop="packageType"
        label="包装">
        <template slot-scope="scope">
          {{scope.row.packageType | packageTypeFilter}}
        </template>
      </el-table-column>
      </el-table>
    </div>  
  </BaseDialog>
</template>

<script>
import store from '@/store'
import {getDictLabel} from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'

export default {
  filters: {
    packageTypeFilter(packageType) {
      return getDictLabel('packageType', packageType)
    }
  },
  data() {
    return {
      selectCargo:{},  // 选中列
      dialogConfig: {
        title: '货品信息',
        show: true,
        size: 'medium',
        width: '60%'
      },
    }
  },
  props: {
    cargosList: {
      type: Array,
      default: () => {[]}
    }
  },
  created() {
    console.log(this.cargosList)
  },
  components: {
    BaseDialog,
  },
  methods: {
    dialogCallback(action, done) {
      this.$emit('close', action)
    },
    getSummaries(param) {
      const { columns, data } = param
			const sums = []
			columns.forEach((column, index) => {
        if (index === 0) {
          return sums[index] = '合计'
        }
        const values = data.map(item => Number(item[column.property]))
        if (column.property === 'quantity' ||column.property ==='weight' || column.property==='volume' ) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          sums[index]
        }
      })
      return sums
    },
  }
};
</script>

<style lang="scss">
#cargosDialog .el-table td {
  padding: 12px 0;
}

</style>
