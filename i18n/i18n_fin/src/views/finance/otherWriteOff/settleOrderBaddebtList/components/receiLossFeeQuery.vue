<template>
  <div
    class="finance-page"
    v-loading="loading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground"
  >
    <div>
      <div class="money-box money-box-border-bottom" style="background:#fff;">
        <div class="money-box-left">
          <div class="money-title">{{$t('Charge.chargeOffInquiry')}}</div>
          <div style="color:#CD4130;line-height:20px;">{{$t('Charge.applicationTips')}}</div>
        </div>
        <div class="money-box-right">
        </div>
      </div>
      <FinanceSearch :searchOption="searchOption1" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">{{$t('Charge.listoffees')}}</div>
          </div>
          <div class="money-box-right">
            <el-button
              v-if="checkAuth('SettleOrderBadApply')"
              class="finance-btn"
              @click="receiLossApply"
              size="mini"
              type="success"
            >{{$t('Charge.elimiAppli')}}</el-button>
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
import { recFeeList } from '@/api/fin/fee'

export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      option1: {},
      searchOption1: {},
      multipleSelection1: [],
      loading: false,
      defaultColumns: [],
    }
  },
  created() {
    this.searchOption1 = {
      // saveShow: true,
      // saveName: 'transferFeeAllotList',
      // saveDefault: true,
      // listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: [
          { key: 'sourceBizNos', value: '', showType: '1' },
          { key: 'settleCorpCode', value: '', showType: '2' },
          { key: 'feeCode', value: '', showType: '2' },
          { key: 'profitShareMode', value: '', showType: '2' },
        ],
        filterGroups: {
          sourceBizNos: { label: this.$t('FeeList.orderNo'), type: 'input', placeholder: this.$t('Common.plEnter'), showType: '1' },
          settleCorpCode: { label: this.$t('FeeList.settleCorp'), prop: 'settleCorpCode', placeholder: this.$t('Common.plSelect'), type: 'remoteSelect', multiple: true, showType: '2',
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({queryString, unitTypes: ''}, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({queryString, unitTypes: ''}, item)
            },
            remoteSelectList: [],
          },
          feeCode: { label: this.$t('FeeList.feeEname'), prop: 'feeCode', placeholder: this.$t('Common.plSelect'), type: 'remoteSelect', multiple: false, showType: '2',
            remoteMethod: (queryString, item, row) => {
              this.queryFeeItemList2({queryString, unitTypes: ''}, item)
            },
            visibleChange: (queryString, item, row) => {
              this.queryFeeItemList2({queryString, unitTypes: ''}, item)
            },
            remoteSelectList: [],
          },
          profitShareMode: { label: this.$t('Charge.models'), type: 'select', placeholder: this.$t('Common.plSelect'), propInDict: 'customerServiceMode' }
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
      id: 'option1', $name: 'receiLossFeeQuery',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      // selection: {
      //   show: true
      // },
      operationBtns,
      pagination,
      // customColumns: {
      //   show: true,
      //   handleCustomColumns: this.handleCustomColumns
      // },
      rootTipsHide: true,
      maxHeight: 300,
    })
    let columns = [
      { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'input', width: 160, key: 'settleCorpName', disabled: true },
      { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'input', key: 'feeEnName', width: 110, disabled: true },
      { prop: 'serviceName', label: this.$t('FeeList.serviceCodes'), type: 'text', key: 'serviceName', width: 100, disabled: true },
      { prop: 'unitPrice', label: this.$t('FeeList.unitPrice'), type: 'input', key: 'unitPrice', disabled: true },
      { prop: 'feeUnit', label: this.$t('FeeList.feeUnit'), type: 'select', key: 'feeUnit', disabled: true },
      { prop: 'currency', label: this.$t('FeeList.currency'), type: 'select', key: 'currency', width: 70, propInDict: 'validCurrency', filterable: true, disabled: true },
    ]
    this.selfColumnsBase = this.columnsBaseLocal = [ // let columns =
      {
        prop: 'sourceBizNo',
        label: this.$t('FeeList.orderNo'),
        type: 'button',
        width: 120,
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.showOneNoDetail('order', row.sourceBizNo)
          },
        },
      },
      {
        prop: 'settleCompName',
        label: this.$t('FeeList.settleComp'),
        type: 'text',
        width: 120,
      },
      {
        prop: 'profitShareMode',
        label: this.$t('Charge.models'),
        type: 'select',
        propInDict: 'customerServiceMode'
      },
      {
        prop: 'settleCorpName',
        label: this.$t('FeeList.settleCorp'),
        type: 'text',
        width: 120
      },
      { prop: 'serviceName', label: this.$t('FeeList.serviceCodes'), type: 'text' },
      { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text' },
      { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text' },
      { prop: 'feeAmt', label: this.$t('FeeList.feeAmt'), type: 'text' },
      { prop: 'totalWriteoffAmt', label: this.$t('Collect.writtenoffAmount'), type: 'text' },
      { prop: 'noWriteoffAmt', label: this.$t('Collect.unwrittenAmount'), type: 'text' },
      { prop: 'bdEmployeeName', label: this.$t('PreClose.salesman'), type: 'text' },
      { prop: 'bdDeptName', label: this.$t('FinBill.department'), type: 'text' },
    ]
    this.option1.columns = this.selfColumnsBase
    this.defaultColumns = this.selfColumnsBase.map(item => item.prop)
    // this.getData()
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
      // if (this.customColumnsKeys && this.customColumnsKeys.length) {
			// 	data.columns = this.customColumnsKeys
			// }
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        let { key, value } = item
        if (value && value !== '' && value.length > 0) {
          if (key === 'settleCorpCode') {
            data.query.push({
              column: key,
              type: 'eq',
              value: value.join(','),
            })
          } else {
            data.query.push({
              column: key,
              type: 'eq',
              value: value,
            })
          }
        }
      })
      // if (isSearch) {
      //   this.searchBackup = data.query
      // }
      // data.query = this.searchBackup || []
      this.loading = true
      recFeeList(data).then((res) => {
        if (res.code === 0) {
          this.columns = this.defaultColumns
          let arr = []
          this.columns.forEach(column => {
            let obj = this.selfColumnsBase.find(item => {
              return item.prop === column
            })
            if (obj) {
              arr.push(obj)
            }
          })
          this.option1.columns = arr
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
    receiLossApply() {
      if (this.multipleSelection1.length === 0) {
        return this.$message({
          message: this.$t('Charge.feeFirst'),
          type: 'error',
          showClose: true
        })
      }
      this.routerPush('SettleOrderBadApply', {
        source: 'create',
        feeIds: this.multipleSelection1.map(item => item.feeId).join(',') // '54,676,343,8787'
      })
    },
    sendMulti(data, option) {
      // console.log(data, option)
      if (option === this.option1) this.multipleSelection1 = data
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