<template>
  <div class="finance-page">
    <div class="money-box money-box-border-bottom">
      <div class="money-box-left">
        <div class="money-title">{{$t('Charge.writedownDetail')}}</div>
      </div>
      <div class="money-box-right">
        <el-button-group v-if="pendingApprovingAudit && checkAuth($route.name, 'btn-auditPass')">
          <el-button
            class="finance-btn"
            type="success"
            size="mini"
            @click="audit('pass')"
            :loading="btnLoading"
            >{{$t('Settle.approved')}}</el-button
          >
        </el-button-group>
        <el-button-group v-if="pendingApprovingAudit && checkAuth($route.name, 'btn-auditRefuse')">
          <el-button class="finance-btn" type="danger" size="mini" @click="audit('refuse')"
            >{{$t('Settle.refuse')}}</el-button
          >
        </el-button-group>
        <el-button-group v-if="pendingAudit && checkAuth($route.name, 'btn-badApplyCancel')">
          <el-button
            class="finance-btn"
            type="purple"
            size="mini"
            @click="badApplyCancel"
            :loading="btnLoading1"
           >{{$t('Hedge.gedgingCancel')}}</el-button
          >
        </el-button-group>
        <el-button-group>
          <el-button class="finance-btn" size="mini" @click="back"
           >{{$t('Common.back')}}</el-button
          >
        </el-button-group>
      </div>
    </div>
    <div class="orderDetail-box">
      <div class="item-box">
        <div class="title">{{$t('Settle.baseInfo')}}</div>
        <div class="info-box">
          <DetailDiv :label="$t('FeeList.settleOrderNo')" :content="info.settleOrderNo" />
          <DetailDiv :label="$t('FeeList.settleComp')" :content="info.settleCompName" :isTooltip="true" />
          <DetailDiv :label="$t('FeeList.settleCorp')" :content="info.settleCorpName" :isTooltip="true" />
          <DetailDiv :label="$t('Settle.settleCycle')" :content="dictMapObj['settleCycle'][info.settleCycle]" />

          <DetailDiv :label="$t('Charge.receivabTotal')" :isTooltip="true">
            <div>
              <span
                v-for="(item, index) in info.settleRecFeeSumList"
                :key="index"
              >{{ item.currency }}{{ item.sumAmt }}</span>
            </div>
          </DetailDiv>
          <DetailDiv :label="$t('Charge.eliminTotal')" :isTooltip="true">
            <div>
              <span
                v-for="(item, index) in info.recFeeSumList"
                :key="index"
              >{{ item.currency }}{{ item.sumAmt }}</span>
            </div>
          </DetailDiv>
          <DetailDiv :label="$t('Charge.debtsReasons')" :content="dictMapObj['baddebtReason'][info.badReason]" />
          <DetailDiv :label="$t('Common.processing')" :content="dictMapObj['baddebtDealWay'][info.dealWay]" />
          <DetailDiv :label="$t('Common.attachment')" :isSlot="true">
            <el-tooltip v-if="info.fileName" :content="info.fileName" placement="top-start">
              <el-tag
                class="detail__content"
                size="medium"
                @click="vmShowAttachment(info.fileNo)"
              >{{ info.fileName }}</el-tag>
            </el-tooltip>
          </DetailDiv>
          <DetailDiv :label="$t('Settle.applyRemarks')" :content="info.remark" :isFull="true" />
          <!-- <div class="base-item">
            <span class="sub-title">结算单号：</span>
            <el-tooltip
              :content="info.settleOrderNo"
            >
              <span class="text-over">{{ info.settleOrderNo }}</span>
            </el-tooltip>
          </div>
          <div class="base-item">
            <span class="sub-title">分公司：</span
            ><el-tooltip
              :content="info.settleCompName"
              v-if="info.settleCompName"
            >
              <span class="text-over">{{ info.settleCompName }}</span>
            </el-tooltip>
          </div>
          <div class="base-item">
            <span class="sub-title">结算单位：</span
            ><el-tooltip
              :content="info.settleCorpName"
              v-if="info.settleCorpName"
            >
              <span class="text-over">{{ info.settleCorpName }}</span>
            </el-tooltip>
          </div>
          <div class="base-item">
            <span class="sub-title">结算周期：</span
            >{{ dictMapObj['settleCycle'][info.settleCycle] }}
          </div>

          <div class="base-item">
            <span class="sub-title">结算应收合计：</span
            ><b v-for="(item, index) in info.settleRecFeeSumList" :key="index">
              {{ item.currency }}{{ item.sumAmt }}
            </b>
          </div>
          <div class="base-item">
            <span class="sub-title">应收冲减金额合计：</span
            ><b v-for="(item, index) in info.recFeeSumList" :key="index">
              {{ item.currency }}{{ item.sumAmt }}
            </b>
          </div>
          <div class="base-item">
            <span class="sub-title">应收冲减类型：</span
            >{{ dictMapObj['badType'][info.badType] }}
          </div>
          <div class="base-item">
            <span class="sub-title">应收冲减原因：</span
            >{{ dictMapObj['baddebtReason'][info.badReason] }}
          </div>
          <div class="base-item">
            <span class="sub-title">处理方式：</span
            >{{ dictMapObj['baddebtDealWay'][info.dealWay] }}
          </div>
          <div class="base-item remark">
            <span class="sub-title">申请备注：</span>{{ info.remark }}
          </div> -->
        </div>
      </div>
      <div class="item-box">
        <div class="title">{{$t('Charge.badDebtInfo')}}</div>
        <div class="info-box">
          <DetailDiv :label="$t('Charge.applicationNo')" :content="info.settleOrderBaddebtNo" />
          <DetailDiv :label="$t('Settle.applicant')" :content="info.createdName" />
          <DetailDiv :label="$t('Settle.applicationDate')" :content="info.createdTime" />
          <DetailDiv v-if="info.auditStatus" :label="$t('FinBill.approvalResult')" :content="dictMapObj['auditStatus'][info.auditStatus]" />
          <DetailDiv :label="$t('FinBill.approverName')" :content="info.auditName" v-if="info.auditStatus && !pendingApprovingAudit"/>
          <DetailDiv :label="$t('FinBill.approveEndTime')" :content="info.auditTime" v-if="info.auditStatus && !pendingApprovingAudit"/>
          <DetailDiv :label="$t('Settle.reject')" :content="info.refuseReason" :isFull="true" v-if="info.auditStatus && !pendingApprovingAudit"/>
          <!-- <div class="base-item">
            <span class="sub-title">申请单号：</span
            >{{ info.settleOrderBaddebtNo }}
          </div>
          <div class="base-item">
            <span class="sub-title">申请人：</span>{{ info.createdName }}
          </div>
          <div class="base-item">
            <span class="sub-title">申请时间：</span>{{ info.createdTime }}
          </div>
          <div class="base-item" v-if="info.auditStatus">
            <span class="sub-title">审核状态：</span
            >{{ dictMapObj['auditStatus'][info.auditStatus] }}
          </div>
          <div class="base-item" v-if="info.auditStatus && !pendingApprovingAudit">
            <span class="sub-title">审核人：</span>
            <el-tooltip
              :content="info.auditName"
            >
              <span class="el-form-item-text self-tooltip">{{
                info.auditName
              }}</span>
            </el-tooltip>
          </div> -->
          <!-- <div class="base-item" v-if="info.auditStatus && !pendingApprovingAudit">
            <span class="sub-title">审核时间：</span>{{ info.auditTime }}
          </div>
          <div class="base-item remark" v-if="info.auditStatus && !pendingApprovingAudit">
            <span class="sub-title">拒绝原因：</span>{{ info.refuseReason }}
          </div> -->
        </div>
      </div>
      <div class="item-box">
        <div class="title">{{$t('Common.approvalLog')}}</div>
        <AuditTableDialog :isShow='logDialogShow' :settleOrderBaddebtId="settleOrderBaddebtId"/>
      </div>
      <div class="table-box">
        <div class="title-box">
          <div class="title">
            {{$t('FeeList.expensesList')}}
            <span
              class="total"
              v-for="(item, index) in info.recFeeSumList"
              :key="item.currency"
            >
              {{ index ? `${item.currency}` : `${$t('Common.total')}: ${item.currency}` }}
              <i>{{ item.sumAmt }}</i>
            </span>
          </div>
          <div class="btn">
            <el-button
              class="finance-btn"
              @click="feeSearchToggle = !feeSearchToggle"
              size="mini"
              type="primary"
            >{{feeSearchToggle? $t('Common.hideSearch') : $t('Common.showSearch')}}</el-button>
          </div>
        </div>
        <DetailFeeSearch
          v-show="feeSearchToggle"
          ref="detailFeeSearch"
          :list="option1.data"
          @search="search"
        />
        <FinanceTable :option="option1" />
      </div>
    </div>
    <el-dialog
      :title="$t('Charge.rejectUnderwrit')"
      :visible.sync="rejectDialogVisible"
      width="600px"
    >
      <el-form :model="rejectForm" ref="rejectForm" label-width="130px">
        <el-form-item
          :label="$t('Settle.reject')"
          prop="refuseReason"
          :rules="{
            required: true,
            message: $t('Hedge.rejectionEmp'),
            trigger: 'blur',
          }"
        >
          <el-input
            type="textarea"
            v-model="rejectForm.refuseReason"
            style="width: 400px"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="rejectSubmit" size="mini" :loading="btnLoading"
          >{{$t('Common.sure')}}</el-button
        >
        <el-button @click="rejectDialogVisible = false" size="mini"
          >{{$t('Common.cancel')}}</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      :title="$t('Hedge.latePaymentFee')"
      :visible.sync="lateFeeVisible"
      :close-on-click-modal="false"
      width="800px">
      <FinanceTable
        :option="option13" />
      <span slot="footer" class="dialog-footer">
        <!-- <el-button @click="handleLateFee" size="mini" type="primary">立即处理</el-button>因为最后审批人不一定是财务，业务条线的人没有权限处理滞纳金，所以此处先去掉【立即处理】按钮 -->
        <el-button @click="handleLateFeeCancel" size="mini">{{$t('Common.close')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import DetailFeeSearch from '@/views/finance/components/financeSearch/detailFeeSearch'
import AuditTableDialog from './receiLossAuditLog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { info, audit, applyDetail, apply, badApplyCancel } from '@/api/fin/settleOrderBaddebt'
import { listByWriteoffNo } from '@/api/fin/custOverduePayment'

export default {
  components: {
    FinanceTable,
    AuditTableDialog,
    DetailFeeSearch
  },
  mixins: [mixin, routerMixin],
  data() {
    return {
      settleOrderNo: '',
      settleOrderBaddebtId: '',
      info: {},
      pendingApprovingAudit: false,
      pendingAudit: false,
      option1: {},
      rejectDialogVisible: false,
      // 拒绝弹框表单
      rejectForm: {
        refuseReason: ''
      },
      feeSearchToggle: true, // 费用搜索默认显示
      logDialogShow: false,
      option13: {},
      lateFeeVisible: false,
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'BadApplyDetail',
      operationBtns: false,
      selection: false,
      index: { show: true },
      sortable: true,
      sortChange: this.sortChange
    })
    const columns = [
      {
        prop: 'sourceBizNo',
        label: this.$t('PreClose.bizNo'),
        type: 'button',
        width: 120,
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.showDetail(row)
          }
        }
      },
      {
        prop: 'settleOrderNo',
        label: this.$t('FeeList.settleOrderNo'),
        type: 'button',
        width: 120,
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.showSettleDetail(row)
          }
        }
      },
      {
        prop: 'profitShareMode',
        label: this.$t('Charge.models'),
        type: 'select',
        propInDict: 'customerServiceMode'
      },
      {
        prop: 'settleCompName',
        label: this.$t('FeeList.settleComp'),
        type: 'text',
        width: 150
      },
      {
        prop: 'settleCorpName',
        label: this.$t('FeeList.settleCorp'),
        type: 'text',
        width: 150
      },
      {
        prop: 'serviceName',
        label: this.$t('FeeList.serviceCodes'),
        type: 'text'
      },
      // {
      //   prop: 'feeName',
      //   label: this.$t('FeeList.feeEname'),
      //   type: 'text'
      // },
      {
        prop: 'feeEnName',
        label: this.$t('FeeList.feeEname'),
        type: 'text',
        width: 100
      },
      {
        prop: 'receipayType',
        label: this.$t('FeeList.receipayType'),
        type: 'select',
        propInDict: 'receipayGroup'
      },
      {
        prop: 'currency',
        label: this.$t('FeeList.currency'),
        type: 'text',
        readOnly: true
      },
      {
        prop: 'unitPrice',
        label: this.$t('FeeList.unitPrice'),
        type: 'text'
      },
      {
        prop: 'unitCount',
        label: this.$t('FeeList.quantity'),
        type: 'text'
      },
      {
        prop: 'feeUnit',
        label: this.$t('FeeList.feeUnit'),
        type: 'select',
        readOnly: true
      },
      {
        prop: 'feeAmt',
        label: this.$t('FeeList.feeAmt'),
        type: 'text'
      },
      {
        prop: 'noWriteoffAmt',
        label: this.$t('Charge.appliAmt'),
        type: 'text',
        width: 100
      },
      {
        prop: 'badAmt',
        label: this.$t('Charge.eliminaAmt'),
        type: 'input'
      },
      // { 
      //   prop: 'invoiceStatus',
      //   label: this.$t('Settle.invoiceStatus'),
      //   type: 'select',
      //   propInDict: 'feeInvoiceStatus' },
      // {
      //   prop: 'invoiceAmt',
      //   label: this.$t('Collect.invoicedAmt'),
      //   type: 'text',
      //   width: 100
      // },
      // {
      //   prop: 'noInvoiceAmt',
      //   label: this.$t('Collect.uninvoicedAmount'),
      //   type: 'input',
      //   width: 100
      // },
      {
        prop: 'bdEmployeeName',
        label: this.$t('PreClose.salesman'),
        type: 'text'
      },
      {
        prop: 'deptName',
        label: this.$t('FinBill.department'),
        type: 'text'
      },
      { prop: 'finDate', label: this.$t('FeeList.finDate'), width: 86, type: 'text' },
    ]
    this.option1.columns = columns
    this.option13 = Object.assign({}, this.option, {
      id: 'option13',
      $name: 'BadApplyDetail13',
      data: [],
      index: { show: true },
      tips: false,
      rootTipsHide: true,
      selection: false,
      operationBtns: Object.assign({}, this.option.operationBtns, {
        show: false
      }),
    })
    this.option13.columns = [
      { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), minWidth: 150, type: 'text' },
      { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text' },
      { prop: 'arrearReceiveAmt', label: this.$t('Hedge.arrearReceiveAmt'), type: 'text' },
      { prop: 'lateFeeAmt', label: this.$t('Hedge.lateFeeAmt'), type: 'text' },
      { prop: 'custOverduePaymentNo', label: this.$t('Hedge.custOverduePaymentNo'), type: 'button',
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            this.routerPush('LateFeeDetail', {
              custOverduePaymentNo: row.custOverduePaymentNo
            })
          },
        }
      },
    ]
    this.cTimestamp = new Date().getTime()
    this.init()
    this.getData()
  },
  methods: {
    init() {
      this.settleOrderNo = this.$route.query.settleOrderNo
      this.settleOrderBaddebtId = this.$route.query.settleOrderBaddebtId
      this.settleOrderBaddebtNo = this.$route.query.settleOrderBaddebtNo
    },
    getData() {
      const data = {
        settleOrderBaddebtId: this.settleOrderBaddebtId,
        settleOrderNo: this.settleOrderNo
      }
      this.logDialogShow = false
      info(data)
        .then(res => {
          if (res.code === 0) {
            this.logDialogShow = true
            this.info = {
              ...res.data,
              // settleOrderBaddebtNo: this.settleOrderBaddebtNo
            }
            this.pendingAudit = res.data.auditStatus === 'pending'
            this.pendingApprovingAudit = res.data.auditStatus === 'pending' || res.data.auditStatus === 'approving'
            // let arr = res.data.recFeeList
            // let obj = { ...arr[0] }
            // obj.feeName = '操作费'
            // obj.feeAmt = 595.37
            // obj.currency = 'USD'
            // arr.push(obj)
            // this.option1.data = arr
            this.option1.data = res.data.recFeeList || []
          }
        })
        .catch(() => this.back())
    },
    // 坏账审批 type 拒绝refuse|愿意pass
    audit(type) {
      if (type === 'refuse') {
        return (this.rejectDialogVisible = true)
      }
      const data = {
        settleOrderBaddebtId: this.info.settleOrderBaddebtId,
        auditType: 'pass'
      }
      this.auditReq(data)
    },
    // 弹框确定拒绝
    rejectSubmit() {
      this.$refs.rejectForm.validate((res, rej) => {
        if (res) {
          const data = {
            settleOrderBaddebtId: this.info.settleOrderBaddebtId,
            auditType: 'refuse',
            refuseReason: this.rejectForm.refuseReason
          }
          this.rejectDialogVisible = false
          this.auditReq(data)
        }
      })
    },
    // 发送审核请求
    auditReq(data) {
      this.btnLoading = true
      audit(data).then(res => {
        this.$message({
         message: this.$t('PreClose.operateSuc'),
          type: 'success'
        })
        this.rejectForm.refuseReason = ''
        if (res.data && res.data.length) {
          this.queryLateFeeByWriteoffNo(res.data.join(','))
        }
        // this.back() // 放到下面
      }).finally(() => this.btnLoading = false)
    },
    queryLateFeeByWriteoffNo(writeoffReceipayNo) {
      let data = {
        writeoffReceipayNo // : 'SZCZAP2211000524'
      }
      listByWriteoffNo(data).then(res => {
        this.option13.data = res.data || [] // [{custOverduePaymentNo:'ZNJ202211090089'}]
        if (this.option13.data.length) {
          this.lateFeeVisible = true
        } else {
          this.back()
        }
      })
    },
    handleLateFee() {
      this.routerPush('FiscalTermList', {
        tabFromOther: 'lateFeeList',
        custOverduePaymentNo: this.option13.data.map(item => item.custOverduePaymentNo).join(',')
      })
    },
    handleLateFeeCancel() {
      this.lateFeeVisible = false
      this.back()
    },
    // 返回 关闭详情页 val 是否刷新坏账列表
    back() {
      this.routerBack()
    },
    sortChange(column, prop, order) {
      // console.log(column, prop, order)
      if (!order) return
      let arr = [
        'feeAmt',
        'canUseSettleAmt',
        'settleAmt',
        'exchangeRate',
        'taxRate',
        'taxAmt',
        'feeAmtWithoutTax',
        'invoiceAmt',
        'canInvoiceAmt',
      ]
      let isNum = arr.includes(prop)
      if (order === 'descending') {
        this.option1.data = this.option1.data.sort((a, b) => {
          return isNum ? b[prop] - a[prop] : b[prop] > a[prop] ? 1 : -1
        })
      } else if (order === 'ascending') {
        this.option1.data = this.option1.data.sort((a, b) => {
          return isNum ? a[prop] - b[prop] : a[prop] > b[prop] ? 1 : -1
        })
      }
    },
    // 单号详情
    showDetail(row) {
      const sourceBizNo = row.sourceBizNo
      this.showOneNoDetail('sourceBizNo', sourceBizNo)
    },
    // 结算单号详情
    showSettleDetail(row) {
      const settleOrderNo = row.settleOrderNo
      this.showOneNoDetail('settleOrderNo', settleOrderNo)
    },
    // 撤回申请
    badApplyCancel(){
      this.btnLoading1 = true
      badApplyCancel({settleOrderBaddebtId: this.settleOrderBaddebtId}).then(res=>{
        this.$msgSucClose(this.$t('Hedge.withdrawalTips'))
        this.routerDelBack(true)
      }).finally(() => this.btnLoading1 = false)
    },
    search(list) {
      console.log(list.map((item) => item.invisible))
      this.option1.data = [...list]
      this.info.recFeeSumList = this.computeFeeSum(this.option1.data.filter(item => !item.invisible), { returnType: 'list' })
      // this.writeoffGatherChange()
    },
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 300) {
      this.lateFeeVisible = false // 防止叉掉了页面时，滞纳金窗口还在
      this.$refs.detailFeeSearch && this.$refs.detailFeeSearch.clearData()
      this.init()
      this.getData()
    }
  }
}
</script>

<style lang="scss" scoped>
.info-box{
  /deep/ .detail__div{
    width: 25% !important;
    margin-right: 0;
  }
  .detail__div__full{
    width: 100% !important;
  }
}

.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
  background-color: #fff;
}
.orderDetail-box {
  .item-box {
    border-bottom: 1px solid #d8d8d8;
    // padding-bottom: 10px;
    margin: 0 8px 0;
    .title {
      font-weight: 600;
      color: #222222;
      line-height: 20px;
      padding: 8px;
    }
    .info-box {
      display: flex;
      flex-wrap: wrap;
      margin: 8px 8px 0 8px;
      .base-item-list {
        flex-basis: 100%;
        display: flex;
      }
      .flex-item {
        display: flex;
        label {
          width: 40px;
          font-weight: normal;
        }
      }
      .base-item {
        flex-basis: calc(25% - 10px);
        margin-bottom: 10px;
        margin-right: 10px;
        height: 16px;
        b {
          font-weight: normal;
        }
        .sub-title {
          min-width: 100px;
          text-align: right;
          display: inline-block;
          // text-align-last: justify;
        }
        &.remark {
          flex-basis: 100%;
          height: auto;
        }
        .el-input,
        .el-input--suffix,
        .el-upload--text,
        .finance-table-upload,
        .el-select {
          width: 120px;
        }
        .link {
          font-weight: 400;
          color: #3e80f5;
          line-height: 20px;
          cursor: pointer;
          margin-left: 5px;
        }
      }
      .el-select {
        width: 100px;
        margin-right: 5px;
      }
    }
  }
  .el-button--text {
    font-size: 12px;
    padding: 0 5px;
  }
  .table-box {
    border: 1px solid #e9e9e9;
    border-radius: 4px;
    margin: 16px 8px;
    overflow: hidden;
    .title-box {
      background: #f8f9fd;
    }
    .bill-box {
      margin: -5px 0 15px 5px;
      display: flex;
      padding: 8px;
      color: #4a4a4a;
      span {
        flex-basis: 300px;
      }
    }
  }
  .title-box {
    display: flex;
    // margin-bottom: 15px;
    background: #f8f9fd;
    .title {
      flex: 1;
      height: 30px;
      font-weight: 600;
      color: #222222;
      line-height: 30px;
      padding: 0 8px;
      display: flex;
      .total {
        font-weight: normal;
        color: green;
        margin-left: 10px;
      }
    }
    .money-list {
      margin-left: 20px;
      font-weight: normal;
    }
    span {
      color: #222;
      b {
        color: #33b18a;
        font-weight: 500;
      }
    }
    .btn {
      padding: 0;
      margin: 5px 15px;
      display: flex;
      .toggle {
        line-height: 20px;
        margin-left: 20px;
        cursor: pointer;
        color: #409eff;
        i {
          margin-left: 2px;
        }
      }
    }
    .el-button {
      // height: 20px;
      // background: none !important;
      border-radius: 4px;
      // border: 1px solid #d9d9d9;
      text-align: center;
      // line-height: 20px;
      padding: 0 8px;
      font-size: 12px;
    }
  }
}
.text-over {
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 140px;
  vertical-align: middle;
}
.item-box ::v-deep .finance-table{
  padding: 0;
}
</style>
