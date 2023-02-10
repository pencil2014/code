<template>
  <div class="one-kind-fee"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <div class="finance-table-summary">
      <div class="finance-summary-text">
      </div>
      <div class="finance-btn-container">
        <el-button-group>
          <el-button class="finance-btn" @click="createSettlement" size="mini">生成结算单</el-button>
        </el-button-group>
        <el-button-group>
          <el-button class="finance-btn" size="mini" @click="cancelAgentCompany">撤销费用代收付</el-button>
        </el-button-group>
      </div>
    </div>
    <div class="finance-table-container" v-show="option1.data.length > 0 || option2.data.length === 0">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{moneyTitle1}}</div>
          <div class="money-total" v-for="(item, index) in moneyTotalReceive" :key="'moneyTotalReceive' + index">
            {{item.currency}}合计：<span :class="{'money-pay-color': moneyTitle1 === '应付' ? true : false}">{{item.sum}}</span>
          </div>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" @click="handleCustomColumns" size="mini">自定义表头</el-button>
          <el-button type="text" class="collapse-btn" @click="handleCollapse('Table1')" size="mini">{{showTable1 ? '收起' : '展开'}}<i :class="{'el-icon-arrow-up': showTable1, 'el-icon-arrow-down': !showTable1}"></i></el-button>
        </div>
      </div>
      <FinanceTable
        :option="option1"
        @send-multi="sendMulti"
        v-show="showTable1"/>
    </div>
    <div class="finance-table-container" v-show="option2.data.length > 0">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{moneyTitle2}}</div>
          <div class="money-total" v-for="(item, index) in moneyTotalPay" :key="'moneyTotalPay' + index">
            {{item.currency}}合计：<span :class="{'money-pay-color': moneyTitle2 === '应付' ? true : false}">{{item.sum}}</span>
          </div>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" @click="handleCustomColumns" size="mini" v-show="option1.data.length === 0">自定义表头</el-button>
          <el-button type="text" class="collapse-btn" @click="handleCollapse('Table2')" size="mini">{{showTable2 ? '收起' : '展开'}}<i :class="{'el-icon-arrow-up': showTable2, 'el-icon-arrow-down': !showTable2}"></i></el-button>
        </div>
      </div>
      <FinanceTable
        :option="option2"
        @send-multi="sendMulti"
        v-show="showTable2"/>
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
import FinanceTable from '../../../components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns/index'
import  { mixin } from '../mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mapState } from 'vuex'
import { orderFeeList, cancelAgentCompany } from '@/api/fin/fee'
import Vue from 'vue'

export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      option1: {},
      option2: {},
      multipleSelection1: [],
      multipleSelection2: [],
      moneyTitle1: '应收',
      moneyTitle2: '应付',
      showTable1: true,
      showTable2: true,
      dialogVisible: false,
      usdMoney: '',
      cnyMoney: '',
      // orderNo: this.$store.state.finance.orderNo,
      orderNo: '',
      currency: this.$store.state.dict.dictMap.currency,
      moneyTotalReceive: [],
      moneyTotalPay: [],
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
      id: 'option1', $name: 'agentReceipay1',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns,
      sortable: true,
      sortChange: this.sortChange,
      maxHeight: 300,
      index: {
        show: true
      }
    })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2', $name: 'agentReceipay2',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns,
      sortable: true,
      sortChange: this.sortChange,
      maxHeight: 300,
      index: {
        show: true
      }
    })
    // let orderNo = sessionStorage.getItem('orderNo')
    // this.orderNo = orderNo ? orderNo : ''
    this.getOrderNo()
    this.getData()
  },
  activated() {
    this.getOrderNo()
    if(this.$route.meta.refresh){
      this.$route.meta.refresh = false
      this.getData()
    }
  },
  methods: {
    getData(params) {
      this.loading = true
      let prop = params && params.prop
      if (prop === 'serviceCode') prop = 'serviceName'
      let data = { 
        "orderNo": this.useNo, // this.orderNo,
        "viewGroupType": "all",
        "isException": "no",
        "isAgency": 'yes',
        "columns": this.customColumnsKeys,
        "ascColumns": params && params.order === 'ascending' ? [prop] : [],
        "descColumns": params && params.order === 'descending' ? [prop] : (params && params.order === 'ascending' ? [] : []), // 'createdTime'
        "currPage": 1,
        "pageSize": 1000
      }
      orderFeeList(data).then(res => {
        // this.option1.loading = false
        this.loading = false
        if (res.code === 0) {
          let { configColumns, list } = res.data
          this.columns = configColumns.length > 0 ? configColumns : this.defaultColumns
          this.columns = [...this.columns]
          // if (!this.columns.includes('frontIndex')) {
          //   this.columns.unshift('frontIndex')
          // }
          let serviceCodeIndex = this.columns.findIndex(item => item === 'serviceCode')
          if (serviceCodeIndex > -1) {
            this.columns.splice(serviceCodeIndex, 1, 'serviceName')
          }
          this.columns = [...new Set(this.columns)]
          
          let agentCompIndex = this.columns.findIndex(item => {
            return item === 'agentCompName'
          })
          if (agentCompIndex === -1) {
            let settleCompIndex = this.columns.findIndex(item => {
              return item === 'settleCompName'
            })
            if (settleCompIndex > -1) {
              this.columns.splice(settleCompIndex + 1, 0, 'agentCompName')
            } else {
              this.columns.splice(1, 0, 'agentCompName')
            }
          }

          let arr1 = []
          let arr2 = []
          this.columns.forEach(value => {
            let obj = this.columnsBaseLocal.find(item => {
              return item.prop === value
            })
            if (obj) {
              if (obj.prop !== 'payApplySettleNos' && obj.prop !== 'payOrderNos') {
                arr1.push(obj)
                arr2.push(obj)
              }
            }
          })
          this.option1.columns = arr1
          this.option2.columns = arr2

          list.forEach((item, index) => {
            item.settleOrderNos_multiValue = item.settleOrderNos.split(',')
            item.writeoffNos_multiValue = item.writeoffNos.split(',')
            item.settleTimes_multiValue = item.settleTimes.split(',')
            // item.invoiceNos_multiValue = item.invoiceNos.split(',')
            item.payApplySettleNos_multiValue = item.payApplySettleNos.split(',')
            item.payOrderNos_multiValue = item.payOrderNos.split(',')
            // item.acctVoucherNos_multiValue = item.acctVoucherNos.split(',')
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
          })
          let data1 = list.filter((item, index) => {
            return item.receipayType === "receive"
          })
          let data2 = list.filter(item => {
            return item.receipayType === "pay"
          })

          data1.forEach((item, index) => {
            // item.frontIndex = index + 1
          })
          data2.forEach((item, index) => {
            // item.frontIndex = index + 1
          })

          let initNum = 30
          let initNum2 = 30
          let delay = 100
          this.option1.data = data1.filter((item, index) => {
            if (index < initNum) {
              return item
            }
          })
          this.option2.data = data2.filter((item, index) => {
            if (index < initNum2) {
              return item
            }
          })

          setTimeout(() => {
            if (data1.length > initNum) {
              this.option1.data = this.option1.data.concat(data1.filter((item, index) => {
                if (index >= initNum) {
                  return item
                }
              }))
            }
            if (data2.length > initNum2) {
              this.option2.data = this.option2.data.concat(data2.filter((item, index) => {
                if (index >= initNum) {
                  return item
                }
              }))
            }
          }, delay)
          // this.computeMoneyTotal() 改由后台算
        }
      }).catch(err => {
        console.log(err)
        this.loading = false
      })
    },
    getOrderNo() {
      this.orderNo = this.$route.query.orderNo
      this.jointNo = this.$route.query.jointNo
      this.useNo = this.jointNo ? this.jointNo : this.orderNo
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
    cancelAgentCompany() {
      if (this.multipleSelection1.length === 0 && this.multipleSelection2.length === 0) {
        this.$message({
          message: '请选择需要撤销代收付的费用！',
          type: 'error',
          showClose: true
        })
        return
      }
      this.$confirm('是否确认将选中的费用进行撤销代收付？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          "orderNo": this.useNo, // this.orderNo,
          "orderFeeIds": this.multipleSelection1.concat(this.multipleSelection2).map(item => {
            return item.orderFeeId
          })
        }
        cancelAgentCompany(data).then(res => {
          if (res.code === 0) {
            this.getData()
            this.$message({
              message: '撤销费用代收付成功！',
              type: 'success',
              showClose: true
            })
          }
        }).catch(err => {
        })
      }).catch(() => {         
      })
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params, { isTab: true, from: 'OrderFee' })
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
    },
    handleCollapse(val) {
      this['show' + val] = !this['show' + val]
    },
    handleCommand(command) {
      console.log(command)
    },
    showLog() {
      console.log('showLog')
    }
  },
  computed: {
    ... mapState({
      defaultColumns: state => state.finance.columns.defaultColumns,
      columnsBase: state => state.finance.columns.columnsBase
    })
  },
  components: {
    FinanceTable,
    CustomColumns
  }
}
</script>
<style>
</style>