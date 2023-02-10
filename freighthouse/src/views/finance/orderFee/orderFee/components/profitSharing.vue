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
import { orderProfitShareList } from '@/api/fin/fee'
export default {
  mixins: [mixin],
  data() {
    return {
      option1: {},
      option2: {},
      isEdit: false,
      moneyTitle1: '应收',
      moneyTitle2: '利润分成',
      usdMoney: '+2000.00',
      cnyMoney: '+14000.00',
      showTable1: true,
      showTable2: true,
      table1DataBackup: [],
      table2DataBackup: [],
      isAddPay: false,
      multipleSelection1: [],
      multipleSelection2: [],
      // orderNo: this.$store.state.finance.orderNo,
      orderNo: '',
      currency: this.$store.state.dict.dictMap.currency,
      moneyTotalReceive: [],
      moneyTotalPay: [],
      jointNo: '',
      useNo: '',
      loading: false
    }
  },
  created() {
    let operationBtns = Object.assign(this.option.operationBtns, {
      show: false,
      data: [
        {
          label: '删除',
          type: 'text',
          show: true,
          action: 'Delete'
        }
      ]
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'profitSharing',
      data: [
        ... this.option.data
      ],
      tips: {
        text: '',
        show: false
      },
      operationBtns
    })

    // let orderNo = sessionStorage.getItem('orderNo')
    // this.orderNo = orderNo ? orderNo : ''
    this.getOrderNo()
    this.getData()
  },
  activated() {
    this.getOrderNo()
  },
  components: {
    FinanceTable
  },
  methods: {
    getData() {
      this.loading = true
      let data = { 
        "orderNo": this.useNo, // this.orderNo
      }
      orderProfitShareList(data).then(res => {
        this.loading = false
        if (res.code === 0) {
          let data = res.data
          let columns = [
            {
              prop: 'mon',
              label: '财务月份',
              type: 'text'
            },
            {
              prop: 'shareMode',
              label: '分成模式',
              type: 'text'
            },
            {
              prop: 'compName',
              label: '分公司',
              type: 'text'
            },
            {
              prop: 'employeeName',
              label: '员工',
              type: 'text'
            },
            {
              prop: 'roleCode',
              label: '角色',
              type: 'text'
            },
            {
              prop: 'cnyAmt',
              label: 'CNY金额',
              type: 'text'
            },
            {
              prop: 'usdAmt',
              label: 'USD金额',
              type: 'text'
            }
          ]
          this.option1.columns = columns
          this.option1.data = data
          // this.computeMoneyTotal()
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
    addPay() {
      this.table1DataBackup = [
        ... this.option1.data
      ]
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
    handleDelete($index, row, option) {
      this.$confirm('是否确认删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let arr = [row]
        // todo
      }).catch(() => {         
      })
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