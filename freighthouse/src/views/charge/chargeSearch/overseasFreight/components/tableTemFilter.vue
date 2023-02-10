<template>
  <div class="table-filter">
    <div class="table-filter-left">
      <el-button size="mini" ref="btnCreate" @click="handleAdd('Add')" type="primary">
        New Template
      </el-button>
    </div>
    <div class="table-filter-right">
    </div>
  </div>
</template>
<script>
import BtnMultiOperate from '@/components/Base/Table/btnMultiOperate'

export default {
  data() {
    return {}
  },
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
    // 接口传参
    tableQuery: {
      type: Object,
      default: () => ({}),
    },
    callback: {
      type: Function,
      default: () => ({}),
    },
  },
  created() {},
  mounted() {},
  computed: {},
  components: {
    BtnMultiOperate,
  },
  methods: {
    // 新建
    handleAdd() {
      this.callback('Add')
    },
  },
}
</script>
<style scoped>
</style>  
