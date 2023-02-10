<template>
  <div
    class="finance-list-container"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div style="height:8px;background:#F8F9FD;"></div>
    <div class="money-box">
      <div>
        <el-button
          v-if="checkAuth($route.name, 'tab-preClose1', 'btn-apply')"
          class="finance-btn"
          size="mini"
          @click="multiApply"
          type="primary"
        >申请负利润关账</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-preClose1', 'btn-forceApply')"
          class="finance-btn"
          size="mini"
          @click="dialogShowForcePrecloseHandle"
        >按月预关账</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-preClose1', 'btn-closeRecord')"
          class="finance-btn"
          size="mini"
          @click="precloseByCloseRecord"
        >按单预关账</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-preClose1', 'btn-mngPrecloseByBill')"
          class="finance-btn"
          size="mini"
          @click="mngPrecloseByBill"
          type="primary"
        >强制预关账</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-preClose1', 'btn-export')"
          class="finance-btn"
          size="mini"
          @click="exportBtn"
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
      :title="`${preMultiText}申请负利润关账`"
      :visible.sync="dialogShow"
      width="400px"
      @close="dialogShow = false"
    >
      <el-form
        :model="form"
        ref="form"
        :rules="rules"
        :label-width="preMulti?'118px':'80px'"
        :inline="false"
        size="mini"
        style="padding-top: 16px"
      >
        <el-form-item label="原因分类" prop="reasonType">
          <el-select v-model="form.reasonType" placeholder="请选择原因分类" clearable filterable>
            <el-option
              v-for="item in dictMap['precloseProfitLossReasonType']"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="`${preMultiText}申请原因`" prop="reason">
          <el-input
            type="textarea"
            v-model="form.reason"
            placeholder="请输入申请原因"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="sure">确定</el-button>
        <el-button @click="dialogShow = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="按月预关账"
      :visible.sync="dialogShowForcePreclose"
      width="400px"
      @close="dialogShowForcePreclose = false"
    >
      <el-form
        :model="forcePrecloseForm"
        ref="forcePrecloseForm"
        label-width="100px"
        :inline="false"
        size="small"
        style="padding-top: 16px"
      >
        <el-form-item label="预关账分公司" prop="settleCompName">
          <el-input style="width:250px" v-model="forcePrecloseForm.settleCompName" disabled></el-input>
        </el-form-item>
        <el-form-item label="财务月份" prop="finMon">
          <el-date-picker
            style="width:250px"
            v-model="forcePrecloseForm.finMon"
            type="month"
            value-format="yyyy-MM"
            placeholder="请选择日期"
            disabled
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="btnLoading1" type="primary" size="mini" @click="forcePrecloseSubmit">确定</el-button>
        <el-button @click="dialogShowForcePreclose = false" size="mini">取消</el-button>
      </span>
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
import { mapState } from 'vuex'
import { departmentTreeList } from '@/api/companyResource'
import CustomColumns from '@/components/customColumns/index'

export default {
  name: 'preClose1',
  label: '预关账失败',
  mixins: [mixin, mixin2, voucherMixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
  },
  inject: ['tabRefresh'],
  activated() {
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    if (this.tabRefresh.pre) {
      this.tabRefresh.pre = false
      !this.isFirstGetData && this.handleCurrentChange(1)
    }
  },
  data() {
    return {
      keyDownActive: true,
      searchOption: {},
      tableOption: {},
      multipleSelection: [],
      selectionRow: {},
      // 申请弹框数据
      dialogShow: false,
      form: {
        reason: '',
        reasonType: '',
      },
      rules: {
        reason: [{ required: true, message: ' ', trigger: 'blur' }],
        reasonType: [{ required: true, message: ' ', trigger: 'blur' }],
      },
      preMulti: false,
      dialogShowForcePreclose: false,
      forcePrecloseForm: {
        settleCompName: '',
        settleCompCode: '',
        finMon: '',
      },
      departmentListO: [],
      departmentListB: [],
      departmentListOBD: [],
    }
  },
  computed: {
    preMultiText() {
      return this.preMulti ? '批量' : ''
    },
    ...mapState({
      finance: (state) => state.finance,
    }),
  },
  created() {
    this.loanBasicData()
    // 搜索配置
    let searchInputGroup = ['bizNo', 'bdEmployeeId', 'planCloseDate']
    this.searchOption = {
      saveDefault: true,
      saveName: 'fincloseList',
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 3,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          bizNo: { label: '单号', type: 'input' },
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
          dateRange: { label: '更新时间', type: 'daterange', format: 'yyyy-MM-dd', keys: ['fromFinDate', 'toFinDate'] },
          finMon: { label: '财务月份', type: 'month', format: 'yyyy-MM' },
          planCloseDate: { label: '预计预关账时间', type: 'daterange', format: 'yyyy-MM-dd', keys: ['fromPlanCloseDate', 'toPlanCloseDate'] },
          // TODO
          deptCode: {
            label: 'BD部门',
            prop: 'deptCode',
            type: 'cascader',
            cascaderList: this.departmentListB,
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
            },
          },
          bdEmployeeId: {
            label: '销售（BD）',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.listByRole(queryString, item, ''), // 'bd'
            visibleChange: (queryString, item) => this.listByRole(queryString, item, ''), // 'bd'
          },
          obdDeptCode: {
            label: 'OBD部门',
            prop: 'deptCode',
            type: 'cascader',
            cascaderList: this.departmentListOBD,
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
            },
          },
          obdEmployeeId: {
            label: '销售助理（OBD）',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.listByRole(queryString, item, ''), // 'obd'
            visibleChange: (queryString, item) => this.listByRole(queryString, item, ''), // 'obd'
          },
          // opDeptCode: {
          //   label: '操作员部门',
          //   prop: 'deptCode',
          //   type: 'cascader',
          //   cascaderList: this.departmentListO,
          //   cascaderProps: {
          //     children: 'childList',
          //     label: 'deptCname',
          //     value: 'deptCode',
          //     checkStrictly: true,
          //   },
          // },
          opEmployeeId: {
            label: '操作员',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.listByRole(queryString, item, ''), // 'op'
            visibleChange: (queryString, item) => this.listByRole(queryString, item, ''), // 'op'
          },
          cscEmployeeId: {
            label: '单证',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.listByRole(queryString, item, ''), // 'csc'
            visibleChange: (queryString, item) => this.listByRole(queryString, item, ''), // 'csc'
          },
          docEmployeeId: {
            label: '文件',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.listByRole(queryString, item, ''), // 'doc'
            visibleChange: (queryString, item) => this.listByRole(queryString, item, ''), // 'doc'
          },
          sysLineCode: {
            label: '航线',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.baseSystemLineList(queryString, item),
            visibleChange: (queryString, item) => this.baseSystemLineList(queryString, item),
          },
          precloseStatus: { label: '是否已预关账', type: 'select', prop: 'yesNo' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = { ...this.option, id: 'option1', $name: 'PreCloseListTab', pagination,
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns
      },
      sortable: true,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
    }
    this.tableOption.operationBtns.width = '160'
    this.tableOption.operationBtns.data = [
      {
        label: '详情',
        type: 'text',
        show: true,
        action: 'showDetail',
      },
      {
        label: '申请负利润关账',
        type: 'text',
        showFn: (row) => {
          // UI看到单个按钮的表象，希望调窄
          if (this.tableOption.data.some(row => (row.errorType || '').toUpperCase() === 'PROFIT_LOSS' &&
          !row.bizAuditStatus &&
          this.checkAuth(this.$route.name, 'tab-preClose1', 'btn-apply'))) {
            this.tableOption.operationBtns.width = '160'
          } else {
            this.tableOption.operationBtns.width = '80'
          }
          return (row.errorType || '').toUpperCase() === 'PROFIT_LOSS' &&
          !row.bizAuditStatus &&
          this.checkAuth(this.$route.name, 'tab-preClose1', 'btn-apply')
        },
        action: 'Edit',
      },
    ]
    this.selfColumnsBase = [ // let columns
      {
        prop: 'billNo',
        label: '单号',
        width: 130,
        type: 'button', sortable: false,
        callback: (row) => {
          this.showDetail(row)
        },
      },
      { prop: 'settleCompName', width: 150, label: '分公司', sortable: false },
      { prop: 'bizDate', width: 100, label: '业务日期', sortable: false },
      { prop: 'finMon', width: 80, label: '财务月份', sortable: false },
      { prop: 'planCloseDate', label: '预计预关账时间', minWidth: 130 },
      {
        prop: 'dateRange',
        label: '关账时间段',
        width: 160, sortable: false,
        formatter: ({ row }) => {
          return row.feeFromDate + ' ~ ' + row.feeToDate
        },
      },
      { prop: 'createdTime', width: 130, label: '更新时间', sortable: false },
      { prop: 'createdName', width: 130, label: '关账人', sortable: false },
      { prop: 'errorReason', label: '失败原因', minWidth: 200, sortable: false },
      { prop: 'deptName', width: 130, label: 'BD部门', sortable: false },
      { prop: 'bdEmployeeName', label: '销售（BD）', width: 100, sortable: false },
      { prop: 'obdDeptName', width: 130, label: 'OBD部门' },
      { prop: 'obdEmployeeName', label: '销售助理（OBD）', width: 100 },
      { prop: 'opDeptName', width: 130, label: '操作员部门', sortable: false },
      { prop: 'opEmployeeName', label: '操作员', width: 100 },
      { prop: 'cscDeptName', label: '单证部门', width: 110, sortable: false },
      { prop: 'cscEmployeeName', label: '单证', width: 100, sortable: false },
      { prop: 'docDeptName', label: '文件部门', width: 110 },
      { prop: 'docEmployeeName', label: '文件', width: 100 },
      { prop: 'precloseStatus', label: '是否已预关账', width: 100, type: 'select', propInDict: 'yesNo', sortable: false },
      { prop: 'sysLineName', width: 130, label: '航线', sortable: false },
    ]
    this.tableOption.columns = [ ...this.selfColumnsBase ] // columns
    this.columns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.optionMaxHeight = this.tableOption
    // this.getData()
  },
  methods: {
    getData(isSearch) {
      this.lsLoading = true
      let data = this.convertSearch(this.tableOption, this.searchOption)
      Object.assign(data, {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        columns: this.customColumnsKeys
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      API.failPreclosingList(data)
        .then((res) => {
          this.finCommonColumns(res, 'tableOption')
          // let { configColumns } = res.data
          // this.columns = configColumns.length > 0 ? configColumns : this.selfColumnsBase.map(item => item.prop)
          // this.columns = [...this.columns]
          // this.tableOption.columns = this.columns.map(prop => {
          //   let obj = this.selfColumnsBase.find(item => item.prop === prop)
          //   if (obj) {
          //     return obj
          //   } else {
          //     return {}
          //   }
          // })
          this.tableOption.data = res.data.list || []
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    // 批量申请
    multiApply() {
      if (!this.multipleSelection.length) {
        return this.$msgErrClose('请选择至少一项')
      }
      if (!this.multipleSelection.find((row) => (row.errorType || '').toUpperCase() === 'PROFIT_LOSS')) {
        return this.$msgErrClose('请选择有负利润原因的失败记录')
      }
      this.initDialog(true)
    },
    // 单个申请
    handleEdit(row) {
      this.selectionRow = row
      this.initDialog(false)
    },
    // 初始化弹框
    initDialog(multi) {
      this.preMulti = multi
      this.dialogShow = true
      this.$nextTick(() => {
        this.$refs.form.resetFields()
      })
    },
    // 跳转至详情页
    showDetail(row) {
      if (!row.billNo) {
        return this.$message.error('单号不能为空！')
      }
      this.showOneNoDetail('sourceBizNo', row.billNo, { isTab: true })
    },
    // 弹框内确定按钮
    sure() {
      this.$refs.form.validate((res) => {
        if (res) {
          if (this.preMulti) {
            this.form.preclosingIds = this.multipleSelection
              .filter((row) => (row.errorType || '').toUpperCase() === 'PROFIT_LOSS')
              .map((item) => item.finPreclosingId)
          } else {
            this.form.preclosingIds = [this.selectionRow.finPreclosingId]
          }
          this.lsLoading = true
          API.precloseApply({ ...this.form })
            .then((res) => {
              this.getData()
              this.dialogShow = false
              this.tabRefresh.audit = true
              this.$msgSucClose('申请关账成功！')
            })
            .catch(() => (this.lsLoading = false))
        }
      })
    },
    // 强制预关账
    forcePrecloseSubmit() {
      // console.log(this.forcePrecloseForm);
      // return
      this.$refs.forcePrecloseForm.validate((res) => {
        if (res) {
          this.btnLoading1 = true
          API.forcePreclose(this.forcePrecloseForm)
            .then((res) => {
              this.btnLoading1 = false
              this.dialogShowForcePreclose = false
              this.$msgSucClose('强制预关账成功！')
              this.getData()
            })
            .catch(() => (this.btnLoading1 = false))
        }
      })
    },
    dialogShowForcePrecloseHandle() {
      let userInfo = this.$store.state.user.userInfo
      API.getSysDate({ settleCompCode: userInfo.settleCompanyCode }).then((res) => {
        this.forcePrecloseForm.finMon = res.data.finMon
      })
      this.dialogShowForcePreclose = true
      this.$nextTick(() => {
        this.forcePrecloseForm.settleCompName = userInfo.settleCompanyName
        this.forcePrecloseForm.settleCompCode = userInfo.settleCompanyCode
      })
    },
    precloseByCloseRecord() {
      if (!this.multipleSelection.length) {
        return this.$msgErrClose('请选择至少一项')
      }
      this.$confirmWarn('确认进行按单预关账？', () => {
        let preclosingIds = this.multipleSelection.map((v) => v.finPreclosingId)
        API.precloseByCloseRecord({ preclosingIds }).then((res) => {
          this.$msgSucClose('操作成功！')
          this.getData()
        })
      })
    },
    mngPrecloseByBill() {
      if (!this.multipleSelection.length) {
        return this.$msgErrClose('请选择至少一项')
      }
      this.$confirmWarn('确认进行强制预关账？', () => {
        let orderNos = [...new Set(this.multipleSelection.map((v) => v.billNo))]
        let settleCompCode = [...new Set(this.multipleSelection.map((v) => v.settleCompCode))]
        if (settleCompCode.length > 1) {
          return this.$msgErrClose('请选择同一个结算分公司进行操作！')
        }
        API.mngPrecloseByBill({ orderNos, settleCompCode: settleCompCode[0] }).then((res) => {
          this.$msgSucClose('操作成功！')
          this.getData()
        })
      })
    },
    // 部门下拉框
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        let resData1 = JSON.parse(JSON.stringify(res.data || []))
        let resData2 = JSON.parse(JSON.stringify(res.data || []))
        let resData3 = JSON.parse(JSON.stringify(res.data || []))
        this.departmentListO.splice(0, 1000, ...this.getTreeData(resData1))
        this.departmentListB.splice(0, 1000, ...this.getTreeData(resData2))
        this.departmentListOBD.splice(0, 1000, ...this.getTreeData(resData3))
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
    },
    exportBtn() {
      let data = {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: [...(this.searchBackup || [])],
      }
      if (this.multipleSelection.length) {
        data.query = [
          { column: 'finPreclosingIds', type: 'in', value: this.multipleSelection.map((v) => v.finPreclosingId).join(',') },
        ]
      }
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'failPreclosingListExport' })

      this.loading = true
      this.$store
        .dispatch('finance/downloadBlobFilePost', {
          uri: '/fin/common/queryDataExportExcel',
          data: { data },
        })
        .then((res) => {
          this.loading = false
          this.aTagClick(window.URL.createObjectURL(res), '预关账失败列表.xlsx')
        })
        .catch(() => (this.loading = false))
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-list-container ::v-deep {
  .el-button.el-button--text {
    margin-left: 6px;
    margin-right: 6px;
  }

  .el-form-item__content > div {
    width: 100%;
    textarea {
      min-height: 60px !important;
    }
  }
}
</style>