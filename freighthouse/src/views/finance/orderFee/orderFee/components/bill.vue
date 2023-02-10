<template>
  <div class="one-kind-fee"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{moneyTitle2}}</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button v-if="checkAuth(pageCode, 'tab-bill', 'btn-invoiceConfirm')" class="finance-btn" @click="invoiceConfirm('yes')" size="mini">确认开票</el-button>
            <el-button v-if="checkAuth(pageCode, 'tab-bill', 'btn-invoiceConfirmNot')" class="finance-btn" @click="invoiceConfirm('no')" size="mini">确认不开票</el-button>
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth(pageCode, 'tab-bill', 'btn-createSettlement')" class="finance-btn" @click="createSettlement" size="mini">生成结算单</el-button>
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth(pageCode, 'tab-bill', 'btn-customerConfirm')" class="finance-btn" @click="customerConfirm" size="mini">客户确认</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTable
        :option="option1"
        v-show="showTable1"
        @send-multi="sendMulti"/>
    </div>
  </div>
</template>
<script>
import FinanceTable from '../../../components/financeTableMass/financeTableMass'
import { mixin } from '../mixin'
import { mapState } from 'vuex'
import { orderFeeList } from '@/api/fin/fee'
import { billList, customerConfirm, invoiceConfirm } from '@/api/fin/bill'
import Vue from 'vue'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
  mixins: [mixin, routerMixin],
  data() {
    let pageCode = '' // this.$route.name === 'SiDetail' ? 'SiDetailFee' : this.$route.name
    if (this.$route.name === 'SiDetail') {
      pageCode = 'SiDetailFee'
    } else {
      pageCode = 'OrderFee'
    }
    return {
      option1: {},
      option2: {},
      isEdit: false,
      moneyTitle1: '应收',
      moneyTitle2: '账单',
      showTable1: true,
      showTable2: true,
      table1DataBackup: [],
      table2DataBackup: [],
      isAddPay: false,
      multipleSelection1: [],
      multipleSelection2: [],
      orderNo: '',
      // orderNo: this.$store.state.finance.orderNo,
      currency: this.$store.state.dict.dictMap.currency,
      moneyTotalReceive: [],
      moneyTotalPay: [],
      currentComponent: '',
      source: '',
      jointNo: '',
      useNo: '',
      loading: false,
      pageCode,
    }
  },
  created() {
    let operationBtns = Object.assign(this.option.operationBtns, {
      data: [
        {
          label: '详情',
          type: 'text',
          show: true,
          action: 'showDetail'
        },
        // {
        //   label: '删除',
        //   type: 'text',
        //   show: true,
        //   action: 'Delete'
        // }
      ],
      width: '84px'
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'OrderFeeBill',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns, 
      // maxHeight: 380
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
  components: {
    FinanceTable
  },
  methods: {
    getData() {
      this.loading = true
      let data = { 
        "orderNo": this.useNo, // this.orderNo,
      }
      billList(data).then(res => {
        this.loading = false
        if (res.code === 0) {
          let list = res.data // let { list } = res.data
          let columns = [
            {
              prop: '',
              label: '',
              type: 'tag',
              width: 30,
              resizable: false,
              formatter: ({ feeChange }) => {
                if (feeChange) {
                  return [{ text: '改', type: 'change' }]
                } else {
                  return []
                }
              }
            },
            {
              prop: 'createdTime',
              label: '生成日期',
              type: 'text',
              width: 120
            },
            {
              prop: 'confirmStatus',
              label: '确认状态',
              type: 'text',
              formatter: ({ cellValue }) => {if (cellValue === 'yes') {return '是'} else if (cellValue === 'no') {return '否'}}
            },
            {
              prop: 'orderBillNo',
              label: '系统账单编号',
              type: 'button',
              width: 120,
              operationBtns: {
                show: true,
                callback: (fn, index, row, option) => {
                  this.showDetail(row)
                }
              }
            },
            {
              prop: 'dnNo',
              label: '账单号',
              type: 'text',
              width: 125,
              headerSign: {
                text: 'DN号、CN号的统称'
              }
            },
            {
              prop: 'settleCorpName',
              label: '结算单位',
              type: 'text',
              minWidth: 100
            },
            {
              prop: 'receipayType',
              label: '收付类型',
              type: 'select',
              propInDict: 'receipayGroup'
            },
            {
              prop: 'receive',
              label: '应收金额',
              type: 'text'
            },
            {
              prop: 'pay',
              label: '应付金额',
              type: 'text'
            },
            {
              prop: 'settleOrderNo',
              label: '结算单号',
              type: 'columnTip',
              width: 125,
              component: 'ColumnTip',
              componentProps: {
                show: false,
                data: [],
                callback: (no, componentProps) => {
                  this.showColumnDetail({
                    type: 'settleOrderNos',
                    no,
                    componentProps
                  })
                }
              }
            },
            {
              prop: 'feeChange',
              label: '是否有效',
              type: 'text',
              formatter: ({ cellValue }) => {
                if (!cellValue) {
                  return '是'
                } else if (cellValue) {
                  return '否'
                }
              }
            },
            {
              prop: 'createdName',
              label: '生成人',
              type: 'text',
            },
          ]
          let data = []
          list && list.forEach(item => {
            if (item.money && item.money.receive) {
              let keys1 = Object.keys(item.money.receive)
              let receive = keys1.reduce((str, cur, index) => {
                if (index === 0) {
                  return str + cur + item.money.receive[cur]
                } else {
                  return str + ' ' + cur + item.money.receive[cur]
                }
              }, '')
              item.receive = receive
            }
            if (item.money && item.money.pay) {
              let keys2 = Object.keys(item.money.pay)
              let pay = keys2.reduce((str, cur, index) => {
                if (index === 0) {
                  return str + cur + item.money.pay[cur]
                } else {
                  return str + ' ' + cur + item.money.pay[cur]
                }
              }, '')
              item.pay = pay
            }
            item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
            item._isChanged = item.feeChange
            data.push(item)
          })
          this.option1.columns = columns
          this.option1.data = data
          // this.computeMoneyTotal()
          this.table1DataBackup = [
            ... this.option1.data
          ]
        }
      }).catch(err => {
        this.loading = false
        console.log(err)
      })
    },
    getOrderNo() {
      this.orderNo = this.$route.query.orderNo
      this.jointNo = this.$route.query.jointNo
      this.useNo = this.jointNo ? this.jointNo : this.orderNo
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params, { isTab: true })
    },
    createSettlement() {
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: '请选择需要生成结算单的账单！',
          type: 'error',
          showClose: true
        })
        return
      }
      if (this.multipleSelection1.length > 1) {
        this.$message({
          message: '一次只能选择一个账单！',
          type: 'error',
          showClose: true
        })
        return
      }
      if (this.multipleSelection1[0].confirmStatus === 'no') {
        this.$message({
          message: '请先确认账单！',
          type: 'error',
          showClose: true
        })
        return
      }
      let _this = this
      this.isJumpRouteFromPage = true
      Vue.prototype.$NotRouteBeforeRouteLeave = function(to, from) {
        _this.commonRoute(to, from)
      }
      this.$router.push({
        path: '/finance/settlement/createSettlement',
        query: {
          source: 'createSettlementFromBill',
          billId: this.multipleSelection1[0].orderBillId,
          orderNo: this.orderNo
        }
      })
    },
    sendMulti(data, option) {
      console.log(data, option)
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
    },
    showDetail(row) {
      let _this = this
      this.isJumpRouteFromPage = true
      Vue.prototype.$NotRouteBeforeRouteLeave = function(to, from) {
        _this.commonRoute(to, from)
      }
      // this.$router.push({
      //   name: 'BillDetail',
      //   query: { billId: row.orderBillId }
      // })
      let routeUrl = this.$router.resolve({
        name: 'BillDetail',
        query: { billId: row.orderBillId }
      })
      window.open(routeUrl.href, '_blank')
    },
    customerConfirm() {
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: '请勾选需要确认的账单！',
          type: 'error',
          showClose: true
        })
        return
      }
      let arr = []
      this.multipleSelection1.forEach(item => {
        let data = {
          "billId": item.orderBillId,
          "confirmStatus": "yes"
        }
        arr.push(customerConfirm(data))
      })
      Promise.all(arr).then(res => {
        this.$message({
          message: '确认账单成功！',
          type: 'success',
          showClose: true
        })
        this.getData()
      })
    },
    invoiceConfirm(val) {
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: '请勾选需要确认的账单！',
          type: 'error',
          showClose: true
        })
        return
      }
      let data = {
        "billIds": this.multipleSelection1.map(item => {
          return item.orderBillId
        }),
        "isIssueInvoice": val
      }
      invoiceConfirm(data).then(res => {
        if (res.code === 0) {
          if (res.data.allFinish) {
            this.$message({
              message: `确认${val === 'yes' ? '开票' : '不开票'}成功！`,
              type: 'success',
              showClose: true
            })
          } else {
            this.$message({
              message: `确认${val === 'yes' ? '开票' : '不开票'}成功，已过滤不可开票费用！`,
              type: 'success',
              showClose: true
            })
          }
          this.getData()
        }
      })
    }
  },
}
</script>
<style>
</style>