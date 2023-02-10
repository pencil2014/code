<template>
  <div
    class="finance-list-container"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div style="height: 8px; background: #f8f9fd"></div>
    <div class="money-box">
      <div class="money-box-left">
        <el-button
          class="finance-btn"
          size="mini"
          @click="multiAudit"
          v-if="checkAuth($route.name, 'tab-preClose2', 'btn-multiAudit')"
          type="primary"
        >批量审批</el-button>
        <el-button
          class="finance-btn"
          size="mini"
          @click="multiExport"
          v-if="checkAuth($route.name, 'tab-preClose2', 'btn-export')"
        >导出</el-button>
      </div>
      <div class="money-box-right">
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
      </div>
    </div>
    <div class="finance-list-container">
      <FinanceTable :option="tableOption" @send-multi="sendMulti" />
    </div>
    <el-dialog
      :title="`${preMultiText}预关账审批`"
      :visible.sync="auditDialog.show"
      width="400px"
      @close="auditDialog.show = false"
    >
      <el-form
        :model="auditForm"
        ref="auditForm"
        :rules="auditRules"
        :label-width="preMulti ? '118px' : '80px'"
        :inline="false"
        size="mini"
        style="padding-top: 16px"
      >
        <el-form-item :label="`${preMultiText}审批状态`" prop="auditStatus">
          <el-radio-group v-model="auditForm.auditStatus">
            <el-radio
              v-for="item in auditDialog.radios"
              :key="item.label"
              :label="item.label"
            >{{ item.key }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="`${preMultiText}审批备注`" prop="auditRemark">
          <el-input
            type="textarea"
            v-model="auditForm.auditRemark"
            placeholder="请输入审批备注"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="sureAudit">确定</el-button>
        <el-button @click="auditDialog.show = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="日志"
      :visible.sync="logDialogShow"
      width="800px"
      @close="logDialogShow = false"
      class="finance-table"
    >
      <div class="title">单号：{{ selectionRow.billNo }}</div>
      <el-table :data="logData" :border="true" class="border-table">
        <el-table-column
          header-align="center"
          v-for="col in logColumns"
          :prop="col.prop"
          :key="col.prop"
          :label="col.label"
          :width="col.width"
          :align="col.prop === 'event' ? 'left' : 'center'"
        >
          <template slot-scope="scope">
            <span :class="['big', col.prop]">{{ scope.row[col.prop] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mixin as voucherMixin } from '@/views/finance/voucher/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import API from '@/api/fin/finClose'
import { departmentTreeList } from '@/api/companyResource'
import { mapState } from 'vuex'
import CustomColumns from '@/components/customColumns/index'

export default {
  name: 'preClose2',
  label: '负利润审批',
  mixins: [mixin, mixin2, voucherMixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
  },
  // inject: ['tabRefresh'],
  activated() {
    // if (this.tabRefresh.audit) {
    //   this.tabRefresh.audit = false
    //   this.handleCurrentChange(1)
    // }
  },
  data() {
    return {
      keyDownActive: true,
      searchOption: {},
      tableOption: {},
      multipleSelection: [],
      selectionRow: {},
      preMulti: false,
      // 审批弹框数据
      auditDialog: {
        show: false,
        radios: [
          { key: '审批通过', label: 'pass' },
          { key: '审批不通过', label: 'refuse' },
        ],
      },
      auditForm: {
        auditStatus: '',
        auditRemark: '',
      },
      auditRules: {
        auditStatus: [{ required: true, message: '请选择状态', trigger: 'blur' }],
        auditRemark: [{ required: true, message: '请输入备注', trigger: 'blur' }],
      },
      // 日志弹框数据
      logDialogShow: false,
      logData: [],
      logColumns: [
        { label: '序号', prop: 'index', width: '50px' },
        { label: '时间', prop: 'createdTime', width: '180px' },
        { label: '操作人', prop: 'createdName' },
        // { label: '审批状态', prop: 'status' },
        { label: '日志内容', prop: 'event', width: '400px' },
      ],
      departmentList: [],
    }
  },
  computed: {
    preMultiText() {
      return this.preMulti ? '批量' : ''
    },
    ...mapState({
      userId: (state) => state.user.userId,
    }),
  },
  created() {
    this.loanBasicData()
    // 搜索配置
    let searchInputGroup = ['billNo', 'settleCompCode', 'dateRange', 'auditStatus']
    this.searchOption = {
      saveDefault: true,
      saveName: 'fincloseAuditList',
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          billNo: { label: '单号', type: 'input' },
          settleCompCode: {
            label: '分公司',
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
          finMon: { label: '财务月份', type: 'month', format: 'yyyy-MM' },
          dateRange: { label: '申请时间', type: 'daterange', format: 'yyyy-MM-dd', keys: ['fromDate', 'toDate'] },
          // dateRange: { label: '财务日期', type: 'monthrange', format: 'yyyy-MM', keys: ['fromFinDate', 'toFinDate'] },
          auditStatus: { label: '审批状态', type: 'select', prop: 'auditStatusNocancel' },
          bizAuditId: {
            label: '审批人',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.listByRole(queryString, item, ''),
            visibleChange: (queryString, item) => this.listByRole(queryString, item, ''),
          },
          bizAuditTime: {
            label: '审批时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
            keys: ['fromBizAuditTime', 'toBizAuditTime'],
          },
          reasonType: { label: '原因分类', type: 'select', prop: 'precloseProfitLossReasonType' },
          deptCode: {
            label: '部门',
            prop: 'deptCode',
            type: 'cascader',
            cascaderList: this.departmentList,
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
            },
          },
          bdEmployeeId: {
            label: '业务员',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.listByRole(queryString, item, ''),
            visibleChange: (queryString, item) => this.listByRole(queryString, item, ''),
          },
          sysLineCode: {
            label: '航线',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.baseSystemLineList(queryString, item),
            visibleChange: (queryString, item) => this.baseSystemLineList(queryString, item),
          },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = {
      ...this.option,
      id: 'option1',
      $name: 'PreCloseAuditTab',
      pagination,
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns,
      },
    }
    this.tableOption.operationBtns = Object.assign({}, this.option.operationBtns, {
      show: true,
      width: '150px',
      data: [
        { label: '详情', show: true, action: 'detail' },
        {
          label: '审批',
          showFn: (row) =>
            (row.bizAuditStatus == 'pending' || !row.bizAuditStatus) &&
            this.checkAuth(this.$route.name, 'tab-preClose2', 'btn-audit'),
          action: 'audit',
        },
        {
          label: '撤回',
          // colorType: 'cancel',
          showFn: (row) => row.bizAuditStatus == 'pending' && row.createdBy == this.userId,
          action: 'cancel',
        },
        { label: '日志', show: true, action: 'log' },
      ],
      callback: (action, index, row) =>
        this.handleEdit(row, action == 'audit' ? '1' : action == 'cancel' ? '2' : action == 'log' ? '3' : '0'),
    })
    let statusCfg = { pass: '审批通过', refuse: '审批不通过' }
    this.selfColumnsBase = [
      // let columns
      {
        prop: 'billNo',
        label: '单号',
        type: 'button',
        width: '130px',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.handleEdit(row)
          },
        },
        showOverflow: false,
      },
      { prop: 'settleCompName', width: 150, label: '分公司' },
      { prop: 'finMon', width: 100, label: '财务月份' },
      { prop: 'bizAuditStatus', width: 100, label: '审批状态', type: 'select', propInDict: 'auditStatusNocancel' },
      { prop: 'createdTime', width: 130, label: '申请时间' },
      { prop: 'bizAuditName', width: 100, label: '审批人' },
      { prop: 'bizAuditTime', width: 130, label: '审批时间' },
      { prop: 'reasonType', minWidth: 90, label: '亏损原因', type: 'select', propInDict: 'precloseProfitLossReasonType' },
      { prop: 'reason', minWidth: 150, label: '申请原因' },
      { prop: 'deptName', width: 130, label: '销售部门' },
      { prop: 'bdEmployeeName', width: 100, label: '销售' }, // label: '销售（BD）'
      { prop: 'bizAuditRemark', minWidth: 150, label: '备注' },
      { prop: 'sysLineName', width: 130, label: '小航线' },
    ]
    this.tableOption.columns = [...this.selfColumnsBase] // columns
    this.columns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.optionMaxHeight = this.tableOption
    // this.getData()
  },
  methods: {
    getData(isSearch) {
      this.lsLoading = true
      let data = this.convertSearch(this.tableOption, this.searchOption)
      data.columns = this.customColumnsKeys
      console.log(data)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      API.precloseApplyList(data)
        .then((res) => {
          let { configColumns } = res.data
          this.columns = configColumns.length > 0 ? configColumns : this.selfColumnsBase.map((item) => item.prop)
          this.tableOption.columns = this.columns.map((prop) => {
            let obj = this.selfColumnsBase.find((item) => item.prop === prop)
            if (obj) {
              return obj
            } else {
              return {}
            }
          })
          this.tableOption.data = res.data.list || []
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    // 行内按钮操作
    handleEdit(row, index) {
      this.selectionRow = row
      // console.log(row)
      if (index === '1') {
        // 审批
        this.initDialog(false)
      } else if (index === '2') {
        // 撤回申请
        this.$confirmWarn('确认撤回申请？', () => {
          API.precloseApplyCancel({ applyId: row.preclosingApplyId }).then((res) => {
            this.$msgSucClose('成功撤回！')
            this.getData()
          })
        })
      } else if (index === '3') {
        // 日志
        this.getLogData()
      } else {
        if (!row.billNo) {
          return this.$msgErrClose('单号不能为空！')
        }
        // this.finance.orderNo = row.billNo
        // this.$emit('update:isJumpRouteFromPage', true)
        // let isFin = row.billType === 'finBill'
        // let name = isFin ? 'FinBillListDetail' : 'OrderFee'
        // let query = isFin ? { finBillNo: row.billNo } : { orderNo: row.billNo, component: 'Fee' }
        // this.$router.push({ name, query })
        this.showOneNoDetail('sourceBizNo', row.billNo, { isTab: true })
      }
    },
    // 行内日志
    getLogData() {
      API.precloseApplyLog({ billNo: this.selectionRow.billNo }).then((res) => {
        this.logData = res.data.map((item, index) => ({ ...item, index }))
        this.logDialogShow = true
      })
    },
    // 批量审批
    multiAudit() {
      if (!this.multipleSelection.length) {
        return this.$msgErrClose('请选择至少一项')
      }
      let arr = this.multipleSelection.filter((item) => item.bizAuditStatus === 'pending' || !item.bizAuditStatus)
      if (!arr.length) {
        return this.$msgErrClose('请选择至少一项是未审批的项')
      }
      this.initDialog(true)
    },
    // 初始化弹框
    initDialog(multi) {
      this.preMulti = multi
      this.auditDialog.show = true
      this.$nextTick(() => {
        this.$refs.auditForm.resetFields()
      })
    },
    // 弹框审批
    sureAudit() {
      this.$refs.auditForm.validate((res) => {
        if (res) {
          if (this.preMulti) {
            let arr = this.multipleSelection.filter((item) => item.bizAuditStatus === 'pending' || !item.bizAuditStatus)
            this.auditForm.applyIds = arr.map((item) => item.preclosingApplyId)
          } else {
            this.auditForm.applyIds = [this.selectionRow.preclosingApplyId]
          }
          this.lsLoading = true
          API.precloseApplyAudit({ ...this.auditForm })
            .then((res) => {
              this.auditDialog.show = false
              this.$msgSucClose('审批成功！')
              this.getData()
            })
            .catch(() => (this.lsLoading = false))
        }
      })
    },
    // 导出
    multiExport() {
      let data = {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: [...(this.searchBackup || [])],
      }
      if (this.multipleSelection.length) {
        data.query = [
          { column: 'preclosingApplyIds', type: 'in', value: this.multipleSelection.map((v) => v.preclosingApplyId).join(',') },
        ]
      }
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'preCloseApplyListExport' })
      this.loading = true
      this.$store
        .dispatch('finance/downloadBlobFilePost', {
          uri: '/fin/common/queryDataExportExcel',
          data: { data },
        })
        .then((res) => {
          this.loading = false
          this.aTagClick(window.URL.createObjectURL(res), '预关账失败审批列表.xlsx')
        })
        .catch(() => (this.loading = false))
    },
    // 部门下拉框
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-list-container ::v-deep {
  .el-button.el-button--text {
    margin-left: 5px;
    margin-right: 5px;
  }
  .el-radio-group {
    .el-radio {
      line-height: 20px !important;
      .el-radio__label {
        padding-left: 4px;
        font-size: 12px;
      }
    }
  }
  .el-form-item__content > div textarea {
    min-height: 60px !important;
  }
}
.el-dialog .title {
  font-size: 12px;
  color: #222222;
  font-weight: bold;
  margin-bottom: 12px;
}
.el-dialog .big {
  padding: 8px 0;
  font-size: 12px;
  &.index {
    color: #bfbfbf;
    font-weight: bold;
  }
}
.el-dialog .el-table.border-table ::v-deep td {
  border-right: 1px solid #ebeef5 !important;
}
.el-dialog .el-form ::v-deep label {
  font-size: 12px !important;
}
</style>