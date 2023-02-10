<template>
  <div class="info-page">
    <div class="info-title" v-if="!isSupplier">
      <div>
        <span style="padding-right: 18px">合计</span>
        单量：
        <span class="blue">{{ option1.pagination.totalCount || 0 }}</span>
        T量：
        <span class="blue">{{ count.totalAmount || 0 }}T</span>
        订单金额：
        <span class="red">{{ count.fee || 0 }}</span>
        利润：
        <span class="red">{{ count.profit || 0 }}</span>
      </div>
      <div>
        <span v-if="custInfo && custInfo.mtDate"
          >客户保有时间：{{ custInfo.mtDate }}</span
        >
      </div>
    </div>
    <FinanceTable :option="option1" />
  </div>
</template>
<script>
import FinanceTable from "@/views/finance/components/financeTable/financeTable"
import { baseOrderTable as columns } from "@/views/crm/data"
import { mixin } from "@/views/finance/orderFee/orderFee/mixin"
import CUSTOMER from "@/api/crm/customer"
import SUPPLIER from "@/api/crm/supplier"

export default {
  name: "CUSTj",
  supplierShow: true,
  potentialHide: true,
  label: "订单记录",
  mixins: [mixin],
  components: {
    FinanceTable,
  },
  props: ["custid", "orgid", "isSupplier"],
  watch: {
    custid: {
      handler(custid) {
        if (!custid) return
        // watch 立即执行时，早于created钩子函数
        this.getCount()
        this.$nextTick(() => this.handleCurrentChange(1))
      },
      immediate: true,
    },
  },
  computed: {
    custInfo() {
      // console.log(this.$store.state.crm.detailBaseInfo)
      return this.$store.state.crm.detailBaseInfo
    },
  },
  data() {
    return {
      option1: {},
      count: { total: "", totalAmount: "", fee: "", profit: "" },
    }
  },
  // activated() {
  //   this.$nextTick(() => {
  //     this.getCount()
  //     this.getData()
  //   })
  // },
  created() {
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    this.option1 = {
      ...this.option,
      id: "option1",
      pagination,
      operationBtns: false,
      selection: false,
    }
    this.option1.style = { padding: 0 }
    this.option1.columns = [
      {
        prop: "orderNo",
        label: "工作单号",
        type: "button",
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.goDetail(row)
          },
        },
      },
      { prop: "businessType", label: "业务类型", type: "select" },
      { prop: "cargoSource", label: "货物来源", type: "select" },
      // { prop: '_fileNos', label: '客户类型', type: 'select', },
      { prop: "orderStatus", label: "订单状态", type: "select" },
      { prop: "amount", label: "T量" },
      { prop: "createdName", label: "订单创建人" },
      { prop: "createdTime", label: "订单创建时间" },
      { prop: "_fileNos", label: "应收费用" },
      { prop: "_fileNos", label: "应付费用" },
    ]
  },
  methods: {
    goDetail(row) {
      let { orderNo } = row
      let routeUrl = this.$router.resolve({
        name: "OrderRedirect",
        query: {
          orderNo,
        },
      })
      window.open(routeUrl.href, "_blank")
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    getCount() {
      this.isSupplier ||
        CUSTOMER.orderCount({
          custid: this.custid,
          supplierId: this.custid,
        }).then((res) => {
          this.count.totalAmount = res.data.totalAmount
        })
    },
    getData() {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        custid: this.custid,
        supplierId: this.custid,
      }
      let method = this.isSupplier ? SUPPLIER : CUSTOMER
      method.orderList(data).then((res) => {
        this.option1.data = res.data.list
        this.option1.pagination.currPage = res.data.currPage
        this.option1.pagination.pageSize = res.data.pageSize
        this.option1.pagination.totalCount = res.data.totalCount
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.info-title {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 4px !important;
  span {
    font-size: 12px;
  }
  .blue {
    color: #1890ff;
    padding-right: 10px;
  }
  .red {
    color: #cd4130;
    padding-right: 10px;
  }
}
</style>
