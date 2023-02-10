<template>
  <div class="finance-page">
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">审核日志</div>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" size="mini" @click="cancel">返回</el-button>
        </div>
      </div>
    </div>
    <FinanceTable :option="option1" />
  </div>
</template>

<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { getAuditLog } from '@/api/fin/shBill'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
  },
  data() {
    return {
      option1: {},
      // 初始表头
      selfColumnsBase: [
        {
          prop: 'approverName',
          label: '审核人',
          type: 'text',
        },
        {
          prop: 'approverDesc',
          label: '审核人岗位',
          type: 'text',
        },
        {
          prop: 'approvalResult',
          label: '审核状态',
          type: 'select',
          // propInDict:'confirmStatus'
          formatter: ({ row }) => {
            const statusName = this.dictMapObj.confirmStatus[row.approvalResult]
            if (row.approvalResult === 'pending') {
              return '<span style="color:#EDB534">' + statusName + '</span>'
            } else if (row.approvalResult === 'pass') {
              return '<span style="color:#33B18A">' + statusName + '</span>'
            } else if (row.approvalResult === 'refuse') {
              return '<span style="color:#CD4130">' + statusName + '</span>'
            } else {
              return statusName
            }
          },
        },
        {
          prop: 'approveEndTime',
          label: '审核时间',
          type: 'text',
        },
        {
          prop: 'approvalComments',
          label: '拒绝原因',
          type: 'text',
        },
      ],
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      customColumns: {
        show: false,
      },
      tips: {
        text: '',
        show: false,
      },
      selection: {
        show: false,
      },
      id: 'option1',
      $name: 'getAuditLog',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns: false,
    })
    const columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = columns
  },
  methods: {
    cancel() {
      this.routerBack()
    },
    getData() {
      let data = {
        applyNo: this.$route.query.applyNo,
      }
      getAuditLog(data)
        .then((res) => {
          this.option1.data = res.data
        })
        .catch(() => {
          this.delVisitedView()
          this.cancel()
        })
    },
  },
  activated() {
    this.getData()
  },
}
</script>

<style>
</style>