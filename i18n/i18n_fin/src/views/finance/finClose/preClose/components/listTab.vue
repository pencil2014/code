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
      <div class="money-box-left">
        <el-button
          v-if="checkAuth($route.name, 'tab-preClose1', 'btn-apply')"
          class="finance-btn"
          size="mini"
          @click="multiApply"
          type="primary"
        >{{$t('PreClose.closure')}}</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-preClose1', 'btn-forceApply')"
          class="finance-btn"
          size="mini"
          @click="dialogShowForcePrecloseHandle"
        >{{$t('PreClose.monthlyClosure')}}</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-preClose1', 'btn-closeRecord')"
          class="finance-btn"
          size="mini"
          @click="precloseByCloseRecord"
        >{{$t('PreClose.orderClosure')}}</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-preClose1', 'btn-mngPrecloseByBill')"
          class="finance-btn"
          size="mini"
          @click="mngPrecloseByBill"
          type="primary"
        >{{$t('PreClose.mandatoryClosure')}}</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-preClose1', 'btn-export')"
          class="finance-btn"
          size="mini"
          @click="exportBtn"
        >{{$t('Common.export')}}</el-button>
      </div>
      <div class="money-box-right">
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
      </div>
    </div>
      <FinanceTable :option="tableOption" @send-multi="sendMulti" />
    </div>
    <el-dialog
      :title="`${preMultiText} ${$t('PreClose.closure')}`"
      :visible.sync="dialogShow"
      width="400px"
      @close="dialogShow = false"
    >
      <el-form
        :model="form"
        ref="form"
        :rules="rules"
        :inline="false"
        size="mini"
        style="padding-top: 16px"
        label-suffix=":"
      >
        <el-form-item :label="$t('PreClose.reasonType')" prop="reasonType">
          <el-select v-model="form.reasonType" :placeholder="$t('Common.plSelect')" clearable filterable>
            <el-option
              v-for="item in dictMap['precloseProfitLossReasonType']"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="`${preMultiText} ${$t('PreClose.reason')}`" prop="reason">
          <el-input
            type="textarea"
            v-model="form.reason"
            :placeholder="$t('Common.plEnter')"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="sure">{{$t('Common.sure')}}</el-button>
        <el-button @click="dialogShow = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="$t('PreClose.monthlyClosure')"
      :visible.sync="dialogShowForcePreclose"
      width="400px"
      @close="dialogShowForcePreclose = false"
    >
      <el-form
        :model="forcePrecloseForm"
        ref="forcePrecloseForm"
        :inline="false"
        size="small"
        label-suffix=":"
      >
        <el-form-item :label="$t('PreClose.preClosebranches')" prop="settleCompName">
          <el-input v-model="forcePrecloseForm.settleCompName" disabled></el-input>
        </el-form-item>
        <el-form-item :label="$t('PreClose.finMon')" prop="finMon">
          <el-date-picker
            v-model="forcePrecloseForm.finMon"
            type="month"
            value-format="yyyy-MM"
            :placeholder="$t('Common.plSelect')"
            disabled
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="btnLoading1" type="primary" size="mini" @click="forcePrecloseSubmit">{{$t('Common.sure')}}</el-button>
        <el-button @click="dialogShowForcePreclose = false" size="mini">{{$t('Common.cancel')}}</el-button>
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
import { listByRole } from '@/api/base'
import { departmentTreeList } from '@/api/companyResource'
import CustomColumns from '@/components/customColumns/index'
import i18n from '@/lang'

export default {
  name: 'preClose1',
  label: i18n.t('PreClose.preCloseFailure'),
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
      return this.preMulti ? this.$t('Common.bulk') : ''
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
          dateRange: { label: this.$t('PreClose.createdTime'), type: 'daterange', format: 'yyyy-MM-dd', keys: ['fromFinDate', 'toFinDate'] },
          finMon: { label: this.$t('PreClose.finMon'), type: 'month', format: 'yyyy-MM' },
          planCloseDate: { label: this.$t('PreClose.planCloseDate'), type: 'daterange', format: 'yyyy-MM-dd', keys: ['fromPlanCloseDate', 'toPlanCloseDate'] },
          // TODO
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
            remoteMethod: (queryString, item) => this.getSellers(queryString, item, ''), // 'bd'
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
            remoteMethod: (queryString, item) => this.getSellers(queryString, item, ''), // 'op'
            visibleChange: (queryString, item) => this.getSellers(queryString, item, ''), // 'op'
          },
          cscEmployeeId: {
            label: this.$t('PreClose.cscEmployeeId'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getSellers(queryString, item, ''), // 'csc'
            visibleChange: (queryString, item) => this.getSellers(queryString, item, ''), // 'csc'
          },
          docEmployeeId: {
            label: this.$t('PreClose.docEmployeeId'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getSellers(queryString, item, ''), // 'doc'
            visibleChange: (queryString, item) => this.getSellers(queryString, item, ''), // 'doc'
          },
          sysLineCode: {
            label: this.$t('FeeList.sysLineCode'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.baseSystemLineList(queryString, item),
            visibleChange: (queryString, item) => this.baseSystemLineList(queryString, item),
          },
          precloseStatus: { label: this.$t('PreClose.preclosed'), type: 'select', prop: 'yesNo' },
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
    }
    this.tableOption.operationBtns.width = '160'
    this.tableOption.operationBtns.data = [
      {
        label: this.$t('Common.details'),
        type: 'text',
        show: true,
        action: 'showDetail',
      },
      {
        label: this.$t('PreClose.closure'),
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
        label: this.$t('PreClose.bizNo'),
        width: 130,
        type: 'button',
        callback: (row) => {
          this.showDetail(row)
        },
      },
      { prop: 'settleCompName', width: 150, label: this.$t('FeeList.settleComp') },
      { prop: 'bizDate', width: 100, label: this.$t('FeeList.bizDate')},
      { prop: 'finMon', width: 80, label: this.$t('PreClose.finMon') },
      { prop: 'planCloseDate', label: this.$t('PreClose.planCloseDate'), minWidth: 130 },
      {
        prop: 'dateRange',
        label: this.$t('PreClose.dateRange'),
        width: 160,
        formatter: ({ row }) => {
          return row.feeFromDate + ' ~ ' + row.feeToDate
        },
      },
      { prop: 'createdTime', width: 130, label: this.$t('PreClose.createdTime') },
      { prop: 'createdName', width: 130, label: this.$t('PreClose.createdName')},
      { prop: 'errorReason', label: this.$t('PreClose.errorReason'), minWidth: 200 },
      { prop: 'deptName', width: 130, label: this.$t('PreClose.deptCname') },
      { prop: 'bdEmployeeName', label: this.$t('PreClose.bdEmployeeId'), width: 100 },
      { prop: 'obdDeptName', width: 130, label: this.$t('PreClose.obdDeptCode') },
      { prop: 'obdEmployeeName', label: this.$t('PreClose.obdEmployeeId'), width: 100 },
      { prop: 'opDeptName', width: 130, label: this.$t('PreClose.opDeptName')},
      { prop: 'opEmployeeName', label: this.$t('PreClose.operators'), width: 100 },
      { prop: 'cscDeptName', label: this.$t('PreClose.cscDeptName'), width: 110 },
      { prop: 'cscEmployeeName', label: this.$t('PreClose.cscEmployeeId'), width: 100 },
      { prop: 'docDeptName', label: this.$t('PreClose.docDeptName'), width: 110 },
      { prop: 'docEmployeeName', label: this.$t('PreClose.docEmployeeId'), width: 100 },
      { prop: 'precloseStatus', label: this.$t('PreClose.preclosed'), width: 100, type: 'select', propInDict: 'yesNo' },
      { prop: 'sysLineName', width: 130, label: this.$t('FeeList.sysLineCode') },
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
      data.columns = this.customColumnsKeys
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      API.failPreclosingList(data)
        .then((res) => {
          let { configColumns } = res.data
          this.columns = configColumns.length > 0 ? configColumns : this.selfColumnsBase.map(item => item.prop)
          this.columns = [...this.columns]
          this.tableOption.columns = this.columns.map(prop => {
            let obj = this.selfColumnsBase.find(item => item.prop === prop)
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
    // 批量申请
    multiApply() {
      if (!this.multipleSelection.length) {
        return this.$msgErrClose(this.$t('PreClose.leastTips'))
      }
      if (!this.multipleSelection.find((row) => (row.errorType || '').toUpperCase() === 'PROFIT_LOSS')) {
        return this.$msgErrClose(this.$t('PreClose.selectTips'))
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
        return this.$message.error(this.$t('PreClose.jobNoTips'))
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
              this.$msgSucClose(this.$t('PreClose.closureSuc'))
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
              this.$msgSucClose(this.$t('PreClose.mandatorySuc'))
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
        return this.$msgErrClose(this.$t('PreClose.leastTips'))
      }
      this.$confirmWarn(this.$t('PreClose.perOrderTips'), () => {
        let preclosingIds = this.multipleSelection.map((v) => v.finPreclosingId)
        API.precloseByCloseRecord({ preclosingIds }).then((res) => {
          this.$msgSucClose(this.$t('PreClose.operateSuc'))
          this.getData()
        })
      })
    },
    mngPrecloseByBill() {
      if (!this.multipleSelection.length) {
        return this.$msgErrClose(this.$t('PreClose.leastTips'))
      }
      this.$confirmWarn(this.$t('PreClose.conMandatory'), () => {
        let orderNos = [...new Set(this.multipleSelection.map((v) => v.billNo))]
        let settleCompCode = [...new Set(this.multipleSelection.map((v) => v.settleCompCode))]
        if (settleCompCode.length > 1) {
          return this.$msgErrClose(this.$t('PreClose.sameBill'))
        }
        API.mngPrecloseByBill({ orderNos, settleCompCode: settleCompCode[0] }).then((res) => {
          this.$msgSucClose(this.$t('PreClose.operateSuc'))
          this.getData()
        })
      })
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
          this.aTagClick(window.URL.createObjectURL(res), `${this.$t('PreClose.preCloseFailureList')}.xlsx`)
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
  .el-form-item__label{
    width: 100% !important;
    text-align: left;
  }
  .el-form-item__content > div {
    width: 100%;
    textarea {
      min-height: 60px !important;
    }
  }
}
</style>