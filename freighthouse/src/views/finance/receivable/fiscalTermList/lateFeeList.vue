<template>
  <div
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <!-- finance-seabill-cnt -->
      <div class="money-box" style="background-color: #fff;">
        <div class="money-box-left">
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-lateFeeList', 'btn-lateFeeReceive')"
              class="finance-btn"
              @click="lateFeeReceive"
              size="mini"
              type="primary"
            >滞纳金收取</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-lateFeeList', 'btn-lateFeeDerate')"
              class="finance-btn"
              @click="lateFeeDerate"
              size="mini"
              type="primary"
            >滞纳金减免</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-lateFeeList', 'btn-withdrawalConfirm')"
              class="finance-btn"
              @click="withdrawalConfirm"
              size="mini"
              type="purple"
            >滞纳金确认撤销</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-lateFeeList', 'btn-handleExport')"
              class="finance-btn"
              @click="handleExport"
              size="mini"
            >导出</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{ key: 'prop', label: 'label' }"
        @close="customColumnsPopClose"
      />
    </div>
    <ResultDialog :option="resultDialogOption" @close="resultDialogOption.show = false">
      <div class="result-dialog-descript" slot="descript">
        <span v-for="item in settleOrderNos.split(',')" :key="item">{{item}}</span>
      </div>
    </ResultDialog>
    <LateFeeReceive :receiveVisibleOut.sync="receiveVisibleOut" :lateFeeFormOut="lateFeeFormOut" @refreshListPage="refreshListPage" />
    <LateFeeDerate :derateVisibleOut.sync="derateVisibleOut" :lateFeeFormOut="lateFeeFormOut" @refreshListPage="refreshListPage" />
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { custOverduePaymentList, listPageSummary, withdrawalConfirm } from '@/api/fin/custOverduePayment'
import { listByRole } from '@/api/base'
import { departmentTreeList } from '@/api/companyResource'
import { dateFormat } from '@/views/finance/utils/finance'
import LateFeeReceive from '@/views/finance/receivable/fiscalTermList/lateFeeReceive'
import LateFeeDerate from '@/views/finance/receivable/fiscalTermList/lateFeeDerate'
export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: custOverduePaymentList('geturl'),
      keyDownActive: true,
      departmentList: [],
      searchOption: {},
      option1: {},
      multipleSelection1: [],
      resultDialogOption: {
        show: false,
        title: '生成成功',
        resultType: 'success',
        text_cancel: '关闭',
        titleText: '生成多个结算单成功！',
      },
      settleOrderNos: '',
      selfColumnsBase: [
        {
          disabled: true,
          prop: 'custOverduePaymentNo',
          label: '滞纳金编号',
          width: '130px',
          type: 'button',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'settleCompName',
          label: '分公司',
          type: 'text',
          width: 140,
          sortable: false,
        },
        {
          prop: 'settleCorpName',
          label: '结算单位',
          type: 'text',
          width: 140,
        },
        {
          disabled: true,
          prop: 'writeoffReceipayNo',
          label: '核销编号',
          width: '130px',
          type: 'button',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.showOneNoDetail('writeoffNos', row.writeoffReceipayNo, { isTab: true })
            },
          },
        },
        {
          prop: 'receiveDate',
          label: '收付日期',
          type: 'text',
          width: 90,
        },
        {
          prop: 'currency',
          label: '币种',
          type: 'text',
          width: 90,
        },
        {
          prop: 'feeAmt',
          label: '应收金额',
          type: 'text',
          width: 100,
        },
        {
          prop: 'arrearAmt',
          label: '超期金额',
          type: 'text',
          width: 100,
        },
        {
          prop: 'arrearReceiveAmt',
          label: '超期已收金额',
          type: 'text',
          width: 110,
        },
        {
          prop: 'lateFeeAmt',
          label: '实际滞纳金',
          type: 'text',
          width: 100,
        },
        {
          prop: 'unconfirmLateFeeAmt',
          label: '待确认实际滞纳金',
          type: 'text',
          width: 130,
        },
        {
          prop: 'confirmLateFeeAmt',
          label: '已确认实际滞纳金',
          type: 'text',
          width: 130,
        },
        {
          prop: 'deductLateFeeAmt',
          label: '减免实际滞纳金',
          type: 'text',
          width: 120,
        },
        {
          prop: 'disposalStatus',
          label: '处理状态',
          type: 'select',
          propInDict: 'custOverduePaymentDisposalStatus',
          sortable: false,
        },
        {
          prop: 'lateFeeOrderNo',
          label: '滞纳金下架单号',
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps, index) => {
              let row = componentProps.row
              let lateFeeOrderNos = row.lateFeeOrderNo_multiValue
              let lateFeeTypes = row.lateFeeType_multiValue
              let no2 = lateFeeOrderNos[index]
              let type = lateFeeTypes[index]
              this.showOneNoDetail(type, no2, { isTab: true })
            }
          },
          sortable: false,
        },
        {
          prop: 'disposalType',
          label: '处理方式',
          type: 'select',
          propInDict: 'custOverduePaymentDisposalType',
          sortable: false,
        },
        {
          prop: 'assumerType',
          label: '承担方式',
          type: 'select',
          propInDict: 'custOverduePaymentAssumerType',
          sortable: false,
        },
        {
          prop: 'reductionType',
          label: '减免方式',
          type: 'select',
          propInDict: 'custOverduePaymentDeductionType',
          sortable: false,
        },
        {
          prop: 'bdEmployeeName',
          label: '销售',
          type: 'text',
          width: 100,
          sortable: false,
        },
        {
          prop: 'bdDeptName',
          label: '销售所属部门',
          type: 'text',
          width: 100,
          sortable: false,
        },
        {
          prop: 'writeoffName',
          label: '核销人',
          type: 'text',
          width: 100,
          sortable: false,
        },
        {
          prop: 'writeoffTime',
          label: '核销时间',
          type: 'text',
          width: 130,
        },
        {
          prop: 'deductionApplyNo',
          label: '减免申请编号',
          type: 'button',
          width: 130,
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.routerPushTab('DerateDetail', { deductionApplyNo: row.deductionApplyNo })
            },
          },
        },
      ],
      receiveVisibleOut: false,
      derateVisibleOut: false,
      lateFeeFormOut: {}
    }
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    CustomColumns,
    LateFeeReceive,
    LateFeeDerate
  },
  // activated() {
  //   !this.isFirstGetData && this.getData()
  // },
  created() {
    this.loanBasicData()
    let searchArr = ['custOverduePaymentNo', 'orderNo', 'settleCorpCode', 'writeoffReceipayNo', 'receiveDate', 'disposalStatus']
    this.searchOption = {
      saveDefault: true,
      saveName: 'lateFeeList',
      isNotAutoLoad: true,
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          custOverduePaymentNo: { label: '滞纳金编号', type: 'input' },
          orderNo: { label: '工作单号', type: 'input' },
          settleCompCode: {
            label: '分公司',
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            remoteSelectList: [],
          },
          settleCorpCode: {
            label: '结算单位',
            type: 'remoteSelect',
            showType: '6',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item)
            },
            remoteSelectList: [],
          },
          writeoffReceipayNo: { label: '核销编号', type: 'input' },
          fiscalTermNo: { label: '应收账单编号', type: 'input' },
          receiveDate: { label: '收付日期', type: 'daterange', format: 'yyyy-MM-dd' },
          currency: { label: '币种', type: 'select', prop: 'currency', multiple: true },
          disposalStatus: { label: '处理状态', type: 'select', prop: 'custOverduePaymentDisposalStatus', multiple: true },
          deductionApplyNo: { label: '减免申请编号', type: 'input' },
          writeoffDate: { label: '核销日期', type: 'daterange', format: 'yyyy-MM-dd' },
          writeoffBy: {
            label: '核销人',
            type: 'remoteSelect',
            multiple: true,
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          bdEmployeeId: {
            label: '销售',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getSellers(queryString, item, ''), // 'bd'
            visibleChange: (queryString, item) => this.getSellers(queryString, item, ''), // 'bd'
          },
          bdDeptCode: {
            label: '销售所属部门',
            prop: 'bdDeptCode',
            type: 'cascader',
            cascaderList: this.departmentList,
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
              // multiple: true
            },
          },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '详情',
          type: 'text',
          show: true,
          action: 'showDetail',
        },
      ],
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option1 = Object.assign({}, this.option, {
      customColumns: {
        show: true,
        handleCustomColumns: () => {
          if (!this.isNotFirtGetData) {
            this.getData(false, true).then((res) => setTimeout(() => (this.customColumnsPopShow = true), 600))
          } else {
            this.customColumnsPopShow = true
          }
        },
      },
      id: 'option1',
      $name: 'lateFeeList',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      emptyText: '数据将在查询后显示',
      pagination,
      listAmtSummary,
      sortable: true,
      sortChange: this.sortChange,
    })
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = columns
  },
  methods: {
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    sortChange(column, prop, order) {
      this.sortParams = { prop, order }
      this.isSort = true
      this.getData()
    },
    lateFeeReceive() {
      if (this.multipleSelection1.length !== 1) {
        return this.$message({ message: '请选择一个滞纳金编号', type: 'error', showClose: true })
      }
      let row = this.multipleSelection1[0]
      if (row.disposalStatus !== 'init') {
        return this.$message({ message: '待处理的滞纳金才允许发起滞纳金收取', type: 'error', showClose: true })
      }
      this.lateFeeFormOut = {
        custOverduePaymentNo: row.custOverduePaymentNo,
        settleCompName: row.settleCompName,
        settleCorpName: row.settleCorpName,
        currency: row.currency,
        lateFeeAmt: row.lateFeeAmt
      }
      this.receiveVisibleOut = true
      // this.routerPushTab('LateFeeReceive', {
      //   custOverduePaymentNo: row.custOverduePaymentNo,
      //   settleCompName: row.settleCompName,
      //   settleCorpName: row.settleCorpName,
      //   currency: row.currency,
      //   lateFeeAmt: row.lateFeeAmt
      // })
    },
    lateFeeDerate() {
      if (this.multipleSelection1.length !== 1) {
        return this.$message({ message: '请选择一个滞纳金编号', type: 'error', showClose: true })
      }
      let row = this.multipleSelection1[0]
      if (row.disposalStatus !== 'init') {
        return this.$message({ message: '待处理的滞纳金才允许发起滞纳金减免申请', type: 'error', showClose: true })
      }
      this.lateFeeFormOut = {
        custOverduePaymentNo: row.custOverduePaymentNo,
        settleCompName: row.settleCompName,
        settleCorpName: row.settleCorpName,
        currency: row.currency,
        lateFeeAmt: row.lateFeeAmt
      }
      this.derateVisibleOut = true
      // this.routerPushTab('LateFeeDerate', {
      //   custOverduePaymentNo: row.custOverduePaymentNo,
      //   settleCompName: row.settleCompName,
      //   settleCorpName: row.settleCorpName,
      //   currency: row.currency,
      //   lateFeeAmt: row.lateFeeAmt
      // })
    },
    withdrawalConfirm() {
      if (this.multipleSelection1.length !== 1) {
        return this.$message({ message: '请选择一个滞纳金编号', type: 'error', showClose: true })
      }
      let row = this.multipleSelection1[0]
      if (row.disposalStatus !== 'done') {
        return this.$message({ message: '只有已确认的的滞纳金才允许操作撤销确认', type: 'error', showClose: true })
      }
      this.$confirm('是否确认撤销滞纳金确认？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        let data = {
          custOverduePaymentNo: row.custOverduePaymentNo
        }
        withdrawalConfirm(data).then(res => {
          this.$message({ message: '撤销成功', type: 'success', showClose: true })
          this.getData()
        })
      }).catch(err => {
        console.log(err)
      })
    },
    getData(isSearch, otherParams) { // getData(isSearch, customerList)
      this.isNotFirtGetData = true
      this.lsLoading = true
      let { prop, order } = this.sortParams
      let isCustom = otherParams === true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: isCustom ? 0 : this.option1.pagination.pageSize,
        columns: [],
        query: [],
        ascColumns: order === 'ascending' ? [prop] : [],
        descColumns: order === 'descending' ? [prop] : order === 'ascending' ? [] : ['createdTime'],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({ column: 'confirmStatus', type: 'eq', value: this.buttonSearch })
      }
      // if (isSearch) {
      //   this.searchBackup = data.query
      // }
      // data.query = this.searchBackup || []
      let isExport = typeof otherParams === 'object' && otherParams.isExport
      if (isExport) {
        this.$confirm('是否确认导出滞纳金列表？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          data.query.push({"column": "queryDataModuleCode", "type": "eq", "value": "custOverduePaymentListExport"})
          if (this.multipleSelection1.length) {
            data.query.push({"column": "custOverduePaymentNo", "type": "in", "value": this.multipleSelection1.map(item => item.custOverduePaymentNo).join(',')})
          }
          this.$store.dispatch('finance/downloadExcelFile', { data }).then((res) => {
            let link = document.createElement('a')
            link.href = window.URL.createObjectURL(res)
            link.download = '滞纳金列表导出' + dateFormat('yyyy-mm-dd HH_MM_SS', new Date()) + '.xlsx'
            link.click()
            this.lsLoading = false
          })
        }).catch(err => {
          console.log(err)
          this.lsLoading = false
        })
        return
      }
      return custOverduePaymentList(data)
        .then((res) => {
          if (res.code === 0) {
            this.finCommonColumns(res)
            if (isCustom) return
            // if (res.data.configColumns && res.data.configColumns.length) {
            // 	let columns = res.data.configColumns
            // 	this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
            // 	this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
            // 	this.configColumns = res.data.configColumns
            // }
            let list = res.data.list
            let data = []
            list.forEach((item) => {
              item.lateFeeOrderNo_multiValue = item.lateFeeOrderNo ? item.lateFeeOrderNo.split(',').map(item => item.split('/')[0]) : []
              item.lateFeeType_multiValue = item.lateFeeOrderNo ? item.lateFeeOrderNo.split(',').map(item => item.split('/')[1]) : []
              data.push(item)
            })
            this.option1.data = data
            console.log(this.option1.data)
            this.$set(this.option1, 'emptyText', '未查询到任何数据')
            Object.assign(this.option1.pagination, res.data)
            // this.option1.pagination.currPage = res.data.currPage
            // this.option1.pagination.pageSize = res.data.pageSize
            // this.option1.pagination.totalCount = res.data.totalCount
          }
        })
        .finally(() => {
          this.lsLoading = false
        })
    },
    getListAmtSummary(data) {
      listPageSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let data = {
            lateFeeAmtSummaryList: []
          }
          data = Object.assign(data, res.data)
          let labelObj = {
            lateFeeAmtSummaryListLabel: '实际滞纳金'
          }
          let colorObj = {
            lateFeeAmtSummaryListColor: 'red', // 支持red, green, black三种值
          }
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj,
          })
        }
      })
    },
    //导出按钮
    handleExport(params, isSearch) {
      this.getData(true, { isExport: true })
    },
    search(data, index) {
      this.buttonSearch = data
      this.option1.pagination.currPage = 1
      this.getData(true)
      if (index || index === 0) {
        this.rightFilterBtns = [false, false, false]
        this.rightFilterBtns[index] = true
      }
    },
    sendMulti(data) {
      this.multipleSelection1 = data
      let data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      let nos = this.multipleSelection1.map(item => item.custOverduePaymentNo).join(',')
      if (this.multipleSelection1.length) {
        data2.query.push({
          column: 'custOverduePaymentNo',
          type: 'eq',
          value: nos,
        })
      } else {
        data2.query = this.searchBackup || []
      }
      this.debounceLs(() => {
        this.getListAmtSummary(data2)
      })
    },
    showDetail(row) {
      this.routerPushTab('LateFeeDetail', {
        custOverduePaymentNo: row.custOverduePaymentNo,
        // settleCompName: row.settleCompName,
        // settleCorpName: row.settleCorpName,
        // writeoffReceipayNo: row.writeoffReceipayNo,
        // receiveDate: row.receiveDate,
        // currency: row.currency,
        // arrearReceiveAmt: row.arrearReceiveAmt,
        // lateFeeAmt: row.lateFeeAmt,
        // unconfirmLateFeeAmt: row.unconfirmLateFeeAmt,
        // confirmLateFeeAmt: row.confirmLateFeeAmt,
        // deductLateFeeAmt: row.deductLateFeeAmt,
        // disposalStatus: row.disposalStatus
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