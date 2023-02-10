<template>
<div v-show="dialogVisible.show">
  <el-dialog
    :title="'调费详情'"
    :visible.sync="dialogVisible.show"
    :close-on-click-modal="false"
    width="1100px"
    custom-class="modify-fee-detail-dialog">
    <div class="money-box" style="background:#fff;">
      <div class="money-box-left">
        <div class="money-title"></div>
      </div>
      <div class="money-box-right">
        <el-button
          v-if="checkAuth('FeeClosedModifyFeeDetail', 'btn-preSubmitPass') && !isAudited"
          @click="preSubmit('pass')"
          size="mini"
          type="success"
        >审核通过</el-button>
        <el-button
          v-if="checkAuth('FeeClosedModifyFeeDetail', 'btn-preSubmitRefuse') && !isAudited"
          @click="preSubmit('refuse')"
          size="mini"
          type="danger"
        >审核拒绝</el-button>
        <!-- <el-button
          v-if="checkAuth($route.name, 'btn-preSubmitPending') && !isAudited && userId == modifyFeeData.applyPersonId && !modifyFeeData.bizAuditTime"
          @click="auditCancel"
          size="mini"
          type="purple"
        >撤回申请</el-button> -->
      </div>
    </div>
    <div class="finance-detail-info">
      <div class="detail-info-other">
        <span class="detail-info-item">责任人员：{{modifyFeeData.applyPersonName}}</span>
        <span class="detail-info-item">创建人员：{{modifyFeeData.createdName}}</span>
        <span class="detail-info-item">创建时间：{{modifyFeeData.createdTime}}</span>
      </div>
      <div class="">
        <span class="detail-info-item">调费原因：{{renderPropLabel('feeAdjustReason', modifyFeeData.reason)}}</span>
        <span class="detail-info-item">审核状态：{{renderPropLabel('auditStatus', modifyFeeData.bizAuditStatus)}}</span>
        <span v-if="modifyFeeData.bizAuditStatus === 'refuse'" class="detail-info-item"
          style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;"
        >拒绝原因：
          <el-tooltip :content="modifyFeeData.bizAuditRemark" placement="bottom-start">
            <span>{{modifyFeeData.bizAuditRemark}}</span>
          </el-tooltip>
        </span>
        <span class="detail-info-item">当前审核人：{{modifyFeeData.bizAuditName}}</span>
        <span class="detail-info-item">审核时间：{{modifyFeeData.bizAuditTime}}</span>
        <span class="detail-info-item">财务月份：{{modifyFeeData.finMon}}</span>
        <div class="detail-info-item" v-html="finCloseStatus"></div>
      </div>
      <div v-if="!(modifyFeeData.adjustType==='negative_recv_fee' && !modifyFeeData.remark)" class="">
        <span class="detail-info-item" style="width:100%;">调费备注：{{modifyFeeData.remark}}</span>
      </div>
      <div class="">
        <span class="detail-info-item" style="width:100%;">调费内容：{{modifyFeeData.content}}</span>
      </div>
      <div class="detail-info-item" style="width:100%;margin-right:0;font-weight:bold;">
        <div
          v-html="`<span class='el-icon-info' style='margin-right:6px;'></span>修改前：订单毛利CNY<span style='color:#33b18a;'>${changeInfo.cnyProfitBefore}</span>(USD<span style='color:#33b18a;'>${changeInfo.usdProfitBefore}</span>) 毛利率：${changeInfo.grossProfitBeforeStr}`"
        ></div>
        <div
          v-html="`<span class='el-icon-success' style='color:#E9851F;margin-right:6px;'></span><span style='color:#E9851F;'>修改后</span>：订单毛利CNY<span style='color:#33b18a;'>${changeInfo.cnyProfitAfter}</span>(USD<span style='color:#33b18a;'>${changeInfo.usdProfitAfter}</span>) 毛利率：${changeInfo.grossProfitAfterStr}`"
        ></div>
      </div>
      <div style="width: 100%;height: 1px;border-top: 1px solid #e9e9e9;padding: 0 0 2px 0;margin: 2px 0;"></div>
    </div>
    <!-- 先挂起 -->
    <div class="money-box" style="background:#fff;padding:0;min-height:20px;margin:12px 0 4px;">
      <div class="money-box-left">
        <div class="money-title" style="margin-right:0px;"></div>
        <div class="money-total" v-show="true">
          利润变更：<span :class="{'money-pay-color':reduceSumType==='reduce','money-recei-color':reduceSumType==='add'}">{{reduceSumTypeStr}}</span> USD <span :class="{'money-pay-color':reduceSumType==='reduce','money-recei-color':reduceSumType==='add'}">{{reduceSum}}</span>
          <!-- <el-popover
            placement="bottom-start"
            trigger="hover">
            <div class="money-dialog money-dialog-profit" style="padding:0;">
              <div style="font-size:12px;">
                <div
                  v-html="`<span class='el-icon-info' style='color:#E9851F;margin-right:6px;'></span>修改前：订单毛利CNY<span style='color:#E9851F'>${changeInfo.cnyProfitBefore}</span>(USD<span style='color:#E9851F'>${changeInfo.usdProfitBefore}</span>) 毛利率：${changeInfo.grossProfitBeforeStr}`"
                ></div>
                <div
                  v-html="`<span class='el-icon-success' style='color:#33B18A;margin-right:6px;'></span>修改后：订单毛利CNY<span style='color:#33b18a'>${changeInfo.cnyProfitAfter}</span>(USD<span style='color:#33b18a'>${changeInfo.usdProfitAfter}</span>) 毛利率：${changeInfo.grossProfitAfterStr}`"
                ></div>
              </div>
            </div>
            <i class="el-icon el-icon-question" slot="reference" style="font-size:14px;color:#BFBFBF;margin-left:10px;"></i>
          </el-popover> -->
        </div>
        <div class="money-total" v-show="changeInfo.cnyProfitAfter<0">
          <i class="el-icon-info" style="color:#E63923;margin-right:1px;"></i>
          <span style="color:#E63923;">订单会变成负利润</span>
        </div>
      </div>
      <div class="money-box-right">
      </div>
    </div>
    <div class="finance-table-container" v-if="option1.data.length > 0">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{moneyTitle1}}</div>
        </div>
        <div class="money-box-right">
        </div>
      </div>
      <FinanceTable
      :option="option1"/>
    </div>
    <div class="finance-table-container" v-if="option2.data.length > 0">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{moneyTitle2}}</div>
          <div class="money-total" v-for="(item, index) in moneyTotalReceive" :key="'moneyTotalReceive' + index">
            {{item.currency}}合计：<span :class="{'money-pay-color': moneyTitle1 === '应付' ? true : false}">{{item.sum}}</span>
          </div>
        </div>
      </div>
      <FinanceTable
      :option="option2"/>
    </div>
    <div class="finance-table-container" v-if="option3.data.length > 0">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{moneyTitle3}}</div>
          <div class="money-total" v-for="(item, index) in moneyTotalReceive" :key="'moneyTotalReceive' + index">
            {{item.currency}}合计：<span :class="{'money-pay-color': moneyTitle1 === '应付' ? true : false}">{{item.sum}}</span>
          </div>
        </div>
      </div>
      <FinanceTable
      :option="option3"/>
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">审批日志</div>
        </div>
      </div>
      <FinanceTable :option="option5" />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible.show = false" size="mini">取消</el-button>
    </span>
  </el-dialog>
  <el-dialog :title="'拒绝费用调整'" :visible.sync="rejectDialogVisible" width="600px">
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
</div>
</template>
<script>
import FinanceTable from '../../../../components/financeTableMass/financeTableMass'
import { mixin } from '../../mixin'
import { mapState } from 'vuex'
import { orderFeeAdjustDetail, getAdjustAuditLog, adjustAudit } from '@/api/fin/feeAdjust'

export default {
  name: 'modifyFeeDetailDialog',
  mixins: [mixin],
  props: {
    dialogVisible: {
      type: Object,
      default: () => ({})
    },
    isSpecialFee: {
      type: Boolean,
      default: false
    },
    feeAdjustApplyId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      option1: {},
      option2: {},
      option3: {},
      moneyTitle1: '费用新增',
      moneyTitle2: '费用删除',
      moneyTitle3: '费用修改',
      moneyTotalReceive: [],
      comeType: '修改',
      hedgingRecord: [],
      deleteSelection: [],
      orderNo: '',
      reason: '',
      applyPersonId: '',
      remark: '',
      employeeSelectOptions: [],
      modifyFeeData: {
        "applyPersonName": "",
        "createdName": "",
        "createdTime": "",
        "bizAuditName": "",
        "bizAuditTime": "",
        "reason": "",
        "remark": "",
        "finMon": "",
        "finCloseStatus": "",
      },
      useNo: '',
      option5: {},
      rejectDialogVisible: false,
      // auditStatus: '',
      form: {
        auditRemark: '',
      },
      isAudited: true,
      changeInfo: {
        cnyProfitBefore: '',
        usdProfitBefore: '',
        grossProfitBeforeStr: '',
        cnyProfitAfter: '',
        usdProfitAfter: '',
        grossProfitAfterStr: '',
      },
      reduceSum: 0,
      reduceSumType: '',
      reduceSumTypeStr: '',
    }
  },
  created() {
    let operationBtns = Object.assign(this.option.operationBtns, {
      data: [
        {
          label: '删除',
          type: 'text',
          show: true,
          action: 'Delete'
        }
      ]
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'modifyFeeDetailDialog1',
      edit: true,
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
      },
      rootTipsHide: true
    })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2', $name: 'modifyFeeDetailDialog2',
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
      },
      rootTipsHide: true
    })
    this.option3 = Object.assign({}, this.option, {
      id: 'option3', $name: 'modifyFeeDetailDialog3',
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
      },
      rootTipsHide: true
    })
    
    let columns = ['receipayType', 'settleCorpName', 'feeName', 'serviceName', 'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency', 'jointToOrderNo', 'taxRate', 'finDate', 'closeStatus', 'remark', 'negativeType', 'splitFromOrderNo', 'negativeFollowerId', 'feeEnName'] // , 'feeUnit'
    let arr = [
      { prop: 'hasTag', hasTag: true, type: 'hasTag', width: 30 }
    ]
    columns.forEach((value, index) => {
      let obj = this.columnsBaseLocal.find(item => {
        if (item.prop === 'blId') {
          item = Object.assign(item, {
            formatter: ({row}) => row.blIds
          })
        }
        return item.prop === value
      })
      // if (index === 0) {
      //   if (obj) {
      //     obj.hasTag = true
      //   }
      // }
      if (obj) arr.push(obj)
    })
    let arr2 = [
      { prop: 'hasTag', hasTag: true, type: 'hasTag', width: 30 },
      { prop: 'serialNumber', type: 'text', label: '序号', width: 40 },
      { prop: 'modifyStatus', type: 'text', label: '费用状态' }
    ]
    columns.forEach((value, index) => {
      let obj = this.columnsBaseLocal.find(item => {
        return item.prop === value
      })
      // if (index === 0) {
      //   if (obj) {
      //     obj.hasTag = true
      //   }
      // }
      if (obj) arr2.push(obj)
    })
    this.option1.columns = arr
    this.option2.columns = arr
    this.option3.columns = arr2
    this.option5 = Object.assign({}, this.option, {
      id: 'option5', $name: 'modifyFeeDetailDialog5',
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
  },
  methods: {
    getData() {
      let data = {
        "sourceBizNo": this.useNo,
        "feeAdjustApplyId": this.feeAdjustApplyId
      }
      orderFeeAdjustDetail(data).then(res => {
        if (res.code === 0) {
          Object.assign(this.changeInfo, res.data || {})
          this.modifyFeeData = res.data.feeAdjustApply
          // 判断是否已审批
          if (this.modifyFeeData.bizAuditStatus === 'pending' || this.modifyFeeData.bizAuditStatus === 'approving') {
            this.isAudited = false
          } else {
            this.isAudited = true
          }
          res.data.fees.forEach(item => {
            if (item.feeAmt < 0) {
              item._isDanger = true // item._isWarning
            }
            item._tagArr = item.jointStatus === 'yes' ? [{text: '协', type: 'bluetag'}] : []
          })
          this.option1.data = []
          res.data.newOrderFeeIds.forEach(item => {
            let find = res.data.fees.find(fee => {
              return fee.feeId === item
            })
            if (find) this.option1.data.push(find)
          })
          this.option2.data = []
          res.data.deleteOrderFeeIds.forEach(item => {
            let find = res.data.fees.find(fee => {
              return fee.feeId === item
            })
            if (find) this.option2.data.push(find)
          })
          this.option3.data = []
          res.data.updateOrderFeeIds.forEach((item, index) => {
            let find1 = res.data.fees.find(fee => {
              if (fee.feeId === item[0]) {
                fee.serialNumber = index + 1
                fee.modifyStatus = '修改前'
                return true
              } else {
                return false
              }
            })
            if (find1) this.option3.data.push(find1)
            let find2 = res.data.fees.find(fee => {
              if (fee.feeId === item[1]) {
                fee.modifyStatus = '修改后'
                if (fee.feeAmt >= 0) {
                  fee._isChangedFee = true
                }
                return true
              } else {
                return false
              }
            })
            if (find2) this.option3.data.push(find2)
          })
          this.calcReduceSum()
        }
      })
      this.showLog(data)
    },
    preSubmit(type) {
      // if (this.userId !== this.modifyFeeData.bizAuditBy && !this.modifyFeeData.bizAuditTime) {
      //   return this.$message({
      //     type: 'error',
      //     message: `只有审批人${this.modifyFeeData.bizAuditName ? '“' + this.modifyFeeData.bizAuditName + '”' : ''}才能操作审批`,
      //     showClose: true,
      //   })
      // }
      // if (this.userId !== this.modifyFeeData.mainOrderAuditBy && this.modifyFeeData.bizAuditTime) {
      //   return this.$message({
      //     type: 'error',
      //     message: `只有审批人${this.modifyFeeData.mainOrderAuditName ? '“' + this.modifyFeeData.mainOrderAuditName + '”' : ''}才能操作审批`,
      //     showClose: true,
      //   })
      // }
      if (type === 'pass') {
        let text = this.changeInfo.cnyProfitAfter<0 ? '订单会变成负利润，是否需要审批通过？' : '是否确认审批通过？'
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
        this.form.auditRemark = ''
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
      let data = {
        sourceBizNo: this.useNo,
        feeAdjustApplyId: this.feeAdjustApplyId,
        auditStatus: auditStatus,
        auditRemark: this.form.auditRemark,
      }
      adjustAudit(data).then((res) => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '提交成功!',
            showClose: true,
          })
          this.rejectDialogVisible = false
          this.dialogVisible.show = false
          this.delVisitedView(this.$route)
          this.closeDetail(true)
        }
      })
    },
    calcReduceSum() {
      let reduceSum = this.changeInfo.usdProfitAfter - this.changeInfo.usdProfitBefore
      this.reduceSum = new LSnum(reduceSum).toNum(2)
      if (this.reduceSum < 0) {
        this.reduceSumType = 'reduce'
        this.reduceSumTypeStr = '减少'
      } else {
        this.reduceSumType = 'add'
        this.reduceSumTypeStr = '增加'
      }
    },
    employeeSelectlist(queryString) {
      let data = {
        "state": "valid",
        "name": queryString
      }
      this.$store.dispatch('dict/employeeSelectlist', data).then(data => {
        console.log(data)
        this.employeeSelectOptions = data.map(item => {
          return {
            label: item.value,
            value: item.key
          }
        })
      })
    },
    add() {
      let obj = {
        orderFeeId: '',
        edit: true
      }
      this.option1.columns.forEach(item => {
        obj[item.prop] = ''
      })
      this.option1.data.push(obj)
    },
    handleDelete($index, row, option) {
      this.$confirm('是否确认删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // let orderFeeId = row.orderFeeId
        // if (orderFeeId !== '') {
        //   let deleteItem = this.multipleSelection.find(item => {
        //     return orderFeeId === item.orderFeeId
        //   })
        //   deleteItem.operation = 'delete'
        //   this.deleteSelection.push(deleteItem)
        // }
        // this.option1.data.splice($index, 1)
      }).catch(() => {         
      })
    },
    handleCollapse() {
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
              minWidth: 120
            },
            {
              prop: 'approverDesc',
              label: '审核人角色',
              type: 'text',
              minWidth: 120,
            },
            {
              prop: 'approveEndTime',
              label: '审核时间',
              type: 'text',
              minWidth: 120
            },
            {
              prop: 'approvalResult',
              label: '审核状态',
              type: 'select',
              minWidth: 100,
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
        }
      })
    },
  },
  components: {
    FinanceTable
  },
  computed: {
    finCloseStatus() {
      let cellValue = this.modifyFeeData.finCloseStatus
      return '总关账状态：' + (cellValue === 'yes' ? '<span style="color:#33B18A;">是</span>' : cellValue === 'no' ? '<span style="color:#CD4130;">否</span>' : '')
    },
    ... mapState({
      defaultColumns: state => state.finance.columns.defaultColumns,
      columnsBase: state => state.finance.columns.columnsBase
    })
  },
  watch: {
    'dialogVisible.show'(val) {
      if (val) {
        this.modifyFeeData = {}
        this.option1.data = []
        this.option2.data = []
        this.option3.data = []
        this.option5.data = []
        this.orderNo = this.$route.query.orderNo
        this.jointNo = this.$route.query.jointNo
        this.useNo = this.jointNo ? this.jointNo : this.orderNo
        this.getData()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.modifyfee-h2{
font-size: 18px;
font-weight: 600;
color: #222222;
line-height: 25px;
margin-top: 14px;
}
/* .detail-info-item{
  width: 220px;
} */
.finance-table-container {
  margin-left: 0;
  margin-right: 0;
  margin-top: 0px; // 8px
}
</style>
<style lang="scss">
.modify-fee-detail-dialog {
  .el-dialog__body {
    padding-top: 14px;
  }
}
</style>