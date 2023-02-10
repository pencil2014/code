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
          v-if="checkAuth($route.name, 'tab-preClose4', 'btn-closeRecord')"
          class="finance-btn"
          size="mini"
          @click="precloseByBill"
        >{{$t('PreClose.orderClosure')}}</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-preClose4', 'btn-export')"
          class="finance-btn"
          size="mini"
          @click="exportBtn('pending')"
        >{{$t('PreClose.exportData')}}</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-preClose4', 'btn-export')"
          class="finance-btn"
          size="mini"
          @click="exportBtn('pre')"
        >{{$t('PreClose.exportStatements')}}</el-button>
      </div>
      <div class="money-box-right">
        <el-button v-if="checkAuth($route.name, 'tab-preClose4', 'btn-precloseDelayAdd')" class="finance-btn" @click="precloseDelay('add')" size="mini">{{$t('PreClose.reasonTips')}}</el-button>
        <el-button v-if="checkAuth($route.name, 'tab-preClose4', 'btn-precloseDelayMdf')" class="finance-btn" @click="precloseDelay('modify')" size="mini">{{$t('PreClose.modifyTips')}}</el-button>
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
      </div>
    </div>
    <FinanceTable :option="tableOption" @send-multi="sendMulti" />
    </div>
    <el-dialog
      :title="closeDelayTitle"
      :visible.sync="closeDelayVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      custom-class="fin-modify-settleunit"
      width="640px">
      <div class="fin-dialog-content">
        <el-form ref="closeDelayForm" :model="closeDelayForm" size="mini" label-suffix=":">
          <el-form-item :label="$t('FeeList.orderNo')" prop="billNo"  class="nofull">
            <el-tooltip :content="closeDelayForm.billNo" placement="top-start">
              <div class="finance-tooltip">{{closeDelayForm.billNo}}</div>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('PreClose.reasonTitle')" prop="delayReason" 
            :rules="{required: true, message: ' ', trigger: 'change'}" class="fin-modify-settleunit-person">
            <el-select v-model="closeDelayForm.delayReason" :placeholder="$t('Common.plEnter')"
              filterable
              remote
              clearable>
              <el-option
                v-for="(item, index) in dictMap['precloseDelayReason']"
                :key="'precloseDelayReason' + index"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('PreClose.responsibility')" prop="dutyRole" 
            :rules="{required: true, message: ' ', trigger: 'change'}" class="fin-modify-settleunit-person">
            <el-select v-model="closeDelayForm.dutyRole" :placeholder="$t('Common.plEnter')"
              filterable
              remote
              clearable>
              <el-option
                v-for="(item, index) in dictMap['precloseDelayDutyRole']"
                :key="'precloseDelayDutyRole' + index"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveCloseDelay" type="primary" size="mini">{{$t('Common.save')}}</el-button>
        <el-button @click="closeDelayVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
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
  name: 'preClose4',
  label: i18n.t('PreClose.waitingPreClosure'),
  mixins: [mixin, mixin2, voucherMixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
  },
  // inject: ['tabRefresh'],
  // activated() {
  //   if (this.tabRefresh.pre) {
  //     this.tabRefresh.pre = false
  //     this.handleCurrentChange(1)
  //   }
  // },
  data() {
    return {
      keyDownActive: true,
      searchOption: {},
      tableOption: {},
      multipleSelection: [],
      departmentListO: [],
      departmentListB: [],
      departmentListOBD: [],
      departmentListCsc: [],
      departmentListDoc: [],
      descColumns: [],
      ascColumns: [],
      closeDelayVisible: false,
      closeDelayForm: {
        billNo: '',
        delayReason: '',
        dutyRole: ''
      },
      closeDelayTitle: this.$t('PreClose.reasonTips'),
      closeDelayType: 'add',
      multipleSelection1: []
    }
  },
  computed: {
    ...mapState({
      finance: (state) => state.finance,
    }),
  },
  created() {
    this.loanBasicData()
    // 搜索配置
    let searchInputGroup = ['bizNo', 'bdDeptCode', 'bdEmployeeId', 'bizDate', 'cscDeptCode', 'closeReadyStatus', 'delayReason', 'dutyRole']
    this.searchOption = {
      saveDefault: true,
      saveName: 'finclosePending',
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 10,
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
          bizDate: {
            label: this.$t('FeeList.bizDate'),
            type: 'daterange',
            format: 'yyyy-MM-dd',
            keys: ['fromBizDate', 'toBizDate'],
          },
          precloseDate: {
            label: this.$t('PreClose.planCloseDate'),
            type: 'daterange',
            format: 'yyyy-MM-dd',
            keys: ['fromPrecloseDate', 'toPrecloseDate'],
          },
          bdDeptCode: {
            label: this.$t('PreClose.deptCname'),
            prop: 'deptCode',
            type: 'cascader',
            cascaderList: this.departmentListB,
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
              multiple: true
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
              multiple: true
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
          opDeptCode: {
            label: this.$t('PreClose.opDeptName'),
            prop: 'deptCode',
            type: 'cascader',
            cascaderList: this.departmentListO,
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
              multiple: true
            },
          },
          opEmployeeId: {
            label: this.$t('PreClose.operators'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getSellers(queryString, item, ''), // 'op'
            visibleChange: (queryString, item) => this.getSellers(queryString, item, ''), // 'op'
          },
          cscDeptCode: {
            label: this.$t('PreClose.cscDeptName'),
            prop: 'cscDeptCode',
            type: 'cascader',
            cascaderList: this.departmentListCsc,
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
              multiple: true
            },
          },
          cscEmployeeId: {
            label: this.$t('PreClose.cscEmployeeId'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getSellers(queryString, item, ''), // 'csc'
            visibleChange: (queryString, item) => this.getSellers(queryString, item, ''), // 'csc'
          },
          docDeptCode: {
            label: this.$t('PreClose.docDeptName'),
            prop: 'docDeptCode',
            type: 'cascader',
            cascaderList: this.departmentListDoc,
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
              multiple: true
            },
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
          closeReadyStatus: { label: this.$t('PreClose.meetTips'), type: 'select', prop: 'yesNo' },
          delayReason: { label: this.$t('PreClose.reasonTitle'), type: 'select', prop: 'precloseDelayReason' },
          dutyRole: { label: this.$t('PreClose.responsibility'), type: 'select', prop: 'precloseDelayDutyRole' },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = {
      ...this.option,
      id: 'option1',
      $name: 'PreCloseListTab',
      pagination,
      sortable: true,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns
      },
    }
    this.tableOption.operationBtns.data = [{ label: this.$t('Common.details'), type: 'text', show: true, action: 'showDetail' }]
    this.selfColumnsBase = [ // let columns
      {
        prop: 'billNo',
        label: this.$t('PreClose.bizNo'),
        width: 130,
        type: 'button',
        callback: (row) => this.showDetail(row),
        sortable: false,
      },
      { prop: 'settleCompName', width: 150, label: this.$t('FeeList.settleComp'), sortable: false },
      { prop: 'bizDate', width: 100, label: this.$t('FeeList.bizDate'), sortable: false },
      { prop: 'finMon', label: this.$t('PreClose.finMon'), width: 80, sortable: false },
      { prop: 'precloseDate', width: 130, label: this.$t('PreClose.planCloseDate')},
      { prop: 'closeReadyStatus', width: 130, label: this.$t('PreClose.meetTips'), type: 'select', propInDict: 'yesNo', sortable: false },
      { prop: 'errorReason', minWidth: 180, label: this.$t('PreClose.notPreclose'), sortable: false },
      { prop: 'bdDeptName', width: 130, label: this.$t('PreClose.deptCname'), sortable: false },
      { prop: 'bdEmployeeName', width: 130, label: this.$t('PreClose.bdEmployeeId'), sortable: false },
      { prop: 'obdDeptName', width: 130, label: this.$t('PreClose.obdDeptCode')},
      { prop: 'obdEmployeeName', label: this.$t('PreClose.obdEmployeeId'), width: 130 },
      { prop: 'opDeptName', width: 130, label: this.$t('PreClose.opDeptName'), sortable: false },
      { prop: 'opEmployeeName', width: 130, label: this.$t('PreClose.operators'), sortable: false },
      { prop: 'cscDeptName', label: this.$t('PreClose.cscDeptName'), width: 110, sortable: false },
      { prop: 'cscEmployeeName', label: this.$t('PreClose.cscEmployeeId'), width: 100, sortable: false },
      { prop: 'docDeptName', label: this.$t('PreClose.docDeptName'), width: 110 },
      { prop: 'docEmployeeName', label: this.$t('PreClose.docEmployeeId'), width: 100 },
      { prop: 'sysLineName', width: 130, label: this.$t('FeeList.sysLineCode'), sortable: false },
      { prop: 'delayReason', width: 120, label: this.$t('PreClose.reasonTitle'), type: 'select', propInDict: 'precloseDelayReason', sortable: false },
      { prop: 'dutyRole', width: 120, label: this.$t('PreClose.responsibility'), type: 'select', propInDict: 'precloseDelayDutyRole', sortable: false },
      { prop: 'createdTime', width: 130, label: this.$t('Settle.creatTime'), sortable: false },
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
      API.preclosingPreviewList(data)
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
    // 跳转至详情页
    showDetail(row) {
      if (!row.billNo) {
        return this.$message.error(this.$t('PreClose.jobNoTips'))
      }
      this.showOneNoDetail('sourceBizNo', row.billNo, { isTab: true })
    },
    // 按单预关账
    precloseByBill() {
      if (this.multipleSelection.length !== 1) {
        return this.$msgErrClose(this.$t('PreClose.operationTips'))
      }
      this.$confirmWarn(this.$t('PreClose.perOrderTips'), () => {
        let orderNo = this.multipleSelection[0].billNo
        API.precloseByBill({ orderNo }).then((res) => {
          this.$msgSucClose(this.$t('PreClose.operateSuc'))
          this.getData()
        })
      })
    },
    precloseDelay(type) {
      this.closeDelayForm.billNo = ''
      this.closeDelayForm.delayReason = ''
      this.closeDelayForm.dutyRole = ''
      if (type === 'add') {
        if (this.multipleSelection1.length < 1) {
          return this.$msgErrClose(this.$t('PreClose.leastTips'))
        }
        if (this.multipleSelection1.some(item => item.delayReason)) {
          return this.$msgErrClose(this.$t('PreClose.alreadyTips'))
        }
        this.closeDelayTitle = this.$t('PreClose.reasonTips')
        this.closeDelayForm.billNo = this.multipleSelection1.map(item => item.billNo).join(',')
      } else if (type === 'modify') {
        if (this.multipleSelection1.length !== 1) {
          return this.$msgErrClose(this.$t('PreClose.modificationTips'))
        }
        this.closeDelayTitle = this.$t('PreClose.modifyTips')
        this.closeDelayForm.billNo = this.multipleSelection1[0].billNo
        this.closeDelayForm.delayReason = this.multipleSelection1[0].delayReason
        this.closeDelayForm.dutyRole = this.multipleSelection1[0].dutyRole
      }
      this.closeDelayType = type
      this.closeDelayVisible = true
    },
    saveCloseDelay() {
      this.$refs.closeDelayForm.validate(valid => {
        if (valid) {
          let data = {}
          let fn = this.closeDelayType === 'add' ? API.precloseDelay : API.modifyPrecloseDelay
          if (this.closeDelayType === 'add') {
            data = {
              billNos: this.multipleSelection1.map(item => item.billNo),
              delayReason: this.closeDelayForm.delayReason,
              dutyRole: this.closeDelayForm.dutyRole
            }
          } else if (this.closeDelayType === 'modify') {
            data = {
              billNo: this.multipleSelection1[0].billNo,
              delayReason: this.closeDelayForm.delayReason,
              dutyRole: this.closeDelayForm.dutyRole
            }
          }
          fn(data).then(res => {
            this.$msgSucClose(`${this.$t('PreClose.fillSuc')}`) // ${this.closeDelayTitle.slice(0, 2)} 
            this.closeDelayVisible = false
            this.getData()
          })
        }
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
        let resData4 = JSON.parse(JSON.stringify(res.data || []))
        let resData5 = JSON.parse(JSON.stringify(res.data || []))
        this.departmentListO.splice(0, 1000, ...this.getTreeData(resData1))
        this.departmentListB.splice(0, 1000, ...this.getTreeData(resData2))
        this.departmentListOBD.splice(0, 1000, ...this.getTreeData(resData3))
        this.departmentListCsc.splice(0, 1000, ...this.getTreeData(resData4))
        this.departmentListDoc.splice(0, 1000, ...this.getTreeData(resData5))
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
    },
    exportBtn(type) {
      let data = {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: [...(this.searchBackup || [])],
      }
      if (this.multipleSelection.length) {
        data.query = [
          { column: 'preclosingPviewIds', type: 'in', value: this.multipleSelection.map((v) => v.preclosingPviewId).join(',') },
        ]
      }
      //查询对象的配置编码
      let value = type === 'pending' ? 'preclosingReviewListExport' : 'preclosingReportDataExport'
      data.query.push({ column: 'queryDataModuleCode', value })
      this.loading = true
      this.$store
        .dispatch('finance/downloadBlobFilePost', { uri: '/fin/common/queryDataExportExcel', data: { data } })
        .then((res) => {
          this.loading = false
          this.aTagClick(window.URL.createObjectURL(res),  `${type === 'pending' ? this.$t('PreClose.accountsList') : this.$t('PreClose.statements')}.xlsx`)
        })
        .catch(() => (this.loading = false))
    },
  },
  watch: {
    closeDelayVisible(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.closeDelayForm && this.$refs.closeDelayForm.clearValidate()
        })
      }
    }
  }
}
</script>

<style lang="scss">
.fin-modify-settleunit{
  .el-form-item--mini{
    margin-right: 0;
  }
  .el-form-item__label{
    width: 100%;
    text-align: left;
    
  }
  .nofull{
    display: flex;
    .el-form-item__label{
      width: 60px;
    }
    .el-form-item__content{
      flex: 1;
    }
  }
}
</style>