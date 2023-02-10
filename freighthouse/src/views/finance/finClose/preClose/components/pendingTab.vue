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
          v-if="checkAuth($route.name, 'tab-preClose4', 'btn-closeRecord')"
          class="finance-btn"
          size="mini"
          @click="precloseByBill"
        >按单预关账</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-preClose4', 'btn-export')"
          class="finance-btn"
          size="mini"
          @click="exportBtn('pending')"
        >导出等待数据</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-preClose4', 'btn-export')"
          class="finance-btn"
          size="mini"
          @click="exportBtn('pre')"
        >导出预关账报表</el-button>
      </div>
      <div class="money-box-right">
        <el-button v-if="checkAuth($route.name, 'tab-preClose4', 'btn-precloseDelayAdd')" class="finance-btn" @click="precloseDelay('add')" size="mini">填写未预关账原因</el-button>
        <el-button v-if="checkAuth($route.name, 'tab-preClose4', 'btn-precloseDelayMdf')" class="finance-btn" @click="precloseDelay('modify')" size="mini">修改未预关账原因</el-button>
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
      </div>
    </div>
    <FinanceTable :option="tableOption" @send-multi="sendMulti" />
    <el-dialog
      :title="closeDelayTitle"
      :visible.sync="closeDelayVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      custom-class="fin-modify-settleunit"
      width="640px">
      <div class="fin-dialog-content">
        <el-form ref="closeDelayForm" :model="closeDelayForm" label-width="120px" size="mini">
          <el-form-item label="工作单号：" prop="billNo" style="width:540px;">
            <el-tooltip :content="closeDelayForm.billNo" placement="top-start">
              <div class="finance-tooltip">{{closeDelayForm.billNo}}</div>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="未预关账原因：" prop="delayReason" style="width:540px;"
            :rules="{required: true, message: ' ', trigger: 'change'}" class="fin-modify-settleunit-person">
            <el-select v-model="closeDelayForm.delayReason" placeholder="请输入"
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
          <el-form-item label="未预关账责任岗：" prop="dutyRole" style="width:540px;"
            :rules="{required: true, message: ' ', trigger: 'change'}" class="fin-modify-settleunit-person">
            <el-select v-model="closeDelayForm.dutyRole" placeholder="请输入"
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
        <el-button @click="saveCloseDelay" type="primary" size="mini">保存</el-button>
        <el-button @click="closeDelayVisible = false" size="mini">取消</el-button>
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
  name: 'preClose4',
  label: '等待预关账',
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
      closeDelayTitle: '填写未预关账原因',
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
          bizDate: {
            label: '业务日期',
            type: 'daterange',
            format: 'yyyy-MM-dd',
            keys: ['fromBizDate', 'toBizDate'],
          },
          precloseDate: {
            label: '预计预关账时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
            keys: ['fromPrecloseDate', 'toPrecloseDate'],
          },
          bdDeptCode: {
            label: 'BD部门',
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
              multiple: true
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
          opDeptCode: {
            label: '操作员部门',
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
            label: '操作员',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.listByRole(queryString, item, ''), // 'op'
            visibleChange: (queryString, item) => this.listByRole(queryString, item, ''), // 'op'
          },
          cscDeptCode: {
            label: '单证部门',
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
            label: '单证',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.listByRole(queryString, item, ''), // 'csc'
            visibleChange: (queryString, item) => this.listByRole(queryString, item, ''), // 'csc'
          },
          docDeptCode: {
            label: '文件部门',
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
          closeReadyStatus: { label: '是否满足预关账条件', type: 'select', prop: 'yesNo' },
          delayReason: { label: '未预关账原因', type: 'select', prop: 'precloseDelayReason' },
          dutyRole: { label: '未预关账责任岗', type: 'select', prop: 'precloseDelayDutyRole' },
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
    this.tableOption.operationBtns.data = [{ label: '详情', type: 'text', show: true, action: 'showDetail' }]
    this.selfColumnsBase = [ // let columns
      {
        prop: 'billNo',
        label: '单号',
        width: 130,
        type: 'button',
        callback: (row) => this.showDetail(row),
        sortable: false,
      },
      { prop: 'settleCompName', width: 150, label: '分公司', sortable: false },
      { prop: 'bizDate', width: 100, label: '业务日期', sortable: false },
      { prop: 'finMon', label: '财务月份', width: 80, sortable: false },
      { prop: 'precloseDate', width: 130, label: '预计预关账时间' },
      { prop: 'closeReadyStatus', width: 130, label: '是否满足预关账条件', type: 'select', propInDict: 'yesNo', sortable: false },
      { prop: 'errorReason', minWidth: 180, label: '不可预关账原因', sortable: false },
      { prop: 'bdDeptName', width: 130, label: 'BD部门', sortable: false },
      { prop: 'bdEmployeeName', width: 130, label: '销售（BD）', sortable: false },
      { prop: 'obdDeptName', width: 130, label: 'OBD部门' },
      { prop: 'obdEmployeeName', label: '销售助理（OBD）', width: 130 },
      { prop: 'opDeptName', width: 130, label: '操作员部门', sortable: false },
      { prop: 'opEmployeeName', width: 130, label: '操作员', sortable: true },
      { prop: 'cscDeptName', label: '单证部门', width: 110, sortable: false },
      { prop: 'cscEmployeeName', label: '单证', width: 100, sortable: false },
      { prop: 'docDeptName', label: '文件部门', width: 110 },
      { prop: 'docEmployeeName', label: '文件', width: 100 },
      { prop: 'sysLineName', width: 130, label: '航线', sortable: false },
      { prop: 'delayReason', width: 120, label: '未预关账原因', type: 'select', propInDict: 'precloseDelayReason', sortable: true },
      { prop: 'dutyRole', width: 120, label: '未预关账责任岗', type: 'select', propInDict: 'precloseDelayDutyRole', sortable: true },
      { prop: 'createdTime', width: 130, label: '创建时间', sortable: false },
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
    // 跳转至详情页
    showDetail(row) {
      if (!row.billNo) {
        return this.$message.error('单号不能为空！')
      }
      this.showOneNoDetail('sourceBizNo', row.billNo, { isTab: true })
    },
    // 按单预关账
    precloseByBill() {
      if (this.multipleSelection.length !== 1) {
        return this.$msgErrClose('请选择一项进行操作')
      }
      this.$confirmWarn('确认进行按单预关账？', () => {
        let orderNo = this.multipleSelection[0].billNo
        API.precloseByBill({ orderNo }).then((res) => {
          this.$msgSucClose('操作成功！')
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
          return this.$msgErrClose('请至少选择一项进行操作')
        }
        if (this.multipleSelection1.some(item => item.delayReason)) {
          return this.$msgErrClose('存在已填写的数据，不能再次填写')
        }
        this.closeDelayTitle = '填写未预关账原因'
        this.closeDelayForm.billNo = this.multipleSelection1.map(item => item.billNo).join(',')
      } else if (type === 'modify') {
        if (this.multipleSelection1.length !== 1) {
          return this.$msgErrClose('只能选择一项进行修改')
        }
        this.closeDelayTitle = '修改未预关账原因'
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
            this.$msgSucClose(`${this.closeDelayTitle.slice(0, 2)}成功！`)
            this.closeDelayVisible = false
            this.getData()
          })
        }
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
          this.aTagClick(window.URL.createObjectURL(res),  `${type === 'pending' ? '等待预关账列表' : '预关报表'}.xlsx`)
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