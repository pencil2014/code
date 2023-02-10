<template>
  <div class="finance-list-container">
    <div class="money-box">
      <div class="money-box-left"></div>
      <div class="money-box-right">
        <el-button-group>
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
        </el-button-group>
      </div>
    </div>
    <FinanceTable :option="option1" @send-multi="sendMulti" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapGetters } from 'vuex'
import { listPage } from '@/api/fin/settleOrderBill'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      option1: {},
      multipleSelection1: [],
      orderNo: '',
      orderBillId: '',
      settleOrderNo: '',
      cTimestamp: 0,
    }
  },
  created() {
    this.cTimestamp = new Date().getTime()
    this.option1 = Object.assign({}, this.option, {
      selection: false,
      id: 'option1',
      $name: 'SettlementBillListMonth',
      data: [],
      tips: { text: '', show: false },
      operationBtns: Object.assign({}, this.option.operationBtns, {
        data: [{ label: '详情', type: 'text', show: true, action: 'showDetail' }],
        show: true,
      }),
      pagination: Object.assign({}, this.option.pagination, { show: true, isNew: true }),
    })
    this.option1.columns = [
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
        },
      },
      { prop: 'createdTime', label: '生成时间', type: 'text', width: 120 },
      // { prop: 'settleOrderNo', label: '结算单号', type: 'text', width: 120 },
      {
        prop: 'settleOrderNo',
        label: '结算单号',
        type: 'columnTip',
        width: 130,
        component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps) => {
            this.showColumnDetailHandle({ type: 'settleOrderNos', no, componentProps }, { isTab: true })
          },
        },
      },
      {
        prop: 'settleOrderBillNo',
        label: '系统账单编号',
        type: 'button',
        width: 130,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.showDetail(row)
          },
        },
      },
      // { // 后台说无此数据，先注释
      //   prop: 'dnNo',
      //   label: '账单号', // 'DN号'
      //   type: 'text',
      //   width: 125,
      //   headerSign: {
      //     text: 'DN号、CN号的统称'
      //   }
      // },
      {
        prop: 'confirmStatus',
        label: '确认状态',
        type: 'text',
        formatter: ({ cellValue }) => (cellValue === 'yes' ? '已确认' : cellValue === 'no' ? '未确认' : ''),
      },
      {
        prop: 'billType',
        label: '类型',
        type: 'text',
        formatter: ({ cellValue }) => (cellValue === 'detail' ? '明细' : '汇总'),
      },
      {
        prop: 'lang',
        label: '语言',
        type: 'text',
        formatter: ({ cellValue }) => {
          if (cellValue && cellValue.toUpperCase() === 'US') {
            return '英文'
          } else if (cellValue && cellValue.toUpperCase() === 'CN') {
            return '中文'
          } else {
            return cellValue
          }
        },
      },
      { prop: 'settleCompName', label: '分公司', type: 'text', width: 130 },
      { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 130 },
      { prop: 'billFeeType', label: '对账单费用类型', type: 'select', width: 105 },
      { prop: 'sumamt', label: '汇总金额', type: 'text' },
    ]
  },
  methods: {
    getData() {
      // 第二次以后进来重新获取一下，该页面兼具列表页和详情页双重特点
      this.settleOrderNo = this.$route.query.settleOrderNo
      // console.log('data:', data)
      let option = this.option1
      let data = { 
        query: [{
          column: "settleOrderNo",
          type: "eq",
          value: this.settleOrderNo
        }],
        currPage: option.pagination.currPage, 
        pageSize: option.pagination.pageSize 
      }
      listPage(data).then((res) => {
        if (res.code === 0) {
          let { list } = res.data
          list.forEach((item) => {
            item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
            item._isChanged = item.feeChange
          })
          option.data = list
          Object.assign(this.option1.pagination, res.data)
          // option.pagination.currPage = res.data.currPage
          // option.pagination.pageSize = res.data.pageSize
          // option.pagination.totalCount = res.data.totalCount
        }
      })
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
    },
    showDetail(row) {
      this.routerPushTab('SettlementBillDetail', { source: 'settlementBillList', settleOrderBillId: row.settleOrderBillId })
    },
  },
  components: {
    FinanceTable,
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  activated() {
    this.getData()
  },
}
</script>