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
            >{{$t('LateFee.collectLateFee')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-lateFeeList', 'btn-lateFeeDerate')"
              class="finance-btn"
              @click="lateFeeDerate"
              size="mini"
              type="primary"
            >{{$t('LateFee.derateLateFee')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-lateFeeList', 'btn-withdrawalConfirm')"
              class="finance-btn"
              @click="withdrawalConfirm"
              size="mini"
              type="purple"
            >{{$t('LateFee.cancelLateFeeConfirm')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-lateFeeList', 'btn-handleExport')"
              class="finance-btn"
              @click="handleExport"
              size="mini"
            >{{$t('Common.export')}}</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
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
import { dateFormat } from '@/views/finance/utils/finance'
import LateFeeReceive from '@/views/finance/receivable/fiscalTermList/lateFeeReceive'
import LateFeeDerate from '@/views/finance/receivable/fiscalTermList/lateFeeDerate'
import lang from '@/lang/language'
import { listByRole } from '@/api/base'
import { departmentTreeList } from '@/api/companyResource'

export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: custOverduePaymentList('geturl'),
      keyDownActive: true,
      searchOption: {},
      option1: {},
      multipleSelection1: [],
      departmentList: [],
      resultDialogOption: {
        show: false,
        title: this.$t('FeeList.buildSuc'),
        resultType: 'success',
        text_cancel: this.$t('Common.close'),
         titleText: this.$t('FeeList.multipleSuc'),
      },
      settleOrderNos: '',
      selfColumnsBase: [
        {
          disabled: true,
          prop: 'custOverduePaymentNo',
          label: this.$t('LateFee.lateFeeNo'), // this.$t('Hedge.custOverduePaymentNo'), // ???????????????
          width: '140px',
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
          label: this.$t('FeeList.settleComp'),
          type: 'text',
          width: 140,
          sortable: false,
        },
        {
          prop: 'settleCorpName',
          label: this.$t('FeeList.settleCorp'),
          type: 'text',
          width: 140,
        },
        {
          disabled: true,
          prop: 'writeoffReceipayNo',
          label:  this.$t('Hedge.writeoffNo'),
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
          label: this.$t('FeeList.receivePayDates'),
          type: 'text',
          width: 175,
        },
        {
          prop: 'currency',
          label: this.$t('FeeList.currency'),
          type: 'text',
          width: 100,
        },
        {
          prop: 'feeAmt',
          label: this.$t('FeeList.recFeeAmt'),
          type: 'text',
          width: 140,
        },
        {
          prop: 'arrearAmt',
          label: this.$t('Finance.overdueAmt'),
          type: 'text',
          width: 130,
        },
        {
          prop: 'arrearReceiveAmt',
          label: this.$t('Hedge.arrearReceiveAmt'),
          type: 'text',
          width: 185,
        },
        {
          prop: 'lateFeeAmt',
          label: this.$t('Finance.actuallatefee'),
          type: 'text',
          width: 120,
        },
        {
          prop: 'unconfirmLateFeeAmt',
          label: this.$t('LateFee.unconfirmLateFeeAmt'), // '????????????????????????',
          type: 'text',
          width: 160,
        },
        {
          prop: 'confirmLateFeeAmt',
          label: this.$t('LateFee.confirmLateFeeAmt'), // '????????????????????????',
          type: 'text',
          width: 150,
        },
        {
          prop: 'deductLateFeeAmt',
          label: this.$t('LateFee.deductLateFeeAmt'), // '?????????????????????',
          type: 'text',
          width: 130,
        },
        {
          prop: 'disposalStatus',
          label: this.$t('LateFee.disposalStatus'), // '????????????',
          type: 'select',
          propInDict: 'custOverduePaymentDisposalStatus',
          sortable: false,
          width: 100
        },
        {
          prop: 'lateFeeOrderNo',
          label: this.$t('LateFee.lateFeeOrderNo'), // '?????????????????????',
          type: 'columnTip',
          width: 180,
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
          label:  this.$t('Common.processing'),
          type: 'select',
          propInDict: 'custOverduePaymentDisposalType',
          sortable: false,
          width: 100
        },
        {
          prop: 'assumerType',
          label: this.$t('LateFee.assumerType'), // '????????????',
          type: 'select',
          propInDict: 'custOverduePaymentAssumerType',
          sortable: false,
          width: 100
        },
        {
          prop: 'reductionType',
          label: this.$t('LateFee.reductionType'), // '????????????',
          type: 'select',
          propInDict: 'custOverduePaymentDeductionType',
          sortable: false,
          width: 100
        },
        {
          prop: 'bdEmployeeName',
          label: this.$t('OrderFee.salesperson'), // '??????',
          type: 'text',
          width: 100,
          sortable: false,
        },
        {
          prop: 'bdDeptName',
          label: this.$t('OrderFee.salesDepartment'), // '??????????????????',
          type: 'text',
          width: 120,
          sortable: false,
        },
        {
          prop: 'writeoffName',
          label:  this.$t('Hedge.writeoffs'),
          type: 'text',
          width: 100,
          sortable: false,
        },
        {
          prop: 'writeoffTime',
          label:  this.$t('Hedge.writeoffTime'),
          type: 'text',
          width: 130,
        },
        {
          prop: 'deductionApplyNo',
          label: this.$t('LateFee.derateApplyNo'), // '??????????????????',
          type: 'button',
          width: 170,
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
          custOverduePaymentNo: {label: this.$t('LateFee.lateFeeNo'), type: 'input' },
          orderNo: { label: this.$t('FeeList.orderNo'), type: 'input' },
          settleCompCode: {
            label: this.$t('FeeList.settleComp'),
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            remoteSelectList: [],
          },
          settleCorpCode: {
            label: this.$t('FeeList.settleCorp'),
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
          writeoffReceipayNo: { label:  this.$t('Hedge.writeoffNo'), type: 'input' },
          fiscalTermNo: { label: this.$t('Finance.receBillNo'), type: 'input' },
          receiveDate: { label: this.$t('FeeList.receivePayDates'), type: 'daterange', format: 'yyyy-MM-dd' },
          currency: { label: this.$t('FeeList.currency'), type: 'select', prop: 'currency', multiple: true },
          disposalStatus: { label: this.$t('LateFee.disposalStatus'), type: 'select', prop: 'custOverduePaymentDisposalStatus' }, // '????????????'
          deductionApplyNo: { label: this.$t('LateFee.derateApplyNo'), type: 'input' }, // '??????????????????'
          writeoffDate: { label: this.$t('PayApplyList.writeoffDate'), type: 'daterange', format: 'yyyy-MM-dd' }, // '????????????'
          writeoffBy: {
            label:  this.$t('Hedge.writeoffs'),
            type: 'remoteSelect',
            multiple: true,
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          bdEmployeeId: {
            label: this.$t('OrderFee.salesperson'), // '??????',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getSellers(queryString, item, ''), // 'bd'
            visibleChange: (queryString, item) => this.getSellers(queryString, item, ''), // 'bd'
          },
          bdDeptCode: {
            label: this.$t('OrderFee.salesDepartment'), // '??????????????????',
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
          label: this.$t('Common.details'),
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
      emptyText: this.$t('Common.emptyText'),
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
    // ??????????????????change   ????????????????????????
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    // ?????????????????????   ????????????????????????
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
        return this.$message({ message: this.$t('OrderFee.selectOneRow'), type: 'error', showClose: true }) // '??????????????????????????????'
      }
      let row = this.multipleSelection1[0]
      if (row.disposalStatus !== 'init') {
        return this.$message({ message: this.$t('LateFee.selectLateFeePending'), type: 'error', showClose: true }) // '???????????????????????????????????????????????????'
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
        return this.$message({ message: this.$t('OrderFee.selectOneRow'), type: 'error', showClose: true }) // '??????????????????????????????'
      }
      let row = this.multipleSelection1[0]
      if (row.disposalStatus !== 'init') {
        return this.$message({ message: this.$t('LateFee.selectLateFeePending'), type: 'error', showClose: true }) // '?????????????????????????????????????????????????????????'
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
        return this.$message({ message: this.$t('OrderFee.selectOneRow'), type: 'error', showClose: true }) // '??????????????????????????????'
      }
      let row = this.multipleSelection1[0]
      if (row.disposalStatus !== 'done') {
        return this.$message({ message: this.$t('LateFee.selectLateFeeConfirmed'), type: 'error', showClose: true }) // '?????????????????????????????????????????????????????????'
      }
      this.$confirm(this.$t('LateFee.sureCancelLateFeeConfirm'), this.$t('Common.tips'), { // ????????????????????????????????????
        confirmButtonText: this.$t('OrderFee.confirm'),
        cancelButtonText: this.$t('OrderFee.cancel'),
        type: 'warning',
      }).then(() => {
        let data = {
          custOverduePaymentNo: row.custOverduePaymentNo
        }
        withdrawalConfirm(data).then(res => {
          this.$message({ message: this.$t('OrderFee.successOp'), type: 'success', showClose: true }) // '????????????'
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
        this.$confirm(this.$t('LateFee.sureExportLateFeeList'), this.$t('Common.tips'), { // '????????????????????????????????????'
          confirmButtonText: this.$t('OrderFee.confirm'),
          cancelButtonText: this.$t('OrderFee.cancel'),
          type: 'warning',
        }).then(() => {
          if (!data.columns.length) {
            data.columns = this.selfColumnsBase.map(item => item.prop)
          }
          data.query.push({"column": "queryDataModuleCode", "type": "eq", "value": "custOverduePaymentListExport"})
          this.$store.dispatch('finance/downloadExcelFile', { data }).then((res) => {
            let link = document.createElement('a')
            link.href = window.URL.createObjectURL(res)
            link.download = this.$t('LateFee.lateFeeListExport') + dateFormat('yyyy-mm-dd HH_MM_SS', new Date()) + '.xlsx' // '?????????????????????'
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
              item.bdEmployeeName = item.bdEmployeeName === 'null' ? '' : item.bdEmployeeName
              item.bdDeptName = item.bdDeptName === 'null' ? '' : item.bdDeptName
              data.push(item)
            })
            this.option1.data = data
            this.$set(this.option1, 'emptyText',  this.$t('Common.noData'))
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
            lateFeeAmtSummaryListLabel: this.$t('LateFee.lateFeeAmt'), // '???????????????'
          }
          let colorObj = {
            lateFeeAmtSummaryListColor: 'red', // ??????red, green, black?????????
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
    //????????????
    handleExport(params, isSearch) {
      this.getData(true, { isExport: true })
    },
    // ????????????
    getSellers(name = '', item, role) {
      let query = [{ column: 'roleCode', type: 'eq', value: role }] // column: 'roleCode', type: 'in', value: 'bd,obd'
      name && query.push({ column: 'name', type: 'eq', value: name })
      listByRole({ currPage: 1, pageSize: 30, query }).then(({ data: { list } }) => {
        list = list.map((v) => ({ ...v, label: `${lang === 'zh' ? v.cname : v.ename}(${v.employeeNo})`, value: v.employeeId }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList = list
      })
    },
    // ???????????????
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
      })
    },
    // ??????children???????????????undefined
    getTreeData(data) {
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
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
  },
}
</script>