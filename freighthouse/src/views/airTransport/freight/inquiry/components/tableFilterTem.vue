<template>
  <div class="table-filter">

    <div class="table-filter-left">
      <div style="margin-left: 10px">
        <el-button size="mini" ref="btnCreate" @click="handleAdd('Add')" type="primary">
          新建
        </el-button>
      </div>
    </div>

    <div class="table-filter-right">
    </div>
  </div>
</template>
<script>
import BtnMultiOperate from '@/components/Base/Table/btnMultiOperate'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      multiOperate: [
        {
          label: '复制的模板',
          action: 'CopyColumns'
        }
      ]
    }
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
    }),
    airChargeStatus() {
      return this.dictMap.airChargeStatus.filter(
        (el) => el.value !== 'no_publish'
      )
    }
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
