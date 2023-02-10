<template>
  <div class="warehouse-soInfo">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="SO信息" name="soInfo">
        <el-table fit style="width: 100%" :data="soList" class="table-cont" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
          <el-table-column prop="so" label="so号" align="center"> </el-table-column>
          <el-table-column prop="polPortName" label="起运港" align="center"> </el-table-column>
          <el-table-column prop="podPortName" label="目的港" align="center"> </el-table-column>
          <el-table-column prop="containerInfo" label="箱型箱量" align="center"> </el-table-column>
        </el-table>
        <table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import tableTooltip from '@/components/Base/Table/table-tooltip'
export default {
  data() {
    return {
      activeNames: '1',
      tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null, // 行数据
      }
    }
  },
  props: {
    soList: {
      type: Array,
      default: () => ([])
    }
  },
  activated() {
    
  },
  created() {
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles
		}),
    isOp() {
			// return this.ordDetRole === 'op'
			return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs')
		},
  },
  components: {
    tableTooltip
  },
  watch: {
  },
  methods: {
    // 鼠标移入cell
    showTooltip(row, column, cell) {
      this.tableCellMouse.cellDom = cell;
      this.tableCellMouse.row = row;
      this.tableCellMouse.hidden = false;
    },
    // 鼠标移出cell
    hiddenTooltip() {
      this.tableCellMouse.hidden = true;
    },
  }
}
</script>
<style lang="scss">
.warehouse-soInfo{
  padding: 0 20px;
  background-color:#fff;
  margin-top: 8px;
}
.warehouse-soInfo .el-collapse {
  border-top: 0;
}
.warehouse-soInfo .el-collapse-item__header {
  height: 28px;
  line-height: 28px;
  padding: 0;
  border-bottom: 0;
  font-weight: 700;
  font-size: 12px;
}
.warehouse-soInfo .el-collapse-item__wrap{
  border-bottom: 0;
}
.warehouse-soInfo .el-collapse-item__content{
  padding: 8px 0;
}
.warehouse-soInfo .el-collapse-item__header.is-active {
  border-bottom: 1px solid #e6ebf5;
}
.warehouse-soInfo .table-cont {
  padding: 0;
}
.warehouse-soInfo .table-cont th{
  height: 24px;
  line-height: 16px;
  padding: 2px 0;
}
.warehouse-soInfo .table-cont td{
  line-height: 16px;
  padding: 2px 0;
}
.warehouse-soInfo .table-cont .cell{
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>