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
    <ModifyFeeDetailDialog
      :fee-adjust-apply-id="feeAdjustApplyId"
      :dialog-visible="modifyFeeDetailVisible"
      @update-data="getData"/>
    <el-dialog
      :title="$t('OrderFee.log')"
      :visible.sync="logDialogVisible"
      :close-on-click-modal="false"
      width="800px"><!-- 审批日志 -->
      <FinanceTable
        :option="option5"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="logDialogVisible = false" size="mini">{{$t('OrderFee.close')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTable from '../../../components/financeTableMass/financeTableMass'
import ModifyFeeDetailDialog from './components/feeClosedModifyFeeDetailDialog'
import  { mixin } from '../mixin'
import { mapState, mapGetters } from 'vuex'
import { orderFeeAdjustList, adjustAuditCancel, getAdjustAuditLog } from '@/api/fin/feeAdjust'

export default {
  mixins: [mixin],
  data() {
    return {
      option1: {},
      option2: {},
      isEdit: false,
      moneyTitle2: this.$t('OrderFee.feesApprovalRecord'),
      showTable1: true,
      showTable2: true,
      table1DataBackup: [],
      table2DataBackup: [],
      isAddPay: false,
      multipleSelection1: [],
      multipleSelection2: [],
      currency: this.$store.state.dict.dictMap.currency,
      moneyTotalReceive: [],
      moneyTotalPay: [],
      modifyFeeDetailVisible: {
        show: false
      },
      multipleSelection: [],
      feeAdjustApplyId: 0,
      jointNo: '',
      useNo: '',
      loading: false,
      option5: {},
      logDialogVisible: false,
    }
  },
  created() {
    let operationBtns = Object.assign(this.option.operationBtns, {
      show: true,
      width: '160px',
      data: [
        {
          label: this.$t('OrderFee.detail'), // '详情',
          type: 'text',
          show: true,
          action: 'showDetail'
        },
        {
          label: this.$t('OrderFee.cancel'), // '撤回申请',
          type: 'text',
          showFn: (row) => row.createdBy === this.userId && row.bizAuditStatus === 'pending',
          action: 'Cancel'
        },
        {
          label: this.$t('OrderFee.log'), // '审批日志',
          type: 'text',
          show: true,
          action: 'showLog'
        },
      ]
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'feeClosedModifyFee',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns,
      colorColumns: ['auditStatus']
    })
    this.option5 = Object.assign({}, this.option, {
      id: 'option5', $name: 'FeeClosedModifyFeeList5',
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
    this.getOrderNo()
    this.getData()
    this.$emit('order-fee-adjust-count', true)
  },
  activated() {
    this.getOrderNo()
  },
  components: {
    FinanceTable,
    ModifyFeeDetailDialog
  },
  methods: {
    getData() {
      this.loading = true
      let data = { 
        "orderNo": this.useNo,
      }
      orderFeeAdjustList(data).then(res => {
        this.loading = false
        if (res.code === 0) {
          let data = res.data
          let columns = [
            {
              prop: 'reason',
              label: this.$t('OrderFee.adjustReason'), // '调费原因',
              type: 'select',
              propInDict: 'feeAdjustReason',
              width: 120
            },
            {
              prop: 'content',
              label: this.$t('OrderFee.adjustContent'), // '调费内容',
              type: 'text',
              width: 200
            },
            {
              prop: 'remark',
              label: this.$t('OrderFee.adjustRemark'), // '调费备注',
              type: 'text',
              width: 120
            },
            {
              prop: 'finMon',
              label: this.$t('OrderFee.finMon'), // '财务月份',
              type: 'text',
              width: 110
            },
            {
              prop: 'finCloseStatus',
              label: this.$t('OrderFee.closeStatus'), // '总关账状态',
              type: 'select',
              propInDict: 'yesNo',
              formatter: ({ cellValue }) => { return cellValue === 'yes' ? `<span style="color:#33B18A;">${this.$t('OrderFee.yes')}</span>` : cellValue === 'no' ? `<span style="color:#CD4130;">${this.$t('OrderFee.no')}</span>` : cellValue },
              width: 100
            },
            // {
            //   prop: 'applyPersonName',
            //   label: '责任人',
            //   type: 'text'
            // },
            {
              prop: 'bizAuditStatus',
              label: this.$t('OrderFee.auditStatus'), // '审核状态',
              type: 'select',
              propInDict: 'auditStatus',
              width: 110
            },
            {
              prop: 'bizAuditName',
              label: this.$t('OrderFee.currAuditor'), // '当前审核人',
              type: 'text',
              width: 120
            },
            {
              prop: 'bizAuditTime',
              label: this.$t('OrderFee.auditTime'), // '审核时间',
              type: 'text',
              width: 130
            },
            // {
            //   prop: 'mainOrderAuditName',
            //   label: '主单审核人',
            //   type: 'text'
            // },
            {
              prop: 'createdName',
              label: this.$t('OrderFee.createdName'), // '创建人',
              type: 'text',
              width: 120
            },
            {
              prop: 'createdTime',
              label: this.$t('OrderFee.createdTime'), // '创建时间',
              type: 'text',
              width: 130
            },
          ]
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
      // console.log(data, option)
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
    },
    showDetail(row) {
      this.feeAdjustApplyId = row.feeAdjustApplyId
      this.modifyFeeDetailVisible.show = true
    },
    handleCancel(row){
      this.$confirmWarn(this.$t('OrderFee.confirmCancelApply'), () => { // '确认撤回申请？'
        adjustAuditCancel({ feeAdjustApplyId: row.feeAdjustApplyId }).then((res) => {
          if (res.code === 0) {
            this.$msgSucClose(this.$t('OrderFee.successOp')) // '成功撤回！'
            this.getData()
            this.$emit('order-fee-adjust-count', true)
          } else {
            this.$msgErrClose(res.msg)
          }
        })
      })
    },
    showLog(row) {
      let data = {
        "feeAdjustApplyId": row.feeAdjustApplyId
      }
      getAdjustAuditLog(data).then(res => {
        if (res.code === 0) {
          let data = res.data
          let columns = [
            {
              prop: 'approverName',
              label: this.$t('FinBill.approverName'),
              type: 'text',
              width: 120
            },
            {
              prop: 'approverDesc',
              label: this.$t('OrderFee.approverRole'), // '审核人角色',
              type: 'text',
              width: 120,
            },
            {
              prop: 'approveEndTime',
              label: this.$t('FinBill.approveEndTime'),
              type: 'text',
              width: 120
            },
            {
              prop: 'approvalResult',
              label: this.$t('OrderFee.approvalStatus'), // '审核状态',
              type: 'select',
              width: 100,
              propInDict: 'auditStatus'
            },
            {
              prop: 'approvalComments',
              label: this.$t('OrderFee.approvalComment'), // '审核说明',
              type: 'text',
              minWidth: 200
            }
          ]
          this.option5.columns = columns
          this.option5.data = data ? data : []
          this.logDialogVisible = true
        }
      })
    },
  },
  computed: {
    ...mapGetters(['userId']),
    ...mapState({
      defaultColumns: state => state.finance.columns.defaultColumns,
      columnsBase: state => state.finance.columns.columnsBase
    })
  }
}
</script>