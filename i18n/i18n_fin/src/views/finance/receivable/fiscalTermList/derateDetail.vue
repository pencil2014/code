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
          <div class="money-title">{{$t('LateFee.derateList')+$t('OrderFee.enspace')+$t('OrderFee.detail')}}</div><!-- 滞纳金减免申请详情 -->
        </div>
        <div class="money-box-right">
          <el-button @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
        </div>
      </div>
      <div class="settlement-detail-form settlement-detail-form-own">
          <!-- :model="lateFeeForm" -->
        <el-form
          ref="lateFeeForm"
          :inline="true"
          size="mini"
          label-width="120px"
        >
          <DetailDiv :label="$t('LateFee.derateApplyNo')" :content="deductionApplyNo" :isTooltip="true" :labelWidth="'140'" :width="'272'" />
          <DetailDiv :label="$t('FeeList.settleComp')" :content="lateFeeForm.settleCompName" :isTooltip="true" :labelWidth="'140'" :width="'272'" />
          <DetailDiv :label="$t('FeeList.settleCorp')" :content="lateFeeForm.settleCorpName" :labelWidth="'140'" :width="'272'" />
          <DetailDiv :label="$t('OrderFee.currency')" :content="lateFeeForm.currency" :labelWidth="'140'" :width="'272'" />
          <DetailDiv :label="$t('Finance.actuallatefee')" :content="lateFeeForm.lateFeeAmt" :labelWidth="'140'" :width="'272'" />
          <DetailDiv :label="$t('LateFee.derateType')" :content="dictMapObj['custOverduePaymentDeductionType'][lateFeeForm.deductionType]" :labelWidth="'140'" :width="'272'" />
          <DetailDiv :label="$t('LateFee.derateAmt')" :content="lateFeeForm.deductionAmt" :labelWidth="'140'" :width="'272'" /><!-- 减免申请金额 -->
          <DetailDiv :label="$t('LateFee.derateReason')" :content="lateFeeForm.deductionRemark" :labelWidth="'140'" :width="'272'" />
          <DetailDiv :label="$t('LateFee.remainLateFeeassumerType')" :content="dictMapObj['custOverduePaymentAssumerType'][lateFeeForm.assumerType]" :labelWidth="'140'" :width="'272'" :isTooltip="true"/><!-- 剩余滞纳金承担类型 -->
          <DetailDiv :label="$t('LateFee.customerAssumerAmt')" :content="lateFeeForm.customerAssumerAmt" :labelWidth="'140'" :width="'272'" />
          <DetailDiv :label="$t('LateFee.orderAssumerAmt')" :content="lateFeeForm.orderAssumerAmt" :labelWidth="'140'" :width="'272'" />
          <DetailDiv :label="$t('OrderFee.approvalStatus')" :content="dictMapObj['auditStatus'][lateFeeForm.auditStatus]" :labelWidth="'140'" :width="'272'" />
          <DetailDiv :label="$t('PayApplyList.createdName')" :content="lateFeeForm.createdName" :labelWidth="'140'" :width="'272'" />
          <DetailDiv :label="$t('PayApplyList.createdTime')" :content="lateFeeForm.createdTime" :labelWidth="'140'" :width="'272'" />
          <DetailDiv :label="$t('OrderFee.approver')" :content="lateFeeForm.auditName" :labelWidth="'140'" :width="'272'" />
          <DetailDiv :label="$t('OrderFee.approvalTime')" :content="lateFeeForm.auditTime" :labelWidth="'140'" :width="'272'" />
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
