<template>
  <div class="table-filter">
    <div class="table-filter-left">
      <el-button size="mini" ref="btnExport" @click="handleExport('Export')" plain>
        导出
      </el-button>
    </div>
  </div>
</template>
<script>
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { mapState } from 'vuex'
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
    ...mapState({
      currRole: (state) => state.user.currRole
    })
  },
  components: {},
  methods: {
    // 导出
    handleExport() {
      this.$confirm('是否确认导出？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.callback('Export')
      })
    }
  }
}
</script>
<style scoped>
</style>  
