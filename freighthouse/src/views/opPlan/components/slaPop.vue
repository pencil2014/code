<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
      <el-table
        :data="tableData"
        border
        style="width: 100%">
        <el-table-column
          prop="itemName"
          label="项目"
          width="150px"
        >
        </el-table-column>
        <el-table-column
          prop="serviceItems"
          label="服务项"
          width="200px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.serviceItems | mapService}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="addPointStandard"
          label="得分标准"
        >
         <template slot-scope="scope">
           <span v-if="scope.row.addPointStandard" v-html="scope.row.addPointStandard"></span>
         </template>
        </el-table-column>
        <el-table-column
          prop="deductPointStandard"
          label="扣分标准"
        >
         <template slot-scope="scope">
           <span v-if="scope.row.deductPointStandard" v-html="scope.row.deductPointStandard"></span>
         </template>
        </el-table-column>
      </el-table>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
export default {
   components: {
    BaseDialog
   },
   props: {
    slaPopList: {
      type: Array,
      default: () => {
        return []
      }
    }
   },
   filters: {
    mapService(val) {
      if (val && val.length) {
        return val.map(item => {
          return item.itemServiceName
        }).join('、')
      } else {
        return '--'
      }
    }
   },
   created() {
      this.tableData = this.slaPopList
   },
   data() {
    return {
      dialogConfig: {
        title: 'SLA评分标准',
        show: true,
        size: 'medium',
        width: "1200px",
        btns: [
          {label: '关闭', action: 'Cancel'}
        ]
			},
      tableData: [],
    }
   },
   methods: {
		close(action, value) {
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.close('Confirm', this.model)
      } else {
        this.close('Cancel')
      }
    }
	}
}
</script>

<style>

</style>