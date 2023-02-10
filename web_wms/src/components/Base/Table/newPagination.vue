<template>
  <div class="new-pagination-container">
    <div>
      <span v-if="config.pagination.total>0" class="pagination-item">共{{config.pagination.total}}条数据</span>
      <el-button size="mini" class="pagination-item" :disabled="!config.pagination.hasPreviousPage&&!config.pagination.hasNextPage" :type="firstIsPrimary" @click="changePageNum(1)">首页</el-button>
      <el-button size="mini" class="pagination-item" :disabled="!config.pagination.hasPreviousPage" @click="changePageNum(tableQuery.currPage-1)">上一页</el-button>
      <span class="pagination-item">当前第 {{tableQuery.currPage>0?tableQuery.currPage:''}} 页</span>
      <el-button size="mini" class="pagination-item" :disabled="!config.pagination.hasNextPage" @click="changePageNum(tableQuery.currPage+1)">下一页</el-button>
      <el-button size="mini" class="pagination-item" :disabled="!config.pagination.hasPreviousPage&&!config.pagination.hasNextPage" :type="lastIsPrimary" @click="changePageNum(-1)">尾页</el-button>
      <el-select v-model="pageSize" placeholder="" size="mini" style="width:100px" class="pagination-item" @change="changePageSize">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    tableQuery: {
      type: Object,
      default: () => ({})
    },
    callback: {
      type: Function,
      default: () => ({})
    }
  },
  data() {
    return {
      pageSize: 10,
      options: [
        {
          value: 10,
          label: '10条/页'
        },
        {
          value: 15,
          label: '15条/页'
        },
        {
          value: 20,
          label: '20条/页'
        },
        {
          value: 30,
          label: '30条/页'
        },
        {
          value: 50,
          label: '50条/页'
        },
        {
          value: 100,
          label: '100条/页'
        },
        {
          value: 200,
          label: '200条/页'
        },
        {
          value: 1000,
          label: '1000条/页'
        }
      ]
    }
  },
  created() {},
  computed: {
    firstIsPrimary() {
      if (this.config.pagination.isFirstPage) {
        return 'primary'
      }
    },
    lastIsPrimary() {
      if (this.config.pagination.isLastPage) {
        return 'primary'
      }
    }
  },
  watch: {
    'tableQuery.pageSize': {
      handler: function (n, o) {
        if (this.tableQuery.pageSize == -1) {
          this.pageSize = 10
        } else {
          this.pageSize = this.tableQuery.pageSize
        }
      },
      immediate: true
    }
  },
  methods: {
    changePageNum(value) {
      this.tableQuery.currPage = value
      this.callback('CurrentChange')
    },
    changePageSize(value) {
      this.tableQuery.pageSize = value
      this.tableQuery.currPage = 1
      this.callback('SizeChange')
    }
  }
}
</script>

<style lang="scss">
.new-pagination-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 10px;
  .pagination-item {
    margin-left: 10px;
    user-select: none;
  }
  .el-button--mini {
    height: 20px;
    padding: 0px 8px;
  }
  .el-input--mini .el-input__inner {
    height: 20px !important;
    line-height: 20px !important;
  }
  .el-input__icon{
    height: 20px !important;
    line-height: 20px !important;
  }
}
</style>