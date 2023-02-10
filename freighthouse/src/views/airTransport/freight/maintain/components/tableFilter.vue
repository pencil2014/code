<template>
  <div class="table-filter">

    <div class="table-filter-left">
      <el-button size="mini" ref="btnCreate" @click="handleAdd('Add')" type="primary">
        新建
      </el-button>
      <el-button size="mini" ref="btnExport" @click="handleExport('Export')" style="margin-right: 10px">
        导出
      </el-button>
      <BtnMultiOperate :multiOperate="config.multiOperate" :callback="callback" />
    </div>

    <div class="table-filter-right">
      <div class="pulish-status">
        <el-radio-group v-model="tableQuery.status" size="mini" @change="handleSearchByPublishStatus">
          <el-radio-button size="mini" label="">全部</el-radio-button>
          <el-radio-button size="mini" v-for="(item, index) in dictMap.airChargeStatus" :key="index" :label="item.value">{{item.label}}</el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>
<script>
import BtnMultiOperate from '@/components/Base/Table/btnMultiOperate'
import { mapState } from 'vuex'
export default {
  data() {
    return {}
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    publishStatusOptions: {
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
    // console.log(this.publishStatusOptions);
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap
    })
  },
  components: {
    BtnMultiOperate
  },
  methods: {
    // 新建
    handleAdd() {
      this.callback('Add')
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
    handleMultiPublish() {
      this.callback('MultiPublish')
    },
    // 按发布状态查询
    handleSearchByPublishStatus(value) {
      Object.assign(this.tableQuery, {
        status: value
      })
      this.callback('SearchByPublishStatus')
    }
  }
}
</script>
<style scoped>
.publish-btn {
  margin-left: 10px;
}
</style>  
