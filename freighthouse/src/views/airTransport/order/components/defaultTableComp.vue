<template>
  <div class="default-table">
    <div class="row-tit" v-if="Object.keys(tableInfo).length>0">
      <span class="tit">{{tableInfo.title}}</span>
      <div class="row-tit-operate" v-if="tableInfo.titleBtnList && tableInfo.titleBtnList.length > 0">
        <slot></slot>
        <template v-for="(item, index) in tableInfo.titleBtnList">
          <el-button size="mini" style="margin-left: 10px;" :disabled="item.hide || isJoint" :key="index" :type="item.type || 'default'" @click="handleClick(item.key)">{{item.label}}</el-button>
        </template>
      </div>
    </div>
    <div class="row-table">
      <BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
    </div>
  </div>
</template>
<script>
const defaultPage = {
  pageSize: 10,
  currPage: 1
}

const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: [],
  query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
  state: 'pass' // 订舱状态，默认显示审核通过
}

import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'


export default {
  data() {
    return {
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      selectedCheckbox: []
    }
  },
  props: {
    tableInfo: {
      type: Object,
      default: () => ({})
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    isJoint:{
      type:Boolean,
      default:false
    }
  },
  created() {},
  mounted() {
    console.log("🚀 ~ this.tableInfo", this.tableInfo)
  },
    
  computed: {},
  components: {
    BaseTableMuti
  },
  methods: {
    handleClick(type) {
      this.$emit('tableClick', type)
    },
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    // 多选
    handleMuti(arr) {
      this.$emit('handleMuti', arr)
      this.selectedCheckbox = arr
    }
  }
}
</script>
<style lang="scss">
.default-table {
  .row-tit {
    border: unset !important;
  }
  .row-table {
    padding: 0 20px;
    .el-table {
      display: grid;
    }
  }
}
</style>  
