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
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { listCommonFeePage } from '@/api/fin/fee'
import { dateFormat } from '@/views/finance/utils/finance.js'
export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: listCommonFeePage('geturl'),
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
    }
  },
  created() {
    this.searchOption1 = {
      saveShow: true,
      saveName: 'commonFeeList',
      // saveDefault: true,
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: [
          { key: 'sourceBizNo', value: '', showType: '1' },
          { key: 'settleCorpCode', value: '', showType: '2' },
          { key: 'feeCode', value: '', showType: '3' },
          { key: 'currency', value: '', showType: '4' },
          { key: 'finDate', value: '', showType: '5' },
        ],
        filterGroups: {
          sourceBizNo: { label: this.$t('FeeList.orderNo'), type: 'input', showType: '1' },
          settleCorpCode: {
            label: this.$t('FeeList.settleCorp'),
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            showType: '2',
            clearable: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            // 结算单位有很多，不显示默认下拉列表---特殊设想---先取消
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            remoteSelectList: [],
          },
          feeCode: {
						label: this.$t('FeeList.feeEname'), type: 'remoteSelect', prop: 'feeEnName', showType: '3', //feeEname
						remoteMethod: (queryString, filterItem) => {
							this.remoteFeeItemList(queryString, filterItem)
						},
						visibleChange: (queryString, filterItem) => {
							this.remoteFeeItemList(queryString, filterItem)
						},
						remoteSelectList: []
          },
          currency: { label: this.$t('FeeList.currency'), type: 'select', selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'), showType: '4' },
          finDate: {label: this.$t('FeeList.finDate'), type: 'lsDaterange', format: 'yyyy-MM-dd' },
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
      id: 'option1', $name: 'commonFeeList',
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
      emptyText: this.$t('Common.emptyText'),
    })
    let columns = [
      {
        prop: 'sourceBizNo', // orderNo
        label: this.$t('FeeList.orderNo'),
        type: 'button',
        width: 128,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            let type = row.sourceType ? row.sourceType : 'order'
            this.showOneNoDetail(type, row.sourceBizNo, { isTab: true }) // feeId: row.feeId, 
          },
        },
      },
      {
        prop: 'settleCompName',
        label: this.$t('FeeList.settleComp'),
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
        prop: 'feeEnName',
        label: this.$t('FeeList.feeEname'),
        type: 'text',
        width: 100
      },
      {
        prop: 'currency',
        label: this.$t('FeeList.currency'),
        type: 'text',
      },
      {
        prop: 'feeAmt',
        label: this.$t('FeeList.feeAmt'),
        type: 'text',
      },
      {
        prop: 'bdEmployeeName',
        label: this.$t('OrderFee.salesman'),
        type: 'text',
      },
      {
        prop: 'finDate',
       label: this.$t('FeeList.finDate'),
        type: 'text',
      },
    ]
    this.option1.columns = columns
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
        query: [],
      }
      this.finCommonSearch(data.query, this.searchOption1, true)
      // this.searchOption1.addFilter.searchInputGroup.forEach(item => {
      //   let { key, value } = item
      //   if (value && value !== '') {
      //     if (key === 'finDate') {
      //       data.query.push({
      //         column: 'finDateStart',
      //         type: 'default',
      //         value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
      //       })
      //       data.query.push({
      //         column: 'finDateEnd',
      //         type: 'default',
      //         value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
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
          "value": "commonfeeListExport"
        })
        this.$store.dispatch('finance/downloadBlobFilePost', {
          uri: '/fin/common/queryDataExportExcel',
          data: {
            data
          }
        }).then(res => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = '费用类费用' + dateFormat('yyyy-mm-dd HH_MM_SS', new Date()) + '.xlsx'
          link.click()
        })
        return
      }
      this.loading = true
      listCommonFeePage(data).then((res) => {
        if (res.code === 0) {
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
    remoteFeeItemList (queryString, filterItem, lang) {
			this.$store.dispatch('dict/queryFeeItemList2', { businessType: '', serviceCode: '', queryString, lang }).then(data => {
        if (this.remoteSelectCommon(filterItem, data)) return
				filterItem.remoteSelectList = data
			})
		},
    preSubmit(type) {
      if (!this.multipleSelection1.length) {
        return this.$message({
          type: 'error',
          message: '须选择专项审批的记录',
          showClose: true,
        })
      }
      if (type === 'pass') {
        this.$confirm('是否确认审批通过？', this.$t('Common.tips'), {
          confirmButtonText: this.$t('Common.sure'),
          cancelButtonText: this.$t('Common.cancel'),
          type: 'warning',
        })
        .then(() => {
          this.adjustAudit('pass')
        })
        .catch(() => {})
      } else if (type === 'refuse') {
        this.form.auditRemark='';
        this.rejectDialogVisible = true
      }
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
  },
}
</script>
<style>
</style>