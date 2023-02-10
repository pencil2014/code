<template>
  <div class="column-checkbox">
    <el-checkbox v-model="checked" @change="change" :disabled="disabled"></el-checkbox>
  </div>
</template>

<script>
import { orderFollowFinish, orderFollowCancel } from '@/api/order/followItems'
export default {
  props: ['param', 'item'],
  data() {
    return {
      checked: false,
      disabled: false,
      options: [
        {
          tableCloumn: 'submitPlanTodo', // 列表显示所用的字段名 （前端）
          key: 'submitPlanTodo',    // 列表接口中提供的字段名 （后端）
          code: 'submit_plan_todo', // 完成后取消接口入参的code
          name: '交接计划单',       // 完成后取消接口入参的name
        },
        {
          tableCloumn: 'auditPlanTodo',
          key: 'auditPlanTodo',
          code: 'audit_plan_todo',
          name: '审核计划单',
        },
        {
          tableCloumn: 'sa',
          key: 'sa',
          code: 'sa',
          name: 'SA',
        },
        {
          tableCloumn: 'saAgent',
          key: 'saAgent',
          code: 'sa_agent',
          name: '发SA代理',
        },
        {
          tableCloumn: 'saSupplier',
          key: 'saSupplier',
          code: 'sa_supplier',
          name: '发SA给供应商',
        },
        {
          tableCloumn: 'saCust',
          key: 'saCust',
          code: 'sa_cust',
          name: '发SA给客户',
        },
        {
          tableCloumn: 'offloaded',
          key: 'offloaded',
          code: 'offloaded',
          name: '发送不甩柜申请',
        },
        {
          tableCloumn: 'fl_freetime',
          key: 'freetime',
          code: 'freetime',
          name: 'FREETIME',
        },
        {
          tableCloumn: 'costReview',
          key: 'costReview',
          code: 'cost_review',
          name: '成本复核',
        },
        {
          tableCloumn: 'signReceiable',
          key: 'signReceiable',
          code: 'sign_receiable',
          name: '签应收',
        },
        {
          tableCloumn: 'sendCustBill',
          key: 'sendCustBill',
          code: 'send_cust_bill',
          name: '发客户账单',
        },
        {
          tableCloumn: 'checkFactoryBill',
          key: 'checkFactoryBill',
          code: 'check_factory_bill',
          name: '对工厂账单',
        },
        {
          tableCloumn: 'sendFactoryBill',
          key: 'sendFactoryBill',
          code: 'send_factory_bill',
          name: '发工厂账单',
        },
        {
          tableCloumn: 'sendAgentBill',
          key: 'sendAgentBill',
          code: 'send_agent_bill',
          name: '发代理账单',
        },
        {
          tableCloumn: 'truckCost',
          key: 'truckCost',
          code: 'truck_cost',
          name: '拖车成本',
        },
      ],
      title: '',
      optionObj: {}
    }
  },
  components: {
  },
  watch: {
    param() {
      this.init()
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      let tableCloumn = this.item.key
      this.title = this.item.label
      this.optionObj = this.options.find(item => {
        return item.tableCloumn === tableCloumn
      })
      let key = (this.optionObj && this.optionObj.key) || ''
      let obj = this.param.followItem || {}
      if (obj[key] && obj[key] === 'done') {
        this.checked = true
      } else {
        this.checked = false
      }
    },
    change(val) {
      let orderNo = this.param.orderNo
      if (!this.optionObj) return
      // this.$confirm(`是否确认${this.title}?`, '提示', {
			// 	confirmButtonText: '确定',
			// 	cancelButtonText: '取消',
			// 	type: 'warning'
			// }).then(() => {
        this.disabled = true
        if (val) {
          orderFollowFinish({
            orderNo,
            code: this.optionObj.code,
            name: this.optionObj.name
          })
          .then(() => {
            this.successCb()
          })
          .catch(() => {
            this.checked = !val
          })
          .finally(() => {
            this.disabled = false
          })
        } else {
          orderFollowCancel({
            orderNo,
            code: this.optionObj.code,
            name: this.optionObj.name
          })
          .then(() => {
            this.successCb()
          })
          .catch(() => {
            this.checked = !val
          })
          .finally(() => {
            this.disabled = false
          })
        }
      // }).catch(() => {
      //   this.checked = !val
      // })
      
    },
    successCb() {
      this.$message.success(this.title + '修改成功')
      this.item.method()
    }
  },
}
</script>

<style>

</style>