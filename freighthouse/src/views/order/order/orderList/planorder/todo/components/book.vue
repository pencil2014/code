<template>
  <el-table fit class="plan-table" style="width: 100%;" :data="tableData">
    <el-table-column prop="orderNo" label="工作号" align="left" width="200">
      <template slot-scope="scope">
        <el-button type="text" size="mini" @click="handleInfo(scope.row)">{{scope.row.orderNo}}</el-button> 
      </template>
    </el-table-column>
    <el-table-column label="SO号" align="left">
      <template slot-scope="scope">
        <span>{{scope.row.infoData && scope.row.infoData.so}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="matter" label="待办事项" align="left">
    </el-table-column>
    <!-- <el-table-column label="放舱要求" align="left">
      <template slot-scope="scope">
        <span>{{scope.row.infoData && scope.row.infoData.issueMode}}</span>
      </template>
    </el-table-column>
    <el-table-column label="放舱状态" align="left"> 
      <template slot-scope="scope">
        <span>{{scope.row.infoData && scope.row.infoData.status}}</span>
      </template>
    </el-table-column> -->
  </el-table>
</template>
<script>
import {getDictLabel} from '@/utils/tools'
import {routerMixin} from '@/views/order/order/mixins/routerMixin'
import {planMixin} from '@/views/order/order/orderList/planorder/planMixin'

export default {
  mixins: [routerMixin, planMixin],
  data() {
    return {
      
    }
  },
  props: {
    tableData: {
      type: Array,
      default: () => ([])
    }
  },
  created() {
  },
  mounted() {
    
  },
  destroyed(){
  },
  computed: {
  },
  watch: {
  },
  components: {
    
  },
  methods: {
    handleInfo(row) {
      this.isJumpRouteFromPage = true
      this.handleToOrderDetail(row)
    }
  }
}
</script>
<style lang="scss">
</style>
