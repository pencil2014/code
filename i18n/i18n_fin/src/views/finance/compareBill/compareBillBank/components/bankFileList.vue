<template>
  <div class="finance-page">
    <div
      class="finance-list-container"
      v-loading="lsLoading"
      :element-loading-text="eLoadingText"
      :element-loading-spinner="eLoadingSpinner"
      :element-loading-background="eLoadingBackground"
    >
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">银行账单附件</div>
        </div>
        <div class="money-box-right">
          <el-button @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
        </div>
      </div>
      <FinanceSearch :searchOption="searchOption" @search="search" :border="true" />
      <FinanceTable :option="option1" />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { bankBillListPage as bankListPage } from '@/api/fin/compareBill.js'
import { officePreview } from '@/utils/office'

export default {
  name: 'compareBillBankFileList',
  label: '银行账单附件',
  mixins: [mixin, mixin2, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
  },
  activated() {
    console.log(this.$route.meta.isUseCache)
    if (!this.isNotFirst) {
      this.isNotFirst = true
    }
    if (!this.$route.meta.isUseCache && this.isNotFirst) {
      this.getData()
    }
  },
  data() {
    return {
      keyDownActive: true,
      searchOption: {},
      option1: {},
      multipleSelection: [],
    }
  },
  watch: {
    dialogVisible(val) {
      if (!val) {
        this.uploadParams.template = this.uploadParams.file = ''
      }
    },
  },
  created() {
    // 搜索配置
    let searchInputGroup = ['bankAccBillNo', 'template', 'createdBy', 'createdTime']
    this.searchOption = {
      // saveDefault: true,
      // saveName: 'compareBillBankList',
      // isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          bankAccBillNo: { label: '银行账单编号', type: 'input' },
          template: { label: '模板类型', type: 'select', prop: 'bankAccStatementTemplate' },
          createdBy: {
            label: '导入人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          createdTime: { label: '导入时间', type: 'daterange', format: 'yyyy-MM-dd' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.option1 = { ...this.option, id: 'option1', $name: 'PreCloseAuditTab', pagination, selection: false }
    this.option1.operationBtns = Object.assign({}, this.option.operationBtns, { show: false })
    let columns = [
      {
        prop: 'bankAccBillNo',
        label: '银行账单编号',
        type: 'button',
        width: '130px',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => this.routerPush('CompareBillBankDetail', { bankAccBillNo: row.bankAccBillNo }),
        },
        showOverflow: false,
      },
      { prop: 'template', label: '模板类型', type: 'select', width: 80, propInDict: 'bankAccStatementTemplate' },
      { prop: 'result', label: '解析状态', type: 'select', width: 80, propInDict: 'yesNo' },
      // { prop: 'remark', minWidth: 150, label: '失败原因' },
      { prop: 'rows', width: 90, label: '银行账条数' },
      {
        prop: 'fileName',
        width: 150,
        label: '附件',
        type: 'button',
        width: '130px',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => officePreview({ ...row, name: row.fileName }),
        },
        showOverflow: false,
      },
      { prop: 'createdName', width: 100, label: '导入人' },
      { prop: 'createdTime', width: 130, label: '导入时间' },
    ]
    this.option1.columns = columns
    this.optionMaxHeight = this.option1
    // this.getData()
  },
  methods: {
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    sendMulti(data) {
      this.multipleSelection1 = data
    },
    getData(isSearch) {
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      this.finCommonSearch(data.query, this.searchOption, true, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      bankListPage(data)
        .then((res) => {
          this.option1.data = res.data.list || []
          Object.assign(this.option1.pagination, res.data)
        })
        .finally(() => (this.lsLoading = false))
    },
    cancel() {
      this.routerBack()
    },
  },
}
</script>
<style lang="scss" scoped>
</style>