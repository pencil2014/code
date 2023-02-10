<template>
  <div
    class="finance-list-container"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch v-if="searchOption.addFilter" :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="money-box">
      <!-- v-if="checkAuth($route.name, 'tab-VS5', 'btn-asyncKdRate')" -->
      <el-button type="primary" class="finance-btn" size="mini" @click="asyncKdRate">同步汇率至金蝶</el-button>
      <div class="money-box-right">
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
      </div>
    </div>
    <div class="finance-list-container">
      <FinanceTable :option="tableOption" @send-multi="sendMulti" />
    </div>
    <VoucherDialog
      v-if="editDialog.show"
      :option="editDialog"
      @close="dialogClose('editDialog', $event)"
    />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mixin as voucherMixin } from '../../mixin.js'
import VoucherDialog from '../../components/voucherDialog'
import { acRateList, acRateSync, kdAccountList } from '@/api/fin/acct'
import { dateFormat } from '@/views/finance/utils/finance'

export default {
  name: 'VS8',
  label: '金蝶汇率',
  mixins: [mixin, mixin2, voucherMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    VoucherDialog,
  },
  data() {
    return {
      keyDownActive: true,
      searchOption: {},
      multipleSelection: [],
      tableOption: {},
      editDialog: {
        // padding: '0 10px',
        labelWidth: '108px',
        show: false,
        title: '同步金蝶汇率',
        formItems: [],
        form: {},
      },
      kdAccountList: [],
    }
  },

  async created() {
    this.lsLoading = true
    await kdAccountList({}).then((res) => {
      let list = res.data.map((v) => ({ ...v, value: v.kingdeeAccountId, label: v.accountName }))
      this.kdAccountList.splice(0, 1000, ...list)
    })
    /******************************************   对话框form配置  *********************************************/
    // 统一设置规则提醒
    const ruleMsg = [{ required: true, message: ' ', trigger: 'blur' }]
    // 统一设置弹框内表单字段 r表示需要rules d表示需要disabled
    let nowYearMonth = dateFormat('yyyy-mm', new Date())
    console.log(nowYearMonth)
    const formItem = [
      { label: '账套名称', type: 'select', prop: 'acKingdeeAccountId', r: true, selectOptions: this.kdAccountList },
      { label: '月份', type: 'date', prop: 'yearMon', dateType: 'month', format: 'yyyy-MM', default: nowYearMonth },
    ]
    const formData = {}
    formItem.forEach((item) => (formData[item.prop] = item.default || ''))
    this.editDialog.form = { ...formData }
    // 深拷贝弹框内容，并设置需要rules，disabled的地方
    let editDialogItems = []
    formItem.forEach((item) => {
      editDialogItems.push(item.d ? { ...item, disabled: true } : item.r ? { rules: ruleMsg, ...item } : { ...item })
    })
    this.editDialog.formItems = editDialogItems
    /******************************************  搜索   *********************************************/

    // 搜索配置
    let searchInputGroup = ['acKingdeeAccountId', 'srcCurrency', 'toCurrency', 'month']
    this.searchOption = {
      saveDefault: true,
      saveName: 'acRateTab',
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          acKingdeeAccountId: { label: '账套名称', type: 'select', selectOptions: this.kdAccountList },
          // accountName: { label: '账套名称', type: 'input' },
          srcCurrency: { label: this.$t('Settle.orignalCurrency'), type: 'select', prop: 'validCurrencyNR' },
          toCurrency: { label: '目标币别', type: 'select', prop: 'validCurrencyNR' },
          month: { label: '月份', type: 'monthrange', prop: 'month', format: 'yyyy-MM', keys: ['beginDate', 'endDate'] },
        },
      },
    }
    /******************************************  表格配置   *********************************************/
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = { ...this.option, id: 'option1', $name: 'VoucherSettingFeeTab', pagination, selection: false }
    this.tableOption.operationBtns.data = this.editOperate
    if (!this.checkAuth(this.$route.name, 'tab-VS8', 'btn-edit')) this.tableOption.operationBtns = false
    let columns = [
      { prop: 'accountName', label: '账套名称', type: 'text' },
      { prop: 'srcCurrency', label: this.$t('Settle.orignalCurrency'), type: 'text' },
      { prop: 'toCurrency', label: '目标币别', type: 'text' },
      { prop: 'rate', label: '金蝶汇率', type: 'select' },
      { prop: 'kdFrateId', label: '金蝶汇率ID', type: 'text' },
      { prop: 'sysAcctRate', label: '系统记账汇率', type: 'text' },
      { prop: 'exchangeRateId', label: '系统记账汇率ID', type: 'text' },
      { prop: 'yearMon', label: '月份', type: 'text' },
      { prop: 'createdTime', label: '同步时间', type: 'text' },
    ]
    this.tableOption.columns = columns
    this.optionMaxHeight = this.tableOption
    // TODO 搜索保存，自动请求
    // this.getData()
  },
  methods: {
    getData(data) {
      this.lsLoading = true
      if (data) {
        this.searchBackup = data.query
      }
      data = {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: this.searchBackup || [],
      }
      acRateList(data)
        .then((res) => {
          this.tableOption.data = res.data.list
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    asyncKdRate() {
      this.editDialog.show = true
    },
    dialogClose(type, params) {
      if (params === true) {
        // 转换请求参数后 请求
        acRateSync(this.editDialog.form)
          .then((res) => {
            this.$msgSucClose('同步成功！')
            this.editDialog.show = false
            this.getData()
          })
          .catch(console.log)
      } else {
        this[type].show = false
      }
    },
  },
}
</script>