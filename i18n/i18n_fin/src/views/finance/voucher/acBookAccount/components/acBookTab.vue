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
      <div>
        <el-button
          v-if="checkAuth($route.name, 'tab-acBook', 'btn-getKdBook')"
          type="primary"
          class="finance-btn"
          size="mini"
          @click="acbookAsync"
          :loading="btnLoading"
        >从金蝶下载账簿</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-acBook', 'btn-add')"
          type="primary"
          class="finance-btn"
          size="mini"
          @click="add"
        >{{$t('Common.add')}}</el-button>
      </div>
      <div class="money-box-right">
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
      </div>
    </div>
    <div class="finance-list-container">
      <FinanceTable :option="tableOption" />
    </div>
    <VoucherDialog
      v-if="editDialog.show"
      :option="editDialog"
      @close="dialogClose('editDialog', $event)"
    />
    <VoucherDialog
      v-if="addDialog.show"
      :option="addDialog"
      @close="dialogClose('addDialog', $event)"
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
import { acBookList, acBookSave, kdAccountList, acbookAsync } from '@/api/fin/acct'
import { getSysDate } from '@/api/fin/sysDate'

// 统一设置规则提醒
const ruleMsg = [{ required: true, message: ' ', trigger: 'change' }]
export default {
  name: 'acBook',
  label: '账簿管理',
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
      tableOption: {},
      addDialog: { show: false, labelWidth: '100px', title: '新增账簿', formItems: [], form: {} },
      editDialog: { show: false, labelWidth: '100px', title: '修改账簿', formItems: [], form: {} },
      companyList: [],
      kdAccountList: [],
    }
  },

  async created() {
    await kdAccountList({}).then((res) => {
      let list = res.data.map((v) => ({ ...v, value: v.kingdeeAccountId, label: v.accountName }))
      this.kdAccountList.splice(0, 1000, ...list)
    })
    // 搜索配置
    let searchInputGroup = ['acKingdeeAccountId', 'bookName', 'kdCode']
    this.searchOption = {
      saveDefault: true,
      saveName: 'voucherAccountbookList',
      plusShow: false,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          acKingdeeAccountId: { label: '账套名称', type: 'select', selectOptions: this.kdAccountList },
          bookName: { label: '账簿名称', type: 'input' },
          kdCode: { label: '账簿编码', type: 'input' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = { ...this.option, id: 'option1', $name: 'acBookTab', pagination, selection: false }
    this.tableOption.operationBtns.data = this.editOperate
    if (!this.checkAuth(this.$route.name, 'tab-acBook', 'btn-edit')) {
      this.tableOption.operationBtns = false
    }
    let columns = [
      { prop: 'acctSetType', label: '内外账类型', type: 'select', propInDict: 'voucherAcctSetType' },
      { prop: 'kdAccountName', label: '账套名称', type: 'text' },
      { prop: 'kdCode', label: '账簿编码', type: 'text' },
      { prop: 'bookName', label: '账簿名称', type: 'text', minWidth: '160px' },
      { prop: 'settleCompName', label: '核算组织', type: 'text' },
      { prop: 'finMon', label: '财务月', type: 'text' },
      { prop: 'monPeriod', label: '期间', type: 'text' },
      // { prop: 'kdAccountName', label: '金蝶账号', type: 'text' },
      { prop: 'basicCurrency', label: '本位币', type: 'text', width: 80 },
    ]
    this.tableOption.columns = columns
    this.optionMaxHeight = this.tableOption

    // 统一设置弹框内表单字段 r表示需要rules d表示需要disabled
    // acBookId	N	int	账簿id ,为空为新增
    // acKingdeeAccountId	Y	int	所属的金蝶账号id
    // bookName	Y	string	账簿名称
    // kdCode	Y	string	账簿金蝶编码
    // remark	N	int	备注
    // settleCompCode	Y	int	所属分公司编码
    let months = []
    let monthAll = 13
    while (--monthAll) {
      months.unshift({ label: monthAll, value: monthAll })
    }
    const formItem = [
      // voucher_sub_subject_matchType     subMatchType
      {
        label: '分公司名称',
        type: 'select',
        prop: 'settleCompCode',
        remote: true,
        r: true,
        // d: true,
        noRemote: true,
        selectOptions: this.companyList,
        remoteMethod: (queryString, item) => {
          this.querySettleUnit({ queryString, unitTypes: 'company', isAdd: true }).then((data) => {
            item.selectOptions.splice(0, 1000, ...data.map((v) => ({ ...v, value: v.key, label: v.value })))
          })
        },
        visibleChange: (queryString, item) => {
          this.querySettleUnit({ queryString, unitTypes: 'company', isAdd: true }).then((data) => {
            item.selectOptions.splice(0, 1000, ...data.map((v) => ({ ...v, value: v.key, label: v.value })))
          })
        },
        selectChange: (val, item, form) => {
          let find = item.selectOptions.find((v) => v.value === val)
          form.settleCompName = find.label
          getSysDate({ settleCompCode: val }).then((res) => {
            if (res.data?.finMon) {
              this.$set(form, 'finMon', res.data.finMon)
              this.$set(form, 'monPeriod', +res.data.finMon.split('-')[1])
            }
          })
        },
      },
      { label: '财务月', prop: 'finMon', type: 'date', dateType: 'month', format: 'yyyy-MM', disabled: true },
      { label: '期间', prop: 'monPeriod', type: 'select', selectOptions: months, disabled: true },
      { label: '账簿编码', type: 'input', prop: 'kdCode', r: true, d: true, maxlength: '10' },
      { label: '账簿名称', type: 'input', prop: 'bookName', r: true, d: true, maxlength: '30' },
      {
        label: '账套名称',
        type: 'select',
        prop: 'acKingdeeAccountId',
        filter: true,
        r: true,
        d: true,
        selectOptions: this.kdAccountList,
        selectChange: (val, item, form) => {
          let find = item.selectOptions.find((v) => v.value === val)
          form.kdAccountName = find.label
        },
      },
      { label: '本位币', type: 'select', prop: 'basicCurrency', r: true, propInDict: 'validCurrencyNR', default: 'CNY' },
    ]
    const formData = {}
    formItem.forEach((item) => (formData[item.prop] = item.default || ''))
    this.addDialog.form = { ...formData }
    this.editDialog.form = { ...formData }
    // 深拷贝弹框内容，并设置需要rules，disabled的地方
    let addDialogItems = []
    let editDialogItems = []
    formItem.map((item) => {
      addDialogItems.push(item.r ? { rules: ruleMsg, ...item } : { ...item })
      editDialogItems.push(item.d ? { ...item, disabled: true } : item.r ? { rules: ruleMsg, ...item } : { ...item })
    })
    this.addDialog.formItems = addDialogItems
    this.editDialog.formItems = editDialogItems
    // TODO 搜索保存，自动请求
    // this.getData()
  },
  methods: {
    // kdAccountListMethod(queryString, item) {
    //   clearTimeout(this.setTimeoutTag)
    //   this.setTimeoutTag = setTimeout(() => {
    //     kdAccountList({}).then((res) => {
    //       let list = res.data.map((v) => ({ ...v, value: v.kingdeeAccountId, label: v.accountName }))
    //       item.selectOptions.splice(0, 1000, ...list)
    //     })
    //   }, 300)
    // },
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
      acBookList(data)
        .then((res) => {
          this.tableOption.data = res.data.list
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    clearForm(form, isAdd) {
      for (const key in form) {
        if (Object.hasOwnProperty.call(form, key)) {
          form[key] = ''
        }
      }
      if (isAdd) return
      this.companyList.splice(0, 1000)
      // this.kdAccountList.splice(0, 1000)
    },
    add() {
      this.clearForm(this.addDialog.form, true)
      this.addDialog.form.basicCurrency = 'CNY'
      this.addDialog.show = true
    },
    dialogClose(type, params) {
      // console.log(this[type].form)
      // return
      if (params === true) {
        // if (!this[type].form.acBookId && this[type].form.acBookId !== 0) {
        //   this[type].form.acBookId = ''
        // }
        acBookSave(this[type].form)
          .then((res) => {
            this.$message.success(type === 'editDialog' ? this.$t('Hedge.modifyTips') : this.$t('Settle.addSuc'))
            this.getData()
            this[type].show = false
          })
          .catch(console.log)
      } else {
        this[type].show = false
      }
    },
    // 单行编辑
    handleSingleEdit(row) {
      this.clearForm(this.editDialog.form)
      this.addDialog.form.basicCurrency = 'CNY'

      this.companyList.splice(0, 1000, { value: row.settleCompCode, label: row.settleCompName })
      // this.kdAccountList.splice(0, 1000, { value: row.acKingdeeAccountId, label: row.kdAccountName })

      Object.assign(this.editDialog.form, row)
      this.editDialog.show = true
    },
    acbookAsync() {
      this.btnLoading = true
      acbookAsync({})
        .then((res) => {
          this.$msgSucClose('操作成功！')
          this.getData()
        })
        .finally(() => (this.btnLoading = false))
    },
  },
}
</script>