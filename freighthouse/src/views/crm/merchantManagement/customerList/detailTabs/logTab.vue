<template>
  <div class="info-page">
    <div class="serch-box">
      关键节点:
      <el-select 
        v-model="keyNodes"
        placeholder="请选择节点"
        clearable>
        <el-option
          v-for="(item, index) in dictMap['orgOpLogEvent']"
          :key="index"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-button size="mini" type="primary" class="addbtn"  @click="getLog()">搜索</el-button>
    </div>
    <FinanceTable :option="option1" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CUSTOMER from '@/api/crm/customer'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
export default {
  // name: 'CUST0',
  name: 'CUSTt',
  supplierShow: true,
  shipperShow: true,
  label: '日志',
  mixins: [mixin],
  components: {
    FinanceTable
  },
  props: ['custid', 'isSupplier', 'isShipC'],
  watch: {
    custid: {
      handler(custid) {
        if (!custid) return
        this.$nextTick(() => this.getData())
      },
      immediate: true
    }
  },
  data() {
    return {
      option1: {},
      keyNodes:''
    }
  },
  activated() {
    this.getData()
  },
  created() {
    const pagination = { ...this.option.pagination, show: true }
    this.option1 = {
      ...this.option,
      id: 'option1',
      operationBtns: false,
      pagination,
      selection: false,
      data: []
    }
    this.option1.style = { padding: 0 }
    this.option1.columns = [
      { prop: 'createdTime', label: '时间' },
      {
        prop: 'opEmployeeName',
        label: '人员',
        formatter: ({cellValue}) => cellValue || '系统操作'
      },
      { prop: 'opEmployeeDeptName', label: '部门' },
      {
        prop: 'event',
        label: '关键节点',
        type: 'select',
        propInDict: 'orgOpLogEvent'
      },
      { prop: 'remark', label: '备注' }
    ]
  },
  methods: {
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    getLog(){
      this.getData(true)
    },
    getData(value) {
      const data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        custid: this.custid,
        supplierId: this.custid,
        shippingCarrierId: this.custid,
      }
      if(value){
        data.keyNodes = this.keyNodes
      }
      console.log('data',data)
      CUSTOMER[this.isSupplier ? 'logSList' : this.isShipC ? 'logScList':'logCList'](data).then(res => {
        this.option1.data = res.data.list
        this.option1.pagination.currPage = res.data.currPage
        this.option1.pagination.pageSize = res.data.pageSize
        this.option1.pagination.totalCount = res.data.totalCount
        // console.log(this.option1)
      })
    }
  }
}
</script>
<style>
.serch-box{padding:10px;}
.el-select{width:180px}
.addbtn{margin-left:15px;}
</style>
