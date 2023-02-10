<template>
  <div
    class="finance-list-container"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <!-- <FinanceSearch :searchOption="searchOption" @search="search" /> -->
    <div class="money-box">
      <div></div>
      <div class="money-box-right">
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
      </div>
    </div>
    <div class="finance-list-container">
      <FinanceTable :option="tableOption" />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mixin as voucherMixin } from '../../mixin.js'
import { voucherClassList, voucherClassSave } from '@/api/fin/acct'

export default {
  name: 'VS4',
  label: '凭证字管理',
  mixins: [mixin, mixin2, voucherMixin],
  components: {
    FinanceTable,
    FinanceSearch,
  },
  data() {
    return {
      searchOption: {},
      tableOption: {},
    }
  },

  created() {
    // 搜索配置
    // let searchColumns = [
    //   {
    //     label: '凭证字',
    //     prop: 'name',
    //     type: 'input',
    //   },
    //   {
    //     label: '凭证字编码',
    //     prop: 'code',
    //     type: 'input',
    //   },
    // ]
    // this.searchOption = this.initSearchOption(searchColumns)
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = { ...this.option, id: 'option1', $name: 'voucherTab', pagination, operationBtns: false, selection: false }
    let columns = [
      { prop: 'code', label: '凭证字编码', type: 'text' },
      { prop: 'name', label: '凭证字类型', type: 'text' },
      { prop: 'accountName', label: '账套', type: 'text' },
      { prop: 'acctSetType', label: '账套类型', type: 'select', propInDict: 'voucherAcctSetType' },
      { prop: 'kdCode', label: '金蝶编码', type: 'text' },
    ]
    this.tableOption.columns = columns
    this.optionMaxHeight = this.tableOption
    this.getData()
  },
  methods: {
    getData() {
      this.lsLoading = true
      // let data = this.convertSearch(this.tableOption, this.searchOption);
      voucherClassList({
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: this.searchBackup || [],
      })
        .then((res) => {
          this.tableOption.data = res.data.list
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
  },
}
</script>