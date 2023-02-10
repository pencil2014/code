<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div>
      <div class="money-box money-box-border-bottom" style="background:#FFFFFF;border-radius:4px;">
        <div class="money-box-left">
          <div class="money-title">{{$t('LateFee.billRecvNo')}}: {{fiscalTermNo}}</div>
        </div>
        <div class="money-box-right">
          <el-button @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
        </div>
      </div>
      <div class="settlement-detail-form settlement-detail-form-own money-box-border-bottom">
        <el-form
          :model="fiscalTermForm"
          ref="fiscalTermForm"
          :inline="true"
          size="mini"
          label-width="100px"
        >
          <DetailDiv :label="$t('FeeList.settleComp')" :content="fiscalTermForm.settleCompName" :isTooltip="true" />
          <DetailDiv :label="$t('FeeList.settleCorp')" :content="fiscalTermForm.settleCorpName" :isTooltip="true" />
          <DetailDiv :label="$t('LateFee.billingDay')" :content="fiscalTermForm.settleDate" />
          <DetailDiv :label="$t('LateFee.dueDate')" :content="fiscalTermForm.dueDate" />
          <DetailDiv :label="$t('LateFee.graceDays')" :content="fiscalTermForm.graceDays" />
          <DetailDiv :label="$t('LateFee.cleanStatus')" :content="dictMapObj['cleanStatus'][fiscalTermForm.cleanStatus]" />
        </el-form>
      </div>
    </div>
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <!-- <div class="finance-seabill-cnt" style="padding-top: 8px;">
      <FinanceTableMass :option="option1" />
    </div> -->
    <div class="finance-list-container">
      <div class="money-box" style="background-color:#fff;">
        <div class="money-box-left">
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1" />
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
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { queryFiscalTermFeePage, queryFiscalTermFeeSummary } from '@/api/fin/fiscalterm'
import { dateFormat } from '@/views/finance/utils/finance'
import { listByRole } from '@/api/base'
import { departmentTreeList } from '@/api/companyResource'
export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      fiscalTermNo: 0,
      searchOption: {},
      option1: {},
      loading: false,
      //部门
      departmentList: [],
      fiscalTermForm: {
        settleCompName: '',
        settleCorpName: '',
        settleDate: '',
        dueDate: '',
        graceDays: '',
        cleanStatus: ''
      },
      selfColumnsBase: [
        {
          disabled: true,
          prop: 'sourceBizNo',
          label: this.$t('PreClose.bizNo'),
          width: 140,
          type: 'button',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              let sourceType = row.sourceType
              let sourceBizNo = row.sourceBizNo
              this.showOneNoDetail(sourceType, sourceBizNo, { feeId: row.feeId })
            },
          },
        },
        {
          prop: 'settleCorpName',
          label: this.$t('FeeList.settleCorp'),
          width: 140,
          type: 'text',
        },
        {
          prop: 'businessType',
          label: this.$t('FeeList.businessTypes'),
          type: 'select',
          width: 100,
          propInDict: 'businessType',
        },
        {
          prop: 'feeEnName',
          label: this.$t('FeeList.feeEname'),
          type: 'text',
          width: 105
        },
        {
          prop: 'receipayType',
          label: this.$t('FeeList.receipayType'),
          type: 'select',
          propInDict: 'feeitemReceipayGroup',
          width: 160
        },
        {
          prop: 'crmTimeType',
          label: this.$t('Finance.timeType'),
          type: 'select',
          propInDict: 'settleInfoTimeType',
        },
        {
          prop: 'feeDate',
          label: this.$t('Common.time'),
          type: 'text',
        },
        {
          prop: 'currency',
          label: this.$t('Settle.orignalCurrency'),
          type: 'text',
          width: 110
        },
        {
          prop: 'feeAmt',
          label: this.$t('LateFee.feeAmt2'), // '原币应收金额',
          width: 155,
          type: 'text',
        },
        {
          prop: 'unrecvAmt',
          label: this.$t('LateFee.unrecvAmt2'), // '原币未收金额',
          width: 160,
          type: 'text',
        },
        {
          prop: 'bdEmployeeName',
          label: this.$t('PreClose.salesman'),
          type: 'text',
          width: 100
        },
        {
          prop: 'ownerDeptName',
          label: this.$t('Finance.salesDepart'),
          width: 110,
          type: 'text',
        },
        {
          prop: 'ownerCompName',
          label: this.$t('LateFee.salesCompany'), // '销售所属分公司',
          width: 140,
          type: 'text',
        },
        {
          prop: 'settleCompName',
          label: this.$t('Supplier.settlementBranch'),
          width: 140,
          type: 'text',
        },
        {
          prop: 'usdExRate',
          label: this.$t('LateFee.usdExRate'), // '折USD汇率',
          type: 'text',
          width: 135
        },
        {
          prop: 'recvUsdAmt',
          label: this.$t('LateFee.recvUsdAmt'), // '折USD应收',
          type: 'text',
          width: 135
        },
        {
          prop: 'unrecvUsdAmt',
          label: this.$t('LateFee.unrecvUsdAmt'), // '折USD未收',
          type: 'text',
          width: 140
        },
        {
          prop: 'cnyExRate',
          label: this.$t('LateFee.cnyExRate'), // '折CNY汇率',
          type: 'text',
          width: 135
        },
        {
          prop: 'recvCnyAmt',
          label: this.$t('LateFee.recvCnyAmt'), // '折CNY应收',
          type: 'text',
          width: 135
        },
        {
          prop: 'unrecvCnyAmt',
          label: this.$t('LateFee.unrecvCnyAmt'), // '折CNY未收',
          type: 'text',
          width: 140
        },
        {
          prop: 'arrearReceiveAmt',
          label: this.$t('LateFee.arrearReceiveOrigiAmt'), // '原币超期已收',
          width: 195,
          type: 'text',
        },
        {
          prop: 'arrearReceivedUsdAmt',
          label: this.$t('LateFee.arrearReceivedUsdAmt'), // '超期已收折USD',
          width: 175,
          type: 'text',
        },
        {
          prop: 'arrearReceivedCnyAmt',
          label: this.$t('LateFee.arrearReceivedCnyAmt'), // '超期已收折CNY',
          width: 175,
          type: 'text',
        },
        {
          prop: 'arrearUsdAmt',
          label: this.$t('LateFee.arrearUsdAmt'), // '超期USD未收',
          width: 195,
          type: 'text',
        },
        {
          prop: 'arrearCnyAmt',
          label: this.$t('LateFee.arrearCnyAmt'), // '超期CNY未收',
          width: 195,
          type: 'text',
        },
        {
          prop: 'interest',
          label: this.$t('LateFee.interest'), // '预计滞纳金',
          width: 130,
          type: 'text',
        },
        // {
        //   prop: 'interest',
        //   label: this.$t('Finance.actuallatefee'), // 三个滞纳金金额去掉
        //   width: 100,
        //   type: 'text',
        // },
        // {
        //   prop: 'unconfirmLateFeeAmt',
        //   label: '待确认滞纳金',
        //   width: 100,
        //   type: 'text',
        // },
        // {
        //   prop: 'confirmLateFeeAmt',
        //   label: '已确认滞纳金',
        //   width: 100,
        //   type: 'text',
        // },
        {
          prop: 'remark',
          label: this.$t('LateFee.feeDateRule'), // '费用日期规则描述',
          width: 150,
          type: 'text',
        },
      ],
    }
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    CustomColumns,
  },
  created() {
    this.loanBasicData()
    this.searchOption = {
      addFilter: {
        defaultSearchLength: 3,
        searchInputGroup: [
          { key: 'sourceBizNo', value: '', showType: '1' },
          { key: 'ownerDeptNo', value: '', showType: '1' },
          { key: 'feeDate', value: '', showType: '2' },
        ],
        filterGroups: {
          sourceBizNo: {	label: this.$t('OrderFee.sourceBizNo'),	type: "input",	showType: "1" }, // fiscalTermNo // "单号"
          // employeeId: {	label: "业务员工号",	type: "input",	showType: "1" },
          // employeeName: {	label: "业务员",	type: "input",	showType: "1" },
          employeeId: {
            label: this.$t('PreClose.salesman'),
            showType: '1',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => {
              this.getSellers(queryString, item)
            },
            visibleChange: (queryString, item) => {
              this.getSellers(queryString, item)
            },
          },
          ownerDeptNo: {
            label: this.$t('LateFee.dept'), // '部门',
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
          // ownerCompCode: {
          // 	label: this.$t('FeeList.settleComp'),
          // 	prop: 'settleCorpCode',
          // 	type: 'remoteSelect',
          // 	remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
          // 	visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
          // 	remoteSelectList: [],
          // },
          feeDate: { label: this.$t('Common.time'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['feeDateStart', 'feeDateEnd'] },
          crmTimeType: { label: this.$t('LateFee.timeType'),	type: "select", prop:'settleInfoTimeType',	showType: "1" }, // useTimeType: {	label: "时间类型",	type: "select", prop:'settleInfoTimeType',	showType: "1" }, // "时间类型"
          businessType: { label: this.$t('FeeList.businessTypes'), type: 'select', prop: 'businessType', showType: '1' },
          settleCycle: { label: this.$t('LateFee.settleCycle'), type: 'select', prop: 'settleCycle' }, // '结算周期'
          currency: {
            label: this.$t('FeeList.currency'),
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true }) // , isPlaceBottom: true
    this.option1 = {
      ...this.option,
      id: 'option1',
      pagination,
      operationBtns: false,
      selection: false,
      sortable: false,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      listAmtSummary,
      customColumns: {
        show: true,
        handleCustomColumns: () => (this.customColumnsPopShow = true),
      },
    }
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.selfColumnsBase.forEach((item) => (item.sortable = true))
    this.option1.columns = columns
  },
  methods: {
    //返回
    cancel() {
      this.routerBack()
    },
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    // 所属部门下拉框
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
      })
    },
    getTreeData(data) {
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    getData(isSearch) {
      this.loading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: [],
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption)
      data.query.push({ column: 'fiscalTermNo', type: 'eq', value: this.fiscalTermNo })
      queryFiscalTermFeePage(data)
        .then((res) => {
          if (res.code === 0) {
            this.finCommonColumns(res)
            // if (res.data.configColumns && res.data.configColumns.length) {
            // 	let columns = res.data.configColumns
            // 	this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
            // 	this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
            // 	this.configColumns = res.data.configColumns
            // }
            let list = res.data.list
            this.option1.data = list
            this.table1DataBackup = [...this.option1.data]
            Object.assign(this.option1.pagination, res.data)
            // this.option1.pagination.currPage = res.data.currPage
            // this.option1.pagination.pageSize = res.data.pageSize
            // this.option1.pagination.totalCount = res.data.totalCount
          }
        })
        .finally(() => {
          this.loading = false
        })
      this.debounceLs(() => {
        this.getListAmtSummary(data)
      })
    },
    // 获取销售
    getSellers(name = '', item) {
      let query = [{ column: 'roleCode', type: 'in', value: 'bd,obd' }]
      name && query.push({ column: 'name', type: 'eq', value: name })
      listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data: { list } }) => {
        if (
          this.remoteSelectCommon(
            item,
            list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
          )
        )
          return
        item.remoteSelectList = list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
      })
    },
    getListAmtSummary(data1) {
      queryFiscalTermFeeSummary(data1).then((res) => {
        let data = {
          // recvUsdAmtList: [],
          // recvCnyAmtList: [],
          unrecvUsdAmtList: [],
          unrecvCnyAmtList: [],
          // arrearUsdAmtList: [],
          // arrearCnyAmtList: [],
        }
        data = Object.assign(data, {
          // recvUsdAmtList: [{ amt: res.data.recvUsdAmt }],
          // recvCnyAmtList: [{ amt: res.data.recvCnyAmt }],
          unrecvUsdAmtList: [{ amt: res.data.unrecvUsdAmt }],
          unrecvCnyAmtList: [{ amt: res.data.unrecvCnyAmt }],
          // arrearUsdAmtList: [{ amt: res.data.arrearUsdAmt }],
          // arrearCnyAmtList: [{ amt: res.data.arrearCnyAmt }],
        })
        let labelObj = {
          // recvUsdAmtListLabel: this.$t('LateFee.recvUsdAmt'), // '折USD',
          // recvCnyAmtListLabel: this.$t('LateFee.recvCnyAmt'), // '折CNY',
          unrecvUsdAmtListLabel: this.$t('LateFee.unrecvUsdAmt'), // '折USD',
          unrecvCnyAmtListLabel: this.$t('LateFee.unrecvCnyAmt'), // '折CNY',
          // arrearUsdAmtListLabel: this.$t('LateFee.arrearUsdAmt'), // '超期USD',
          // arrearCnyAmtListLabel: this.$t('LateFee.arrearCnyAmt'), // '超期CNY',
        }
        let colorObj = {
          // recvUsdAmtListColor: 'red', // 支持red, green, black三种值
          // recvCnyAmtListColor: 'red',
          unrecvUsdAmtListColor: 'red',
          unrecvCnyAmtListColor: 'red',
          // arrearUsdAmtListColor: 'red',
          // arrearCnyAmtListColor: 'red',
        }
        // let groups = [
        //   {
        //     label: this.$t('FeeList.receivable'),
        //     data: {
        //       recvUsdAmtList: data.recvUsdAmtList,
        //       recvCnyAmtList: data.recvCnyAmtList,
        //     },
        //   },
        //   {
        //     label: this.$t('LateFee.unrecvAmt'), // '未收',
        //     data: {
        //       unrecvUsdAmtList: data.unrecvUsdAmtList,
        //       unrecvCnyAmtList: data.unrecvCnyAmtList,
        //       arrearUsdAmtList: data.arrearUsdAmtList,
        //       arrearCnyAmtList: data.arrearCnyAmtList,
        //     },
        //   },
        // ]
        this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
          show: true,
          data,
          // groups,
          labelObj,
          colorObj,
          toolTipHide: true,
        })
      })
    },
    search(data, index) {
      this.buttonSearch = data
      this.option1.pagination.currPage = 1
      this.getData(null, true)
      if (index || index === 0) {
        this.rightFilterBtns = [false, false, false]
        this.rightFilterBtns[index] = true
      }
    },
  },
  activated() {
    if (!this.$route.meta.isUseCache) {
      // this.fiscalTermNo = this.$route.query.fiscalTermNo
      let { fiscalTermNo, settleCompName, settleCorpName, settleDate, dueDate, graceDays, cleanStatus } = this.$route.query
      this.fiscalTermNo = fiscalTermNo
      this.fiscalTermForm = Object.assign(this.fiscalTermForm, { settleCompName, settleCorpName, settleDate, dueDate, graceDays, cleanStatus })
    }
    // this.searchOption.data = { employeeId: '', ownerDeptNo: '', feeDate: '', businessType: '', currency: '', settleCycle: '' }
    // this.searchOption.addFilter.searchInputGroup = [
    //   { key: 'ownerDeptNo', value: '', showType: '1' },
    //   { key: 'feeDate', value: '', showType: '2' },
    // ]
  },
}
</script>

<style lang="scss" scoped>
.finance-approve-btns-box {
  display: flex;
  justify-content: space-between;
  height: 40px;
  padding: 0 24px;
  border-radius: 4px 4px 0px 0px;
  border-bottom: 1px solid #e9e9e9;
}
.finance-approve-btns-left {
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  line-height: 24px;
  margin-top: 8px;
}
.finance-approve-btns-right {
  margin-top: 6px;
}
</style>
