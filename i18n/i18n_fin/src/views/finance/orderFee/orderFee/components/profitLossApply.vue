<template>
  <div class="one-kind-fee"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <!-- <div class="money-title">{{moneyTitle2}}</div> -->
          <el-button
            v-if="checkAuth(pageCode, 'tab-profitLossApply', 'btn-auditPass')"
            @click="preSubmit('pass')"
            class="finance-btn"
            size="mini"
            type="success"
          >{{$t('OrderFee.auditPass')}}</el-button>
          <el-button
            v-if="checkAuth(pageCode, 'tab-profitLossApply', 'btn-auditRefuse')"
            @click="preSubmit('refuse')"
            class="finance-btn"
            size="mini"
            type="danger"
          >{{$t('OrderFee.auditRefuse')}}</el-button>
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
      :title="$t('OrderFee.log')"
      :visible.sync="logDialogVisible"
      :close-on-click-modal="false"
      width="800px">
      <FinanceTable
        :option="option5"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="logDialogVisible = false" size="mini">{{$t('OrderFee.cancel')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="$t('OrderFee.auditRefuse')" :visible.sync="rejectDialogVisible" width="600px">
      <el-form :model="form" ref="form" label-width="80px">
        <el-form-item
          :label="$t('OrderFee.refuseReason')"
          prop="auditRemark"
          :rules="{required: true, message: ' ', trigger: 'blur'}"
        >
          <el-input type="textarea" v-model="form.auditRemark" maxlength="500"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="rejectSubmit" size="mini">{{$t('OrderFee.confirm')}}</el-button>
        <el-button @click="rejectDialogVisible = false" size="mini">{{$t('OrderFee.cancel')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="$t('OrderFee.log')"
      :visible.sync="logDialogShow"
      width="800px"
      @close="logDialogShow = false"
      class="finance-table"
    >
      <div class="title">{{$t('OrderFee.orderNo')}}：{{ useNo }}</div>
      <el-table :data="logData" :border="true" class="border-table">
        <el-table-column
          header-align="center"
          v-for="col in logColumns"
          :prop="col.prop"
          :key="col.prop"
          :label="col.label"
          :width="col.width"
          :align="col.prop === 'event' ? 'left' : 'center'"
        >
          <template slot-scope="scope">
            <span :class="['big', col.prop]">{{ scope.row[col.prop] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTable from '../../../components/financeTableMass/financeTableMass'
import ModifyFeeDetailDialog from './components/feeClosedModifyFeeDetailDialog'
import  { mixin } from '../mixin'
import { mapState, mapGetters } from 'vuex'
import { adjustAuditCancel, getAdjustAuditLog } from '@/api/fin/feeAdjust'
import { orderPrecloseApplyList } from '@/api/fin/orderFee'
import API from '@/api/fin/finClose'

export default {
  mixins: [mixin],
  data() {
    let pageCode = ''
    if (this.$route.name === 'SiDetail') {
      pageCode = 'SiDetailFee'
    } else {
      pageCode = 'OrderFee'
    }
    return {
      option1: {},
      option2: {},
      isEdit: false,
      // moneyTitle2: '负利润审批',
      showTable1: true,
      showTable2: true,
      table1DataBackup: [],
      table2DataBackup: [],
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
      pageCode,
      rejectDialogVisible: false,
      form: {
        auditStatus: '',
        auditRemark: '',
      },
      // 日志弹框数据
      logDialogShow: false,
      logData: [],
      logColumns: [
        { label: this.$t('OrderFee.index'), prop: 'index', width: '50px' }, // '序号'
        { label: this.$t('OrderFee.time'), prop: 'createdTime', width: '180px' }, // '时间'
        { label: this.$t('OrderFee.operationStaff'), prop: 'createdName' }, // '操作人'
        // { label: '审批状态', prop: 'status' },
        { label: this.$t('OrderFee.logContent'), prop: 'event', width: '400px' }, // '日志内容'
      ],
    }
  },
  created() {
    let operationBtns = Object.assign(this.option.operationBtns, {
      show: true,
      width: '80px',
      data: [
        // {
        //   label: this.$t('Common.details'),
        //   type: 'text',
        //   show: true,
        //   action: 'showDetail'
        // },
        // {
        //   label: '撤回申请',
        //   type: 'text',
        //   showFn: (row) => row.createdBy === this.userId && row.bizAuditStatus === 'pending',
        //   action: 'Cancel'
        // },
        {
          label: this.$t('OrderFee.log'), // '日志',
          type: 'text',
          show: true,
          action: 'showLog'
        },
      ]
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'profitLossApply',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns,
      colorColumns: ['auditStatus']
    })
    this.option5 = Object.assign({}, this.option, {
      id: 'option5', $name: 'profitLossApply5',
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
      orderPrecloseApplyList(data).then(res => {
        this.loading = false
        if (res.code === 0) {
          let data = res.data.list
          let columns = [
            {
              prop: 'reasonType',
              label: this.$t('OrderFee.lossReason'), // '亏损原因',
              type: 'select',
              propInDict: 'precloseProfitLossReasonType',
              minWidth: 90
            },
            {
              prop: 'settleCompName',
              label: this.$t('OrderFee.settleCompName'), // '分公司',
              type: 'text',
              minWidth: 160
            },
            {
              prop: 'finMon',
              label: this.$t('OrderFee.finMon'), // '财务月份',
              type: 'text',
              width: 110
            },
            {
              prop: 'bizAuditStatus',
              label: this.$t('OrderFee.approvalStatus'), // '审批状态',
              type: 'select',
              propInDict: 'auditStatus',
              width: 100
            },
            {
              prop: 'createdTime',
              label: this.$t('PayApplyList.createdTime'), // '申请时间',
              type: 'text',
              width: 120
            },
            {
              prop: 'bizAuditName',
              label: this.$t('OrderFee.approver'), // '审批人',
              type: 'text',
              width: 90
            },
            {
              prop: 'bizAuditTime',
              label: this.$t('OrderFee.approvalTime'), // '审批时间',
              type: 'text',
              width: 120
            },
            // {
            //   prop: 'mngAuditStatus',
            //   label: '管理审批状态',
            //   type: 'select',
            //   propInDict: 'auditStatus',
            //   width: 90
            // },
            // {
            //   prop: 'mngAuditName',
            //   label: '管理审批人',
            //   type: 'text',
            //   width: 90
            // },
            // {
            //   prop: 'mngAuditTime',
            //   label: '管理审批时间',
            //   type: 'text',
            //   width: 120
            // },
            // {
            //   prop: 'mngAuditRemark',
            //   label: '管理审批备注',
            //   type: 'text',
            //   width: 90
            // },
            {
              prop: 'reason',
              label: this.$t('OrderFee.reason'), // '申请原因',
              type: 'text',
              width: 90
            },
            {
              prop: 'createdName',
              label: this.$t('PayApplyList.createdName'), // '申请人',
              type: 'text',
              width: 90
            },
            {
              prop: 'deptName',
              label: this.$t('OrderFee.salesDepartment'), // '销售部门',
              type: 'text',
              width: 120
            },
            {
              prop: 'bdEmployeeName',
              label: this.$t('OrderFee.salesperson'), // '销售',
              type: 'text',
              width: 100
            },
            {
              prop: 'bizAuditRemark',
              label: this.$t('OrderFee.auditRemark'), // '审批备注',
              type: 'text',
              width: 120
            },
            {
              prop: 'sysLineName',
              label: this.$t('OrderFee.smallSeaway'), // '小航线'
              type: 'text',
              width: 120
            },
          ]
          this.option1.columns = columns
          this.option1.data = data
          // this.computeMoneyTotal()
          this.table1DataBackup = [
            ...this.option1.data
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
    preSubmit(type) {
      if (!this.multipleSelection1.length) {
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // '请选择至少一项'
      }
      let arr = this.multipleSelection1.filter((item) => item.bizAuditStatus === 'pending' || !item.bizAuditStatus)
      if (!arr.length) {
        return this.$msgErrClose(this.$t('OrderFee.selectRowNoApproved')) // '请选择至少一项是未审批的项'
      }
      this.form.auditStatus = type
      this.form.auditRemark = ''
      if (type === 'pass') {
        let text = this.$t('OrderFee.confirmPassApply') // '您是否确定将该条数据审核通过？'
        this.$confirm(text, this.$t('OrderFee.tip'), {
          confirmButtonText: this.$t('OrderFee.confirm'),
          cancelButtonText: this.$t('OrderFee.cancel'),
          type: 'warning',
        })
          .then(() => {
            this.adjustAudit('pass')
          })
          .catch(() => {})
      } else if (type === 'refuse') {
        this.rejectDialogVisible = true
      }
    },
    rejectSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.adjustAudit('refuse')
        }
      })
    },
    adjustAudit(auditStatus) {
      let data = Object.assign({}, this.form, {
        applyIds: this.multipleSelection1.filter((item) => item.bizAuditStatus === 'pending' || !item.bizAuditStatus).map(item => item.preclosingApplyId)
      })
      this.loading = true
      API.precloseApplyAudit(data)
        .then((res) => {
          this.$msgSucClose(this.$t('OrderFee.successOp')) // '审批成功！'
          this.rejectDialogVisible = false
          this.getData()
        })
        .finally(() => (this.loading = false))
    },
    // 行内日志
    showLog() {
      API.precloseApplyLog({ billNo: this.useNo }).then((res) => {
        this.logData = res.data.map((item, index) => ({ ...item, index }))
        this.logDialogShow = true
      })
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
      this.$confirmWarn(this.$t('OrderFee.confirmCancelApply'), () => {
        adjustAuditCancel({ feeAdjustApplyId: row.feeAdjustApplyId }).then((res) => {
          if (res.code === 0) {
            this.$msgSucClose(this.$t('OrderFee.successOp')) // '成功撤回！'
            this.getData()
          }
        })
      })
    },
    // showLog(row) {
    //   let data = {
    //     "feeAdjustApplyId": row.feeAdjustApplyId
    //   }
    //   getAdjustAuditLog(data).then(res => {
    //     if (res.code === 0) {
    //       let data = res.data
    //       let columns = [
    //         {
    //           prop: 'approverName',
    //           label: this.$t('FinBill.approverName'),
    //           type: 'text',
    //           width: 120
    //         },
    //         {
    //           prop: 'approverDesc',
    //           label: '审核人角色',
    //           type: 'text',
    //           width: 120,
    //         },
    //         {
    //           prop: 'approveEndTime',
    //           label: this.$t('FinBill.approveEndTime'),
    //           type: 'text',
    //           width: 120
    //         },
    //         {
    //           prop: 'approvalResult',
    //           label: '审核状态',
    //           type: 'select',
    //           width: 100,
    //           propInDict: 'auditStatus'
    //         },
    //         {
    //           prop: 'approvalComments',
    //           label: '审核说明',
    //           type: 'text',
    //           minWidth: 200
    //         }
    //       ]
    //       this.option5.columns = columns
    //       this.option5.data = data ? data : []
    //       this.logDialogVisible = true
    //     }
    //   })
    // },
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
<style lang="scss" scoped>
.el-dialog .title {
  font-size: 12px;
  color: #222222;
  font-weight: bold;
  margin-bottom: 12px;
}
.el-dialog .big {
  padding: 8px 0;
  font-size: 12px;
  &.index {
    color: #bfbfbf;
    font-weight: bold;
  }
}
</style>