<template>
  <div class="table-filter">
    <div class="table-filter-left">
      <!-- <el-button size="mini" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
      <el-button size="mini" @click="handleAdd" type="primary" class="ml10">新增</el-button>
      <el-button size="mini" @click="handleBatchDisable" type="danger" class="ml10">禁用</el-button>
    </div>
  </div>
</template>
<script>

export default {
  data () {
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
  created() {
  },
  mounted() {
  },
  computed: {
  },
  components: {},
  methods: {
    handleCommand(action) {
      this.callback(action)
    },
    // 新建
    handleAdd() {
      this.callback('Add')
    },
    // 禁用
    handleBatchDisable() {
      this.callback('BatchDisable')
    },

    // 导出
    handleExport() {
      this.callback('Export')
    }
  }
}
</script>
<style scoped>

</style>  
