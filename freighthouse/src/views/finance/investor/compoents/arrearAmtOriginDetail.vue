<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <!-- <div> -->
    <div class="money-box" style="background:#FFFFFF;border-bottom:1px solid #e9e9e9;">
      <div class="money-box-left">
        <div class="money-title">
          超期详情
          <span
            style="font-size: 12px;padding-left: 20px;font-weight: normal;"
          >原超期金额：{{$route.query.amt+' '+$route.query.currency}}</span>
        </div>
      </div>
      <div class="money-box-right">
        <el-button @click="cancel" size="mini">返回</el-button>
      </div>
    </div>
    <!-- </div> -->
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <!-- <div class="finance-search-list-gap"></div> -->
    <div class="finance-list-container">
      <el-button
        class="finance-btn refresh_btn"
        @click="refreshListPage"
        size="mini"
        type="primary"
      >刷新</el-button>
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
import { listByRole } from '@/api/base'
import { departmentTreeList } from '@/api/companyResource'
export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      searchOption: {},
      option1: {},
      loading: false,
      //部门
      departmentList: [],
      selfColumnsBase: [
        {
          disabled: true,
          prop: 'fiscalTermNo',
          label: '应收账单编号',
          width: 140,
          type: 'button',
          operationBtns: {
            show: true,
            callback: (
              action,
              $index,
              { fiscalTermNo, settleCompName, settleCorpName, settleDate, dueDate, graceDays, cleanStatus },
              option
            ) => {
              this.routerPush('FiscalTermDetail', {
                fiscalTermNo,
                settleCompName,
                settleCorpName,
                settleDate,
                dueDate,
                graceDays,
                cleanStatus,
              })
            },
          },
        },
        {
          prop: 'settleDate',
          label: '账单日',
          type: 'text',
        },
        {
          prop: 'dueDate',
          label: '结款到期日期',
          width: 100,
          type: 'text',
        },
        {
          prop: 'graceDays',
          label: '宽限天数',
          type: 'text',
        },
        {
          disabled: true,
          prop: 'sourceBizNo',
          label: '单号',
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
          label: '结算单位',
          width: 140,
          type: 'text',
        },
        {
          prop: 'businessType',
          label: '业务类型',
          type: 'select',
          width: 100,
          propInDict: 'businessType',
        },
        {
          prop: 'feeName',
          label: '费用名称',
          type: 'text',
        },
        {
          prop: 'receipayType',
          label: '收付类型',
          type: 'select',
          propInDict: 'feeitemReceipayGroup',
        },
        {
          prop: 'crmTimeType',
          label: '时间类型',
          type: 'select',
          propInDict: 'settleInfoTimeType',
        },
        {
          prop: 'feeDate',
          label: '时间',
          type: 'text',
        },
        {
          prop: 'currency',
          label: '原币种',
          type: 'text',
        },
        {
          prop: 'feeAmt',
          label: '原币应收金额',
          width: 100,
          type: 'text',
        },
        {
          prop: 'unrecvAmt',
          label: '原币未收金额',
          width: 100,
          type: 'text',
        },
        {
          prop: 'bdEmployeeName',
          label: '业务员',
          type: 'text',
        },
        {
          prop: 'ownerDeptName',
          label: '销售所属部门',
          width: 100,
          type: 'text',
        },
        {
          prop: 'ownerCompName',
          label: '销售所属分公司',
          width: 140,
          type: 'text',
        },
        {
          prop: 'settleCompName',
          label: '结算分公司',
          width: 140,
          type: 'text',
        },
        {
          prop: 'usdExRate',
          label: '折USD汇率',
          type: 'text',
        },
        {
          prop: 'recvUsdAmt',
          label: '折USD应收',
          type: 'text',
        },
        {
          prop: 'unrecvUsdAmt',
          label: '折USD未收',
          type: 'text',
        },
        {
          prop: 'cnyExRate',
          label: '折CNY汇率',
          type: 'text',
        },
        {
          prop: 'recvCnyAmt',
          label: '折CNY应收',
          type: 'text',
        },
        {
          prop: 'unrecvCnyAmt',
          label: '折CNY未收',
          type: 'text',
        },
        {
          prop: 'arrearReceiveAmt',
          label: '原币超期已收',
          width: 100,
          type: 'text',
        },
        {
          prop: 'arrearReceivedUsdAmt',
          label: '超期已收折USD',
          width: 100,
          type: 'text',
        },
        {
          prop: 'arrearReceivedCnyAmt',
          label: '超期已收折CNY',
          width: 100,
          type: 'text',
        },
        {
          prop: 'arrearUsdAmt',
          label: '超期未收折USD',
          width: 100,
          type: 'text',
        },
        {
          prop: 'arrearCnyAmt',
          label: '超期未收折CNY',
          width: 100,
          type: 'text',
        },
        {
          prop: 'interest',
          label: '预计滞纳金',
          width: 100,
          type: 'text',
        },
        {
          prop: 'remark',
          label: '费用日期规则描述',
          width: 120,
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
          { key: 'sourceBizNo', value: '' },
          { key: 'ownerDeptNo', value: '' },
          { key: 'feeDate', value: '' },
        ],
        filterGroups: {
          fiscalTermNo: { label: '应收账单编号', type: 'input' },
          sourceBizNo: { label: '单号', type: 'input' },
          employeeId: {
            label: '业务员',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getSellers(queryString, item),
            visibleChange: (queryString, item) => this.getSellers(queryString, item),
          },
          ownerDeptNo: {
            label: '部门',
            prop: 'deptCode',
            type: 'diyCascader',
            cascaderList: this.departmentList,
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
            },
          },
          // ownerCompCode: {
          // 	label: '分公司',
          // 	prop: 'settleCorpCode',
          // 	type: 'remoteSelect',
          // 	remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
          // 	visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
          // 	remoteSelectList: [],
          // },
          feeDate: { label: '时间', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['feeDateStart', 'feeDateEnd'] },
          crmTimeType: { label: '时间类型', type: 'select', prop: 'settleInfoTimeType' }, // useTimeType: {	label: "时间类型",	type: "select", prop:'settleInfoTimeType',	showType: "1" },
          businessType: { label: '业务类型', type: 'select', prop: 'businessType' },
          // settleCycle: { label: '结算周期', type: 'select', prop: 'settleCycle' },
          currency: {
            label: '币种',
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
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
      this.finCommonSearch(data.query, this.searchOption, true)
      data.query.push({ column: 'settleCorpCode', type: 'eq', value: this.$route.query.settleCorpCode })
      data.query.push({ column: 'hasArrear', type: 'eq', value: 'yes' })
      queryFiscalTermFeePage(data)
        .then((res) => {
          this.finCommonColumns(res)
          let list = res.data.list
          this.option1.data = list
          this.table1DataBackup = [...this.option1.data]
          Object.assign(this.option1.pagination, res.data)
        })
        .finally(() => (this.loading = false))
      this.debounceLs(() => {
        this.getListAmtSummary(data)
      })
    },
    // 获取销售
    getSellers(name = '', item) {
      let query = [{ column: 'roleCode', type: 'in', value: 'bd,obd' }]
      name && query.push({ column: 'name', type: 'eq', value: name })
      listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data: { list } }) => {
        list = list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList = list
      })
    },
    getListAmtSummary(data1) {
      queryFiscalTermFeeSummary(data1).then((res) => {
        let data = {
          unrecvUsdAmtList: [],
          unrecvCnyAmtList: [],
        }
        data = Object.assign(data, {
          unrecvUsdAmtList: [{ amt: res.data.unrecvUsdAmt }],
          unrecvCnyAmtList: [{ amt: res.data.unrecvCnyAmt }],
        })
        let labelObj = {
          unrecvUsdAmtListLabel: '折USD未收金额',
          unrecvCnyAmtListLabel: '折CNY未收金额',
        }
        let colorObj = {
          unrecvUsdAmtListColor: 'red',
          unrecvCnyAmtListColor: 'red',
        }
        this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
          show: true,
          data,
          labelObj,
          colorObj,
          toolTipHide: true,
        })
      })
    },
    search(data) {
      this.buttonSearch = data
      this.option1.pagination.currPage = 1
      this.getData(null, true)
    },
  },
  activated() {
    if (!this.$route.meta.isUseCache) {
      this.searchOption.addFilter.searchInputGroup = [
        { key: 'sourceBizNo', value: '' },
        { key: 'ownerDeptNo', value: '' },
        { key: 'feeDate', value: '' },
      ]
    }
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
.finance-list-container {
  position: relative;
}
.finance-btn.refresh_btn {
  position: absolute;
  z-index: 1;
  right: 8px;
  top: 6px;
}
</style>
