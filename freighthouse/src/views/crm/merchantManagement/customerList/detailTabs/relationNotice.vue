<template>
  <div class="scope-css">
    <FinanceSearch
      :searchOption="searchOption1"
      @search="search"
      :noLabelWidth="true"
      :border="true"
    />
    <FinanceTable :option="option1" />
  </div>
</template>
<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import RELATION from '@/api/crm/custRelation'
export default {
  name: 'relationNotice',
  mixins: [mixin],
  props: ['custid', 'RELATION'],
  components: {
    FinanceTable,
    FinanceSearch,
  },
  data() {
    return {
      option1: {},
      searchOption1: {},
    }
  },
  watch: {
    custid: {
      handler(custid) {
        if (!custid) return
        // watch 立即执行时，早于created钩子函数
        this.$nextTick(() => this.handleCurrentChange(1))
      },
      immediate: true,
    },
  },
  // activated() {
  //   this.getData()
  // },
  created() {
    // 搜索配置
    this.searchOption1 = {
      columns: [
        { label: '关联公司', prop: 'relationName', type: 'input' },
        { label: '关联角色', prop: 'relationRole', type: 'select', propInDict: 'customerRole' },
      ],
      data: { relationName: '', relationRole: '' },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    this.option1 = { ...this.option, id: 'option1', pagination, selection: false, operationBtns: false }
    // 自定义表头
    this.option1.columns = [
      { label: '关联公司', prop: 'relaCustName' },
      { label: '关联角色', prop: 'relaCustRole', type: 'select', propInDict: 'customerRole' },
      { label: '客户角色', prop: 'custRole', type: 'select', propInDict: 'customerRole' },
    ]
    // this.getData()
  },
  methods: {
    edit() {
      this.routerPushTab('CustomerDetailBaseEdit')
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    getData() {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        custid: this.custid,
        ...this.searchOption1.data,
      }
      RELATION.csnList(data).then(({ data }) => {
        this.option1.data = data.list
        this.option1.pagination.currPage = data.currPage
        this.option1.pagination.pageSize = data.pageSize
        this.option1.pagination.totalCount = data.totalCount
      })
    },
  },
}
</script>