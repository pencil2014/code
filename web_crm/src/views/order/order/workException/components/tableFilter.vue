<template>
  <div class="table-filter">

    <div class="table-filter-left">
      <el-button size="mini" ref="btnCreate" @click="handleAdd('Add')" type="primary">
        新建
      </el-button>
      <el-button size="mini" ref="btnExport" @click="handleExport('Export')" plain>
        导出
      </el-button>
      <!-- <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
      <!-- <el-button size="mini" ref="btnCustomColumns" @click="handleClose" plain class="ml10" v-if="own">关闭异常单</el-button>
      <el-button size="mini" ref="btnCustomColumns" @click="handleCancel" plain class="ml10" v-if="own">取消异常单</el-button> -->
    </div>
    
    <div class="table-filter-right">
      <div class="pulish-status">
        <el-radio-group v-model="tableQuery.handleStatus" size="mini" @change="handleSearchByStatus">
          <el-radio-button size="mini" label="all" >全部</el-radio-button>
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
    console.log(this.dictMap);
  },
  computed: {
    ...mapState({
      currRole: state => state.order.currRole,
      dictMap: state => state.dict.dictMap
    }),
    statusOptions() {
      let result = {}
      console.log('this.dictMap.exceptionStatus', this.dictMap.exceptionStatus)
      this.dictMap.exceptionStatus.map(item => {
        result[item.value] = item.label
      })
      return result
    },
    own() {
      return this.tableQuery.handleStatus === 'own' ? true : false
    }
  },
  components: {
  },
  methods: {

    // 新建
    handleAdd() {
      this.callback('Add')
    },
    handleExport() {
      this.callback('Export')
    },

    // 自定义表头
    handleCustomColumns() {
      this.callback('CustomColumns')
    },

    // 关闭异常单
    handleClose() {
      this.callback('Close')
    },

    // 取消异常单
    handleCancel() {
      this.callback('Cancel')
    },

    // 按发布状态查询
    handleSearchByStatus(value) {
      Object.assign(this.tableQuery, {
        handleStatus: value
      })
      this.callback('SearchByExceptionStatus')
    }
  }
}
</script>
<style scoped>

</style>  
