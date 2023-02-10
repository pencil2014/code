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
          <!-- <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'btn-createSettleMulti')"
              class="finance-btn"
              @click="createSettlement('yes')"
              size="mini"
              type="primary"
            >生成多个结算单</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'btn-createSettle')"
              class="finance-btn"
              @click="createSettlement('no')"
              size="mini"
              type="primary"
            >生成结算单</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="handleExport">导出</el-button>
          </el-button-group> -->
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
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { fiscalTermCollectPageList, fiscalTermCollectPageSummary } from '@/api/fin/fiscalterm'
import { dateFormat } from '@/views/finance/utils/finance'
import { countrySelectList } from '@/api/base'
export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: fiscalTermCollectPageList('geturl'),
      keyDownActive: true,
      searchOption: {},
      option1: {},
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
          prop: 'settleCorpName',
          label: '结算单位',
          type: 'button',
          width: 140,
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.showDetailSU(row)
            },
          },
        },
        {
          prop: 'settleCompName',
          label: '分公司',
          type: 'text',
          width: 140,
        },
        {
          prop: 'custClass',
          label: '客户类型',
          type: 'select',
          propInDict: 'customerClassNew',
        },
        {
          prop: 'countryName',
          label: '客户国家',
          type: 'text',
        },
        {
          prop: 'recvUsdAmt',
          label: '应收折USD',
          type: 'text',
          width: 100,
        },
        {
          prop: 'recvCnyAmt',
          label: '应收折CNY',
          type: 'text',
          width: 100,
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
          width: 106,
        },
        {
          prop: 'arrearReceivedCnyAmt',
          label: '超期已收折CNY',
          type: 'text',
          width: 106,
        },
        {
          prop: 'arrearUsdAmt',
          label: '超期未收折USD',
          type: 'text',
          width: 106,
        },
        {
          prop: 'arrearCnyAmt',
          label: '超期未收折CNY',
          type: 'text',
          width: 106,
        },
        {
          prop: 'usdInterest',
          label: '预计滞纳金折USD',
          type: 'text',
          width: 120,
        },
        {
          prop: 'cnyInterest',
          label: '预计滞纳金折CNY',
          type: 'text',
          width: 120,
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
    let searchArr = ['settleCorpCode', 'custClass', 'settleCompCode']
    this.searchOption = {
      saveDefault: true,
      saveName: 'custReceiList',
      isNotAutoLoad: true,
      fixCreatedDate: true,
      fixCreatedKey: 'dueDate',
      fixCreatedNMonth: 2,
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
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
          custClass: {	label: "客户类型",	type: "select", prop:'customerClassNew' },
          settleCompCode: {
            label: '分公司',
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            remoteSelectList: [],
          },
          countryCode: {
            label: '国家',
            prop: 'countryCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.getCountryList(queryString, item),
            visibleChange: (queryString, item) => this.getCountryList('', item),
            remoteSelectList: [],
          },
          // settleDate: { label: '账单日', type: 'daterange', format: 'yyyy-MM-dd' },
          dueDate: { label: '结款到期日', type: 'daterange', format: 'yyyy-MM-dd' },
          // rateType: { label: '利率类型', type: 'select', prop: 'settleInfoRateType' },
          // cleanStatus: { label: '结清状态', type: 'select', prop: 'cleanStatus' },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '详情',
          type: 'text',
          show: true, // 待确认和不通过可以修改
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
      $name: 'custReceiList',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      emptyText: '数据将在查询后显示',
      pagination,
      listAmtSummary,
    })
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.selfColumnsBase.forEach((item) => (item.sortable = true))
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
      if (this.buttonSearch) {
        data.query.push({ column: 'confirmStatus', type: 'eq', value: this.buttonSearch })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      return fiscalTermCollectPageList(data)
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
      fiscalTermCollectPageSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let data = {
            unrecvAmtSummaryList: []
          }
          data = Object.assign(data, res.data)
          let labelObj = {
            unrecvAmtSummaryListLabel: '未收金额'
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
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: [],
        ascColumns: params && params.order === 'ascending' ? [params.prop] : [],
        descColumns: params && params.order === 'descending' ? [params.prop] : ['settleDate'],
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.searchOption.addFilter.searchInputGroup.forEach((item) => {
        let { key, value, range, req, valueReq } = item
        if (!value) return
        if (typeof value !== 'object') {
          if (valueReq && item[valueReq]) {
            data.query.push({
              column: valueReq,
              type: 'eq',
              value: item[valueReq],
            })
            console.log(item[valueReq])
          }
          return data.query.push({
            column: key,
            type: 'eq',
            value: req || value,
          })
        }
        if (key === 'recvCorpCode' || key === 'payStatus' || key === 'status') {
          if (!value.length) return
          data.query.push({
            column: key,
            type: 'eq',
            value: value.join(','),
          })
        } else {
          data.query.push({
            column: key + 'Start',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[0]),
          })
          data.query.push({
            column: key + 'End',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[1]),
          })
        }
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({ column: 'confirmStatus', type: 'eq', value: this.buttonSearch })
      }
      if (this.multipleSelection1.length) {
        data.query = [{ column: 'fiscalTermNo', type: 'in', value: this.multipleSelection1.map((v) => v.fiscalTermNo).join(',') }]
      }
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'fiscalTermListExport' })

      this.$confirm('是否确认导出应收账单列表?', '导出应收账单列表', {
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
      let settleCorpCode = this.multipleSelection1.map(item => item.settleCorpCode).join(',')
      let settleCompCode = this.multipleSelection1.map(item => item.settleCompCode).join(',')
      let custClass = this.multipleSelection1.map(item => item.custClass).join(',')
      if (this.multipleSelection1.length) {
        data2.query.push({
          column: 'settleCorpCode',
          type: 'eq',
          value: settleCorpCode,
        })
        data2.query.push({
          column: 'settleCompCode',
          type: 'eq',
          value: settleCompCode,
        })
        data2.query.push({
          column: 'custClass',
          type: 'eq',
          value: custClass,
        })
      } else {
        data2.query = this.searchBackup || []
      }
      this.debounceLs(() => {
        this.getListAmtSummary(data2)
      })
    },
    showDetail(row) {
      this.showDetailSU(row)
    },
    showDetailSU({ settleCorpName, settleCorpCode, settleCompCode }) {
      this.routerPushTab('FiscalTermListSU', {
        settleCorpName,
        settleCorpCode,
        settleCompCode
      })
    },
    getCountryList(countryCode, item) {
      countrySelectList({ countryCode }).then((res) => {
        this.remoteSelectCommon(item, (res.data || []).map((item) => {
          return { cname: item.cname, ename: item.ename, value: item.countryCode, label: item.cname }
        }))
      })
    },
  },
}
</script>