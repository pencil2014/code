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
      <div class="money-box" style="background-color: #fff;">
        <div class="money-box-left">
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="handleExport">导出</el-button>
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
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { queryFiscalTermFeePage, queryFiscalTermFeeSummary } from '@/api/fin/fiscalterm'
import { listByRole } from '@/api/base'
import { departmentTreeList } from '@/api/companyResource'
export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: queryFiscalTermFeePage('geturl'),
      keyDownActive: true,
      searchOption: {},
      option1: {},
      multipleSelection1: [],
      departmentList: [],
      selfColumnsBase: [
        {
          disabled: true,
          prop: 'fiscalTermNo',
          label: '应收账单编号',
          width: '155px',
          type: 'button',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'settleDate',
          label: '账单日',
          type: 'text',
          width: 110,
        },
        {
          prop: 'dueDate',
          label: '结款到期日',
          type: 'text',
          width: 110,
        },
        {
          prop: 'graceDays',
          label: '宽限天数',
          type: 'text',
        },
        {
          prop: 'settleCompName',
          label: '分公司',
          type: 'text',
          width: 140,
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
          propInDict: 'feeListBusinessType',
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
          prop: 'bdEmployeeName',
          label: '销售',
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
        // {
        //   prop: 'settleCompName',
        //   label: '结算分公司',
        //   width: 140,
        //   type: 'text',
        // },
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
          prop: 'hasInterest',
          label: '是否产生预计滞纳金',
          type: 'select',
          propInDict: 'yesNo',
          width: 130,
        },
        {
          prop: 'billDays',
          label: '账龄',
          type: 'text',
        },
        {
          prop: 'arrearDays',
          label: '逾期天数',
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
  // activated() {
  //   !this.isFirstGetData && this.getData()
  // },
  created() {
    this.loanBasicData()
    let searchArr = ['fiscalTermNo', 'sourceBizNo', 'settleDate', 'settleCompCode', 'businessType']
    this.searchOption = {
      saveDefault: true,
      saveName: 'fiscalFeeDetailList',
      isNotAutoLoad: true,
      fixCreatedDate: true,
      fixCreatedKey: 'dueDate',
      fixCreatedNMonth: 2,
      fixCreatedSelectArr: ['3', '6'],
      addFilter: {
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          allNo: { label: '各类编号', type: 'input' },
          fiscalTermNo: { label: '应收账单编号', type: 'input' },
          settleDate: { label: '账单日', type: 'daterange', format: 'yyyy-MM-dd' },
          dueDate: { label: '结款到期日', type: 'daterange', format: 'yyyy-MM-dd' },
          settleCompCode: {
            label: '分公司',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            remoteSelectList: [],
          },
          sourceBizNo: { label: '单号', type: 'input' }, // fiscalTermNo
          settleCorpCode: {
            label: '结算单位',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (queryString, item, row) => this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item),
            visibleChange: (queryString, item, row) => this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item),
            remoteSelectList: [],
          },
          businessType: { label: '业务类型', type: 'select', prop: 'feeListBusinessType', multiple: true },
          // receipayType: { label: '收付类型', type: 'select', prop: 'onlyReceivePay' },
          feeCode: {
            label: '费用名称',
            type: 'remoteSelect',
            reqKey: 'feeCode',
            multiple: true,
            remoteMethod: (queryString, filterItem) => this.remoteFeeItemList(queryString, filterItem),
            visibleChange: (queryString, filterItem) => this.remoteFeeItemList(queryString, filterItem),
            remoteSelectList: [],
            // scope: true,
          },
          crmTimeType: { label: '时间类型', type: 'select', prop: 'settleInfoTimeType' }, // useTimeType: {	label: "时间类型",	type: "select", prop:'settleInfoTimeType',	showType: "1" },
          feeDate: { label: '时间', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['feeDateStart', 'feeDateEnd'] },
          bdEmployeeId: {
            label: '销售',
            type: 'remoteSelect',
            multiple: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => {
              this.getSellers(queryString, item)
            },
            visibleChange: (queryString, item) => {
              this.getSellers(queryString, item)
            },
          },
          ownerDeptNo: {
            label: '销售所属部门',
            prop: 'deptCode',
            type: 'cascader',
            cascaderList: this.departmentList,
            cascaderProps: {
              multiple: true,
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
            },
          },
          currency: {
            label: '原币种',
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
          graceDays: { label: '宽限天数', type: 'range', ranges: ['graceDaysStart', 'graceDaysEnd'], positive: true },
          billDays: { label: '账龄', type: 'range', ranges: ['billDaysStart', 'billDaysEnd'], positive: true },
          arrearDays: { label: '逾期天数', type: 'range', ranges: ['arrearDaysStart', 'arrearDaysEnd'], positive: true },
          hasInterest: { label: '是否产生预计滞纳金', type: 'select', prop: 'yesNo' },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '详情',
          type: 'text',
          show: true, //待确认和不通过可以修改
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
      $name: 'derateList',
      data: [],
      tips: { text: '', show: false },
      operationBtns,
      emptyText: '数据将在查询后显示',
      pagination,
      // sortable: true,
      listAmtSummary,
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
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      return queryFiscalTermFeePage(data)
        .then((res) => {
          if (res.code === 0) {
            this.finCommonColumns(res)
            if (customerList) return
            this.option1.data = res.data.list || []
            this.$set(this.option1, 'emptyText', '未查询到任何数据')
            Object.assign(this.option1.pagination, res.data)
          }
        })
        .finally(() => {
          this.lsLoading = false
        })
    },
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    sendMulti(data) {
      this.multipleSelection1 = data
      let data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      let ids = this.multipleSelection1.map((item) => item.feeId).join(',')
      if (ids) {
        data2.query.push({ column: 'feeIds', type: 'in', value: ids })
      } else {
        data2.query = this.searchBackup || []
      }
      this.debounceLs(() => {
        this.getListAmtSummary(data2)
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
    showDetail({ fiscalTermNo, settleCompName, settleCorpName, settleDate, dueDate, graceDays, cleanStatus }) {
      this.routerPushTab('FiscalTermDetail', {
        fiscalTermNo,
        settleCompName,
        settleCorpName,
        settleDate,
        dueDate,
        graceDays,
        cleanStatus,
      })
    },
    // 获取销售
    getSellers(name = '', item) {
      let query = [{ column: 'roleCode', type: 'in', value: 'bd,obd' }]
      name && query.push({ column: 'name', type: 'eq', value: name })
      listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data: { list } }) => {
        let itemList = list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
        if (this.remoteSelectCommon(item, itemList)) return
        item.remoteSelectList = itemList
      })
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
    remoteFeeItemList(queryString, filterItem, lang) {
      this.$store.dispatch('dict/queryFeeItemList2', { businessType: '', serviceCode: '', queryString, lang }).then((data) => {
        if (this.remoteSelectCommon(filterItem, data)) return
        filterItem.remoteSelectList = data
      })
    },
    //导出按钮
    handleExport() {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: this.option1.columns.map((v) => v.prop),
        query: [],
      }
      data.query = this.searchBackup || []
      if (this.multipleSelection1.length) {
        data.query = [{ column: 'feeId', type: 'in', value: this.multipleSelection1.map((v) => v.feeId).join(',') }]
      }
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'fiscalTermFeeListExport' })

      this.$confirm('是否确认导出费用明细列表？', '提示', {
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        lockScroll: 'true',
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '执行中...'
            setTimeout(() => {
              this.option1.loading = true
              this.$store
                .dispatch('finance/downloadBlobFilePost', {
                  uri: '/fin/common/queryDataExportExcel',
                  data: { data },
                })
                .then((res) => {
                  this.option1.loading = false
                  console.log(res)
                  let link = document.createElement('a')
                  link.href = window.URL.createObjectURL(res)
                  link.download = '费用明细列表.xlsx'
                  link.click()
                  done()
                  instance.confirmButtonLoading = false
                })
                .catch(() => {
                  this.option1.loading = false
                  this.$message({ message: '导出失败', type: 'error' })
                  done()
                  instance.confirmButtonLoading = false
                })
            }, 10)
          } else {
            done()
            instance.confirmButtonLoading = false
          }
        },
      })
        .then(() => {})
        .catch(() => {})
    },
  },
}
</script>