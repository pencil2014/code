<template>
  <div class="dzg-pagination-container">
    <div>
      <span v-if="config.totalCount>0" class="pagination-item">{{$t('Common.pagnation.total', {total: config.totalCount})}}</span>
      <el-button
        size="mini"
        class="pagination-item"
        :disabled="!config.hasPreviousPage&&!config.hasNextPage"
        :type="firstIsPrimary"
        @click="changePageNum(1)"
      >{{$t('Common.pagnation.first')}}</el-button>
      <el-button
        size="mini"
        class="pagination-item"
        :disabled="!config.hasPreviousPage"
        @click="changePageNum(config.currPage-1)"
      >{{$t('Common.pagnation.prev')}}</el-button>
      <span class="pagination-item">{{$t('Common.pagnation.currPage', {currPage: config.currPage})}}</span>
      <el-button
        size="mini"
        class="pagination-item"
        :disabled="!config.hasNextPage"
        @click="changePageNum(config.currPage+1)"
      >{{$t('Common.pagnation.next')}}</el-button>
      <el-button
        size="mini"
        class="pagination-item"
        :disabled="!config.hasPreviousPage&&!config.hasNextPage"
        :type="lastIsPrimary"
        @click="changePageNum(-1)"
      >{{$t('Common.pagnation.last')}}</el-button>
      <el-select
        v-model="config.pageSize"
        placeholder
        size="mini"
        style="width:100px"
        class="pagination-item"
        @change="changePageSize"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
    pageSizeArr: {
      type: Array,
      default: () => [10, 15, 20, 30, 50, 100, 200, 1000],
    },
  },
  data() {
    return {}
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
    },
    options() {
      return this.pageSizeArr.map((item) => {
        return { value: item, label: item + this.$t('Common.pagnation.pageSize') }
      })
    },
  },
  methods: {
    changePageNum(value) {
      this.$emit('current-change', value)
    },
    changePageSize(value) {
      this.config.currPage = 1
      this.$emit('size-change', value)
    },
  },
  watch: {
    config: {
      handler(newVal) {
        if (newVal.lessPageSize) {
          let len = this.pageSizeArr.length
          if (this.pageSizeArr[len - 1] === 1000) {
            this.pageSizeArr.splice(len - 1)
          }
          if (newVal.pageSize === 1000) {
            newVal.pageSize = 200
          }
        }
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.dzg-pagination-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .pagination-item {
    margin-left: 10px;
    user-select: none;
    ::v-deep {
      .el-input__inner{
        padding: 2px 7px;
        height: 24px;
      }
      .el-input__suffix {
        top: 2px;
        right: 3px;
      }
    }
  }
}
</style>