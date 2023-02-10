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
      <div></div>
      <div class="money-box-right">
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
      </div>
    </div>
    <div class="finance-list-container">
      <FinanceTable :option="tableOption" @send-multi="sendMulti" />
    </div>
    <PreviewDialog
      ref="PreviewDialog"
      :dialogOption="previewDialog"
      @close="dialogClose('previewDialog')"
      :showDel="checkAuth($route.name, 'tab-preClose3', 'btn-voucherDel')"
      :showCreate="checkAuth($route.name, 'tab-preClose3', 'btn-voucherCreate')"
      @generate="(type, isAll) => generateVoucher('PreviewDialog', type, isAll)"
    />

    <!-- <PreviewDialog :dialogOption="previewDialog" @close="dialogClose('previewDialog')" /> -->
    <el-dialog
      :title="dialogForcePrecloseTitle"
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
        <el-form-item label="分公司" prop="settleCompName">
          <el-input style="width:250px" v-model="forcePrecloseForm.settleCompName" disabled></el-input>
        </el-form-item>
        <el-form-item
          label="财务月份"
          prop="finMon"
          :rules="{message: ' ', required: true, triggers: 'change,blur'}"
        >
          <el-date-picker
            style="width:250px"
            v-model="forcePrecloseForm.finMon"
            type="month"
            value-format="yyyy-MM"
            placeholder="请选择日期"
            :pickerOptions="{disabledDate:(nowDate)=>+new Date() - nowDate <= 0}"
            :clearable="true"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :disabled="lsLoading" type="primary" size="mini" @click="forcePrecloseSubmit">确定</el-button>
        <el-button :disabled="lsLoading" @click="dialogShowForcePreclose = false" size="mini">取消</el-button>
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
import { batchDeleteShiftVoucher } from '@/api/fin/voucher'
import { mapState } from 'vuex'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import { departmentTreeList } from '@/api/companyResource'
import CustomColumns from '@/components/customColumns/index'

export default {
  name: 'preClose3',
  label: '预关账成功',
  // hide: true,
  mixins: [mixin, mixin2, voucherMixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    PreviewDialog,
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
      this.handleCurrentChange(1)
    }
  },
  data() {
    return {
      keyDownActive: true,
      searchOption: {},
      tableOption: {},
      preMulti: false,
      previewDialog: {
        show: false,
        title: '凭证预览',
        seqNo: '',
        showData: '',
      },
      dialogForcePrecloseTitle: '',
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
  watch: {
    'previewDialog.show'(val) {
      !val && this.previewDialog._refresh && this.getData()
      this.previewDialog._refresh = false
    },
  },
  computed: {
    ...mapState({
      finance: (state) => state.finance,
      userInfo: (state) => state.user.userInfo,
    }),
  },
  created() {
    this.loanBasicData()
    // 搜索配置
    let searchInputGroup = ['bizNo', 'settleCompCode', 'finMon', 'voucherStatus', 'planCloseDate']
    this.searchOption = {
      saveDefault: true,
      saveName: 'fincloseSuccessList',
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
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
          finMon: { label: '财务月份', type: 'month', format: 'yyyy-MM' },
          planCloseDate: {
            label: '预计预关账时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
            keys: ['fromPlanCloseDate', 'toPlanCloseDate'],
          },
          // finMonth: { label: '财务月份', type: 'daterange', format: 'yyyy-MM-dd', keys: ['fromFinDate', 'toFinDate'] },
          // finMonth: { label: '财务月份', type: 'daterange', format: 'yyyy-MM-dd', keys: ['fromFinDate', 'toFinDate'] },
          // dateRange: { label: '预关账时间', type: 'daterange', format: 'yyyy-MM-dd', keys: ['fromFinDate', 'toFinDate'] },
          // voucherNo: { label: '凭证号', type: 'input' },
          // needShiftAccount: { label: '需要生成凭证', prop: 'yesNo', type: 'select' },
          // voucherStatus: { label: '凭证状态', type: 'select', prop: 'voucherStatus' },
          sysLineCode: {
            label: '航线',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.baseSystemLineList(queryString, item),
            visibleChange: (queryString, item) => this.baseSystemLineList(queryString, item),
          },
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
            remoteMethod: (queryString, item) => this.listByRole(queryString, item, ''), //'bd'
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
            remoteMethod: (queryString, item) => this.listByRole(queryString, item, ''), // op
            visibleChange: (queryString, item) => this.listByRole(queryString, item, ''), // op
          },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = {
      ...this.option,
      id: 'option1',
      $name: 'PreCloseSuccessTab',
      pagination,
      needTimeSort: true,
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns,
      },
    }

    this.tableOption.operationBtns.show = false
    // this.tableOption.selection.show = false
    this.selfColumnsBase = [
      // let columns
      {
        prop: 'billNo',
        label: '单号',
        width: '160px',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.showDetail(row)
          },
        },
      },
      { prop: 'settleCompName', label: '分公司', minWidth: 130 },
      { prop: 'finMon', width: 100, label: '财务月份' },
      { prop: 'bizDate', label: '业务日期', minWidth: 130 },
      { prop: 'planCloseDate', label: '预计预关账时间', minWidth: 130 },
      { prop: 'createdTime', label: '实际预关账时间', minWidth: 130 },
      {
        prop: 'closeStatus',
        label: '预关账状态',
        width: 100,
        formatter: ({ row }) => (row.closeStatus == 'yes' ? '预关账成功' : ''),
      },
      {
        prop: 'delayDays',
        label: '超预关账天数',
        type: 'text',
        minWidth: 90,
        formatter: ({ row }) => {
          let t1 = row.createdTime
          let t2 = row.planCloseDate
          if (!t1 || !t2) {
            return ''
          } else {
            t1 = new Date(t1.split(' ')[0].replace('-', '/') + ' 00:00:00')
            t2 = new Date(t2.replace('-', '/') + ' 00:00:00')
            return (t1.getTime() - t2.getTime()) / (24 * 3600 * 1000)
          }
        },
      },
      {
        prop: 'feeFromDate',
        label: '关账时间段',
        width: 180,
        formatter: ({ row }) => row.feeFromDate + ' ~ ' + row.feeToDate,
      },
      { prop: 'deptName', width: 130, label: 'BD部门' },
      { prop: 'bdEmployeeName', label: '销售（BD）', width: 130 },
      { prop: 'obdDeptName', width: 130, label: 'OBD部门' },
      { prop: 'obdEmployeeName', label: '销售助理（OBD）', width: 130 },
      { prop: 'opDeptName', width: 130, label: '操作员部门' },
      { prop: 'opEmployeeName', label: '操作员', width: 130 },
      { prop: 'createdName', label: '关账人', width: 130 },
      { prop: 'sysLineName', width: 130, label: '航线' },
    ]
    this.tableOption.columns = [...this.selfColumnsBase] // columns
    this.columns.push(...this.selfColumnsBase.map((item) => item.prop).filter((v) => v))
    this.optionMaxHeight = this.tableOption
    // this.getData()
  },
  methods: {
    getData(isSearch) {
      if (this.debounceLsFn()) return
      this.lsLoading = true
      let data = this.convertSearch(this.tableOption, this.searchOption)
      data.columns = this.customColumnsKeys
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      API.preclosingList(data)
        .then((res) => {
          let { configColumns } = res.data
          this.columns = configColumns.length > 0 ? configColumns : this.selfColumnsBase.map((item) => item.prop)
          this.columns = [...this.columns]
          this.tableOption.columns = this.columns
            .map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
            .filter((v) => v)
          this.tableOption.data = res.data.list || []
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => {
          this.lsLoading = false
        })
    },

    // 跳转至详情页
    showDetail(row) {
      if (!row.billNo) {
        return this.$message.error('单号不能为空！')
      }
      this.showOneNoDetail('sourceBizNo', row.billNo, { isTab: true })
    },
    // 关闭弹框
    dialogClose(type) {
      this[type].show = false
    },
    multiApply() {
      if (!this.multipleSelection.length) {
        this.isDel = false
        this.dialogForcePrecloseTitle = '生成转字凭证'
        this.forcePrecloseForm.finMon = ''
        this.forcePrecloseForm.settleCompName = this.userInfo.settleCompanyName
        this.forcePrecloseForm.settleCompCode = this.userInfo.settleCompanyCode
        this.dialogShowForcePreclose = true
        this.$nextTick(() => this.$refs.forcePrecloseForm.clearValidate())
        return
      }
      let finPreclosingIds = this.multipleSelection.map((v) => v.finPreclosingId).join(',')
      this.$confirmWarn('是否进行生成转字凭证？', () => {
        this.lsLoading = true
        API.precloseGenerateVoucher({ finPreclosingIds, settleCompCode: this.userInfo.settleCompanyCode })
          .then((res) => {
            this.$msgSucClose('凭证已经处理！')
            this.getData()
          })
          .catch(() => (this.lsLoading = false))
      })
    },
    multiDel() {
      this.isDel = true
      this.dialogForcePrecloseTitle = '按月删除凭证'
      this.forcePrecloseForm.finMon = ''
      this.forcePrecloseForm.settleCompName = this.userInfo.settleCompanyName
      this.forcePrecloseForm.settleCompCode = this.userInfo.settleCompanyCode
      this.dialogShowForcePreclose = true
      this.$nextTick(() => this.$refs.forcePrecloseForm.clearValidate())
    },
    forcePrecloseSubmit() {
      this.$refs.forcePrecloseForm.validate((res) => {
        if (res) {
          let method, str, strWarn
          method = this.isDel ? batchDeleteShiftVoucher : API.precloseGenerateVoucher
          str = this.isDel ? '删除成功！' : '凭证已经处理！'
          strWarn = this.isDel ? '按月删除凭证' : '生成转字凭证'
          this.$confirmWarn(`是否进行${strWarn}？`, () => {
            this.lsLoading = true
            method(this.forcePrecloseForm)
              .then((res) => {
                this.dialogShowForcePreclose = false
                this.$msgSucClose(str)
                this.getData()
              })
              .catch(() => (this.lsLoading = false))
          })
        }
      })
    },
    // 预览凭证
    generateVoucher(type, type2, isAll) {
      if (type === 'refresh') {
        return this.getData()
      }
      if (type === 'PreviewDialog') {
        // let needShiftAccountSeqNos = this.multipleSelection.filter((v) => !v.acctVoucherSeqno && v.needShiftAccount == 'yes')
        let needShiftAccountSeqNos = this.multipleSelection.filter((v) => !v.acctVoucherSeqno)
        let finPreclosingIds = needShiftAccountSeqNos[this.$refs.PreviewDialog.currIndex - 1].finPreclosingId
        if (isAll === 'all') {
          finPreclosingIds = needShiftAccountSeqNos.map((v) => v.finPreclosingId).join(',')
        }
        console.log(this.$refs.PreviewDialog.currIndex - 1, finPreclosingIds, isAll)
        this.$confirmWarn('是否进行生成凭证？', () => {
          this.lsLoading = true
          this.$refs.PreviewDialog.lsLoading = false
          API.precloseGenerateVoucher({ finPreclosingIds, settleCompCode: this.userInfo.settleCompanyCode })
            .then((res) => {
              this.$msgSucClose('凭证已经处理！')
              // this.previewDialog.show = false
              // this.getData()
            })
            .catch(() => (this.lsLoading = this.$refs.PreviewDialog.lsLoading = false))
        })
        return
      }
      let selectRow = this.multipleSelection
      if (!selectRow.length) {
        return this.$msgErrClose(`请勾选需要预览凭证的项！`)
      }
      if ([...new Set(selectRow.map((v) => v.voucherStatus))].length === 2) {
        return this.$msgErrClose(`凭证状态为已生成和未生成的记录不能同时预览！`)
      }
      let seqNos = selectRow.map((v) => v.acctVoucherSeqno)
      // 未生成
      if (!seqNos[0]) {
        // let needShiftAccountSeqNos = selectRow.filter((v) => !v.acctVoucherSeqno && v.needShiftAccount == 'yes')
        let needShiftAccountSeqNos = selectRow.filter((v) => !v.acctVoucherSeqno)
        if (!needShiftAccountSeqNos.length) return this.$msgErrClose(`请选择是否生成凭证为是的记录！`)
        this.lsLoading = true
        return API.precloseGenerateVoucher({
          finPreclosingIds: needShiftAccountSeqNos.map((v) => v.finPreclosingId).join(','),
          settleCompCode: this.userInfo.settleCompanyCode,
          preview: 'yes',
        })
          .then((res) => {
            if (!res.data || !res.data.length) {
              return this.$msgErrClose(`没有可生成凭证的数据！`)
            }
            this.previewDialog.showData = res.data
            this.previewDialog.seqNo = ''
            this.previewDialog.show = true
          })
          .finally(() => (this.lsLoading = false))
      }
      // 已生成
      this.previewDialog.showData = ''
      this.previewDialog.seqNo = seqNos.join(',')
      this.previewDialog.show = true
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
  },
}
</script>
<style lang="scss" scoped>
.finance-list-container ::v-deep .el-button.el-button--text {
  margin-left: 6px;
  margin-right: 6px;
}
</style>