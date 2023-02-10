<template>
  <div class="finance-table-double">
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{typeComputed}}</div>
          <TableTitle
            v-if="source==='result'"
            :num="supplierNum"
            :pay="supplierPay"
            :receive="supplierReceive"
          />
        </div>
      </div>
      <FinanceTable :option="option1" />
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{$t('Supplier.feeInfo')}}</div>
          <TableTitle
            v-if="source==='result'"
            :num="companyNum"
            :pay="companyPay"
            :receive="companyReceive"
          />
        </div>
      </div>
      <FinanceTable :option="option2" />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import TableTitle from './tableTitle'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { listSupplierBillFeeCompareLogPage, listCompanyFeeCompareLogPage } from '@/api/fin/supplierBill'
import EXPRESS from '@/api/fin/expressBill'
export default {
  mixins: [mixin],
  props: {
    source: {
      type: String,
      default: '',
    },
    supplierNum: {
      type: Number,
      default: 0,
    },
    supplierReceive: {
      type: Array,
      default: () => [],
    },
    supplierPay: {
      type: Array,
      default: () => [],
    },
    companyNum: {
      type: Number,
      default: 0,
    },
    companyReceive: {
      type: Array,
      default: () => [],
    },
    companyPay: {
      type: Array,
      default: () => [],
    },
    lastCompareId: {
      type: Number,
      default: 0,
    },
    refresh: Boolean,
  },
  computed: {
    typeComputed() {
      return this.type === 'express' ? this.$t('Supplier.courierbill') : this.$t('Supplier.supplierBill')
    },
    type() {
      return this.$route.query.expressBillId ? 'express' : 'supplier'
    },
  },
  watch: {
    refresh: {
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            console.log(this.lastCompareId);
            this.handleCurrentChange(1, this.option1)
            this.handleCurrentChange(1, this.option2)
          })
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      option1: {},
      option2: {},
    }
  },
  components: {
    FinanceTable,
    TableTitle,
  },
  created() {
    console.log(this.source)
    // console.log(this.lastCompareId)
    let operationBtns = { show: false }
    let cmmCfg = { data: [], tips: { text: '', show: false }, operationBtns, selection: false }
    this.option1 = Object.assign({}, this.option, cmmCfg, {
      id: 'option1', $name: 'diffCompare1',
      pagination: { ...this.option.pagination, show: true, isNew: true },
      rootTipsHide: true,
    })
    this.option2 = Object.assign({}, this.option, cmmCfg, {
      id: 'option2', $name: 'diffCompare2',
      pagination: { ...this.option.pagination, show: true, isNew: true },
      rootTipsHide: true,
    })
    let columns = [
      {
        prop: 'orderNo',
        label: this.$t('Supplier.OrderNo'),
        type: 'text',
        width: '140px',
      },
      {
        prop: 'payType',
        label: this.$t('FeeList.receipayType'),
        type: 'select',
        propInDict: 'receipayGroup',
        width: '70px',
      },
      {
        prop: 'feeEnName',
        label: this.$t('FeeList.feeEname'),
        type: 'text',
      },
      {
        prop: 'feeAmt',
        label: this.$t('FeeList.feeAmt'),
        type: 'text',
      },
      {
        prop: 'feeCurrency',
        label: this.$t('FeeList.currency'),
        type: 'text',
        width: '50px',
      },
      {
        prop: 'matchResult',
        label: this.$t('Supplier.matchornot'),
        type: 'select',
        propInDict: 'yesNo',
      },
    ]
    let expressColumns = [
      {
        prop: 'supplierExpressNo',
        label: this.$t('Supplier.courierNumber'),
        type: 'text',
        width: '140px',
      },
      {
        prop: 'supplierCorpName',
        label: this.$t('Supplier.courierCompany'),
        type: 'text',
      },
      {
        prop: 'supplierFeeCurrency',
        label: this.$t('FeeList.currency'),
        type: 'text',
      },
      {
        prop: 'supplierFeeAmt',
        label: this.$t('FeeList.feeAmt'),
        type: 'text',
      },
      {
        prop: 'matchResult',
        label: this.$t('Supplier.matchornot'),
        type: 'select',
        propInDict: 'yesNo',
      },
    ]
    let feeArr = ['expressNo', 'supplierCorpName', 'feeCurrency', 'feeAmt', 'matchResult']
    this.option1.columns = this.type === 'express' ? expressColumns : columns
    this.option2.columns =
      this.type === 'express'
        ? expressColumns.map((item, index) => {
            return { ...item, prop: feeArr[index] }
          })
        : [...columns, { prop: 'settleAmt', label: this.$t('Settle.settleAmt'), type: 'text' }]
  },
  methods: {
    // 初始化请求数据
    initData(option) {
      let query = [
        {
          column: this.type === 'express' ? 'expressCompareId' : 'compareId',
          type: 'default',
          value: this.lastCompareId,
        },
      ]
      this.source !== 'result' &&
        query.push({
          column: 'matchResult',
          type: 'default',
          value: 'no',
        })
      return {
        currPage: option.pagination.currPage,
        pageSize: option.pagination.pageSize,
        query,
      }
    },
    // 初始化相应数据
    initRes(option, res) {
      option.data = res.data.list || []
      Object.assign(option.pagination, res.data)
      // option.pagination.currPage = res.data.currPage
      // option.pagination.pageSize = res.data.pageSize
      // option.pagination.totalCount = res.data.totalCount
    },
    // 供应商列表
    listSupplierBillFeeCompareLogPage() {
      let option = this.option1
      let method = this.type === 'express' ? EXPRESS.listExpressBillFeeCompareLogPage : listSupplierBillFeeCompareLogPage
      method(this.initData(option)).then((res) => {
        this.initRes(option, res)
      })
    },
    // 费用信息列表
    listCompanyFeeCompareLogPage() {
      let option = this.option2
      let method = this.type === 'express' ? EXPRESS.listCompanyFeeCompareLogPage : listCompanyFeeCompareLogPage
      method(this.initData(option)).then((res) => {
        this.initRes(option, res)
      })
    },
    handleSizeChange(val, option) {
      option.pagination.pageSize = val
      this[option === this.option1 ? 'listSupplierBillFeeCompareLogPage' : 'listCompanyFeeCompareLogPage']()
    },
    handleCurrentChange(val, option) {
      option.pagination.currPage = val
      this[option === this.option1 ? 'listSupplierBillFeeCompareLogPage' : 'listCompanyFeeCompareLogPage']()
    },
    getData() {
      this.listSupplierBillFeeCompareLogPage()
      this.listCompanyFeeCompareLogPage()
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-table-double ::v-deep .el-input{
  width: 100px;
}
.finance-table-double {
  display: flex;
  justify-content: space-around;
  margin-top: 11px;
}
.finance-table-container {
  margin: 4px 0 14px;
  width: calc(50% - 26px);
}
.finance-table-double ::v-deep {
  .el-pagination>button,
  .el-pagination>span,
  .el-pager li {
    margin: 0 2px;
  }
  .el-pagination__sizes .el-select {
    width: auto;
  }
}
.finance-table-double .finance-table-container + .finance-table-container{
  margin-top: 4px !important;
}
</style>