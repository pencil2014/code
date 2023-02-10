<template>
  <div
    class="finance-list-container"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch v-if="searchOption.addFilter" :searchOption="searchOption" @search="search" />
    <div class="money-box">
      <div>
        <el-button
          v-if="checkAuth($route.name, 'tab-VS2', 'btn-add')"
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
      <FinanceTable :option="tableOption" @send-multi="sendMulti" />
    </div>
    <VoucherDialog
      ref="editDialog"
      v-if="editDialog.show"
      :option="editDialog"
      @close="dialogClose('editDialog', $event)"
    />
    <VoucherDialog
      ref="addDialog"
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
import { submatchList, subjectSave, submatchSave } from '@/api/fin/acct'
import { businessServiceList } from '@/api/base'

const MatchType = []
const TypeValue = []
// 统一设置规则提醒
const ruleMsg = [{ required: true, message: ' ', trigger: 'blur' }]
// 统一设置弹框内表单字段 r表示需要rules d表示需要disabled

let BUSINESS = [] // 业务类型
let BOBJ = {} // 业务类型 对象
businessServiceList({}).then((res) => {
  res.data.forEach((item) => {
    item.serviceList.forEach((subItem) => {
      if (!BUSINESS.find((result) => result.serviceCode === subItem.serviceCode)) {
        BUSINESS.push({ ...subItem, label: subItem.serviceName, value: subItem.serviceCode })
        BOBJ[subItem.serviceCode] = subItem.serviceName
      }
    })
  })
})
export default {
  name: 'VS2',
  label: '业务类型科目匹配',
  mixins: [mixin, mixin2, voucherMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    VoucherDialog,
  },
  data() {
    const formItem = [
      // voucher_sub_subject_matchType     subMatchType
      {
        label: '匹配类型',
        type: 'select',
        prop: 'voucherSubSubjectMatchType',
        selectOptions: MatchType,
        req: 'subMatchType',
        r: true,
        d: true,
      },
      //
      // 远程请求  根据匹配类型 'service' 使用 BUSINESS, 'order_biz_type'使用字典 feeListBusinessType ，其它历史数据使用input显示
      {
        label: '业务编码',
        type: 'input',
        prop: 'typeValue',
        r: true,
        selectOptions: TypeValue,
        placeholder: '请先选择匹配类型',
        visibleChange: (string, item, form) => {
          if (!form.voucherSubSubjectMatchType) this.$msgWarnClose('请先选择匹配类型！')
        },
      },
      { label: '子科目', type: 'input', prop: 'subSubjectCode', r: true },
      {
        label: '内外账匹配',
        type: 'select',
        prop: 'acctSetType',
        propInDict: 'voucherAcctSetType',
        r: true,
        default: 'internal',
      },
      // { label: '类型', type: 'select', prop: 'feeName', r: true },
      // { label: '备注', type: 'textarea', prop: 'feeAmt' },
    ]
    const formData = {}
    formItem.forEach((item) => (formData[item.prop] = item.default || ''))
    // 深拷贝弹框内容，并设置需要rules，disabled的地方
    let addDialogItems = []
    let editDialogItems = []
    formItem.map((item) => {
      addDialogItems.push(item.r ? { ...item, rules: ruleMsg } : { ...item })
      editDialogItems.push(item.d ? { ...item, disabled: true } : item.r ? { ...item, rules: ruleMsg } : { ...item })
    })
    return {
      searchOption: {},
      multipleSelection: [],
      tableOption: {},
      addDialog: {
        show: false,
        // padding: '20px 20px 0',
        labelWidth: '100px',
        title: '新增子科目匹配',
        formItems: addDialogItems,
        form: { ...formData },
      },
      editDialog: {
        show: false,
        labelWidth: '100px',
        title: '修改子科目匹配',
        formItems: editDialogItems,
        form: { ...formData },
      },
    }
  },
  watch: {
    // 远程请求  根据匹配类型 'service' 使用 BUSINESS, 'order_biz_type' 字典feeListBusinessType ，其它历史数据使用input显示
    'addDialog.form.voucherSubSubjectMatchType'(val, oldVal) {
      this.addDialog.form.typeValue = ''
      this.$nextTick(() => this.$refs.addDialog.$refs.form && this.$refs.addDialog.$refs.form.clearValidate())
      let find = this.addDialog.formItems.find((item) => item.prop === 'typeValue')
      if (val === 'service' && oldVal !== 'service') {
        this.$set(find, 'type', 'select')
        TypeValue.splice(0, 1000, ...BUSINESS)
      } else if (val === 'order_biz_type' && oldVal !== 'order_biz_type') {
        this.$set(find, 'type', 'select')
        TypeValue.splice(0, 1000, ...this.dictMap.feeListBusinessType)
      } else {
        this.$set(find, 'type', 'input')
      }
    },
    'editDialog.form.voucherSubSubjectMatchType'(val, oldVal) {
      this.addDialog.form.typeValue = ''
      this.$nextTick(() => this.$refs.addDialog.$refs.form && this.$refs.addDialog.$refs.form.clearValidate())
      let find = this.editDialog.formItems.find((item) => item.prop === 'typeValue')
      if (val === 'service' && oldVal !== 'service') {
        this.$set(find, 'type', 'select')
        TypeValue.splice(0, 1000, ...BUSINESS)
      } else if (val === 'order_biz_type' && oldVal !== 'order_biz_type') {
        this.$set(find, 'type', 'select')
        TypeValue.splice(0, 1000, ...this.dictMap.feeListBusinessType)
      } else {
        this.$set(find, 'type', 'input')
      }
    },
  },
  created() {
    console.log(this.dictMap.feeListBusinessType)
    let matchTypeArr = this.dictMap['voucherSubSubjectMatchType'] || []
    MatchType.splice(0, 1000, ...matchTypeArr.filter((v) => ['service', 'order_biz_type'].indexOf(v.value) > -1))
    // 搜索配置
    let searchInputGroup = ['subMatchType',  'typeValue', 'subSubjectCode','acctSetType']
    this.searchOption = {
      saveDefault: true,
      saveName: 'voucherBusinessList',
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          subMatchType: { label: '匹配类型', type: 'select', prop: 'voucherSubSubjectMatchType' },
          subSubjectCode: { label: '子科目', type: 'input' },
          typeValue: { label: '业务编码', type: 'select', selectOptions: [...this.dictMap.feeListBusinessType, ...BUSINESS] },
          acctSetType: { label: '内外账匹配', type: 'select', prop: 'voucherAcctSetType' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = { ...this.option, id: 'option1', $name: 'businessTab', pagination, selection: false }
    this.tableOption.operationBtns.data = this.editOperate
    if (!this.checkAuth(this.$route.name, 'tab-VS2', 'btn-edit')) this.tableOption.operationBtns = false
    let columns = [
      { prop: 'subMatchType', label: '匹配类型', type: 'select', propInDict: 'voucherSubSubjectMatchType' },
      { prop: 'typeValue', label: '业务编码', type: 'select', selectOptions: [...this.dictMap.feeListBusinessType, ...BUSINESS] },
      { prop: 'subSubjectCode', label: '子科目', type: 'text' },
      { prop: 'acctSetType', label: '内外账匹配', type: 'select', propInDict: 'voucherAcctSetType' },
      { prop: 'createdName', label: this.$t('Common.createdBy'), type: 'text' },
      { prop: 'createdTime', label: this.$t('Common.createTime'), type: 'text' },
      { prop: 'updatedName', label: '修改人', type: 'text' },
      { prop: 'updatedTime', label: '修改时间', type: 'text' },
    ]
    this.tableOption.columns = columns
    this.optionMaxHeight = this.tableOption
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
      submatchList(data)
        .then((res) => {
          this.tableOption.data = res.data.list
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    add() {
      this.addDialog.show = true
    },
    // 单行编辑
    handleSingleEdit(row) {
      Object.assign(this.editDialog.form, row)
      // subMatchType 对应字典 voucherSubSubjectMatchType
      if (row.subMatchType) this.editDialog.form.voucherSubSubjectMatchType = row.subMatchType
      this.editDialog.show = true
      this.$nextTick(() => (this.editDialog.form.typeValue = row.typeValue))
    },
    dialogClose(type, params) {
      if (params === true) {
        // 转换请求参数后 请求
        submatchSave(this.convertReq(this[type]))
          .then((res) => {
            type !== 'editDialog' && this.clearAddDialog(this[type])
            this.$message.success(type === 'editDialog' ? this.$t('Hedge.modifyTips') : this.$t('Settle.addSuc'))
            this.getData()
            TypeValue.splice(0, 1000)
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
<style lang="scss" scoped>
.el-select .el-input {
  width: 130px;
}
</style>