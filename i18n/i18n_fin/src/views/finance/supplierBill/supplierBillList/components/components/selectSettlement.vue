<template>
  <div>
    <FinanceSearch :noLabelWidth="justSelect" :searchOption="searchOption1" @search="search" />
    <!-- <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left"></div>
        <div class="money-box-right"></div>
        <el-button-group v-if="justSelect">
          <el-button class="finance-btn" @click="selectSettlement" size="mini">确定选择</el-button>
        </el-button-group>
    </div>-->
    <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    <!-- </div> -->
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { listPage, close, merge, settleOrderAgentConfirm, settleOrderAgentCancel } from '@/api/fin/settleOrder'
import { dateFormat } from '@/views/finance/utils/finance'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
  name: 'selectSettlement',
  mixins: [mixin, mixin2, routerMixin],
  props: {
    justSelect: {
      type: Boolean,
      default: false,
    },
    selectSettlement: {
      type: Array,
      default: () => [],
    },
    selectedSettlement: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      option1: {},
      option2: {},
      searchOption1: {},
      table2DataBackup: [],
      isAddPay: false,
      multipleSelection1: [],
      multipleSelection2: [],
      agentForm: {
        agentCompCode: '',
        agentCompName: '',
      },
      orderNo: '',
      orderBillId: '',
      feeAdjustApplyId: 0,
      showSettlementDetail: false,
      selectedOptionItem: '',
      dialogVisible: false,
      batchPrintCreateData: [],
      invoiceReceivableIndex: 0,
      dialogVisibleManualRegist: false,
      currentComponent: '',
      settleOrderId: -1,
      settleOrderNo: '',
      settleCorpCode: '',
      settleCorpName: '',
      settleCompCode: '',
      settleCompName: '',
      source: '',
      settleOrderIds: [],
      row: '',
      isJumpRouteFromPage: false,
      agentReceipayDialogVisible: false,
      // searchModifyEffect: true,
      searchOption2: {},
      currencySelectOptions: [],
    }
  },
  created() {
    this.currencySelectOptions = [...this.$store.state.dict.dictMap.currency]
    this.currencySelectOptions.unshift({ label: this.$t('Settle.orignalCurrency'), value: 'original' })
    this.searchOption1 = {
      columns: [
        {
          label: this.$t('Supplier.stateNumber'),
          prop: 'settleOrderNo',
          type: 'input',
        },
        {
          label: this.$t('FeeList.settleComp'),
          prop: 'settleCompCode',
          type: 'select',
          filterable: true,
          remote: true,
          multiple: true,
          remoteMethod: (queryString, item, row) => {
            this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
          },
          visibleChange: (queryString, item, row) => {
            this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
          },
          // change: (value, item, data) => {
          //   let obj = item.remoteSelectList.find(subItem => {
          //     return subItem.value === value
          //   })
          //   Object.assign(data, {
          //     settleCompName: obj ? obj.label : '' // 回传后台无需此字段
          //   })
          // },
          remoteSelectList: [],
        },
        {
          label: this.$t('FeeList.settleCorp'),
          prop: 'settleCorpCode',
          type: 'select',
          filterable: true,
          remote: true,
          multiple: true,
          remoteMethod: (queryString, item, row) => {
            this.querySettleUnit2({ queryString, unitTypes: '' }, item)
          },
          // 结算单位有很多，不显示默认下拉列表---特殊设想
          // visibleChange: (queryString, item, row) => {
          //   this.querySettleUnit2({queryString, unitTypes: ''}, item)
          // },
          // change: (value, item, data) => {
          //   let obj = item.remoteSelectList.find(subItem => {
          //     return subItem.value === value
          //   })
          //   Object.assign(data, {
          //     settleCompName: obj ? obj.label : '' // 回传后台无需此字段
          //   })
          // },
          remoteSelectList: [],
        },
        {
          label: this.$t('FeeList.createdDate'),
          prop: 'createdDate',
          type: 'dateRange',
          // valueFormat: 'yyyy-MM-dd' // 如加此属性，将返回字符串，还是按返回日期格式来处理
        },
        {
          label: this.$t('FeeList.receipayType'),
          prop: 'receivePayType',
          type: 'select',
          propInDict: 'receipayType',
        },
        {
          label: this.$t('Settle.settleOrderStatus'),
          prop: 'settleOrderStatus',
          type: 'select',
          propInDict: 'finSettleOrderStatus',
          // selectOptions: [
          //   {label: this.$t('Common.yes'), value: 'yes'},
          //   {label: this.$t('Common.no'), value: 'no'}
          // ]
        },
      ],
      data: {
        settleOrderNo: '',
        createdDate: '',
        settleCorpName: '',
        settleCorpCode: '',
        settleCompName: '',
        settleCompCode: '',
        receivePayType: '',
        settleOrderStatus: '',
      },
    }
    // 如果是从供应商对账进来，则取消分公司和结算单位的搜索项
    this.justSelect && this.searchOption1.columns.splice(1, 2)
    // this.justSelect && this.searchOption1.columns.splice(-1,1)
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'selectSettlement',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns: false,
      pagination,
      maxHeight: this.getFinanceTableMaxHeight,
    })
    let columns = [
      { prop: 'settleOrderNo', label: this.$t('Supplier.stateNumber'), type: 'text', width: 138 },
      { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', width: 150 },
      { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 150 },
      { prop: 'receivePayType', label: this.$t('FeeList.receipayType'), type: 'select', propInDict: 'receipayType', width: 80 },
      { prop: 'settleCurrency', label: this.$t('Settle.settleCurrency'), type: 'text', width: 80 },
      { prop: 'sumAmount', label: this.$t('Settle.sumAmount'), type: 'tooltip', width: 80 },
      { prop: 'writeoffStatus', label: this.$t('FeeList.writeoffStatuss'), type: 'select', width: 80 },
      // { prop: 'settleOrderStatus', label: '锁定状态', type: 'select', propInDict: 'finSettleOrderStatus', width: 80 },
      // { prop: 'settleOrderStatus', label: '费用确认', type: 'select', propInDict: 'finSettleOrderStatus', width: 80 },
      {
        prop: 'confirmStatus',
        label: this.$t('FeeList.confirmStatus'),
        type: 'text',
        width: 100,
        // formatter: (row, pItem) => {
        //   if (row[pItem.prop] === 'yes') {
        //     return this.$t('Common.confirmed')
        //   } else if (row[pItem.prop] === 'no') {
        //     return this.$t('Common.unconfirmed')
        //   } else {
        //     return row[pItem.prop]
        //   }
        // },
        formatter: ({ cellValue }) => {
          if (cellValue === 'yes') {
            return this.$t('Common.confirmed')
          } else if (cellValue === 'no') {
            return this.$t('Common.unconfirmed')
          } else {
            return cellValue
          }
        },
      },
      {
        prop: 'settleOrderStatus',
        label: this.$t('Settle.settleOrderStatus'),
        type: 'select',
        propInDict: 'finSettleOrderStatus',
        width: 100,
      },
      { prop: 'agentCompName', label: this.$t('Settle.agentCompName'), type: 'text', width: 150 },
      { prop: 'reciWriteOffAmtDesc', label: this.$t('Settle.reciWriteOffAmtDesc'), type: 'text', width: 100 },
      { prop: 'reciNoWriteOffAmtDesc', label: this.$t('Settle.reciNoWriteOffAmtDesc'), type: 'text', width: 100 },
      { prop: 'payWriteOffAmtDesc', label: this.$t('Settle.payWriteOffAmtDesc'), type: 'text', width: 100 },
      { prop: 'payNoWriteOffAmtDesc', label: this.$t('Settle.payNoWriteOffAmtDesc'), type: 'text', width: 100 },
      { prop: 'orderType', label: this.$t('Settle.orderType'), type: 'select', propInDict: 'settleOrderType', width: 80 },
      { prop: 'sourceType', label: this.$t('Settle.sourceType'), type: 'select', propInDict: 'settleOrderSourceType', width: 100 },
      { prop: 'payApplyNo', label: this.$t('Settle.payApplyNo'), type: 'text', width: 130 },
      { prop: 'payOrderNos', label: this.$t('Settle.payOrderNo'), type: 'text', width: 130 },
      { prop: 'writeoffNos', label: this.$t('FeeList.writeoffNo'), type: 'text', width: 130 },
      { prop: 'createdName', label: this.$t('Common.createdBy'), type: 'text', width: 100 },
      { prop: 'createdTime', label: this.$t('Common.createTime'), type: 'text', width: 130 },
    ]
    this.option1.columns = columns
    this.getData()
  },
  methods: {
    getData() {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      if (!this.justSelect) {
        console.log(this.searchOption2.addFilter.searchInputGroup)
        // return
        this.searchOption2.addFilter.searchInputGroup.forEach((item) => {
          let { key, value, range, req, valueReq } = item
          if (range && (range.min || range.max)) {
            if (range.min) {
              data.query.push({
                column: key + 'Min',
                type: 'eq',
                value: range.min,
              })
            }
            if (range.max) {
              data.query.push({
                column: key + 'Max',
                type: 'eq',
                value: range.max,
              })
            }
            return
          }
          if (valueReq && item[valueReq]) {
            data.query.push({
              column: valueReq,
              type: 'eq',
              value: item[valueReq],
            })
            return
          }
          if (value) {
            // if (key === 'sourceBizNo' || key === 'settleOrderNo' || key === 'payOrderNo' || key === 'writeoffNo' || key === 'acctVoucherNos') {
            //   data.query.push({
            //     column: key,
            //     type: 'like',
            //     value: value,
            //   })
            // } else if (key === 'feeName' || key === 'feeEname') {
            //   data.query.push({
            //     column: 'feeCode',
            //     type: 'eq',
            //     value: value,
            //   })
            // } else
            if (value instanceof Array) {
              if (value.length === 0) {
                return
              }
              let DateIndex = key.indexOf('Date')
              // let CodeIndex = key.indexOf('Code')
              if (DateIndex > -1) {
                if (key === 'createdDate') {
                  data.query.push({
                    column: 'beginDate',
                    type: 'eq',
                    value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
                  })
                  data.query.push({
                    column: 'endDate',
                    type: 'eq',
                    value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
                  })
                } else {
                  data.query.push({
                    column: key.slice(0, DateIndex) + 'Begin' + 'Date',
                    type: 'eq',
                    value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
                  })
                  data.query.push({
                    column: key.slice(0, DateIndex) + 'End' + 'Date',
                    type: 'eq',
                    value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
                  })
                }
              }
              // else if (CodeIndex > -1) {
              else {
                data.query.push({
                  column: key,
                  type: 'eq',
                  value: value.join(','),
                })
              }
            } else {
              data.query.push({
                column: key,
                type: 'eq',
                value: req || value,
              })
            }
          }
        })
      } else {
        let obj = this.searchOption1.data
        let keys = Object.keys(obj)
        keys = keys.filter((item) => {
          return item !== 'settleCorpName' && item != 'settleCompName'
        })
        keys.forEach((key) => {
          let value = obj[key]
          if (value && value !== '') {
            if (key === 'settleOrderNo') {
              data.query.push({
                column: 'settleOrderNo',
                type: 'like',
                value: value.replace(/[\s+,+，+]+/g, ' '),
              })
            } else if (key === 'createdDate') {
              data.query.push({
                column: 'beginDate',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
              })
              data.query.push({
                column: 'endDate',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
              })
            } else if (key === 'settleCorpCode') {
              // data.query.push({
              //   "column": 'settleCorpCode',
              //   "type": "eq",
              //   "value": value
              // })
              if (value.length === 0) return
              data.query.push({
                column: 'settleCorpCode',
                type: 'eq',
                value: value.join(','), // 改为传字符串给后台
              })
            } else if (key === 'settleCompCode') {
              if (value.length === 0) return
              data.query.push({
                column: 'settleCompCode',
                type: 'eq',
                value: value.join(','), // 改为传字符串给后台
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
        if (this.searchOption1.data.settleOrderStatus) {
          data.query.push({
            column: 'settleOrderStatuss',
            type: 'in',
            value: this.searchOption1.data.settleOrderStatus,
          })
        }
        data.query.push({
          column: 'settleCorpCodes',
          type: 'in',
          value: this.$attrs.supplierSettleCorpCode,
        })
      }
      console.log(this.$attrs.supplierSettleCorpCode)
      listPage(data).then((res) => {
        if (res.code === 0) {
          let data = (res.data && res.data.list) || []
          let arr = this.selectedSettlement.map((v) => v.settleOrderNo)
          this.option1.data = data.filter((v) => arr.indexOf(v.settleOrderNo) === -1)
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        }
      })
    },
    // selectSettlement() {
    //   if (this.multipleSelection1.length < 1) {
    //     this.$message({
    //       message: '请选择结算单！',
    //       type: 'error',
    //       showClose: true,
    //     })
    //     return
    //   }
    //   this.$emit('select-settlement', this.multipleSelection1)
    //   this.$emit('close-select-settlement')
    // },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params)
    },
    closeSettlementDetail() {
      this.showSettlementDetail = false
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    querySettleUnit(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString).then((data) => {
        cb(data)
      })
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
      this.selectSettlement.splice(0, 1000, ...data)
    },
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    showDetail(row) {
      this.isJumpRouteFromPage = true
      this.$router.push({
        path: '/finance/settlement/settlementDetail',
        query: {
          source: 'settlementDetail',
          settleOrderId: row.settleOrderId,
        },
      })
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
  },
}
</script>
<style>
</style>