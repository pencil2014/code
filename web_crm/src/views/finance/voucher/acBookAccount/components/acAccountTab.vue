<template>
  <div
    class="finance-list-container"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <!-- <div style="height:8px;background:#F8F9FD;"></div> -->
    <div class="money-box">
      <div>
        <el-button
          v-if="checkAuth($route.name, 'tab-acAccount', 'btn-add')"
          type="primary"
          class="finance-btn"
          size="mini"
          @click="add"
        >新增</el-button>
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
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mixin as voucherMixin } from '../../mixin.js'
import { acAccountList, acAccountSave } from '@/api/fin/acct'
import VoucherDialog from '../../components/voucherDialog'

// 统一设置规则提醒
const ruleMsg = [{ required: true, message: ' ', trigger: 'change' }]
export default {
  name: 'acAccount',
  label: '账套管理',
  mixins: [mixin, mixin2, voucherMixin],
  components: {
    FinanceTable,
    VoucherDialog,
  },
  data() {
    return {
      keyDownActive: true,
      tableOption: {},
      addDialog: { show: false, labelWidth: '100px', title: '新增账套', formItems: [], form: {} },
      editDialog: { show: false, labelWidth: '100px', title: '修改账套', formItems: [], form: {} },
    }
  },

  created() {
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = { ...this.option, id: 'option1', $name: 'acBookTab', pagination, selection: false }
    this.tableOption.operationBtns.data = this.editOperate
    if (!this.checkAuth(this.$route.name, 'tab-acAccount', 'btn-edit')) {
      this.tableOption.operationBtns = false
    }
    let columns = [
      { prop: 'accountName', label: '账套名称', type: 'text' },
      { prop: 'kdAccountCode', label: '账套编码', type: 'text' },
      { prop: 'kdOrgId', label: '金蝶组织id', type: 'text' },
      { prop: 'acctSetType', label: '账套类型', type: 'select', propInDict: 'voucherAcctSetType' },
      { prop: 'serviceUrl', label: '服务地址', type: 'text', minWidth: 200 },
      { prop: 'loginName', label: '登录用户名', type: 'text' },
      { prop: 'isDefault', label: '是否默认', type: 'select', propInDict: 'yesNo' },
      { prop: 'createdName', label: '创建人', type: 'text' },
      { prop: 'createdTime', label: '创建时间', type: 'text' },
    ]
    this.tableOption.columns = columns
    this.optionMaxHeight = this.tableOption
    const formItem = [
      { label: '账套名称', type: 'input', prop: 'accountName', r: true, maxlength: '100' },
      { label: '账套编码', type: 'input', prop: 'kdAccountCode', r: true, maxlength: '100' },
      { label: '金蝶组织id', type: 'input', prop: 'kdOrgId', r: true, maxlength: '100' },
      {
        label: '账套类型',
        type: 'select',
        prop: 'acctSetType',
        selectOptions: this.dictMap.voucherAcctSetType.filter((v) => v.value !== 'intexternal'),
        r: true,
      },
      { label: '服务地址', type: 'input', prop: 'serviceUrl', r: true, maxlength: '100' },
      { label: '登录用户名', type: 'input', prop: 'loginName', r: true, maxlength: '100' },
      { label: '密码', type: 'input', prop: 'passwd', r: true, maxlength: '100' },
      { label: '是否默认', type: 'select', prop: 'isDefault', propInDict: 'yesNo', r: true },
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
    this.getData()
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
      acAccountList(data)
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
    // 单行编辑
    handleSingleEdit(row) {
      this.clearForm(this.editDialog.form)
      // this.kdAccountList.splice(0, 1000, { value: row.acKingdeeAccountId, label: row.kdAccountName })
      Object.assign(this.editDialog.form, row)
      this.editDialog.show = true
    },
    dialogClose(type, params) {
      if (params === true) {
        acAccountSave(this[type].form)
          .then((res) => {
            this.$msgSucClose(type === 'editDialog' ? '修改成功！' : '添加成功！')
            this.getData()
            this[type].show = false
          })
          .catch(console.log)
      } else {
        this[type].show = false
      }
    },
  },
}
</script>