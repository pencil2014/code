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
      <el-button
        v-if="checkAuth($route.name, 'tab-VS5', 'btn-add')"
        type="primary"
        class="finance-btn"
        size="mini"
        @click="add"
      >新增</el-button>

      <div class="money-box-right">
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
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
import { feeItemSubjectList, feeItemSubjectSave } from '@/api/fin/acct'
let FEELIST = []
let ITEMLIST = []
export default {
  name: 'VS5',
  label: '费用项科目管理',
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
      addDialog: {
        // padding: '0 10px',
        labelWidth: '108px',
        show: false,
        title: '新增费用项科目',
        formItems: [],
        form: {},
      },
      editDialog: {
        // padding: '0 10px',
        labelWidth: '108px',
        show: false,
        title: '修改费用项科目',
        formItems: [],
        form: {},
      },
    }
  },

  created() {
    this.lsLoading = true
    // 初始化费用分类名称
    this.feeitemFinGroup().then((list) => FEELIST.splice(0, 1000, ...list))
    // 初始化费用
    this.queryFeeItemList({ queryString: '', size: 1000 }).then((list) => {
      // console.log(list)
      ITEMLIST.splice(0, 1000, ...[{ label: '*', value: '*' }, ...list])
    })
    /******************************************   对话框form配置  *********************************************/
    // 统一设置规则提醒
    const ruleMsg = [{ required: true, message: ' ', trigger: 'blur' }]
    // 统一设置弹框内表单字段 r表示需要rules d表示需要disabled
    const formItem = [
      {
        label: '费用分类名称',
        prop: 'feeFinGroup',
        type: 'select',
        // selectOptions: FEELIST,
        r: true,
        d: true,
        rules: [{ ...ruleMsg[0], trigger: 'change' }],
        selectOptions: [],
        remote: true,
        remoteMethod: (queryString, item, data) => {
          this.feeitemFinGroup().then((list) => {
            item.selectOptions.splice(0, 1000, ...list)
          })
        },
        visibleChange: (queryString, item, data) => {
          this.queryFeeItemList().then((list) => {
            item.selectOptions.splice(0, 1000, ...list)
          })
        },
      },
      {
        label: '费用',
        prop: 'feeCode',
        // req: '_feeCode',
        type: 'select',
        remote: true,
        filterable: true,
        default: '*',
        rules: [{ ...ruleMsg[0], trigger: 'change' }],
        // selectOptions: ITEMLIST,
        selectOptions: [],
        remoteMethod: (queryString, item, data) => {
          this.queryFeeItemList({ queryString, size: 1000 }).then((list) => {
            item.selectOptions.splice(0, 1000, { label: '*', value: '*' }, ...list)
          })
        },
        visibleChange: (queryString, item, data) => {
          this.queryFeeItemList({ queryString, size: 1000 }).then((list) => {
            item.selectOptions.splice(0, 1000, { label: '*', value: '*' }, ...list)
          })
        },
        clear: (form, prop) => {
          form.feeCode = '*'
        },
      },
      { label: '收付类型', type: 'select', prop: 'receipayGroup' },
      { label: '科目编码', type: 'input', prop: 'subjectCode' },
      { label: '子科目匹配', type: 'select', prop: 'subMatchType', propInDict: 'voucherSubSubjectMatchType' },
      {
        label: '内外账匹配',
        type: 'select',
        prop: 'acctSetType',
        propInDict: 'voucherAcctSetType',
        r: true,
        default: 'internal',
      },
    ]
    const formData = {}
    formItem.forEach((item) => (formData[item.prop] = item.default || ''))
    this.addDialog.form = { ...formData }
    this.editDialog.form = { ...formData }
    // 深拷贝弹框内容，并设置需要rules，disabled的地方
    let addDialogItems = []
    let editDialogItems = []
    formItem.forEach((item) => {
      addDialogItems.push(item.r ? { rules: ruleMsg, ...item } : { ...item })
      editDialogItems.push(item.d ? { ...item, disabled: true } : item.r ? { rules: ruleMsg, ...item } : { ...item })
    })
    this.addDialog.formItems = addDialogItems
    this.editDialog.formItems = editDialogItems
    /******************************************  搜索   *********************************************/

    // 搜索配置
    let searchInputGroup = ['dateRange', 'feeFinGroup', 'feeCode']
    this.searchOption = {
      saveDefault: true,
      saveName: 'voucherFeeList',
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          dateRange: { label: '创建时间', type: 'daterange', keys: ['startDate', 'endDate'] },
          feeFinGroup: {
            label: '费用分类名称',
            type: 'select',
            selectOptions: FEELIST,
            filterable: true,
            visibleChange: (queryString, item, data) => {
              this.queryFeeItemList().then((list) => {
                item.selectOptions.splice(0, 1000, ...list)
              })
            },
          },
          feeCode: {
            label: '费用',
            type: 'select',
            selectOptions: ITEMLIST,
            filterable: true,
            visibleChange: (queryString, item, data) => {
              this.queryFeeItemList({ queryString: '', size: 1000 }).then((list) => {
                item.selectOptions.splice(0, 1000, { label: '*', value: '*' }, ...list)
              })
            },
          },
        },
        acctSetType: { label: '内外账匹配', type: 'select', prop: 'voucherAcctSetType' },
      },
    }
    /******************************************  表格配置   *********************************************/
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = { ...this.option, id: 'option1', $name: 'VoucherSettingFeeTab', pagination, selection: false }
    this.tableOption.operationBtns.data = this.editOperate
    if (!this.checkAuth(this.$route.name, 'tab-VS5', 'btn-edit')) this.tableOption.operationBtns = false
    let columns = [
      { prop: 'feeFinGroupName', label: '费用分类名称', type: 'text', width: 100 },
      { prop: 'feeCode', label: '费用编码', type: 'text', width: 100 },
      { prop: 'feeName', label: '费用名称', type: 'text', width: 100 },
      { prop: 'receipayGroup', label: '收付类型', type: 'select', width: 60 },
      { prop: 'subjectCode', label: '科目编码', type: 'text', width: 80 },
      { prop: 'subjectFullName', label: '科目名称', type: 'text', width: 100 },
      { prop: 'subMatchType', label: '子科目匹配', type: 'select', propInDict: 'voucherSubSubjectMatchType', width: 100 },
      { prop: 'acctSetType', label: '内外账匹配', type: 'select', propInDict: 'voucherAcctSetType', width: 100 },
      { prop: 'createdName', label: '创建人', type: 'text', width: 100 },
      { prop: 'createdTime', label: '创建时间', type: 'text', width: 130 },
      { prop: 'updatedName', label: '修改人', type: 'text', width: 100 },
      { prop: 'updatedTime', label: '修改时间', type: 'text', width: 130 },
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
      feeItemSubjectList(data)
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
    dialogClose(type, params) {
      // console.log(this.convertReq(this[type]))
      // return
      if (params === true) {
        // 转换请求参数后 请求
        feeItemSubjectSave(this.convertReq(this[type]))
          .then((res) => {
            type !== 'editDialog' && this.clearAddDialog(this[type])
            this.$message.success(type === 'editDialog' ? '修改成功！' : '添加成功！')
            this[type].show = false
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