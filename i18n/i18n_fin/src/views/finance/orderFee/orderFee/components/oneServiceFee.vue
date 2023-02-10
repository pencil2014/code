<template>
  <div class="finance-one-service-fee">
     <!-- v-loading="loading" no necessary -->
    <div class="finance-one-service-fee-separator"></div>
    <div class="finance-one-service-fee-title">
      <p>费用信息</p>
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">应收</div>
          <div class="money-total" v-for="(item, index) in moneyTotalReceive" :key="'moneyTotalReceive' + index">
            {{item.currency}}合计：<span :class="{'money-pay-color': moneyTitle1 === 'pay' ? true : false}">{{item.sum}}</span>
          </div>
          <!-- <div class="money-total">CNY合计：<span>{{orderProfit.totalCnyReceiveAmt}}</span></div>
          <div class="money-total">USD合计：<span>{{orderProfit.totalUsdReceiveAmt}}</span></div> -->
        </div>
        <div class="money-box-right">
          <!-- <el-button class="finance-btn" @click="handleCustomColumns" size="mini">{{$t('Common.custTableHead')}}</el-button> -->
          <el-button type="text" class="collapse-btn" @click="handleCollapse('Table1')" size="mini">{{showTable1 ? $t('Common.collapse') : $t('Common.expand')}}<i :class="{'el-icon-arrow-up': showTable1, 'el-icon-arrow-down': !showTable1}"></i></el-button>
        </div>
      </div>
      <FinanceTableMass
        :option="option1"
        v-if="showTable1"
        @send-multi="sendMulti"/>
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">应付</div>
          <div class="money-total" v-for="(item, index) in moneyTotalPay" :key="'moneyTotalPay' + index">
            {{item.currency}}合计：<span :class="{'money-pay-color': moneyTitle2 === 'pay' ? true : false}">{{item.sum}}</span>
          </div>
          <!-- <div class="money-total">CNY合计：<span class="money-pay-color">{{orderProfit.totalCnyPayAmt}}</span></div>
          <div class="money-total">USD合计：<span class="money-pay-color">{{orderProfit.totalUsdPayAmt}}</span></div> -->
        </div>
        <div class="money-box-right">
          <el-button type="text" class="collapse-btn" @click="handleCollapse('Table2')" size="mini">{{showTable2 ? $t('Common.collapse') : $t('Common.expand')}}<i :class="{'el-icon-arrow-up': showTable2, 'el-icon-arrow-down': !showTable2}"></i></el-button>
        </div>
      </div>
      <FinanceTableMass
        :option="option2"
        v-if="showTable2"
        @send-multi="sendMulti"/>
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose" />
    </div>
    <el-dialog
      :title="'订单费用的日志'"
      :visible.sync="logDialogVisible"
      :close-on-click-modal="false"
      width="875px">
      <FinanceTableMass
        :option="option3"/>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTableMass from '../../../components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '../mixin'
import { mapState } from 'vuex'
import Vue from 'vue'
import { orderFeeList, getOrderProfit, orderFeeHistory } from '@/api/fin/fee'
import { decimalFixed2 } from '@/views/finance/utils/finance'
import { del } from '@/api/fin/invoicePayment'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
export default {
  mixins: [mixin, routerMixin],
  props: {
    orderNoProp: {
      type: String,
      default: ''
    },
    serviceCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      option1: {},
      option2: {},
      option3: {},
      moneyTitle1: 'receive',
      moneyTitle2: 'pay',
      moneyTitle: 'receive',
      dialogVisible: false,
      usdMoney: '',
      cnyMoney: '',
      orderNo: '',
      currency: this.$store.state.dict.dictMap.currency,
      moneyTotalReceive: [],
      moneyTotalPay: [],
      orderProfit: {
        cnyPayAmt:0,
        cnyReceiveAmt:0,
        cnyProfit:0,
        usdPayAmt:0,
        usdReceiveAmt:0,
        usdProfit:0,
        totalCnyPayAmt: 0,
        totalCnyProfit: 0,
        totalCnyReceiveAmt: 0,
        totalGrossProfit: 0,
        totalUsdPayAmt: 0,
        totalUsdProfit: 0,
        totalUsdReceiveAmt: 0
      },
      orderFeeStat: {
       basicCurrency:"",
       receiveTotalAmt:0,
       receiveWriteoffAmt:0,
       receiveUnWriteoffAmt:0,
       receiveInvoiceAmt:0,
       receiveUnInvoiceAmt:0,
       payTotalAmt:0,
       payWriteoffAmt:0,
       payUnWriteoffAmt:0,
       payInvoiceAmt:0,
       payUnInvoiceAmt:0,
       payApplyAmt:0,
       payUnApplyAmt:0
      },
      logDialogVisible: false,
      profitDialogVisible: false,
      orderMonthProfit: [],
      feeIds: [],
      multipleSelection1: [],
      multipleSelection2: [],
      settleOrderNo: '',
      writeoffReceipayNo: '',
      gedgingApplyId: '',
      source: '',
      isDetailPage: true,
      componentProps: '',
      showTable1: false,
      showTable2: false,
      loading: false,
      jointNo: '',
      useNo: ''
    }
  },
  created() {
    let operationBtns = Object.assign(this.option.operationBtns, {
      show: false
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'oneServiceFee1',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns,
      selection: {
        show: false
      },
      // sortable: true,
      // sortChange: this.sortChange,
      maxHeight: 300,
      index: {
        show: true
      }
    })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2', $name: 'oneServiceFee2',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns,
      selection: {
        show: false
      },
      // sortable: true,
      // sortChange: this.sortChange,
      maxHeight: 300,
      index: {
        show: true
      }
    })
    this.option3 = Object.assign({}, this.option, {
      id: 'option3', $name: 'oneServiceFee3',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns: {
        show: false
      },
      selection: {
        show: false
      }
    })
    this.getOrderNo()
    // this.getData() // 此处不调用
  },
  activated() {
    this.getOrderNo()
  },
  methods: {
    getData(params) {
      this.loading = true
      let prop = params && params.prop
      if (prop === 'serviceCode') prop = 'serviceName'
      let data = { 
        "orderNo": this.useNo,
        "viewGroupType": "all",
        "isException": "no",
        "serviceCode": this.serviceCode,
        "columns": this.customColumnsKeys,
        "ascColumns": params && params.order === 'ascending' ? [prop] : [],
        "descColumns": params && params.order === 'descending' ? [prop] : (params && params.order === 'ascending' ? [] : []), // 'createdTime'
        "currPage": 1,
        "pageSize": 1000,
        "receipayType": 'receive'
      }
      let data2 = Object.assign({}, data, { "receipayType": 'pay', "columns": this.customColumnsKeys2, "pageSize": 0 })
      Promise.all([orderFeeList(data), orderFeeList(data2)]).then(res => {
        this.loading = false
        if (res[0].code === 0) {
          this.processData(res[0], 'receive')
        }
        if (res[1].code === 0) {
          this.processData(res[1], 'pay')
        }
      }).catch(err => {
        this.loading = false
      })
      // orderFeeList(data).then(res => {
      //   this.loading = false
      //   if (res.code === 0) {
      //     let { configColumns, list } = res.data
      //     this.columns = configColumns.length > 0 ? configColumns : this.defaultColumns

      //     let arr1 = []
      //     let arr2 = []
      //     this.columns.forEach(value => {
      //       let obj = this.columnsBaseLocal.find(item => {
      //         return item.prop === value
      //       })
      //       if (obj) {
      //         if (obj.prop !== 'payApplySettleNos' && obj.prop !== 'payOrderNos') {
      //           arr1.push(obj)
      //         }
      //         arr2.push(obj)
      //       }
      //     })
      //     this.option1.columns = arr1
      //     this.option2.columns = arr2

      //     list.forEach((item, index) => {
      //       item.settleOrderNos_multiValue = item.settleOrderNos.split(',')
      //       item.writeoffNos_multiValue = item.writeoffNos.split(',')
      //       item.settleTimes_multiValue = item.settleTimes.split(',')
      //       item.invoiceNos_multiValue = item.invoiceNos.split(',')
      //       item.payApplySettleNos_multiValue = item.payApplySettleNos.split(',')
      //       item.payOrderNos_multiValue = item.payOrderNos.split(',')
      //       item.acctVoucherNos_multiValue = item.acctVoucherNos.split(',')
      //     })
      //     let data1 = list.filter((item, index) => {
      //       return item.receipayType === "receive"
      //     })
      //     let data2 = list.filter(item => {
      //       return item.receipayType === "pay"
      //     })

      //     let initNum = 30
      //     let initNum2 = 30
      //     let delay = 100
      //     this.option1.data = data1.filter((item, index) => {
      //       if (index < initNum) {
      //         return item
      //       }
      //     })
      //     this.option2.data = data2.filter((item, index) => {
      //       if (index < initNum2) {
      //         return item
      //       }
      //     })

      //     setTimeout(() => {
      //       if (data1.length > initNum) {
      //         this.option1.data = this.option1.data.concat(data1.filter((item, index) => {
      //           if (index >= initNum) {
      //             return item
      //           }
      //         }))
      //       }
      //       if (data2.length > initNum2) {
      //         this.option2.data = this.option2.data.concat(data2.filter((item, index) => {
      //           if (index >= initNum) {
      //             return item
      //           }
      //         }))
      //       }
      //       // this.computeMoneyTotal(res.data.originalCurrencyStat)
      //       this.computeMoneyTotalFront()
      //     }, delay)
      //   }
      // }).catch(err => {
      //   console.log(err)
      //   this.loading = false
      // })
    },
    processData(res, receipayType) {
      let { configColumns } = res.data
      let columns = []
      if (receipayType === 'receive') {
        this.columns = configColumns.length > 0 ? configColumns : this.defaultColumnsRecei
        this.columns = [...this.columns]
        let serviceCodeIndex = this.columns.findIndex(item => item === 'serviceCode')
        if (serviceCodeIndex > -1) {
          this.columns.splice(serviceCodeIndex, 1, 'serviceName')
        }
        this.columns = [...new Set(this.columns)]
        columns = this.columns
      } else if (receipayType === 'pay') {
        this.columns2 = configColumns.length > 0 ? configColumns : this.defaultColumnsPay
        this.columns2 = [...this.columns2]
        let serviceCodeIndex = this.columns2.findIndex(item => item === 'serviceCode')
        if (serviceCodeIndex > -1) {
          this.columns2.splice(serviceCodeIndex, 1, 'serviceName')
        }
        this.columns2 = [...new Set(this.columns2)]
        columns = this.columns2
      }
      let arr1 = []
      // let arr2 = []
      columns.forEach(value => {
        let obj = this.columnsBaseLocal.find(item => {
          return item.prop === value
        })
        if (obj) {
          // if (obj.prop !== 'payApplySettleNos' && obj.prop !== 'payOrderNos') {
          //   arr1.push(obj)
          // }
          // arr2.push(obj)
          arr1.push(obj)
        }
      })
      if (receipayType === 'receive') {
        this.option1.columns = arr1
      } else if (receipayType === 'pay') {
        this.option2.columns = arr1
        return
      }

      let { list } = res.data
      let data1 = list.filter((item, index) => {
        // 尝试放到这里，减少数组操作次数
        item.settleOrderNos_multiValue = item.settleOrderNos.split(',')
        item.writeoffNos_multiValue = item.writeoffNos.split(',')
        item.settleTimes_multiValue = item.settleTimes.split(',')
        item.payApplySettleNos_multiValue = item.payApplySettleNos.split(',')
        item.payOrderNos_multiValue = item.payOrderNos.split(',')
        item.acctVoucherNos_multiValue = item.acctVoucherNos.split(',').map(subItem => {
          let arr = subItem.split('/')
          return arr[1] ? arr[1] : arr[0]
        })
        item.voucherSeqNos_multiValue = item.acctVoucherNos.split(',').map(subItem => {
          let arr = subItem.split('/')
          return arr[0]
        })
        item.invoiceNos_multiValue = item.invoiceNos.split(',').map(subItem => {
          let arr = subItem.split('/')
          return arr[1] ? arr[1] : arr[0]
        })
        item.invoiceReceivableIds_multiValue = item.invoiceNos.split(',').map(subItem => {
          let arr = subItem.split('/')
          return arr[0]
        })
        return item.receipayType === "receive"
      })
      let data2 = list.filter(item => {
        return item.receipayType === "pay"
      })

      this.option1.data = data1
      this.option2.data = data2
      // this.getOrderProfit()
      this.computeMoneyTotalFront()
    },
    getOrderNo() {
      this.orderNo = this.$route.query.orderNo
      this.jointNo = this.$route.query.jointNo
      this.useNo = this.jointNo ? this.jointNo : this.orderNo
    },
    handleCollapse(val) {
      this['show' + val] = !this['show' + val]
    },
    sortChange(column, prop, order) {
      this.getData({prop, order})
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params, { isTab: true, from: 'OrderFee' })
    },
    // getOrderProfit() {
    //   let data = {
    //     "orderNo": this.useNo, // this.orderNo
    //   }
    //   getOrderProfit(data).then(res => {
    //     if (res.code === 0) {
    //       this.orderMonthProfit = res.data.profitList
    //       // this.orderProfit = res.data // 弃用
    //       this.openProfitDetail()
    //     }
    //   })
    // },
    // openProfitDetail() {
    //   let data = this.orderMonthProfit
    //   let columns = [
    //     {
    //       prop: 'ownerCompName',
    //       label: this.$t('FeeList.settleComp'),
    //       type: 'text'
    //     },
    //     {
    //       prop: 'mon',
    //       label: '月份',
    //       type: 'text'
    //     },
    //     {
    //       prop: 'cnyProfit',
    //       label: '人民币毛利',
    //       type: 'text'
    //     },
    //     {
    //       prop: 'usdProfit',
    //       label: '美元毛利',
    //       type: 'text'
    //     },
    //     {
    //       prop: 'grossProfit',
    //       label: '毛利率',
    //       type: 'text',
    //       formatter: (row, pItem) => {return decimalFixed2(row[pItem.prop] * 100) + '%'}
    //     }
    //   ]
    // },
    showLog(row) {
      let data = { 
        "orderNo": this.useNo,
        "orderFeeId": row.orderFeeId
      }
      orderFeeHistory(data).then(res => {
        if (res.code === 0) {
          let data = res.data
          let columns = [
            {
              prop: 'changeBizType',
              label: '变更来源类型',
              type: 'select',
              propInDict: 'feeChangeSourceType',
              width: 100
            },
            {
              prop: 'changeBizNo',
              label: '变更来源单号',
              type: 'text',
              width: 120,
            },
            {
              prop: 'updatedName',
              label: '变更人',
              type: 'text',
              width: 100
            },
            {
              prop: 'updatedTime',
              label: '变更时间',
              type: 'text',
              width: 125
            },
            {
              prop: 'changeRemark',
              label: '变更说明',
              type: 'text',
            }
          ]
          this.option3.columns = columns
          this.option3.data = data
          this.logDialogVisible = true
        }
      })
    },
    createSettlement() {
      if (this.multipleSelection1.length === 0 && this.multipleSelection2.length === 0) {
        this.$message({
          message: '请勾选需要生成结算单的费用！',
          type: 'error',
          showClose: true
        })
        return
      }
      let feeIds1 = this.multipleSelection1.map(item => {
        return item.feeId
      })
      let feeIds2 = this.multipleSelection2.map(item => {
        return item.feeId
      })
      let _this = this
      this.isJumpRouteFromPage = true
      Vue.prototype.$NotRouteBeforeRouteLeave = function(to, from) {
        _this.commonRoute(to, from)
      }
      this.$router.push({
        path: '/finance/settlement/createSettlement',
        query: {
          source: 'createSettlementFromOrderFeeIds',
          feeIds: JSON.stringify(feeIds1.concat(feeIds2)),
          orderNo: this.orderNo
        }
      })
    },
    sendMulti(data, option) {
      // console.log(data, option)
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
    }
  },
  computed: {
    getReceipayType() {
      return this.moneyTitle === 'receive' ? 'receive' : 'pay'
    },
    getProfitRate() {
      return decimalFixed2(this.orderProfit.totalGrossProfit * 100)
    },
    ... mapState({
      defaultColumnsRecei: state => state.finance.columns.defaultColumnsRecei,
      defaultColumnsPay: state => state.finance.columns.defaultColumnsPay,
      columnsBase: state => state.finance.columns.columnsBase
    })
  },
  watch: {
    serviceCode: {
      handler(newVal) {
        console.log('oneServiceFee serviceCode: ', newVal)
        if (newVal) {
          this.getOrderNo()
          this.getData()
        }
      },
      immediate: true
    }
  },
  components: {
    FinanceTableMass,
    CustomColumns,
  }
}
</script>
<style>
.profit-dialog-container .finance-table-box{
  padding-left: 0;
  padding-right: 0;
}
.finance-orderfee-totalfee .el-dialog__body {
  padding-left: 24px;
}

.finance-orderfee-totalfee .finance-summary-text .el-button--text {
  line-height: 20px;
  padding-top: 0;
  padding-bottom: 0;
  padding-left: 0;
}
.finance-orderfee-totalfee .money-box-left .el-button--text {
  line-height: 14px;
  height: 20px;
  padding: 2px 7px;
}
</style>