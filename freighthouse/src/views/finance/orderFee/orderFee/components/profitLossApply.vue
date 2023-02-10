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
          >审核通过</el-button>
          <el-button
            v-if="checkAuth(pageCode, 'tab-profitLossApply', 'btn-auditRefuse')"
            @click="preSubmit('refuse')"
            class="finance-btn"
            size="mini"
            type="danger"
          >审核拒绝</el-button>
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
    <el-dialog :title="'审核拒绝'" :visible.sync="rejectDialogVisible" width="600px">
      <el-form :model="form" ref="form" label-width="80px">
        <el-form-item
          label="拒绝原因"
          prop="auditRemark"
          :rules="{required: true, message: '拒绝原因不能为空', trigger: 'blur'}"
        >
          <el-input type="textarea" v-model="form.auditRemark" maxlength="500"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="rejectSubmit" size="mini">确定</el-button>
        <el-button @click="rejectDialogVisible = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="日志"
      :visible.sync="logDialogShow"
      width="800px"
      @close="logDialogShow = false"
      class="finance-table"
    >
      <div class="title">单号：{{ useNo }}</div>
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
      moneyTitle2: '负利润审批',
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
        { label: '序号', prop: 'index', width: '50px' },
        { label: '时间', prop: 'createdTime', width: '180px' },
        { label: '操作人', prop: 'createdName' },
        // { label: '审批状态', prop: 'status' },
        { label: '日志内容', prop: 'event', width: '400px' },
      ],
    }
  },
  created() {
    let operationBtns = Object.assign(this.option.operationBtns, {
      show: true,
      width: '80px',
      data: [
        // {
        //   label: '详情',
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
          label: '日志',
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
              label: '亏损原因',
              type: 'select',
              propInDict: 'precloseProfitLossReasonType',
              minWidth: 90
            },
            {
              prop: 'settleCompName',
              label: '分公司',
              type: 'text',
              minWidth: 160
            },
            {
              prop: 'finMon',
              label: '财务月份',
              type: 'text',
            },
            {
              prop: 'bizAuditStatus',
              label: '审批状态',
              type: 'select',
              propInDict: 'auditStatus',
            },
            {
              prop: 'createdTime',
              label: '申请时间',
              type: 'text',
              width: 120
            },
            {
              prop: 'bizAuditName',
              label: '审批人',
              type: 'text',
              width: 90
            },
            {
              prop: 'bizAuditTime',
              label: '审批时间',
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
              label: '申请原因',
              type: 'text',
              width: 90
            },
            {
              prop: 'createdName',
              label: '申请人',
              type: 'text',
              width: 90
            },
            {
              prop: 'deptName',
              label: '销售部门',
              type: 'text',
              width: 90
            },
            {
              prop: 'bdEmployeeName',
              label: '销售',
              type: 'text',
              width: 90
            },
            {
              prop: 'bizAuditRemark',
              label: '审批备注',
              type: 'text',
              width: 90
            },
            {
              prop: 'sysLineName',
              label: '小航线'
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
        return this.$msgErrClose('请选择至少一项')
      }
      let arr = this.multipleSelection1.filter((item) => item.bizAuditStatus === 'pending' || !item.bizAuditStatus)
      if (!arr.length) {
        return this.$msgErrClose('请选择至少一项是未审批的项')
      }
      this.form.auditStatus = type
      this.form.auditRemark = ''
      if (type === 'pass') {
        let text = '您是否确定将该条数据审核通过？'
        this.$confirm(text, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
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
          this.$msgSucClose('审批成功！')
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
      this.$confirmWarn('确认撤回申请？', () => {
        adjustAuditCancel({ feeAdjustApplyId: row.feeAdjustApplyId }).then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('成功撤回！')
            this.getData()
          } else {
            this.$msgErrClose(res.msg)
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
    //           label: '审核人',
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
    //           label: '审核时间',
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