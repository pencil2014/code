
<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption1" @search="search" :border="true" />
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button type="primary" v-if="isBd" size="mini" @click="add">新增</el-button>
          <el-button size="mini" @click="exportData">导出</el-button>
        </div>
      </div>
      <FinanceTable :option="option1" :autoMax="true" />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { visitListTable } from '@/views/crm/data'
import VISITPLAN from '@/api/crm/visitPlan'

export default {
  name: 'visitPlan',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
  },
  data() {
    return {
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption1: {},
      isBd: true,
    }
  },
  created() {
    let roles = this.$store.state.user.roles
    if (roles.find((role) => role == 'sps' || role == 'cts')) {
      this.isBd = false
    }
    // 搜索配置
    let searchObj = {}
    visitListTable.forEach((v) => {
      if (v.prop === 'phaseDate' || v.searchHide) return
      searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
    })
    this.searchOption1 = {
      addFilter: {
        defaultSearchLength: 3,
        searchInputGroup: [
          { key: 'planMonth', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'employeeName', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'employeeDeptName', value: '', showType: '1', range: { min: '', max: '' } },
        ],
        filterGroups: { ...searchObj },
        dateArr: ['planMonth'],
        callback: true,
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    this.option1 = {
      ...this.option,
      id: 'option1',
      pagination,
      border: true,
      multiRow: true,
      multiKey: 'items',
      multiId: 'oid',
      selection: false,
      noClickCheck: true
    }
    if (!this.isBd) {
      this.option1.operationBtns = false
    }
    let columns = [...visitListTable]
    this.option1.columns = columns
  },
  methods: {
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // 搜索按钮
    search(query) {
      this.option1.pagination.currPage = 1
      this.getData(query)
    },
    // 封装请求参数并请求列表
    getData(query) {
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
      }
      if (query) {
        this.searchBackup = query
      }
      data.query = this.searchBackup || []
      this._exportSearchData = data
      VISITPLAN.listPage(data)
        .then((res) => {
          let { list } = res.data
          this.option1.data = list.map((item) => ({ ...item, toggle: false }))
          this.option1.pagination.currPage = res.data.currPage
          this.option1.pagination.pageSize = res.data.pageSize
          this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    exportData() {
      this.lsLoading = true
      VISITPLAN.export(this._exportSearchData)
        .then((res) => {
          window.open(res.data.filePath)
        })
        .finally(() => (this.lsLoading = false))
    },
    add() {
      this.routerPush('VisitPlanAdd')
    },
    showDetail(row) {
      this.routerPush('VisitPlanDetail', { row: JSON.stringify(row) })
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-page ::v-deep {
  .el-table th {
    padding: 4px 0;
  }
  .el-table--border th,
  .el-table--border td {
    border-right: 1px solid #dfe6ec !important;
    border-bottom: 1px solid #dfe6ec !important;
  }
  .el-table__body .el-table__row {
    height: auto !important;
    // 有复选框，激活td:nth-of-type(9)，无复选框，激活td:nth-of-type(5),
    td:nth-of-type(5),
    // td:nth-of-type(9),
    td:nth-of-type(6),
    td:nth-of-type(7),
    td:nth-of-type(8) {
      padding: 0;
      & > div {
        padding: 0;
        & > div {
          .el-tooltip{
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          min-height: 22px;
          line-height: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid #dfe6ec;
          &:nth-last-of-type(1),
          &.noBorder:nth-of-type(1) {
            border: none;
          }
        }
      }
    }
  }
}
</style>
