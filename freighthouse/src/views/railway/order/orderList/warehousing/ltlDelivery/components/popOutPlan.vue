<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-table fit highlight-current-row style="width: 100%" ref="contMultiTable" :data="tableData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" :selectable="selectable"></el-table-column>
      <el-table-column prop="outPlanNo" label="出仓计划编号" align="center"></el-table-column>
      <el-table-column prop="outPlanTime" label="预计出仓时间" align="center" width="150"> </el-table-column>
      <el-table-column prop="status" label="出仓状态" align="center">
        <template slot-scope="scope">
          {{scope.row.status | statusFilter}}
        </template>  
      </el-table-column>
      <el-table-column prop="whName" label="出仓仓库" align="center"> </el-table-column>
      <el-table-column prop="custName" label="客户名称" align="center"> </el-table-column>
      <el-table-column prop="quantity" label="预计出仓件数" align="center" width="110"> </el-table-column>
      <el-table-column prop="weight" label="预计出仓毛重(KGS)" align="center" width="150"> </el-table-column>
      <el-table-column prop="volume" label="预计出仓体积(CBM)" align="center" width="150"> </el-table-column>
      <!-- <el-table-column prop="packageType" label="预计出仓包装" align="center" width="100">
        <template slot-scope="scope">
          {{scope.row.packageType | packageTypeFilter}}
        </template>  
      </el-table-column> -->
      <el-table-column prop="remark" label="出仓备注" align="center" width="150"> </el-table-column>
    </el-table>
  </BaseDialog>
</template>
<script>

import {mapState} from 'vuex'
import {getDictLabel} from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import {outplanList} from '@/api/order/podService/warehouse'

export default {
  filters: {
    statusFilter(status) {
      return getDictLabel('warehouseOutplanStatus', status)
    },
    packageTypeFilter(packageType) {
      return getDictLabel('packageType', packageType)
    }
  },
  data() {
    return {
      oQuery: this.$route.query,
      tableData: [],
      multipleSelection: [],
      bindOutPlanNos: [], // 已绑定出仓集合编号的集合
      tableHeight: null,
      dialogConfig: {
        title: '出仓计划',
        show: true,
        size: 'medium',
        width: "800px",
        btns: [
          {label: '取消', action: 'Cancel'},
          {label: '确定', action: 'Confirm', type: 'primary'}
        ]
      },
      outPlanNoItemQuery: {
        outPlanNo: '',
        outPlanTime: '',
        status: '',
        whName: '',
        whId: '',
        custName: '',
        custid: '',
        packageType: '',
        quantity: '',
        weight: '',
        volume: '',
        remark: '',
      },
    }
  },
  props: {
    outPlanList: {
      type: Array,
      default: () => ([])
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - this.$refs.contMultiTable.$el.offsetTop -200
    })
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      role: state => state.user.role
    })
  },
  components: {
    BaseDialog
  },
  watch: {
    'tableData'(newVal, oldVal) {
      if(newVal.length > 0){
        this.toggleRowSelection()
      }
    }
  },
  methods: {
    selectable(row) {
      let bindOutPlanNos = []
      this.outPlanList.forEach(item => {
        bindOutPlanNos.push(item.outPlanNo)
      })
      // return !bindOutPlanNos.includes(row.outPlanNo)
      return row.outPlanNo
    },
    toggleRowSelection() {
      this.$nextTick(function () {
        this.bindOutPlanNos = []
        this.outPlanList.forEach(item => {
          this.bindOutPlanNos.push(item.outPlanNo)
        })
        this.tableData.forEach(row => {
          this.$refs.contMultiTable.toggleRowSelection(row, this.bindOutPlanNos.includes(row.outPlanNo))
        })
      })
    },

    // 出仓计划列表
    getList() {
      let data = {orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo}
      outplanList(data).then(res => {
        this.tableData = res.data.list
      })
    },

    // 获取多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    close(action, value) {
      this.$emit('close', action, value)
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        let data = []
        console.log(this.multipleSelection);
        this.multipleSelection.map(item => {
          let tempQuery = {}
          for (let i in this.outPlanNoItemQuery) {
            tempQuery[i] = item[i] || ''
          }
          data.push(tempQuery)
        })
        this.close('Confirm', data)
      } else {
        this.close('Cancel')
      }
    },

  }
}
</script>
<style lang="scss">

</style>