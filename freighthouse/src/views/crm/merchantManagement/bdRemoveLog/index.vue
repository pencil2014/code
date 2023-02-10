<template>
  <div class="finance-page">
    <FinanceSearch :searchOption="searchOption1" @search="search" />
    <div style="height:8px;background:#F8F9FD;"></div>
    <FinanceTable :option="option1" :autoMax="true" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { removeListTable } from '@/views/crm/data'
import CUSTOMER from '@/api/crm/customer'

export default {
  name: 'bdRemoveLog',
  mixins: [mixin],
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
    }
  },
  created() {
    // 搜索配置
    let searchObj = {}
    removeListTable.forEach((v) => {
      searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
    })
    this.searchOption1 = {
      addFilter: {
        defaultSearchLength: 2,
        searchInputGroup: [
          { key: 'custName', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'removeTime', value: '', showType: '1', range: { min: '', max: '' } },
        ],
        filterGroups: { ...searchObj },
        dateArr: ['removeTime'],
        callback: true,
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    this.option1 = { ...this.option, id: 'option1', pagination, selection: false, operationBtns: false,  noClickCheck: true }
    let columns = [...removeListTable]
    this.option1.columns = columns
    this.getData()
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
      // console.log(this.searchOption1.addFilter.searchInputGroup)
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
      }
      if (query) {
        this.searchBackup = query
      }
      data.query = this.searchBackup || []
      CUSTOMER.bdRemoveLog(data)
        .then((res) => {
          let { list } = res.data
          this.option1.data = list
          this.option1.pagination.currPage = res.data.currPage
          this.option1.pagination.pageSize = res.data.pageSize
          this.option1.pagination.totalCount = res.data.totalCount
        })
        .catch((err) => console.log(err))
    },
  },
}
</script>
