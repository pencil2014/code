<template>
  <div class="one-kind-fee"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{moneyTitle1}}</div>
          <div class="money-total" v-for="(item, index) in moneyTotalReceive" :key="'moneyTotalReceive' + index">
            {{item.currency}}合计：<span :class="{'money-pay-color': moneyTitle1 === '应付' ? true : false}">{{item.sum}}</span>
          </div>
        </div>
        <div class="money-box-right">
        </div>
      </div>
      <FinanceTable 
        :option="option1"/>
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{moneyTitle2}}</div>
          <div class="money-total" v-for="(item, index) in moneyTotalPay" :key="'moneyTotalPay' + index">
            {{item.currency}}合计：<span :class="{'money-pay-color': moneyTitle2 === '应付' ? true : false}">{{item.sum}}</span>
          </div>
        </div>
        <div class="money-box-right">
        </div>
      </div>
      <FinanceTable
        :option="option2"/>
    </div>
    <el-dialog
      :title="moneyTitle + '合计详情'"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="952px">
      <div class="money-dialog">
        <div class="money-dialog-item">已核销合计：<span :class="{'money-pay-color': moneyTitle === '应付' ? true : false}">+3600.00</span></div>
        <div class="money-dialog-item">未核销合计：<span :class="{'money-pay-color': moneyTitle === '应付' ? true : false}">+0.00</span></div>
        <div class="money-dialog-item" v-if="moneyTitle === '应付'">已请款合计：<span :class="{'money-pay-color': moneyTitle === '应付' ? true : false}">+2500.00</span></div>
        <div class="money-dialog-item" v-if="moneyTitle === '应付'">未请款合计：<span :class="{'money-pay-color': moneyTitle === '应付' ? true : false}">+2000.00</span></div>
        <div class="money-dialog-item">已开票合计：<span :class="{'money-pay-color': moneyTitle === '应付' ? true : false}">+2500.00</span></div>
        <div class="money-dialog-item">未开票合计：<span :class="{'money-pay-color': moneyTitle === '应付' ? true : false}">+2000.00</span></div>
      </div>
    </el-dialog>
    <el-dialog
      :title="'订单费用的日志'"
      :visible.sync="logDialogVisible"
      :close-on-click-modal="false"
      width="800px">
      <FinanceTable
        :option="option3"/>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTable from '../../../components/financeTableMass/financeTableMass'
import  { mixin } from '../mixin'
import { mapState } from 'vuex'
import { orderFeeList, orderFeeHistory } from '@/api/fin/fee'
export default {
  mixins: [mixin],
  data() {
    return {
      option1: {},
      option2: {},
      moneyTitle1: '应收',
      moneyTitle2: '应付',
      moneyTitle: '应收',
      dialogVisible: false,
      // orderNo: this.$store.state.finance.orderNo,
      orderNo: '',
      currency: this.$store.state.dict.dictMap.currency,
      moneyTotalReceive: [],
      moneyTotalPay: [],
      logDialogVisible: false,
      jointNo: '',
      useNo: '',
      loading: false
    }
  },
  created() {
    let operationBtns = Object.assign(this.option.operationBtns, {
      data: [
        {
          label: '日志',
          type: 'text',
          show: true,
          action: 'showLog'
        }
      ]
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'exceptionFee1',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns
    })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2', $name: 'exceptionFee2',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns
    })
    this.option3 = Object.assign({}, this.option, {
      id: 'option3', $name: 'exceptionFee3',
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

    // let orderNo = sessionStorage.getItem('orderNo')
    // this.orderNo = orderNo ? orderNo : ''
    this.getOrderNo()
    this.getData()
  },
  methods: {
    getData() {
      this.loading = true
      let data = { 
        "orderNo": this.useNo, // this.orderNo,
        "viewGroupType": "all",
        "isException": "yes",
        "currPage": 1,
        "pageSize": 1000
      }
      if (this.jointNo) {
        data.jointNo = this.jointNo
      }
      orderFeeList(data).then(res => {
        this.loading = false
        if (res.code === 0) {
          let { list } = res.data // originalCurrencyStat
          let columns = ['settleCompName', 'settleCorpName', 'feeName', 'feeEnName', 'feeAmt', 'currency', 'taxRate', 'settleCycle', 'remark']
          let arr = []
          columns.forEach(value => {
            let obj = this.columnsBaseLocal.find(item => {
              return item.prop === value
            })
            if (obj.prop === 'feeAmt' || obj.prop === 'settleCycle') {
              obj.width = 80
            }
            if (obj) arr.push(obj)
          })
          let data1 = list.filter(item => {
            return item.receipayType === "receive"
          })
          let data2 = list.filter(item => {
            return item.receipayType === "pay"
          })
          this.option1.columns = arr
          this.option2.columns = arr
          this.option1.data = data1
          this.option2.data = data2
          // this.computeMoneyTotal(originalCurrencyStat)
          this.computeMoneyTotalFront()
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
    handleCommand(command) {
      console.log(command)
    },
    openDetailDialog(val) {
      this.moneyTitle = val
      this.dialogVisible = true
    },
    showLog(row) {
      let data = { 
        "orderNo": this.useNo, // this.orderNo,
        "orderFeeId": row.orderFeeId
      }
      orderFeeHistory(data).then(res => {
        if (res.code === 0) {
          let data = res.data
          let columns = [
            {
              prop: 'createdName',
              label: this.$t('Common.createdBy'),
              type: 'text'
            },
            {
              prop: 'createdTime',
              label: this.$t('Common.createTime'),
              type: 'text'
            },
            {
              prop: 'changeRemark',
              label: '变更说明',
              type: 'text'
            }
          ]
          this.option3.columns = columns
          this.option3.data = data
          // this.computeMoneyTotal()
          this.logDialogVisible = true
        }
      })
    }
  },
  activated() {
    this.getOrderNo()
  },
  computed: {
    ... mapState({
      defaultColumns: state => state.finance.columns.defaultColumns,
      columnsBase: state => state.finance.columns.columnsBase
    })
  },
  components: {
    FinanceTable
  }
}
</script>
<style>
</style>