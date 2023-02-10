<template>
  <div class="table-filter">

    <div class="table-filter-left">
      <!-- <el-button size="mini" ref="btnCreate" @click="handleAdd('Add')" type="primary">
        <i class="el-icon-plus"></i> {{$t('charge.add')}}
      </el-button> -->
      <!-- <el-button size="mini" ref="btnExport" @click="handleExport('Export')" plain>
        {{$t('charge.export')}}
      </el-button> -->
      <!-- <BtnMultiOperate :multiOperate="config.multiOperate" :callback="callback"/> -->
      <!-- <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
      <el-dropdown size="mini" @command="handleCommand">
        <el-button size="mini" plain>设置<i class="el-icon-arrow-down el-icon--right"></i></el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(item, index) in multiOperate" :key="index" :command="item.action">
            {{item.label}}
          </el-dropdown-item>
        </el-dropdown-menu>
    </el-dropdown>
    </div>
    
    <div class="table-filter-right">
      <div class="pulish-status">
        <!-- <span class="publish-label">发布状态</span> -->
        <el-radio-group v-model="tableQuery.state" size="mini" @change="handleSearchByPublishStatus">
          <el-radio-button v-for="(item, index) in publishStatusOptions" :key="index" :label="index" >{{item}}</el-radio-button>
        </el-radio-group>
        <!-- <el-dropdown size="small"
          @command="handleSearchByPublishStatus">
          <el-button size="small" plain>{{publishStatusOptions[tableQuery.publishStatus]}}<i class="el-icon-arrow-down el-icon--right"></i></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="(item, index) in publishStatusOptions" :key="index" :command="index">
                {{item}}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown> -->
      </div>
    </div>
  </div>
</template>
<script>

import BtnMultiOperate from '@/components/Base/Table/btnMultiOperate'

export default {
  data () {
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
  },
  mounted() {
    
  },
  computed: {
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
      this.callback('Export')
    },

    // 切换列表锁定状态
    handleChangeLockState() {
      this.callback('ChangeLockState')
    },

    // 自定义表头
    handleCustomColumns() {
      this.callback('CustomColumns')
    },

    // 按发布状态查询
    handleSearchByPublishStatus(value) {
      console.log(value)
      Object.assign(this.tableQuery, {
         state: value
      })
      this.callback('SearchByPublishStatus')
    }
  }
}
</script>
<style scoped>

</style>  
