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
        <!-- <el-button
          v-if="checkAuth($route.name, 'tab-VS1', 'btn-add')"
          type="primary"
          class="finance-btn"
          size="mini"
          @click="add"
        >新增</el-button>-->
        <el-button
          v-if="checkAuth($route.name, 'tab-VS1', 'btn-async')"
          class="finance-btn"
          size="mini"
          @click="handleSubjectAsync"
        >从金蝶读取科目</el-button>
      </div>
      <div class="money-box-right">
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
      </div>
    </div>
    <!-- <div v-if="isFirst" v-loading="isFirst"></div> -->
    <div class="finance-list-container">
      <!-- <FinanceTable v-if="!isFirst" :option="tableOption" @send-multi="sendMulti" :autoMax="true" /> -->
      <FinanceTable :option="tableOption" @send-multi="sendMulti" :autoMax="true" />
    </div>
    <VoucherDialog
      v-if="editDialog.show"
      :needDimensions="true"
      :option="editDialog"
      @close="dialogClose('editDialog', $event)"
    />
    <VoucherDialog
      v-if="addDialog.show"
      :needDimensions="true"
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
import { subjectList, subjectSave, dimensionList, subjectAsync } from '@/api/fin/acct'

// 核算维度格式
// let aaaa = {
//   dimensions: [
//     { dimensionCode: '1', isRequired: '', seq: '1' },
//     { dimensionCode: '2', isRequired: '', seq: '2' },
//   ],
// }

// 统一设置规则提醒
const ruleMsg = [{ required: true, message: ' ', trigger: 'blur' }]
// 统一设置弹框内表单字段 r表示需要rules d表示需要disabled
const formItem = [
  { label: '科目编码', type: 'input', prop: 'subjectCode', r: true, d: true, callback: true },
  { label: '科目名称', type: 'input', prop: 'subjectName', r: true, d: true },
  { label: '科目全名', type: 'text', prop: 'fullName', d: true, noReq: true, concat: 'subjectName' },
  // { label: '余额方向', type: 'select', prop: 'subjectBalanceType', req: 'direction', r: true, d: true },
  { label: '余额方向', type: 'select', prop: 'direction', propInDict: 'subjectBalanceType', r: true, d: true },
  { label: '核算维度', type: 'add', prop: 'dimensions', req: '_dimensions' },
  // { label: '备注', type: 'textarea', prop: 'feeAmt' },
]
const formData = {}
formItem.forEach((item) => (formData[item.prop] = ''))

export default {
  name: 'VS1',
  label: '会计科目管理',
  mixins: [mixin, mixin2, voucherMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    VoucherDialog,
  },
  data() {
    // 深拷贝弹框内容，并设置需要rules，disabled的地方
    let addDialogItems = []
    let editDialogItems = []
    formItem.map((item) => {
      addDialogItems.push(item.r ? { ...item, rules: ruleMsg } : { ...item })
      item.concat && delete item.concat
      editDialogItems.push(item.d ? { ...item, disabled: true } : item.r ? { ...item, rules: ruleMsg } : { ...item })
    })

    return {
      keyDownActive: true,
      searchOption: {},
      multipleSelection: [],
      tableOption: {},
      addDialog: {
        show: false,
        title: '新增科目',
        formItems: addDialogItems,
        form: { ...formData },
      },
      editDialog: {
        show: false,
        title: '修改科目',
        formItems: editDialogItems,
        form: { ...formData },
      },
      dimensionCfg: {},
      isFirst: true,
    }
  },

  async created() {
    //   dimensions: [
    //     { dimensionCode: '1', isRequired: '', seq: '1' },
    //     { dimensionCode: '2', isRequired: '', seq: '2' },
    //   ],
    this.lsLoading = true
    // await dimensionList({}).then((res) => {
    //   // 0: {dimensionCode: "1", dimensionName: "11"}
    //   res.data.forEach((item) => {
    //     this.$set(this.dimensionCfg, item.dimensionCode, item.dimensionName)
    //   })
    // })
    // 搜索配置
    let searchInputGroup = ['subjectName', 'subjectCode', 'acctSetType']
    this.searchOption = {
      saveDefault: true,
      saveName: 'voucherAccountList',
      plusShow: false,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          subjectName: { label: '科目名称', type: 'input' },
          subjectCode: { label: '科目编码', type: 'input' },
          acctSetType: { label: '内外账类型', type: 'select', prop: 'voucherAcctSetType' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = { ...this.option, id: 'option1', $name: 'accountTab', pagination, selection: false }
    // this.tableOption.operationBtns.data = this.editOperate
    this.tableOption.operationBtns = false
    if (!this.checkAuth(this.$route.name, 'tab-VS1', 'btn-edit')) this.tableOption.operationBtns = false
    // 字典数组转化为对象
    // let directionCfg = {}
    // this.dictMap.debitReditType.forEach((item) => (directionCfg[item.value] = item.label))
    let columns = [
      { prop: 'acctSetType', label: '内外账类型', type: 'select', propInDict: 'voucherAcctSetType', width: 80 },
      { prop: 'accountName', label: '账套', type: 'text', minWidth: 100 },
      { prop: 'subjectCode', label: '科目编号', type: 'text', width: 100 },
      { prop: 'subjectName', label: '科目名称', type: 'text', minWidth: 100 },
      { prop: 'fullName', label: '科目全称', type: 'text', minWidth: 130 },
      { prop: 'isDetail', label: '明细科目', type: 'select', propInDict: 'yesNo', width: 60 },
      { prop: 'isAllCurrency', label: '全部币种', type: 'select', propInDict: 'yesNo', width: 60 },
      {
        prop: 'currencys',
        label: '外币',
        width: 60,
        type: 'text',
        formatter: ({ row }, prop) => {
          return row.currencys
            .map((item) => {
              return item.currency
            })
            .toString()
        },
      },
      { prop: 'toBasicCurrency', label: '转本币核算', type: 'select', propInDict: 'yesNo', width: 100 },
      { prop: 'direction', label: '余额方向', type: 'select', propInDict: 'subjectBalanceType', width: 60 },
      { prop: 'dimensions', label: '核算维度', type: 'text', width: 130 },
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
    async getData(data) {
      this.lsLoading = true
      await dimensionList({}).then((res) => {
        // 0: {dimensionCode: "1", dimensionName: "11"}
        res.data.forEach((item) => {
          this.$set(this.dimensionCfg, item.dimensionCode, item.dimensionName)
        })
      })
      if (data) {
        this.searchBackup = data.query
      }
      data = {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: this.searchBackup || [],
      }
      subjectList(data)
        .then((res) => {
          // 转换核算维度显示格式
          res.data.list.map((item) => {
            item.dimensions = item.dimensions || []
            item._dimensions = item.dimensions
            let arr = item.dimensions.map((item) => ({ ...item }))
            item.dimensions = arr
              .sort((a, b) => a.seq - b.seq)
              .map((item) => this.dimensionCfg[item.dimensionCode] + item.seq)
              .join('/')
            item.dimensions = item.dimensions
          })
          this.tableOption.data = res.data.list
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => {
          this.$nextTick(() => {
            this.isFirst = false
            this.lsLoading = false
          })
        })
    },
    add() {
      this.addDialog.show = true
    },
    //同步金蝶科目
    handleSubjectAsync() {
      this.$confirm('是否确定同步金蝶科目?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        lockScroll: 'true',
        type: 'warning',
      })
        .then(() => {
          return subjectAsync({})
        })
        .then(() => {
          this.getData()
          this.$message({ message: '同步金蝶科目已提交成功', type: 'success' })
        })
        .catch(function () {})
    },
    dialogClose(type, params) {
      if (params === true) {
        // 转换请求参数后 请求
        subjectSave(this.convertReq(this[type]))
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
