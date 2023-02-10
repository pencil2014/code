<template>
  <div class="table-filter">
    <div class="table-filter-left">
      <el-button size="mini" ref="btnExport" @click="handleExport" plain>
        导出
      </el-button>
      <el-button type="primary" size="mini" ref="btnApply" @click="handleApply">
        合约号申请
      </el-button>
    </div>
    <div class="table-filter-right">
      <div class="pulish-status">
        <el-radio-group v-model="status" size="mini" @change="handleSearchByStatus">
          <el-radio-button size="mini" v-for="(item, index) in statusOptions" :key="index" :label="index" >{{item}}</el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>
<script>
import {mapState} from 'vuex'

export default {
  data () {
    return {
      status: '0'
    }
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
    ...mapState({
      dictMap: state => state.dict.dictMap
    }),
    statusOptions() {
      return {
        "0": "全部",
        "1": "我维护的",
        "2": "待审核",
        "3": "待维护",
        "4": "已维护",
        "5": "已拒绝",
        "6": "已关闭",
      }
    }
  },
  components: {
  },
  watch: {
    tableQuery: {
      handler(newVal) {
        this.status = newVal.tabVal
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 合约号申请
    handleApply() {
      this.callback('Apply')
    },
    // 导出
    handleExport() {
      this.callback('Export')
    },
    // 按发布状态查询
    handleSearchByStatus(value) {
      this.$set(this.tableQuery, 'tabVal', value)
      this.callback('SearchByTabs')
    }
  }
}
</script>
<style scoped>

</style>  
