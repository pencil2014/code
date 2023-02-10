<template>
  <div
    class="finance-list-container"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch v-if="searchOption.addFilter" :searchOption="searchOption" @search="search" />
    <div style="height:8px;background:#F8F9FD;"></div>
    <div class="money-box">
      <div>
        <el-button type="primary" class="finance-btn" size="mini" @click="add">新增</el-button>
      </div>
      <div class="money-box-right">
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
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
import { kingdeeCodeList, kingdeeCodeSave, kdAccountList } from '@/api/fin/acct'
import VoucherDialog from '../../components/voucherDialog'

// 统一设置规则提醒
const ruleMsg = [{ required: true, message: ' ', trigger: 'change' }]
export default {
  name: 'VS7',
  label: '金蝶编码管理',
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
      addDialog: { show: false, labelWidth: '100px', title: '新增金蝶编码', formItems: [], form: {} },
      editDialog: { show: false, labelWidth: '100px', title: '修改金蝶编码', formItems: [], form: {} },
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
    let searchInputGroup = ['name', 'lsCode', 'kdCode', 'codeType', 'acctSetType']
    this.searchOption = {
      saveDefault: true,
      saveName: 'voucherKdCodeList',
      plusShow: false,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          name: { label: '名称', type: 'input' },
          lsCode: { label: '我方编码', type: 'input' },
          kdCode: { label: '金蝶编码', type: 'input' },
          codeType: { label: '类型', type: 'select', prop: 'kingdeeCodeType' },
          acctSetType: { label: '账套类型', type: 'select', prop: 'voucherAcctSetType' },
          accountName: { label: '账套名称', type: 'input' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = { ...this.option, id: 'option1', $name: 'acBookTab', pagination, selection: false }
    this.tableOption.operationBtns.data = this.editOperate
    let columns = [
      { prop: 'name', label: '名称', type: 'text' },
      { prop: 'lsCode', label: '我方编码', type: 'text' },
      { prop: 'kdCode', label: '金蝶编码', type: 'text' },
      { prop: 'codeType', label: '类型', type: 'select', propInDict: 'kingdeeCodeType' },
      { prop: 'acctSetType', label: '账套类型', type: 'select', propInDict: 'voucherAcctSetType' },
      { prop: 'accountName', label: '账套名称', type: 'text' },
      { prop: 'createdName', label: '创建人', type: 'text' },
      { prop: 'createdTime', label: '创建时间', type: 'text', minWidth: 130 },
      { prop: 'updatedName', label: '更新人', type: 'text' },
      { prop: 'updatedTime', label: '更新时间', type: 'text', minWidth: 130 },
    ]
    this.tableOption.columns = columns
    this.optionMaxHeight = this.tableOption

    const formItem = [
      { label: '我方名称', type: 'input', prop: 'name', r: true, maxlength: '100' },
      { label: '我方编码', type: 'input', prop: 'lsCode', r: true, maxlength: '100' },
      { label: '金蝶编码', type: 'input', prop: 'kdCode', r: true, maxlength: '100' },
      { label: '类型', type: 'select', prop: 'codeType', propInDict: 'kingdeeCodeType', r: true },
      { label: '账套名称', type: 'select', prop: 'kingdeeAccountId', r: true, selectOptions: this.kdAccountList },
    ]
    const formData = {}
    formItem.forEach((item) => (formData[item.prop] = ''))
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
      kingdeeCodeList(data)
        .then((res) => {
          this.tableOption.data = res.data.list
          Object.assign(this.tableOption.pagination, res.data)
        })
        .finally(() => (this.lsLoading = false))
    },
    clearForm(form, isAdd) {
      for (const key in form) {
        if (Object.hasOwnProperty.call(form, key)) {
          form[key] = ''
        }
      }
    },
    add() {
      this.clearForm(this.addDialog.form, true)
      this.addDialog.show = true
    },
    dialogClose(type, params) {
      if (params === true) {
        // if (!this[type].form.acBookId && this[type].form.acBookId !== 0) {
        //   this[type].form.acBookId = ''
        // }
        kingdeeCodeSave(this[type].form)
          .then((res) => {
            this.$msgSucClose(type === 'editDialog' ? '修改成功！' : '添加成功！')
            this[type].show = false
            this.getData()
          })
          .catch(console.log)
      } else {
        this[type].show = false
      }
    },
    // 单行编辑
    handleSingleEdit(row) {
      this.clearForm(this.editDialog.form)
      Object.assign(this.editDialog.form, row)
      this.editDialog.show = true
    },
  },
}
</script>