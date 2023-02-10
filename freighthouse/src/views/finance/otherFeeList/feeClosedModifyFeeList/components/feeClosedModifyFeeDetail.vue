<template>
  <div class="finance-page">
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">调费详情</div>
        </div>
        <div class="money-box-right">
          <el-button
            v-if="checkAuth($route.name, 'btn-preSubmitPass') && !isAudited"
            @click="preSubmit('pass')"
            size="mini"
            type="success"
          >审核通过</el-button>
          <el-button
            v-if="checkAuth($route.name, 'btn-preSubmitRefuse') && !isAudited"
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
          <el-button @click="closeDetail" size="mini">返回</el-button>
        </div>
      </div>
    </div>
    <div class="finance-approve-detail-main">
      <div class="finance-detail-info">
        <div class="detail-info-other">
          <span class="detail-info-item" @click="showOneNoDetail(modifyFeeData.sourceType, modifyFeeData.sourceBizNo)">工作单号：<span style="text-decoration:underline;cursor:pointer;color:#1890ff;">{{modifyFeeData.sourceBizNo}}</span></span>
          <span class="detail-info-item">责任人：{{modifyFeeData.applyPersonName}}</span>
          <span class="detail-info-item">创建人：{{modifyFeeData.createdName}}</span>
          <span class="detail-info-item">创建时间：{{modifyFeeData.createdTime}}</span>
          <span
            class="detail-info-item"
          >调费原因：{{renderPropLabel('feeAdjustReason', modifyFeeData.reason)}}</span>
          <span
            v-if="isAudited"
            class="detail-info-item"
          >审核状态：{{renderPropLabel('auditStatus', modifyFeeData.bizAuditStatus)}}</span>
          <span
            v-if="modifyFeeData.bizAuditStatus === 'refuse'"
            class="detail-info-item"
            style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;"
          >拒绝原因：
            <el-tooltip :content="modifyFeeData.bizAuditRemark" placement="bottom-start">
              <span>{{modifyFeeData.bizAuditRemark}}</span>
            </el-tooltip>
          </span>
          <!-- 审核人始终显示 -->
          <span class="detail-info-item">当前审核人：{{modifyFeeData.bizAuditName}}</span>
          <span v-if="modifyFeeData.bizAuditTime" class="detail-info-item">审核时间：{{modifyFeeData.bizAuditTime}}</span>
          <!-- <span v-if="modifyFeeData.mainOrderAuditName" class="detail-info-item">主单审核人：{{modifyFeeData.mainOrderAuditName}}</span>
          <span v-if="modifyFeeData.mainOrderAuditTime" class="detail-info-item">主单审核时间：{{modifyFeeData.mainOrderAuditTime}}</span> -->
          <span class="detail-info-item">财务月份：{{modifyFeeData.finMon}}</span>
          <div class="detail-info-item" v-html="finCloseStatus"></div>
          <div v-if="!(modifyFeeData.adjustType==='negative_recv_fee' && !modifyFeeData.remark)" class="detail-info-item" style="width:100%;margin-right:0;">
            <span class="detail-info-item-label">调费备注：</span>
            <span class="detail-info-item-content">{{modifyFeeData.remark}}</span>
          </div>
          <div class="detail-info-item" style="width:100%;margin-right:0;">
            <span class="detail-info-item-label">调费内容：</span>
            <span class="detail-info-item-content">{{modifyFeeData.content}}</span>
          </div>
          <div class="detail-info-item" style="width:100%;margin-right:0;font-weight:bold;">
            <div
              v-html="`<span class='el-icon-info' style='margin-right:6px;'></span>修改前：订单毛利CNY<span style='color:#33b18a;'>${changeInfo.cnyProfitBefore}</span>(USD<span style='color:#33b18a;'>${changeInfo.usdProfitBefore}</span>) 毛利率：${changeInfo.grossProfitBeforeStr}`"
            ></div>
            <div
              v-html="`<span class='el-icon-success' style='color:#E9851F;margin-right:6px;'></span><span style='color:#E9851F;'>修改后</span>：订单毛利CNY<span style='color:#33b18a;'>${changeInfo.cnyProfitAfter}</span>(USD<span style='color:#33b18a;'>${changeInfo.usdProfitAfter}</span>) 毛利率：${changeInfo.grossProfitAfterStr}`"
            ></div>
          </div>
        </div>
        <div style="width: 100%;height: 1px;border-top: 1px solid #e9e9e9;padding: 0 0 2px 0;margin: 2px 0;"></div>
      </div>
      <!-- 先挂起 -->
      <div class="money-box" style="background:#fff;padding:0;min-height:20px;margin:12px 0 4px;">
        <div class="money-box-left">
          <div class="money-title" style="margin-right:14px;"></div>
          <div class="money-total" v-show="!isFinBillFee">
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
          <div class="money-total" v-show="!isFinBillFee && changeInfo.cnyProfitAfter<0">
            <i class="el-icon-info" style="color:#E63923;margin-right:1px;"></i>
            <span style="color:#E63923;">订单会变成负利润</span>
          </div>
        </div>
        <div class="money-box-right">
        </div>
      </div>
      <!-- 暂启用 -->
      <!-- <div class="changeinfo_item" v-if="sourceType !== 'finbill'">
        <span class="el-icon-info" style="color:#E9851F"></span>
        <div
          v-html="`修改前：订单毛利CNY<span style='color:#E9851F'>${changeInfo.cnyProfitBefore}</span>(USD<span style='color:#E9851F'>${changeInfo.usdProfitBefore}</span>) 毛利率：${changeInfo.grossProfitBeforeStr}`"
        ></div>
        <span class="el-icon-success" style="color:#33B18A"></span>
        <div
          v-html="`修改后：订单毛利CNY<span style='color:#33b18a'>${changeInfo.cnyProfitAfter}</span>(USD<span style='color:#33b18a'>${changeInfo.usdProfitAfter}</span>) 毛利率：${changeInfo.grossProfitAfterStr}`"
        ></div>
      </div> -->
      <div class="finance-table-container" v-if="option1.data.length > 0">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">{{moneyTitle1}}</div>
          </div>
          <div class="money-box-right">
            <!-- <el-button class="finance-btn" @click="add(null)" size="mini">新增</el-button> -->
            <!-- <el-button type="text" class="collapse-btn" @click="handleCollapse('Table1')" size="mini">收起<i :class="{'el-icon-arrow-up': showTable1, 'el-icon-arrow-down': !showTable1}"></i></el-button> -->
          </div>
        </div>
        <FinanceTable :option="option1" />
      </div>
      <div class="finance-table-container" v-if="option2.data.length > 0">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">{{moneyTitle2}}</div>
            <div
              class="money-total"
              v-for="(item, index) in moneyTotalReceive"
              :key="'moneyTotalReceive' + index"
            >
              {{item.currency}}合计：
              <span
                :class="{'money-pay-color': moneyTitle1 === '应付' ? true : false}"
              >{{item.sum}}</span>
            </div>
          </div>
        </div>
        <FinanceTable :option="option2" />
      </div>
      <div class="finance-table-container" v-if="option3.data.length > 0">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">{{moneyTitle3}}</div>
            <div
              class="money-total"
              v-for="(item, index) in moneyTotalReceive"
              :key="'moneyTotalReceive' + index"
            >
              {{item.currency}}合计：
              <span
                :class="{'money-pay-color': moneyTitle1 === '应付' ? true : false}"
              >{{item.sum}}</span>
            </div>
          </div>
        </div>
        <FinanceTable :option="option3" />
      </div>
      <div class="finance-table-container">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">审批日志</div>
          </div>
        </div>
        <FinanceTable :option="option5" />
      </div>
    </div>
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
    <el-dialog :title="'修改调费申请审批人'" :visible.sync="adjApproverVisible" width="600px" custom-class="fin-adjapprover-dial">
      <el-form :model="adjApproverForm" ref="adjApproverForm" label-width="80px">
        <el-form-item
          label="新审批人"
          prop="employeeId"
          :rules="{required: true, message: ' ', trigger: 'change'}">
          <el-select v-model="adjApproverForm.employeeId" placeholder="请选择"
            filterable
            remote
            clearable
            :remote-method="employeeSelectlist"
            @visible-change="(value) => {if(value){employeeSelectlist('')}}"
          >
            <el-option
              v-for="(item, index) in employeeSelectOptions"
              :key="'employeeSelectOptions' + index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="审批人角色"
          prop="approverRoleDesc"
          :rules="{required: true, message: ' ', trigger: 'blur'}"
        >
          <el-input v-model="adjApproverForm.approverRoleDesc" placeholder="请输入" maxlength="500"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="adjApproverSubmit" size="mini">确定</el-button>
        <el-button @click="adjApproverVisible = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mapState, mapGetters } from 'vuex'
import { orderFeeAdjustDetail, adjustAudit, adjustAuditCancel, getAdjustAuditLog, modifyFeeAdjApprover, delFeeAdjApprover } from '@/api/fin/feeAdjust'
import { actualExchangeRate } from '@/api/base'

export default {
  name: 'feeClosedModifyFeeDetail',
  mixins: [mixin, routerMixin],
  data() {
    return {
      sourceBizNo: '',
      sourceType: '',
      feeAdjustApplyId: '',
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
      reason: '',
      applyPersonId: '',
      remark: '',
      employeeSelectOptions: [],
      modifyFeeData: {
        sourceBizNo: -1,
        orderType: '',
        applyPersonName: '',
        reason: '',
        remark: '',
        finMon: '',
        finCloseStatus: '',
      },
      changeInfo: {
        cnyProfitBefore: '',
        usdProfitBefore: '',
        grossProfitBeforeStr: '',
        cnyProfitAfter: '',
        usdProfitAfter: '',
        grossProfitAfterStr: '',
      },
      rejectDialogVisible: false,
      form: {
        auditRemark: '',
      },
      isAudited: true,
      multipleSelection: [],
      cTimestamp: 0,
      option5: {},
      // exchangeRateList: [],
      // exchangeRateObj: {},
      // selectionSum: 0,
      // showReduceSum: false,
      reduceSum: 0,
      reduceSumType: '',
      reduceSumTypeStr: '',
      isFinBillFee: false,
      adjApproverVisible: false,
      adjApproverForm: {
        employeeId: '',
        approverRoleDesc: '',
        approveSeq: ''
      },
    }
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 300) {
      this.init()
      this.getData()
    }
  },
  created() {
    this.cTimestamp = new Date().getTime()
    this.comeType = this.multipleSelection.length > 0 ? '修改' : '新增'
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'FeeClosedModifyFeeDetail1',
      edit: true,
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns: {
        show: false,
      },
      selection: {
        show: false,
      },
    })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2',
      $name: 'FeeClosedModifyFeeDetail2',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns: {
        show: false,
      },
      selection: {
        show: false,
      },
    })
    this.option3 = Object.assign({}, this.option, {
      id: 'option3',
      $name: 'FeeClosedModifyFeeDetail3',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns: {
        show: false,
      },
      selection: {
        show: false,
      },
      colorColumns: ['receipayGroup'],
    })
    let columns = [
      'settleCompName',
      'settleCorpName',
      'receipayType',
      'feeName',
      'serviceName',
      'feeUnit',
      'unitPrice',
      'unitCount',
      'feeAmt',
      'currency',
      'jointToOrderNo',
      'finDate',
      'closeStatus',
      'remark',
      'negativeType',
      'splitFromOrderNo',
      'negativeFollowerId',
      'blId',
      'feeEnName',
    ]
    let arr = [
      { prop: 'hasTag', hasTag: true, type: 'hasTag', width: 30 },
    ]
    columns.forEach((value) => {
      let obj = this.columnsBaseLocal.find((item) => {
        if (['settleCorpName', 'settleCompName'].includes(item.prop)) {
          item.width = 160
        } else if (item.prop === 'blId') {
          item = Object.assign(item, {
            formatter: ({row}) => row.blIds
          })
        }
        return item.prop === value
      })
      if (obj) {
        arr.push(obj)
      }
    })
    let arr2 = [
      { prop: 'hasTag', hasTag: true, type: 'hasTag', width: 30 },
      { prop: 'serialNumber', type: 'text', label: '序号', width: 40 },
      { prop: 'modifyStatus', type: 'text', label: '费用状态' },
    ]
    columns.forEach((value) => {
      let obj = this.columnsBaseLocal.find((item) => {
        if (['settleCorpName', 'settleCompName'].includes(item.prop)) {
          item.width = 160
        }
        return item.prop === value
      })
      if (obj) {
        arr2.push(obj)
      }
    })
    this.sourceType = this.$route.query.sourceType // 非必传
    this.option1.columns =
      this.sourceType === 'finbill'
        ? arr.filter((item) => {
            return item.prop !== 'serviceName' && item.prop !== 'negativeType' && item.prop !== 'splitFromOrderNo' && item.prop !== 'negativeFollowerId'
          })
        : arr
    this.option2.columns =
      this.sourceType === 'finbill'
        ? arr.filter((item) => {
            return item.prop !== 'serviceName' && item.prop !== 'negativeType' && item.prop !== 'splitFromOrderNo' && item.prop !== 'negativeFollowerId'
          })
        : arr
    this.option3.columns =
      this.sourceType === 'finbill'
        ? arr2.filter((item) => {
            return item.prop !== 'serviceName' && item.prop !== 'negativeType' && item.prop !== 'splitFromOrderNo' && item.prop !== 'negativeFollowerId'
          })
        : arr2
    let operationBtns = Object.assign(this.option.operationBtns, {
      data: [
        {
          label: '修改审批人',
          type: 'text',
          showFn: () => this.checkAuth(this.$route.name, 'btn-editAdjApprover'),
          action: 'Edit',
        },
        {
          label: '删除审批人',
          type: 'text',
          showFn: () => this.checkAuth(this.$route.name, 'btn-delAdjApprover'),
          action: 'Delete',
        },
      ],
      width: 154
    })
    this.option5 = Object.assign({}, this.option, {
      id: 'option5', $name: 'FeeClosedModifyFeeDetail5',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns,
      selection: {
        show: false
      }
    })
    this.init()
    this.getData()
  },
  methods: {
    getData() {
      let data = {
        sourceBizNo: this.sourceBizNo,
        feeAdjustApplyId: this.feeAdjustApplyId,
      }
      orderFeeAdjustDetail(data)
        .then((res) => {
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
            res.data.newOrderFeeIds.forEach((item) => {
              let find = res.data.fees.find((fee) => {
                return fee.feeId === item
              })
              if (find) this.option1.data.push(find)
            })
            this.option2.data = []
            res.data.deleteOrderFeeIds.forEach((item) => {
              let find = res.data.fees.find((fee) => {
                return fee.feeId === item
              })
              if (find) this.option2.data.push(find)
            })
            this.option3.data = []
            res.data.updateOrderFeeIds.forEach((item, index) => {
              let find1 = res.data.fees.find((fee) => {
                if (fee.feeId === item[0]) {
                  fee.serialNumber = index + 1
                  fee.modifyStatus = '修改前'
                  // fee.modifyStatusE = 'modifyBefore'
                  return true
                } else {
                  return false
                }
              })
              if (find1) this.option3.data.push(find1)
              let find2 = res.data.fees.find((fee) => {
                if (fee.feeId === item[1]) {
                  fee.modifyStatus = '修改后'
                  // fee.modifyStatusE = 'modifyAfter'
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
            // actualExchangeRate().then(res => {
            //   this.exchangeRateList = res.data
            //   let exchangeRateObj = {}
            //   this.exchangeRateList.filter(item => {
            //     return item.toCurrency === 'USD'
            //   }).forEach(item => {
            //     exchangeRateObj[item.srcCurrency] = item.rate
            //   })
            //   exchangeRateObj['USD'] = 1
            //   this.exchangeRateObj = exchangeRateObj
            //   this.calcReduceSum()
            // }).catch(() => {
            //   this.exchangeRateList = []
            //   this.showReduceSum = false
            // })
          }
        })
        .catch(() => {
          Object.keys(this.modifyFeeData).forEach((key) => (this.modifyFeeData[key] = ''))
          this.option1.data = []
          this.option2.data = []
          this.option3.data = []
        })
      this.showLog(data)
    },
    init() {
      this.sourceBizNo = this.$route.query.sourceBizNo
      this.sourceType = this.$route.query.sourceType // 非必传
      this.feeAdjustApplyId = this.$route.query.feeAdjustApplyId
      this.isFinBillFee = this.sourceType === 'finbill' ? true : false
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
      // this.showReduceSum = true
      // this.selectionSum = this.option2.data.reduce((prev, cur) => {
      //   if (!this.exchangeRateObj[cur.currency.toUpperCase()]) {
      //     this.showReduceSum = false
      //   }
      //   if (cur.receipayType === 'receive') {
      //     return prev + cur.feeAmtO*this.exchangeRateObj[cur.currency.toUpperCase()]
      //   } else if (cur.receipayType === 'pay') {
      //     return prev - cur.feeAmtO*this.exchangeRateObj[cur.currency.toUpperCase()]
      //   }
      // }, 0)
      // this.selectionSum = this.option3.data.reduce((prev, cur) => {
      //   if (!this.exchangeRateObj[cur.currency.toUpperCase()]) {
      //     this.showReduceSum = false
      //   }
      //   if (cur.modifyStatusE === 'modifyBefore') {
      //     if (cur.receipayType === 'receive') {
      //       return prev + cur.feeAmtO*this.exchangeRateObj[cur.currency.toUpperCase()]
      //     } else if (cur.receipayType === 'pay') {
      //       return prev - cur.feeAmtO*this.exchangeRateObj[cur.currency.toUpperCase()]
      //     }
      //   } else {
      //     return prev
      //   }
      // }, this.selectionSum)
      // let aftSum = this.option1.data.reduce((prev, cur) => {
      //   if (!this.exchangeRateObj[cur.currency.toUpperCase()]) {
      //     this.showReduceSum = false
      //   }
      //   if (!cur.currency || !cur.feeAmt) {
      //     this.showReduceSum = false
      //     return 0
      //   } else {
      //     if (cur.receipayType === 'receive') {
      //       return prev + cur.feeAmt*this.exchangeRateObj[cur.currency.toUpperCase()]
      //     } else if (cur.receipayType === 'pay') {
      //       return prev - cur.feeAmt*this.exchangeRateObj[cur.currency.toUpperCase()]
      //     }
      //   }
      // }, 0)
      // aftSum = this.option3.data.reduce((prev, cur) => {
      //   if (!this.exchangeRateObj[cur.currency.toUpperCase()]) {
      //     this.showReduceSum = false
      //   }
      //   if (!cur.currency || !cur.feeAmt) {
      //     this.showReduceSum = false
      //     return 0
      //   } else {
      //     if (cur.modifyStatusE === 'modifyAfter') {
      //       if (cur.receipayType === 'receive') {
      //         return prev + cur.feeAmtO*this.exchangeRateObj[cur.currency.toUpperCase()]
      //       } else if (cur.receipayType === 'pay') {
      //         return prev - cur.feeAmtO*this.exchangeRateObj[cur.currency.toUpperCase()]
      //       }
      //     } else {
      //       return prev
      //     }
      //   }
      // }, aftSum)
      // let reduceSum = aftSum - this.selectionSum
      // this.reduceSum = new LSnum(reduceSum).toNum(2)
    },
    auditCancel() {
      if (this.userId !== this.modifyFeeData.applyPersonId) {
        return this.$msgErrClose(`只有申请人${this.modifyFeeData.applyPersonName}才能发起撤回!`)
      }
      this.$confirmWarn('确认撤回申请？', () => {
        adjustAuditCancel({ feeAdjustApplyId: this.feeAdjustApplyId }).then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('成功撤回！')
            this.delVisitedView(this.$route)
            this.closeDetail(true)
          } else {
            this.$msgErrClose(res.msg)
          }
        })
      })
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
      if (!this.option5.data.some(item => {
        return item.approverBy === this.userId
      })) {
        return this.$message({
          type: 'error',
          message: `您不在当前审批人列表当中，不能进行审批`,
          showClose: true,
        })
      }
      this.form.auditRemark = ''
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
        sourceBizNo: this.sourceBizNo,
        feeAdjustApplyId: this.feeAdjustApplyId,
        auditStatus,
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
          this.delVisitedView(this.$route)
          this.closeDetail(true)
        }
      })
    },
    employeeSelectlist(queryString) {
      let data = {
        state: 'valid',
        name: queryString,
      }
      this.$store.dispatch('dict/employeeSelectlist', data).then((data) => {
        console.log(data)
        this.employeeSelectOptions = data.map((item) => {
          return {
            label: item.value,
            value: item.key,
          }
        })
      })
    },
    add() {
      let obj = {
        orderFeeId: '',
        edit: true,
      }
      this.option1.columns.forEach((item) => {
        obj[item.prop] = ''
      })
      this.option1.data.push(obj)
    },
    handleEdit(row) {
      this.adjApproverForm.approveSeq = row.approveSeq
      this.adjApproverVisible = true
    },
    adjApproverSubmit() {
      let data = Object.assign({}, this.adjApproverForm, {
        feeAdjustApplyId: this.feeAdjustApplyId
      })
      modifyFeeAdjApprover(data).then(res => {
        this.$message({
          type: 'success',
          message: '修改成功!',
          showClose: true,
        })
        this.adjApproverVisible = false
        let data = {
          sourceBizNo: this.sourceBizNo,
          feeAdjustApplyId: this.feeAdjustApplyId,
        }
        this.showLog(data)
      })
    },
    handleDelete($index, row, option) {
      this.$confirm('是否确认删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          let data = {
            feeAdjustApplyId: this.feeAdjustApplyId,
            approveSeq: row.approveSeq
          }
          delFeeAdjApprover(data).then(res => {
            this.$message({
              type: 'success',
              message: '修改成功!',
              showClose: true,
            })
            let data = {
              sourceBizNo: this.sourceBizNo,
              feeAdjustApplyId: this.feeAdjustApplyId,
            }
            this.showLog(data)
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    closeDetail(refresh) {
      this.routerBack(refresh)
    },
    handleCollapse() {},
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
          this.option5.data = data || []
        }
      })
    },
  },
  components: {
    FinanceTable,
  },
  computed: {
    finCloseStatus() {
      let cellValue = this.modifyFeeData.finCloseStatus
      return (
        '总关账状态：' +
        (cellValue === 'yes'
          ? '<span style="color:#CD4130;">是</span>'
          : cellValue === 'no'
          ? '<span style="color:#33B18A;">否</span>'
          : cellValue)
      )
    },
    ...mapGetters(['userId', 'name']),
    ...mapState({
      defaultColumns: (state) => state.finance.columns.defaultColumns,
      columnsBase: (state) => state.finance.columns.columnsBase,
    }),
  },
  watch: {
    multipleSelection(val) {
      this.comeType = this.multipleSelection.length > 0 ? '修改' : '新增'
      let data1 = []
      let data2 = []
      this.multipleSelection.forEach((item) => {
        let obj1 = Object.assign({}, item, {
          edit: true,
        })
        data1.push(obj1)
        let obj2 = { ...item }
        let obj3 = { ...item }
        obj3.feeAmt = 0 - obj3.feeAmt
        data2.push(obj2, obj3)
      })
      this.option1.data = data1
      this.option2.data = data2
    },
  },
}
</script>
<style lang="scss" scoped>
.modifyfee-h2 {
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  line-height: 25px;
  margin-top: 14px;
}
.finance-approve-btns-box {
  display: flex;
  justify-content: space-between;
  height: 40px;
  padding: 0 24px;
  border-radius: 4px 4px 0px 0px;
  border-bottom: 1px solid #e9e9e9;
}
.finance-approve-btns-left {
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  line-height: 24px;
  margin-top: 8px;
}
.finance-approve-btns-right {
  margin-top: 6px;
}
.finance-approve-detail-main {
  padding: 0;
}
.finance-detail-info {
  padding: 14px 14px 0px; // 18px 14px 4px
}
.detail-info-item-label {
  display: inline-block;
  line-height: 14px;
  margin-top: 3px;
  width: 60px;
}
.detail-info-item-content {
  display: inline-block;
  vertical-align: top;
  width: calc(100% - 60px);
  line-height: 14px;
  margin-top: 3px;
  word-wrap: break-word;
}
.changeinfo_item {
  margin: 0 14px;
  overflow: hidden;
  & > div {
    margin-right: 14px;
    display: inline-block;
    span {
      color: #33b18a !important;
    }
  }
}
.finance-table-container {
  margin-top: 0px; // 8px
}
// .finance-table-container + .finance-table-container {
//   margin-top: 14px !important;
// }
.fin-adjapprover-dial {
  .el-select {
    width: 260px;
  }
  .el-input {
    width: 260px;
  }
}
</style>