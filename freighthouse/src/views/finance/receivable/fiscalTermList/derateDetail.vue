<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">滞纳金减免申请详情</div>
        </div>
        <div class="money-box-right">
          <el-button @click="cancel" size="mini">返回</el-button>
        </div>
      </div>
      <div class="settlement-detail-form settlement-detail-form-own">
        <el-form
          ref="lateFeeForm"
          :inline="true"
          size="mini"
          label-width="120px"
        >
          <DetailDiv label="减免申请编号：" :content="deductionApplyNo" :isTooltip="true" :labelWidth="'124'" />
          <DetailDiv label="分公司：" :content="lateFeeForm.settleCompName" :isTooltip="true" :labelWidth="'124'" />
          <DetailDiv label="结算单位：" :content="lateFeeForm.settleCorpName" :labelWidth="'124'" />
          <DetailDiv label="币种：" :content="lateFeeForm.currency" :labelWidth="'124'" />
          <DetailDiv label="实际滞纳金：" :content="lateFeeForm.lateFeeAmt" :labelWidth="'124'" />
          <DetailDiv label="减免类型：" :content="dictMapObj['custOverduePaymentDeductionType'][lateFeeForm.deductionType]" :labelWidth="'124'" />
          <DetailDiv label="减免申请金额：" :content="lateFeeForm.deductionAmt" :labelWidth="'124'" />
          <DetailDiv label="减免原因：" :content="lateFeeForm.deductionRemark" :labelWidth="'124'" />
          <DetailDiv label="剩余滞纳金承担类型：" :content="dictMapObj['custOverduePaymentAssumerType'][lateFeeForm.assumerType]" :labelWidth="'124'" />
          <DetailDiv label="客户承担金额：" :content="lateFeeForm.customerAssumerAmt" :labelWidth="'124'" />
          <DetailDiv label="订单承担金额：" :content="lateFeeForm.orderAssumerAmt" :labelWidth="'124'" />
          <DetailDiv label="审核状态：" :content="dictMapObj['auditStatus'][lateFeeForm.auditStatus]" :labelWidth="'124'" />
          <DetailDiv label="申请人：" :content="lateFeeForm.createdName" :labelWidth="'124'" />
          <DetailDiv label="申请时间：" :content="lateFeeForm.createdTime" :labelWidth="'124'" />
          <DetailDiv label="审核人：" :content="lateFeeForm.auditName" :labelWidth="'124'" />
          <DetailDiv label="审核时间：" :content="lateFeeForm.auditTime" :labelWidth="'124'" />
          <DetailDiv label="拒绝原因：" v-if="lateFeeForm.auditRemark" :content="lateFeeForm.auditRemark" :labelWidth="'124'" :isFull="true"/>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { getDeductionApplyInfo } from '@/api/fin/custOverduePayment'
export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      loading: false,
      deductionApplyNo: '',
      lateFeeForm: {
        settleCompName: '',
        settleCorpName: '',
      },
    }
  },
  created() {
  },
  methods: {
    getData() {
      let data = {
        deductionApplyNo: this.deductionApplyNo
      }
      getDeductionApplyInfo(data).then(res => {
        this.lateFeeForm = Object.assign(this.lateFeeForm, res.data)
        this.$forceUpdate()
      })
    },
    //返回
    cancel() {
      this.routerBack()
    },
  },
  activated() {
    if (!this.$route.meta.isUseCache) {
      this.deductionApplyNo = this.$route.query.deductionApplyNo
      this.getData()
    }
  },
}
</script>

<style lang="scss" scoped>
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
</style>
