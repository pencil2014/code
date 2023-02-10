<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-container finance-list-container">
      <!-- <FinanceSearch :searchOption="searchOption" @search="search" :border="true" /> -->
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">关账记录</div>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
        </div>
      </div>
      <FinanceTable :option="tableOption" />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin as voucherMixin } from '@/views/finance/voucher/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import API from '@/api/fin/finClose'

export default {
  name: 'totalClose',
  mixins: [mixin, voucherMixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
  },
  data() {
    return {
      pickerOptions: {},
      searchOption: {},
      multipleSelection: [],
      tableOption: {},
      dialogShow: false,
      settleCompObj: { remoteSelectList: [] },
      form: {
        settleComp: {},
        settleCompName: '',
        settleCompCode: '',
        finMon: '',
        nextCloseDate: '',
      },
      rules: {
        settleComp: [{ required: true, message: '须选择分公司', type: 'object' }],
        nextCloseDate: [{ required: true, message: '须选择下次总关账日期' }],
      },
    }
  },
  created() {
    // 搜索配置
    let searchInputGroup = ['settleCompCode', 'dateRange']
    this.searchOption = {
      saveDefault: true,
      addFilter: {
        defaultSearchLength: 2,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          settleCompCode: {
            label: this.$t('FeeList.settleComp'),
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          dateRange: { label: '关账时间', type: 'daterange', format: 'yyyy-MM-dd', keys: ['formDate', 'toDate'] },
        },
      },
    }

    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = {
      ...this.option,
      id: 'option1',
      $name: 'TotalClose',
      pagination,
      selection: false,
    }
    this.tableOption.operationBtns = false
    let columns = [
      { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text' },
      { prop: 'finMon', label: '关账年月', type: 'text' },
      // { prop: 'bookName', label: '账簿名称', type: 'text' },
      { prop: 'createdName', label: '关账人', type: 'text' },
      { prop: 'createdTime', label: '关账时间', type: 'text' },
    ]
    this.tableOption.columns = columns
    this.getData()
  },
  methods: {
    cancel(refresh) {
      this.routerBack(refresh)
    },
    getData(isSearch) {
      this.lsLoading = true
      let data = this.convertSearch(this.tableOption, this.searchOption)
      data = data || {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: [],
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      API.closeList(data)
        .then((res) => {
          this.tableOption.data = res.data.list || []
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
  },
  activated() {},
}
</script>
<style lang="scss" scoped>
.money-box {
  padding: 6px 8px;
  border-bottom: 1px solid #e9e9e9;
  margin-bottom: 8px;
}
</style>
