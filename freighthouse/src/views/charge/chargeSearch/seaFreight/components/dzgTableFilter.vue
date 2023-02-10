<template>
  <div class="table-filter">

    <div class="table-filter-left">
      <!-- <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
    </div>

    <div class="table-filter-right">
      <div class="pulish-status">
        <el-radio-group v-model="tableQuery.connonQueryValue" size="mini" @change="handleSearchByPublishStatus">{{tableQuery.connonQueryValue}}
          <el-radio-button v-for="(item, index) in publishStatusOptions" :key="index" :label="item.value">{{item.label}}</el-radio-button>
        </el-radio-group>
      </div>
      <div style=" display: flex;align-items: center;margin-left:20px">
        <span>驳船费</span>
        <el-switch class="dzg-table-filter-switch" v-model="tableQuery.bargeQuery" @change="handleBargefee" active-text="开" inactive-text="关">
        </el-switch>
      </div>
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
      default: () => ({})
    },
    publishStatusOptions: {
      type: Array,
      default: () => [
        {
          label: '今日发布',
          value: '100'
        },
        {
          label: '有效',
          value: '10'
        },
        {
          label: '失效',
          value: '11'
        }
      ]
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
  computed: {},
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
      this.callback('Export')
    },

    // 自定义表头
    handleCustomColumns() {
      this.callback('CustomColumns')
    },

    // 按状态查询
    handleSearchByPublishStatus(value) {
      Object.assign(this.tableQuery, {
        connonQueryValue: value
      })
      this.callback('SearchStatus')
    },
    // 是否需要驳船费
    handleBargefee(value) {
      Object.assign(this.tableQuery, {
        bargeQuery: value
      })
      this.callback('SearchStatus')
    },
  }
}
</script>
<style  lang="scss">
.dzg-table-filter-switch {
  margin-left: 6px;
  .el-switch__label {
    position: absolute;
    display: none;
    color: #fff !important;
  }
  .el-switch__core {
    width: 50px !important;
  }
}
/*打开时文字位置设置*/
.dzg-table-filter-switch .el-switch__label--right {
  z-index: 1;
}
/* 调整打开时文字的显示位子 */
.dzg-table-filter-switch .el-switch__label--right span {
  margin-right: 10px;
}
/*关闭时文字位置设置*/
.dzg-table-filter-switch .el-switch__label--left {
  z-index: 1;
}
/* 调整关闭时文字的显示位子 */
.dzg-table-filter-switch .el-switch__label--left span {
  margin-left: 26px;
}
/*显示文字*/
.dzg-table-filter-switch .el-switch__label.is-active {
  display: block;
}
</style>  
