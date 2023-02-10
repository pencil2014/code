<template>
  <div class="table-filter">

    <div class="table-filter-left">
      <el-button size="mini" ref="btnCreate" @click="handleAdd('Add')" type="primary">
        {{$t('charge.add')}}
      </el-button>
      <el-button size="mini" ref="btnExport" @click="handleExport('Export')" style="margin-right: 10px">
        {{$t('charge.export')}}
      </el-button>
      <BtnMultiOperate :multiOperate="config.multiOperate" :callback="callback"/>
      <!-- <div class="lock-columns" :class="!config.options.lockState ? 'unlock-columns' : ''" @click="handleChangeLockState">
        <i class="icon-lock"></i>
      </div> -->
      <el-button size="mini" ref="btnCreate" @click="handleMultiPublish()" type="primary" class="publish-btn"> 批量发布</el-button>
      <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button>
    </div>
    
    <div class="table-filter-right">
      <div class="pulish-status">
        <el-radio-group v-model="tableQuery.state" size="mini" @change="handleSearchByPublishStatus">
          <el-radio-button size="mini" v-for="(item, index) in publishStatusOptions" :key="index" :label="index" >{{$t(`dict.publishStatus.${index}`)}}</el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>
<script>

import BtnMultiOperate from '@/components/Base/Table/btnMultiOperate'

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
  mounted() {
  },
  computed: {
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
    handleMultiPublish () {
      this.callback('MultiPublish')
    },

    // 切换列表锁定状态
    handleChangeLockState() {
      
    },

    // 自定义表头
    handleCustomColumns() {
      this.callback('CustomColumns')
    },

    // 按发布状态查询
    handleSearchByPublishStatus(value) {
      Object.assign(this.tableQuery, {
        state: value
      })
      this.callback('SearchByPublishStatus')
    }
  }
}
</script>
<style scoped>
.publish-btn{
  margin-left: 10px;
}
</style>  
