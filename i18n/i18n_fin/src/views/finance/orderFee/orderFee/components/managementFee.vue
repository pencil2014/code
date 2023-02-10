<template>
  <div class="one-kind-fee"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{$t('OrderFee.pay')}}</div>
          <div class="money-total" v-for="(item, index) in moneyTotalPay" :key="'moneyTotalPay' + index">
            {{item.currency}}{{$t('OrderFee.total')}}：<span :class="{'money-pay-color': moneyTitle2 === 'pay' ? true : false}">{{item.sum}}</span>
          </div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button v-if="checkAuth(pageCode, 'tab-managementFee', 'btn-createSettlement')" class="finance-btn" @click="createSettlement" size="mini">{{$t('OrderFee.createSettlement')}}</el-button>
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
import  { mixin } from '../mixin'
import { mapState } from 'vuex'
import Vue from 'vue'
import { orderFeeList } from '@/api/fin/fee'
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
      moneyTitle1: 'receive',
      moneyTitle2: 'pay',
      showTable1: true,
      showTable2: true,
      table1DataBackup: [],
      table2DataBackup: [],
      isAddPay: false,
      multipleSelection1: [],
      multipleSelection2: [],
      orderNo: '',
      currency: this.$store.state.dict.dictMap.currency,
      moneyTotalReceive: [],
      moneyTotalPay: [],
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
          label: this.$t('OrderFee.del'), // '删除',
          type: 'text',
          show: true,
          action: 'Delete'
        }
      ],
      show: false
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'managementFee',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns
    })
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
        "viewGroupType": "manage",
        "isException": "no",
        "columns": this.customColumnsKeys,
        "currPage": 1,
        "pageSize": 1000
      }
      orderFeeList(data).then(res => {
        this.loading = false
        if (res.code === 0) {
          let { list } = res.data // originalCurrencyStat
          let columns = ['settleCompName', 'settleCorpName', 'feeEnName', 'feeName', 'feeAmt', 'currency', 'settleCycle', 'finDate', 'remark', 'writeoffNos', 'taxRate']
          columns = columns.filter(item => this.overseaDelColumns.every(one => one !== item))
          let arr = []
          columns.forEach(value => {
            let obj = this.columnsBaseLocal.find(item => {
              return item.prop === value
            })
            if (obj) {
              arr.push(obj)
            }
          })
          let data = list
          list.forEach(item => {
            item.writeoffNos_multiValue = item.writeoffNos.split(',')
          })
          this.option1.columns = arr
          this.option1.data = data
          this.computeMoneyTotalFront({'pay': 'option1'})
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
      this.showColumnDetailHandle(params, { isTab: true, from: 'OrderFee' })
    },
    createSettlement() {
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: this.$t('OrderFee.selectRow'), // '请选择需要生成结算单的费用！',
          type: 'error',
          showClose: true
        })
        return
      }
      this.feeIds = this.multipleSelection1.map(item => {
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
          feeIds: JSON.stringify(this.feeIds),
          orderNo: this.orderNo
        }
      })
    },
    addPay() {
      let obj = {}
      this.option1.columns.forEach(item => {
        obj[item.prop] = ''
      })
      obj.edit = true
      obj.index = this.option1.data.length
      this.option1.data.push(obj)
      this.option1.edit = true
      this.isEdit = true
      this.isAddPay = true
    },
    sendMulti(data, option) {
      console.log(data, option)
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
    },
  },
  computed: {
    ... mapState({
      defaultColumns: state => state.finance.columns.defaultColumns,
      columnsBase: state => state.finance.columns.columnsBase
    })
  }
}
</script>