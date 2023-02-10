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
      :dialog-visible="modifyFeeDetailVisible"/>
    <el-dialog
      :title="'审批日志'"
      :visible.sync="logDialogVisible"
      :close-on-click-modal="false"
      width="800px">
      <FinanceTable
        :option="option5"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="logDialogVisible = false" size="mini">取消</el-button>
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
      moneyTitle1: '应收',
      moneyTitle2: '费用审批记录',
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
          label: '详情',
          type: 'text',
          show: true,
          action: 'showDetail'
        },
        {
          label: '撤回申请',
          type: 'text',
          showFn: (row) => row.createdBy === this.userId && row.bizAuditStatus === 'pending',
          action: 'Cancel'
        },
        {
          label: '审批日志',
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
              label: '调费原因',
              type: 'select',
              propInDict: 'feeAdjustReason'
            },
            {
              prop: 'content',
              label: '调费内容',
              type: 'text',
              width: 200
            },
            {
              prop: 'remark',
              label: '调费备注',
              type: 'text'
            },
            {
              prop: 'finMon',
              label: '财务月份',
              type: 'text',
            },
            {
              prop: 'finCloseStatus',
              label: '总关账状态',
              type: 'select',
              propInDict: 'yesNo',
              formatter: ({ cellValue }) => { return cellValue === 'yes' ? '<span style="color:#33B18A;">是</span>' : cellValue === 'no' ? '<span style="color:#CD4130;">否</span>' : cellValue }
            },
            // {
            //   prop: 'applyPersonName',
            //   label: '责任人',
            //   type: 'text'
            // },
            {
              prop: 'bizAuditStatus',
              label: '审核状态',
              type: 'select',
              propInDict: 'auditStatus'
            },
            {
              prop: 'bizAuditName',
              label: '当前审核人',
              type: 'text'
            },
            {
              prop: 'bizAuditTime',
              label: '审核时间',
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
              label: '创建人',
              type: 'text'
            },
            {
              prop: 'createdTime',
              label: '创建时间',
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
      this.$confirmWarn('确认撤回申请？', () => {
        adjustAuditCancel({ feeAdjustApplyId: row.feeAdjustApplyId }).then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('成功撤回！')
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
              label: '审核人',
              type: 'text',
              width: 120
            },
            {
              prop: 'approverDesc',
              label: '审核人角色',
              type: 'text',
              width: 120,
            },
            {
              prop: 'approveEndTime',
              label: '审核时间',
              type: 'text',
              width: 120
            },
            {
              prop: 'approvalResult',
              label: '审核状态',
              type: 'select',
              width: 100,
              propInDict: 'auditStatus'
            },
            {
              prop: 'approvalComments',
              label: '审核说明',
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