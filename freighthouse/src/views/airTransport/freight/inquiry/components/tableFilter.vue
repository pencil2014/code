<template>
  <div class="table-filter">

    <div class="table-filter-left">
      <div style="margin-left: 10px">
        <el-dropdown size="mini" @command="handleCommand">
          <el-button size="mini" plain>设置<i class="el-icon-arrow-down el-icon--right"></i></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="(item, index) in multiOperate" :key="index" :command="item.action">
              {{item.label}}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <div class="table-filter-right">
      <div class="pulish-status">
        <el-radio-group v-model="tableQuery.status" size="mini" @change="handleSearchByPublishStatus">
          <el-radio-button size="mini" v-for="(item, index) in airChargeStatus" :key="index" :label="item.value">{{item.label}}</el-radio-button>
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
    airChargeStatus(){
      return this.dictMap.airChargeStatus.filter(el=> el.value!=='no_publish')
    }
  },
  components: {
    BtnMultiOperate
  },
  methods: {
    handleCommand(action) {
      this.callback(action)
    },
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
