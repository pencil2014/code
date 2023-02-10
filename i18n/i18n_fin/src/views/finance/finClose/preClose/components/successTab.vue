<template>
  <div
    class="finance-list-container"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
      <div class="money-box-left"></div>
      <div class="money-box-right">
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
      </div>
    </div>
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
        label-suffix=":"
      >
        <el-form-item :label="$t('FeeList.settleComp')" prop="settleCompName">
          <el-input style="width:250px" v-model="forcePrecloseForm.settleCompName" disabled></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('PreClose.finMon')"
          prop="finMon"
          :rules="{message: ' ', required: true, triggers: 'change,blur'}"
        >
          <el-date-picker
            style="width:250px"
            v-model="forcePrecloseForm.finMon"
            type="month"
            value-format="yyyy-MM"
            :placeholder="$t('Common.plSelect')"
            :pickerOptions="{disabledDate:(nowDate)=>+new Date() - nowDate <= 0}"
            :clearable="true"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :disabled="lsLoading" type="primary" size="mini" @click="forcePrecloseSubmit">{{$t('Common.sure')}}</el-button>
        <el-button :disabled="lsLoading" @click="dialogShowForcePreclose = false" size="mini">{{$t('Common.cancel')}}</el-button>
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
import { listByRole } from '@/api/base'
import { departmentTreeList } from '@/api/companyResource'
import CustomColumns from '@/components/customColumns/index'
import i18n from '@/lang'

export default {
  name: 'preClose3',
  label: i18n.t('PreClose.preCloseSuc'),
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
        title: this.$t('FeeList.voucherPreview'),
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
          bizNo: { label: this.$t('PreClose.bizNo'), type: 'input' },
          settleCompCode: {
            label: this.$t('FeeList.settleComp'),
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
          finMon: { label: this.$t('PreClose.finMon'), type: 'month', format: 'yyyy-MM' },
          planCloseDate: {
            label: this.$t('PreClose.planCloseDate'),
            type: 'daterange',
            format: 'yyyy-MM-dd',
            keys: ['fromPlanCloseDate', 'toPlanCloseDate'],
          },
          // finMonth: { label: '财务月份', type: 'daterange', format: 'yyyy-MM-dd', keys: ['fromFinDate', 'toFinDate'] },
          // finMonth: { label: '财务月份', type: 'daterange', format: 'yyyy-MM-dd', keys: ['fromFinDate', 'toFinDate'] },
          // dateRange: { label: '预关账时间', type: 'daterange', format: 'yyyy-MM-dd', keys: ['fromFinDate', 'toFinDate'] },
          // voucherNo: { label: this.$t('Hedge.voucherNumber'), type: 'input' },
          // needShiftAccount: { label: '需要生成凭证', prop: 'yesNo', type: 'select' },
          // voucherStatus: { label: this.$t('Hedge.voucherStatus'), type: 'select', prop: 'voucherStatus' },
          sysLineCode: {
            label: this.$t('FeeList.sysLineCode'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.baseSystemLineList(queryString, item),
            visibleChange: (queryString, item) => this.baseSystemLineList(queryString, item),
          },
          deptCode: {
            label: this.$t('PreClose.deptCname'),
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
            label: this.$t('PreClose.bdEmployeeId'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getSellers(queryString, item, ''), //'bd'
            visibleChange: (queryString, item) => this.getSellers(queryString, item, ''), // 'bd'
          },
          obdDeptCode: {
            label: this.$t('PreClose.obdDeptCode'),
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
            label: this.$t('PreClose.obdEmployeeId'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getSellers(queryString, item, ''), // 'obd'
            visibleChange: (queryString, item) => this.getSellers(queryString, item, ''), // 'obd'
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
            label: this.$t('PreClose.operators'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getSellers(queryString, item, ''), // op
            visibleChange: (queryString, item) => this.getSellers(queryString, item, ''), // op
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
        label: this.$t('PreClose.bizNo'),
        width: '160px',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.showDetail(row)
          },
        },
      },
      { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), minWidth: 130 },
      { prop: 'finMon', width: 100, label: this.$t('PreClose.finMon') },
      { prop: 'bizDate', label: this.$t('FeeList.bizDate'), minWidth: 130 },
      { prop: 'planCloseDate', label: this.$t('PreClose.planCloseDate'), minWidth: 130 },
      { prop: 'createdTime', label: this.$t('PreClose.actualTime'), minWidth: 130 },
      {
        prop: 'closeStatus',
        label: this.$t('FeeList.precloseStatus'),
        width: 100,
        formatter: ({ row }) => (row.closeStatus == 'yes' ? this.$t('PreClose.preCloseSuc') : ''),
      },
      {
        prop: 'delayDays',
        label: this.$t('PreClose.beyondTips'),
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
        label: this.$t('PreClose.dateRange'),
        width: 180,
        formatter: ({ row }) => row.feeFromDate + ' ~ ' + row.feeToDate,
      },
      { prop: 'deptName', width: 130, label: this.$t('PreClose.deptCname') },
      { prop: 'bdEmployeeName', label: this.$t('PreClose.bdEmployeeId'), width: 130 },
      { prop: 'obdDeptName', width: 130, label: this.$t('PreClose.obdDeptCode') },
      { prop: 'obdEmployeeName', label: this.$t('PreClose.obdEmployeeId'), width: 130 },
      { prop: 'opDeptName', width: 130, label: this.$t('PreClose.opDeptName')},
      { prop: 'opEmployeeName', label: this.$t('PreClose.operators'), width: 130 },
      { prop: 'createdName', label: this.$t('PreClose.createdName'), width: 130 },
      { prop: 'sysLineName', width: 130, label: this.$t('FeeList.sysLineCode') },
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
        return this.$message.error(this.$t('PreClose.jobNoTips'))
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
        this.dialogForcePrecloseTitle = this.$t('PreClose.genVouchers')
        this.forcePrecloseForm.finMon = ''
        this.forcePrecloseForm.settleCompName = this.userInfo.settleCompanyName
        this.forcePrecloseForm.settleCompCode = this.userInfo.settleCompanyCode
        this.dialogShowForcePreclose = true
        this.$nextTick(() => this.$refs.forcePrecloseForm.clearValidate())
        return
      }
      let finPreclosingIds = this.multipleSelection.map((v) => v.finPreclosingId).join(',')
      this.$confirmWarn(this.$t('PreClose.transferTips'), () => {
        this.lsLoading = true
        API.precloseGenerateVoucher({ finPreclosingIds, settleCompCode: this.userInfo.settleCompanyCode })
          .then((res) => {
            this.$msgSucClose(this.$t('Hedge.processedTips'))
            this.getData()
          })
          .catch(() => (this.lsLoading = false))
      })
    },
    multiDel() {
      this.isDel = true
      this.dialogForcePrecloseTitle = this.$t('PreClose.delMonTips')
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
          str = this.isDel ? this.$t('Settle.deleteSuc') : this.$t('Hedge.processedTips')
          strWarn = this.isDel ? this.$t('PreClose.delMonTips'): this.$t('PreClose.genVouchers')
          this.$confirmWarn(`${this.$t('PreClose.whetherTips')}${strWarn}?`, () => {
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
        this.$confirmWarn(this.$t('PreClose.performed'), () => {
          this.lsLoading = true
          this.$refs.PreviewDialog.lsLoading = false
          API.precloseGenerateVoucher({ finPreclosingIds, settleCompCode: this.userInfo.settleCompanyCode })
            .then((res) => {
              this.$msgSucClose(this.$t('Hedge.processedTips'))
              // this.previewDialog.show = false
              // this.getData()
            })
            .catch(() => (this.lsLoading = this.$refs.PreviewDialog.lsLoading = false))
        })
        return
      }
      let selectRow = this.multipleSelection
      if (!selectRow.length) {
        return this.$msgErrClose(this.$t('PreClose.previewTips'))
      }
      if ([...new Set(selectRow.map((v) => v.voucherStatus))].length === 2) {
        return this.$msgErrClose(this.$t('PreClose.ungenerated'))
      }
      let seqNos = selectRow.map((v) => v.acctVoucherSeqno)
      // 未生成
      if (!seqNos[0]) {
        // let needShiftAccountSeqNos = selectRow.filter((v) => !v.acctVoucherSeqno && v.needShiftAccount == 'yes')
        let needShiftAccountSeqNos = selectRow.filter((v) => !v.acctVoucherSeqno)
        if (!needShiftAccountSeqNos.length) return this.$msgErrClose(this.$t('PreClose.yesTips'))
        this.lsLoading = true
        return API.precloseGenerateVoucher({
          finPreclosingIds: needShiftAccountSeqNos.map((v) => v.finPreclosingId).join(','),
          settleCompCode: this.userInfo.settleCompanyCode,
          preview: 'yes',
        })
          .then((res) => {
            if (!res.data || !res.data.length) {
              return this.$msgErrClose(this.$t('PreClose.noVouchers'))
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
    // 获取销售
    getSellers(name = '', item, role) {
      let query = [{ column: 'roleCode', type: 'eq', value: role }] // column: 'roleCode', type: 'in', value: 'bd,obd'
      name && query.push({ column: 'name', type: 'eq', value: name })
      listByRole({ currPage: 1, pageSize: 30, query }).then(({ data: { list } }) => {
        list = list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList = list
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
  },
}
</script>
<style lang="scss" scoped>
.finance-list-container ::v-deep .el-button.el-button--text {
  margin-left: 6px;
  margin-right: 6px;
}
</style>