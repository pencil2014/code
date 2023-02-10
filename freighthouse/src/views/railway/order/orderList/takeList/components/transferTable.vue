<template>
  <div class="transfer-table">
    <div class="transfer-table-title">提单转移信息</div>
    <el-table fit highlight-current-row style="width: 100%" key="valid" :data="transferArr" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
      <el-table-column prop="placeCompName" label="转移地" align="center" width="150px">
      </el-table-column>
      <el-table-column prop="transferTakeEmployeeName" label="取单人" align="center" width="150px">
      </el-table-column>
      <el-table-column prop="transferPutEmployeeName" label="放单人" align="center" width="150px">
      </el-table-column>
      <el-table-column prop="transferStatus" label="转移状态" align="center" width="150px">
        <template slot-scope="scope">
          {{scope.row | blTransferStatusFilter}}
        </template>
      </el-table-column>
      <el-table-column prop="expressType" label="快递类型" align="center" width="150px">
        <template slot-scope="scope">
          {{scope.row | expressTypeFilter}}
        </template>
      </el-table-column>
      <el-table-column prop="expressSupplierName" label="快递公司" align="center" width="150px">
      </el-table-column>
      <el-table-column prop="expressNo" label="快递单号" align="center" width="150px">
      </el-table-column>
      <el-table-column prop="createdName  " label="发起人" align="center" width="150px">
        <template slot-scope="scope">
          {{scope.row.createdName  }}
        </template>
      </el-table-column>
      <el-table-column prop="launchTime" label="发起时间" align="center" width="150px">
        <template slot-scope="scope">
          {{scope.row.launchTime}}
        </template>
      </el-table-column>
      <el-table-column prop="completeTime" label="转移完成时间" align="center" width="150px">
        <template slot-scope="scope">
          {{scope.row.completeTime}}
        </template>
      </el-table-column>
      <el-table-column prop="cancelTime" label="转移取消时间" align="center" width="150px">
        <template slot-scope="scope">
          {{scope.row.cancelTime}}
        </template>
      </el-table-column>
      <el-table-column prop="cancelRemark" label="取消原因" align="center" width="200px">
        <template slot-scope="scope">
          <div class="column-text">
            {{scope.row.cancelRemark}}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150px" fixed="right">
        <template slot-scope="scope">
          <div class="operate-group">
            <el-button v-if="userId === scope.row.createdBy && scope.row.transferStatus==='PROCESSING'" type="text" size="mini" @click="showTransferRefuse=true">取消转移</el-button>
            <el-button v-if="userId === scope.row.transferTakeEmployeeId && scope.row.transferStatus==='PROCESSING'" type="text" size="mini" @click="handleComplete(scope.row)">转移完成</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
    <div v-if="showTransferRefuse">
      <TransferRefuse @close="transferRefuseClose"></TransferRefuse>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import TransferRefuse from './transferRefuse'
import { transferComplete, transferCancel } from '@/api/order/bl'
import tableTooltip from '@/components/Base/Table/table-tooltip'
export default {
  filters: {
    blTransferStatusFilter(detail) {
      return getDictLabel('blTransferStatus', detail.transferStatus)
    },
    expressTypeFilter(detail) {
      console.log(detail.expressType)
      return getDictLabel('expressType', detail.expressType)
    }
  },
  props: {
    transferArr: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showTransferRefuse: false,
      tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null // 行数据
      },
    }
  },
  components: {
    TransferRefuse,
    tableTooltip,
  },
  computed: {
    ...mapState({
      userId: (state) => state.user.userId,
      dictMap: (state) => state.dict.dictMap
    })
  },
  mounted() {},
  methods: {
    // 鼠标移入cell
    showTooltip(row, column, cell) {
      this.tableCellMouse.cellDom = cell
      this.tableCellMouse.row = row
      this.tableCellMouse.hidden = false
    },
    // 鼠标移出cell
    hiddenTooltip() {
      this.tableCellMouse.hidden = true
    },
    handleComplete() {
      let params = {
        blId: this.$route.query.blId,
        orderNo: this.$route.query.orderNo
      }
      transferComplete(params).then((res) => {
        this.$message.success('转移完成')
        this.$emit('transferChange')
      })
    },
    transferRefuseClose(action, value) {
      if (action === 'Confirm') {
        let params = {
          blId: this.$route.query.blId,
          orderNo: this.$route.query.orderNo,
          cancelRemark: value.cancelRemark
        }
        transferCancel(params).then((res) => {
          this.$message.success('取消成功')
          this.showTransferRefuse = false
          this.$emit('transferChange')
        })
      } else {
        this.showTransferRefuse = false
      }
    }
  }
}
</script>

<style  lang="scss" scoped>
.transfer-table {
  padding: 10px;
  .transfer-table-title {
    font-size: 14px;
    font-weight: 800;
    line-height: 36px;
  }
}
</style>