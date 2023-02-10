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
      <el-button
        v-if="checkAuth($route.name, 'tab-VS6', 'btn-add')"
        type="primary"
        class="finance-btn"
        size="mini"
        @click="add"
      >{{$t('Common.add')}}</el-button>

      <div class="money-box-right">
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
      </div>
    </div>
    <div class="finance-list-container">
      <FinanceTable :option="tableOption" @send-multi="sendMulti" />
    </div>
    <!-- v-if="editDialog.show" -->
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
import { sceneGroupBookList, sceneGroupBookSave, acBookList } from '@/api/fin/acct'
let ACLIST = []
let SGLIST = []
export default {
  name: 'VS6',
  label: '场景关联账簿',
  hide: true,
  mixins: [mixin, mixin2, voucherMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    VoucherDialog,
  },
  data() {
    return {
      searchOption: {},
      tableOption: {},
      addDialog: {
        show: false,
        // padding: '20px 20px 0',
        labelWidth: '100px',
        title: '新增场景分组关联账簿',
        formItems: [],
        form: {},
      },
      editDialog: {
        show: false,
        labelWidth: '100px',
        title: '修改场景分组关联账簿',
        formItems: [],
        form: {},
      },
    }
  },

  created() {
    this.lsLoading = true
    // 凭证场景分组
    this.sceneGroupList().then((list) => {
      SGLIST.splice(0, 100, ...list)
    })
    // 账簿名称
    this.acBookList().then((list) => {
      ACLIST.splice(0, 100, ...list.map((item) => ({ ...item, value: item.acBookId })))
    })
    // 统一设置规则提醒
    const ruleMsg = [{ required: true, message: ' ', trigger: 'change' }]
    // 统一设置弹框内表单字段 r表示需要rules d表示需要disabled
    const formItem = [
      {
        label: '凭证场景分组',
        prop: 'acSceneGroupId',
        type: 'select',
        // remote: true,
        r: true,
        selectOptions: SGLIST,
        // remoteMethod: (queryString, item) => {},
      },
      // {
      //   label: '凭证场景分组',
      //   type: 'autocomplete',
      //   prop: 'groupName',
      //   req: 'acSceneGroupId',
      //   r: true,
      //   querySearch: (queryString, cb, formItems) => {
      //     this.sceneGroupList(queryString, cb)
      //   },
      //   select: (optionItem, form) => {
      //     form.acSceneGroupId = optionItem.key
      //   },
      // },
      {
        label: '分公司名称',
        type: 'autocomplete',
        prop: 'settleCompName',
        req: 'settleCompCode',
        r: true,
        querySearch: (queryString, cb) => {
          this.querySettleUnit({ queryString, unitTypes: 'company', isAdd: true }, cb)
        },
        select: (optionItem, form) => {
          form.settleCompCode = optionItem.key
        },
      },
      {
        label: '账簿名称',
        prop: 'acBookId',
        type: 'select',
        remote: true,
        r: true,
        selectOptions: [],
        remoteMethod: (value, item) => {
          let data = { currPage: 1, pageSize: 50, query: [] }
          if (value) {
            data.query.push({ column: 'bookName', type: 'like', value })
          }
          acBookList(data).then((res) => {
            let list = res.data?.list || []
            list = list.map((v) => ({ ...v, value: v.acBookId, key: v.bookName, label: v.bookName }))
            item.selectOptions.splice(0, 100, ...list)
          })
        },
      },
      // {
      //   label: '账簿名称',
      //   type: 'autocomplete',
      //   prop: 'bookName',
      //   req: 'acBookId',
      //   r: true,
      //   querySearch: (queryString, cb) => {
      //     this.acBookList(queryString, cb)
      //   },
      //   select: (optionItem, form) => {
      //     form.acBookId = optionItem.key
      //   },
      // },
      // { label: '类型', type: 'select', prop: 'feeName', r: true },
      // { label: '备注', type: 'textarea', prop: 'feeAmt' },
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

    // 搜索配置
    // let searchColumns = [
    //   {
    //     label: '业务类型名称',
    //     prop: 'orderNo',
    //     type: 'input',
    //   },
    //   {
    //     label: '业务类型编码',
    //     prop: 'orderNo2',
    //     type: 'input',
    //   },
    // ]
    // this.searchOption = this.initSearchOption(searchColumns)

    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = { ...this.option, id: 'option1', $name: 'sceneGroupBookTab', pagination, selection: false }
    this.tableOption.operationBtns.data = this.editOperate
    if (!this.checkAuth(this.$route.name, 'tab-VS6', 'btn-edit')) this.tableOption.operationBtns = false
    let columns = [
      { prop: 'groupName', label: '分组名称', type: 'text' },
      { prop: 'groupRemark', label: '分组名称描述', type: 'text' },
      { prop: 'settleCompName', label: '分公司名称', type: 'text' },
      { prop: 'settleCompCode', label: '分公司编码', type: 'text' },
      { prop: 'bookName', label: '账簿名称', type: 'text' },
      { prop: 'kdCode', label: '账簿金蝶编码', type: 'text' },
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
      sceneGroupBookList(data)
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
        sceneGroupBookSave(this.convertReq(this[type]))
          .then((res) => {
            type !== 'editDialog' && this.clearAddDialog(this[type])
            this.$message.success(type === 'editDialog' ? this.$t('Hedge.modifyTips') : this.$t('Settle.addSuc'))
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
      Object.assign(this.editDialog.form, row)
      acBookList({ currPage: 1, pageSize: 10, query: [{ column: 'bookName', type: 'eq', value: row.bookName }] }).then((res) => {
        if (res.data && res.data.list && res.data.list[0]) {
          this.editDialog.form.acBookId = res.data.list[0].acBookId
        } else {
          this.editDialog.form.acBookId = ''
        }
      })
      // console.log(this.editDialog.form)
      this.editDialog.show = true
    },
  },
}
</script>
<style lang="scss" scoped>
.el-select .el-input {
  width: 130px;
}
</style>