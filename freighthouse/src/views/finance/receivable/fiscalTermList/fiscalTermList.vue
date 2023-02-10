<template>
  <div
    :class="isSU ? 'finance-page' : ''"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div v-if="isSU" class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{$route.query.settleCorpName}}</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="back">返回</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap" v-if="!isSU"></div>
    <div class="finance-list-container" :class="[isSU?'is_su':'']">
      <!-- finance-seabill-cnt -->
      <div class="money-box" style="background-color:#fff;" v-if="!isSU">
        <div v-if="!isSU" class="money-box-left">
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-fiscalTermList', 'btn-createSettleMulti')"
              class="finance-btn"
              @click="createSettlement('yes')"
              size="mini"
              type="primary"
            >生成多个结算单</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-fiscalTermList', 'btn-createSettle')"
              class="finance-btn"
              @click="createSettlement('no')"
              size="mini"
              type="primary"
            >生成结算单</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-fiscalTermList', 'btn-handleExport')"
              class="finance-btn"
              size="mini"
              @click="handleExport"
            >导出</el-button>
          </el-button-group>
        </div>
        <div v-else class="money-box-left"></div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
          </el-button-group>
        </div>
      </div>
      <el-button
        v-else
        class="finance-btn refresh_btn"
        @click="refreshListPage"
        size="mini"
        type="primary"
      >刷新</el-button>
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
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { queryFiscalTermPage, queryFiscalTermPageSummary, settleOrderApply, fiscalTermCollectInfo } from '@/api/fin/fiscalterm'
import { dateFormat } from '@/views/finance/utils/finance'
export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: queryFiscalTermPage('geturl'),
      keyDownActive: true,
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
          prop: 'fiscalTermNo',
          label: '应收账单编号',
          width: '155px',
          type: 'button',
          sortable: false,
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        // {
        //   prop: 'orderNo',
        //   label: '工作单号',
        //   width: 130,
        //   component: 'ColumnTip',
        //   componentProps: {
        //     show: false,
        //     data: [],
        //     callback: (no, componentProps) => {
        //       this.showColumnDetail({
        //         type: 'sourceBizNo',
        //         no,
        //         componentProps,
        //       })
        //     },
        //   },
        // },
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
          sortable: false,
        },
        {
          prop: 'receipayType',
          label: '收付类型',
          type: 'select',
          propInDict: 'feeitemReceipayGroup',
          sortable: false,
        },
        {
          prop: 'hasInterest',
          label: '是否产生预计滞纳金',
          type: 'select',
          propInDict: 'yesNo',
          sortable: false,
          width: 130,
        },
        {
          prop: 'recvUsdAmt',
          label: '应收折USD',
          type: 'text',
          width: 100,
          sortable: false,
        },
        {
          prop: 'recvCnyAmt',
          label: '应收折CNY',
          type: 'text',
          width: 100,
          sortable: false,
        },
        {
          prop: 'unrecvUsdAmt',
          label: '未收折USD',
          type: 'text',
          width: 100,
        },
        {
          prop: 'unrecvCnyAmt',
          label: '未收折CNY',
          type: 'text',
          width: 100,
        },
        {
          prop: 'arrearReceivedUsdAmt',
          label: '超期已收折USD',
          type: 'text',
          width: 100,
          sortable: false,
        },
        {
          prop: 'arrearReceivedCnyAmt',
          label: '超期已收折CNY',
          type: 'text',
          width: 100,
          sortable: false,
        },
        {
          prop: 'arrearUsdAmt',
          label: '超期未收折USD',
          type: 'text',
          width: 100,
        },
        {
          prop: 'arrearCnyAmt',
          label: '超期未收折CNY',
          type: 'text',
          width: 100,
        },
        {
          prop: 'settleDate',
          label: '账单日',
          type: 'text',
          width: 110,
          sortable: false,
        },
        {
          prop: 'dueDate',
          label: '结款到期日',
          type: 'text',
          width: 110,
          sortable: false,
        },
        {
          prop: 'graceDays',
          label: '宽限天数',
          type: 'text',
          sortable: false,
        },
        {
          prop: 'billDays',
          label: '账龄',
          type: 'text',
          sortable: false,
        },
        {
          prop: 'arrearDays',
          label: '逾期天数',
          type: 'text',
          sortable: false,
        },
        {
          prop: 'rateType',
          label: '利率类型',
          type: 'select',
          propInDict: 'finFiscalTermRateType',
          sortable: false,
        },
        {
          prop: 'interestRate',
          label: '滞纳金利率',
          type: 'text',
          sortable: false,
        },
        {
          prop: 'usdInterest',
          label: '预计滞纳金折USD',
          type: 'text',
          width: 110,
        },
        {
          prop: 'cnyInterest',
          label: '预计滞纳金折CNY',
          type: 'text',
          width: 110,
        },
        {
          prop: 'cleanStatus',
          label: '结清状态',
          type: 'select',
          propInDict: 'cleanStatus',
          sortable: false,
        },
        // {
        // 	prop: 'settleCompName',
        // 	label: '建议处理类型',
        // 	type: 'text',
        // 	width: 100,
        // },
        {
          prop: 'remark',
          label: '账期规则描述',
          width: 120,
          type: 'text',
          sortable: false,
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
    this.pageSizeUrl = this.isSU ? fiscalTermCollectInfo('geturl') : queryFiscalTermPage('geturl')
    let searchArr = this.isSU
      ? ['fiscalTermNo', 'settleDate']
      : ['fiscalTermNo', 'settleCompCode', 'settleCorpCode', 'settleDate', 'cleanStatus']
    let filterGroups = {
      fiscalTermNo: { label: '应收账单编号', type: 'input' },
      orderNo: { label: '工作单号', type: 'input' }, // 原代码有，但接口无此字段 20221205加入搜索
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
      // receipayType: {	label: "收付类型",	type: "select", prop:'feeitemReceipayGroup' },
      settleDate: { label: '账单日', type: 'daterange', format: 'yyyy-MM-dd' },
      dueDate: { label: '结款到期日', type: 'daterange', format: 'yyyy-MM-dd' },
      rateType: { label: '利率类型', type: 'select', prop: 'settleInfoRateType' },
      cleanStatus: { label: '结清状态', type: 'select', prop: 'cleanStatus' },
      hasInterest: { label: '是否产生预计滞纳金', type: 'select', prop: 'yesNo' },
    }
    if (this.isSU) {
      delete filterGroups.settleCompCode
      delete filterGroups.settleCorpCode
      delete filterGroups.rateType
      delete filterGroups.cleanStatus
    }
    this.searchOption = {
      saveDefault: true,
      saveName: this.isSU ? 'fiscalTermListSU' : 'fiscalTermList',
      isNotAutoLoad: this.isSU ? false : true,
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups,
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
      $name: 'fiscalTermList',
      data: [],
      tips: { text: '', show: false },
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
    sortChange(column, prop, order) {
      this.sortParams = { prop, order }
      this.isSort = true
      this.getData()
    },
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
    //生成结算单
    createSettlement(type) {
      if (this.multipleSelection1.length !== 1) {
        return this.$message({
          message: '请勾选1个应收账单！',
          type: 'error',
          showClose: true,
        })
      }
      this.lsLoading = true
      let data = {
        fiscalTermNoList: this.multipleSelection1.map((item) => {
          return item.fiscalTermNo
        }),
        hasGroup: type,
      }
      settleOrderApply(data)
        .then((res) => {
          if (res.data.settleOrderNos) {
            this.settleOrderNos = res.data.settleOrderNos
            this.resultDialogOption.show = true
            return
          }
          this.$store.state._feeToSettleParams = res
          this.routerPushTab('CreateSettlement', {
            source: 'createSettlementFromFeeSearch',
          })
        })
        .finally(() => (this.lsLoading = false))
    },
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      this.lsLoading = true
      let { prop, order } = this.sortParams
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        query: [],
        ascColumns: order === 'ascending' ? [prop] : [],
        descColumns: order === 'descending' ? [prop] : [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({ column: 'confirmStatus', type: 'eq', value: this.buttonSearch })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.isSU) {
        let find1 = data.query.find((item) => item.column === 'settleCorpCode')
        if (!find1) {
          data.query.push({ column: 'settleCorpCode', type: 'eq', value: this.$route.query.settleCorpCode })
        } else {
          find1.value = this.$route.query.settleCorpCode
        }
        let find2 = data.query.find((item) => item.column === 'settleCompCode')
        if (!find2) {
          data.query.push({ column: 'settleCompCode', type: 'eq', value: this.$route.query.settleCompCode })
        } else {
          find2.value = this.$route.query.settleCompCode
        }
      }
      let fn = this.isSU ? fiscalTermCollectInfo : queryFiscalTermPage
      return fn(data)
        .then((res) => {
          if (res.code === 0) {
            this.finCommonColumns(res)
            if (customerList) return
            // if (res.data.configColumns && res.data.configColumns.length) {
            // 	let columns = res.data.configColumns
            // 	this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
            // 	this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
            // 	this.configColumns = res.data.configColumns
            // }
            let list = res.data.list
            let data = []
            list.forEach((item) => {
              // item.orderNo_multiValue = item.orderNo.split(',')
              data.push(item)
            })
            this.option1.data = data
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
      queryFiscalTermPageSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let data = {
            unrecvAmtSummaryList: [],
          }
          data = Object.assign(data, res.data)
          let labelObj = {
            unrecvAmtSummaryListLabel: '未收金额',
          }
          let colorObj = {
            unrecvAmtSummaryListColor: 'red', // 支持red, green, black三种值
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
      let { prop, order } = this.sortParams
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: this.option1.columns.map((v) => v.prop),
        ascColumns: order === 'ascending' ? [prop] : [],
        descColumns: order === 'descending' ? [prop] : [],
        query: [],
      }
      data.query = this.searchBackup || []
      if (this.multipleSelection1.length) {
        data.query = [{ column: 'fiscalTermNo', type: 'in', value: this.multipleSelection1.map((v) => v.fiscalTermNo).join(',') }]
      }
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'fiscalTermListExport' })

      this.$confirm('是否确认导出应收账单列表？', '提示', {
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
                  link.download = '应收账单列表.xlsx'
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
      let nos = this.multipleSelection1.map((item) => item.fiscalTermNo).join(',')
      if (this.multipleSelection1.length) {
        data2.query.push({
          column: 'fiscalTermNo',
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
    back(refresh) {
      this.routerBack(refresh === true)
    },
  },
  computed: {
    isSU() {
      return this.$route.query.settleCorpCode && this.$route.query.settleCompCode ? true : false
    },
  },
}
</script>

<style lang="scss" scoped>
.finance-list-container.is_su {
  position: relative;
  .finance-btn.refresh_btn {
    position: absolute;
    z-index: 1;
    right: 8px;
    top: 6px;
  }
}
</style>