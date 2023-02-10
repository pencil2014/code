<template>
  <div class="dzg-pagination-container">
    <div>
      <span v-if="config.totalCount>0" class="pagination-item">共{{config.totalCount}}条数据</span>
      <el-button size="mini" class="pagination-item" :disabled="!config.hasPreviousPage&&!config.hasNextPage" :type="firstIsPrimary" @click="changePageNum(1)">首页</el-button>
      <el-button size="mini" class="pagination-item" :disabled="!config.hasPreviousPage" @click="changePageNum(config.currPage-1)">上一页</el-button>
      <span class="pagination-item">当前第 {{config.currPage>0?config.currPage:''}} 页</span>
      <el-button size="mini" class="pagination-item" :disabled="!config.hasNextPage" @click="changePageNum(config.currPage+1)">下一页</el-button>
      <el-button size="mini" class="pagination-item" :disabled="!config.hasPreviousPage&&!config.hasNextPage" :type="lastIsPrimary" @click="changePageNum(-1)">尾页</el-button>
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
      default: () => {
        return {}
      }
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
        // {
        //   value: 1000,
        //   label: '1000条/页'
        // }
      ]
    }
  },
  computed: {
    firstIsPrimary() {
      if (this.config.isFirstPage) {
        return 'primary'
      }
    },
    lastIsPrimary() {
      if (this.config.isLastPage) {
        return 'primary'
      }
    }
  },
  watch: {
    'config.pageSize': {
      handler: function (n, o) {
        if (this.config.pageSize == -1) {
          this.pageSize = 10
        } else {
          this.pageSize = this.config.pageSize
        }
      },
      immediate: true
    }
  },
  methods: {
    changePageNum(value) {
      this.config.currPage = value
      this.$emit('changePageNum', value)
    },
    changePageSize(value) {
      this.config.pageSize = value
      this.$emit('changePageSize', value)
    }
  }
}
</script>

<style lang="scss" scoped>
.dzg-pagination-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 20px;
  .pagination-item {
    margin-left: 10px;
  }
}
</style>