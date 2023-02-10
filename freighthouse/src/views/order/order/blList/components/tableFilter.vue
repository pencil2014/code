<template>
  <div class="table-filter">
    <div class="table-filter-left">
      <el-button size="mini" ref="btnExport" @click="handleExport('Export')" plain>
        导出
      </el-button>
     
      <el-tooltip v-if="!config.hideTransfer" class="item" effect="dark" placement="top-start">
        <div slot="content">
          <div>提单转移条件：</div>
          <div>1.仅本单的主单取单人/放单人、转移的取单人/放单人、主单/协同单的应收财务/海外财务人员；</div>
          <div>2.“提单所在地”为 本人 所在的分公司；</div>
          <div>3.提单的“放单状态”非“已放单”；且提单的“取单状态”为已取单；</div>
          <div>4.该提单不存在正在转移中；</div>
          <div>5.可多选提单，但所选提单必须是正本M单。</div>
        </div>
         <el-button size="mini" @click="handleTransfer">提单转移</el-button>
      </el-tooltip>
      <!-- <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
      <!-- <el-tooltip class="item" effect="dark" content="支持多选“同个委托单位+草单已确认+出单方式相同”的提单，去批量执行“客户同意放货”" placement="top-start">
        <el-button size="mini" ref="btnCustomColumns" @click="handleRelease" type="primary">客户同意放货</el-button>
      </el-tooltip> -->
    </div>
  </div>
</template>
<script>
import { orderMixin } from '@/views/order/order/mixins/orderMixin'

export default {
  mixins: [orderMixin],
  data() {
    return {}
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    // 接口传参
    tableQuery: {
      type: Object,
      default: () => ({})
    },
    callback: {
      type: Function,
      default: () => ({})
    }
  },
  created() {},
  mounted() {},
  computed: {
    isAc() {
      return this.currRole === 'ac'
    },
    isDoc() {
      return this.currRole === 'doc'
    },
    isRc() {
      return this.currRole === 'rc'
    },
    isOp() {
      return this.currRole === 'op'
    },
    isOpTruck() {
      return this.currRole === 'op_truck'
    },
    isBd() {
      return (
        this.currRole === 'bd' ||
        this.currRole === 'obd' ||
        this.currRole === 'asst'
      )
    }
  },
  components: {},
  methods: {
    handleTransfer(){
      // 提单转移
      this.callback('Transfer')
    },
    // 导出
    handleExport() {
      this.$confirm('是否确认导出？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.callback('Export')
      })
    },
    // 自定义表头
    handleCustomColumns() {
      this.callback('CustomColumns')
    },
    // 客户同意放货
    handleRelease() {
      this.callback('Release')
    }
  }
}
</script>
<style scoped>
</style>
