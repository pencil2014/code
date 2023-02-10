<template>
  <div
    v-loading="loading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground"
  >
    <div>
      <FinanceSearch :searchOption="searchOption1" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
        <div class="money-box">
          <div class="money-box-left">
            <el-button @click="getData('download')" size="mini">{{$t('Common.export')}}</el-button>
            <!-- <a target="_blank" href="http://localhost:7701/#/forget?forgetView=reset&code=MTNmZmExMGFjNDg5YmU3NzM4ZjZhZTFmYjY3NzcwYTA4MTAxY2JjYzFlYWEwOTlhNmViZWE3NWFjMGViOGMwNGFjdGl2ZWQ=">打开激活链接</a> -->
          </div>
          <div class="money-box-right">
            <el-button
              class="finance-btn"
              @click="refreshListPage"
              size="mini"
              type="primary"
            >{{$t('Common.refresh')}}</el-button>
          </div>
        </div>
        <FinanceTable
          :option="option1"
          @send-multi="sendMulti"/>
      </div>
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose" />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { specFeeMngApplyList, applyAudit } from '@/api/fin/specfee'
import { listAllotPage } from '@/api/fin/transferFee'
import { listReceivableRegAccount, bankAccountListAll } from '@/api/fin/settleUnitBankAcct'
import { dateFormat } from '@/views/finance/utils/finance.js'
export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: listAllotPage('geturl'),
      keyDownActive: true,
      option1: {},
      searchOption1: {},
      multipleSelection1: [],
      form: {
        auditRemark: '',
      },
      orderNo: '',
      feeAdjustApplyId: 0,
      loading: false,
      rejectDialogVisible: false,
      defaultColumns: [],
    }
  },
  created() {
    this.searchOption1 = {
      saveShow: true,
      saveName: 'transferFeeAllotList',
      // saveDefault: true,
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 9,
        searchInputGroup: [
          { key: 'orderNo', value: '', showType: '1' },
          { key: 'settleCorpCode', value: '', showType: '2' },
          { key: 'businessType', value: '', showType: '3' },
          { key: 'accountShortName', value: '', showType: '4' },
          { key: 'finDate', value: '', showType: '8' },
          { key: 'writeoffDate', value: '', showType: '5' },
          { key: 'writeoffTime', value: '', showType: '6' },
          { key: 'receipayDate', value: '', showType: '7' },
          { key: 'settleCompCode', value: '', showType: '9' },
        ],
        filterGroups: {
          orderNo: { label: this.$t('FeeList.orderNo'), type: 'input', showType: '1' },
          settleCorpCode: {
            label: this.$t('FeeList.settleCorp'),
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            showType: '2',
            clearable: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            remoteSelectList: [],
          },
          businessType: { label: this.$t('FeeList.businessTypes'), type: 'select', showType: '3', prop: 'businessType' },
          accountShortName: {
            prop: 'accountShortName',
            label: '我司银行',
            type: 'remoteSelect',
            showType: '4',
            DIY: { key: 'accountNo' },
            remoteMethod: (queryString, item, row) => {this.lsBankAccountList(queryString, item, row)},
            visibleChange: (value, item, row) => {this.lsBankAccountList(value, item, row)},
            // change: (value, item, row) => {row.change(value, item, row);},
            remoteSelectList: []
          },
          finDate: {label: this.$t('FeeList.finDate'), type: 'lsDaterange', format: 'yyyy-MM-dd' },
          writeoffDate: { label: this.$t('FeeList.writeOffDate'), type: 'lsDaterange', format: 'yyyy-MM-dd' },
          writeoffTime: { label: this.$t('Hedge.writeoffTime'), type: 'lsDatetimerange', showType: '6', format: 'yyyy-MM-dd HH:mm:ss' },
          receipayDate: { label: this.$t('PayApplyList.receivePayDate'), type: 'lsDaterange', format: 'yyyy-MM-dd' },
          settleCompCode: {
            label: this.$t('FeeList.settleComp'),
            prop: 'settleCompCode',
            type: 'remoteSelect',
            showType: '9',
            clearable: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          transferFeeSourceType: { label: '手续费来源', type: 'select', prop: 'transferFeeSourceType' },
        }
      },
    }
    let operationBtns = Object.assign(this.option.operationBtns, {
      // data: [
      //   {
      //     label: this.$t('Common.details'),
      //     type: 'text',
      //     // show: true,
      //     showFn: () => this.checkAuth(this.$route.name, 'btn-showDetail'),
      //     action: 'showDetail',
      //   },
      // ],
      show: false
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'transferFeeAllotList',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      selection: {
        show: false
      },
      operationBtns,
      pagination,
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns
      },
      emptyText: this.$t('Common.emptyText'),
    })
    this.selfColumnsBase = this.columnsBaseLocal = [ // let columns =
      {
        prop: 'settleCompName',
        label: this.$t('FeeList.settleComp'),
        type: 'text',
        width: 160
      },
      {
        prop: 'bdDeptName',
        label: this.$t('LateFee.dept'),
        type: 'text',
        width: 120
      },
      {
        prop: 'businessType',
        label: this.$t('FeeList.businessTypes'),
        type: 'select',
        width: 120
      },
      {
        prop: 'orderNo', // orderNo
        label: this.$t('FeeList.orderNo'),
        type: 'button',
        width: 128,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            let type = row.sourceType ? row.sourceType : 'order'
            this.showOneNoDetail(type, row.orderNo, { isTab: true }) // feeId: row.feeId, 
          },
        },
      },
      {
        prop: 'bdEmployeeName',
        label: this.$t('FeeList.bdEmployeeId'),
        type: 'text',
        width: 120,
      },
      {
        prop: 'jointNo',
        label: this.$t('FeeList.jointToOrderNo'),
        type: 'text',
        width: 128
      },
      {
        prop: 'feeEnName',
        label: this.$t('FeeList.feeEname'),
        type: 'text',
        width: 120
      },
      {
        prop: 'custName',
        label: this.$t('FeeList.custId'),
        type: 'text',
        width: 160
      },
      {
        prop: 'settleCorpName',
        label: this.$t('FeeList.settleCorp'),
        type: 'text',
        width: 160
      },
      {
        prop: 'accountShortName',
        label: '我司银行',
        type: 'text',
        width: 130
      },
      { prop: 'receipayAmt', label: '收付款金额', type: 'text' },
      { prop: 'receipayCurrency', label: '收付款币种', type: 'text' },
      { prop: 'receipayDate', label: '收付款日期', type: 'text', width: 100 },
      { prop: 'finDate',label: this.$t('FeeList.finDate'), type: 'text', width: 100 },
      { prop: 'writeoffDate', label: this.$t('FeeList.writeOffDate'), type: 'text', width: 100 },
      { prop: 'writeoffTime', label: this.$t('Hedge.writeoffTime'), type: 'text', width: 130 },
      { prop: 'writeoffName', label: this.$t('Hedge.writeoffs'), type: 'text' },
      { prop: 'transferFeeSourceType', label: '手续费来源', type: 'select', width: 120 },
      { prop: 'cutType', label: '手续费扣款类型', type: 'select', width: 120, propInDict: 'transferFeeType' },
      { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text' },
      { prop: 'allotAmt', label: '手续费', type: 'text' },
      { prop: 'acctExRate', label: '折CNY汇率', type: 'text' },
      { prop: 'basicMoneyAmt', label: '折合CNY', type: 'text' },
      { prop: 'usdExRate', label: '折USD汇率', type: 'text' },
      { prop: 'usdMoneyAmt', label: '折合USD', type: 'text' }
    ]
    this.defaultColumns = this.selfColumnsBase.map(item => item.prop)
    // this.option1.columns = columns
  },
  methods: {
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    getData(isSearch) {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: [],
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
				data.columns = this.customColumnsKeys
			}
      this.finCommonSearch(data.query, this.searchOption1, true)
      // this.searchOption1.addFilter.searchInputGroup.forEach(item => {
      //   let { key, value } = item
      //   if (value && value !== '') {
      //     console.log(item)
      //     if (key === 'writeoffDate' || key === 'receipayDate' || key === 'finDate') {
      //       data.query.push({
      //         column: key + 'Start',
      //         type: 'default',
      //         value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
      //       })
      //       data.query.push({
      //         column: key + 'End',
      //         type: 'default',
      //         value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
      //       })
      //     } else if (key === 'writeoffTime') {
      //       console.log(value)
      //       data.query.push({
      //         column: key + 'Start',
      //         type: 'default',
      //         value: value[0],
      //       })
      //       data.query.push({
      //         column: key + 'End',
      //         type: 'default',
      //         value: value[1],
      //       })
      //     } else {
      //       data.query.push({
      //         column: key,
      //         type: 'eq',
      //         value: value,
      //       })
      //     }
      //   }
      // })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (isSearch === 'download') {
        this.$message({
          message: '导出中，请留意下载的区域',
          type: 'warning',
          showClose: true,
          duration: 5000
        })
        data.query.push({
          "column": "queryDataModuleCode",
          "type": "eq",
          "value": "transferFeeAllotListExport"
        })
        this.$store.dispatch('finance/downloadBlobFilePost', {
          uri: '/fin/common/queryDataExportExcel',
          data: {
            data
          }
        }).then(res => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = '分摊手续费' + dateFormat('yyyy-mm-dd HH_MM_SS', new Date()) + '.xlsx'
          link.click()
        })
        return
      }
      this.loading = true
      listAllotPage(data).then((res) => {
        if (res.code === 0) {
          // this.finCommonColumns(res, undefined, 'columns')
          let { configColumns } = res.data
          this.columns = configColumns.length ? configColumns : this.defaultColumns
          let arr = []
          this.columns.forEach(column => {
            let obj = this.selfColumnsBase.find(item => {
              return item.prop === column
            })
            if (obj) {
              arr.push(obj)
            }
          })
          if(this.columnsBackup !== this.columns.toString()){
            this.option1.columns = arr
          }
          this.columnsBackup = this.columns.toString()
          this.option1.data = res.data.list
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        }
      }).finally(() => {
        this.loading = false
      })
    },
    lsBankAccountList(queryString, item, row) {
      // let data = {
      //   "accountName": queryString // 默认查询出自己分公司的账号
      // }
      let data = { unitType: 'company', accountName: queryString, status: 'effect' }
      bankAccountListAll(data).then(res => {
        if (res.code === 0) {
          item.remoteSelectList = res.data.map(item => {
            item.value = item.accountShortName
            item.label = item.accountShortName
            return item
          })
          console.log('item:', item)
        }
      })
    },
    sendMulti(data, option) {
      // console.log(data, option)
      if (option === this.option1) this.multipleSelection1 = data
    },
    showDetail({ sourceBizNo, sourceType, feeAdjustApplyId }) {
      this.routerPush('FeeClosedModifyFeeDetail', { sourceBizNo, sourceType, feeAdjustApplyId })
    },
  },
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns
  },
}
</script>
<style>
</style>