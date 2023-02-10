<template>
  <div class="print-info-box">
    <div class="base-item">{{$t('PayApplyList.settleOrderNo')}}：{{ item.settleOrderNo }}</div>
    <div class="base-item">{{$t('PayApplyList.payWay')}}：{{ dictMapObj.payWay[item.payWay] }}</div>
    <div class="base-item">{{$t('PayApplyList.applyNo')}}：{{ item.applyNo }}</div><!-- 付款申请单号 -->
    <div class="base-item">{{$t('PayApplyList.recvAccountName')}}：{{ item.recvAccountName }}</div>
    <!-- <div class="base-item">对方开户行：{{ item.recvBankName }}</div> -->
    <div class="base-item">{{$t('PayApplyList.recvAccountNo')}}：{{ item.recvAccountNo }}</div>
    <div class="base-item">{{$t('PayApplyList.recvBankBranch')}}：{{ item.recvBankBranch }}</div>
    <!-- <div class="base-item"></div>
    <div class="base-item"></div>-->
    <!-- <div class="base-item">代大掌柜付款：{{ item.dzgInternalCompName }}</div>
    <div class="base-item">大掌柜付款单号：{{ item.dzgPayBillNo }}</div>
    <div class="base-item">代付大掌柜金额：{{ item.dzgFeeAmt }}</div> -->
    <div class="base-item" v-if="item.transferFeeDeductWay">{{$t('PayApplyList.transferFeeDeductWay')}}：{{ dictMapObj['transferFeeDeductWay'][item.transferFeeDeductWay ]}}</div>
    <div class="base-item" style="flex-basis: 100%;">{{$t('PayApplyList.approvalRemark')}}：{{ item.auditOpinion }}</div>
    <template v-if="item.orderType === 'special_refund'">
      <div class="base-item">{{$t('PayApplyList.settleCurrency')}}：{{ item.settleCurrency }}</div>
      <div class="base-item">{{$t('PayApplyList.settleAmt')}}：{{ item.settleAmt }}</div>
      <div class="base-item">{{$t('PayApplyList.realPayAmt')}}：{{ item.realPayAmt }}</div>
    </template>
    <!-- 海外版不显示
    <template v-if="$route.name === 'PaySettleFileNoPrint'">
      <div class="base-item" style="flex-basis: 100%;">发票号：{{ item.invoiceInfoJoinStr }}</div>
    </template> -->
    <!-- <template v-else>
      <div class="base-item">我司户名：{{ info.payAccountName }}</div>
      <div class="base-item">我司开户行：{{ info.payBankName }}</div>
      <div class="base-item">我司账号：{{ info.payAccountNo }}</div>
    </template>-->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'printTopDetail',
  props: {
    item: { type: Object, default: () => ({}) },
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['dictMapObj']),
  },
  methods: {},
  created() {},
}
</script>

<style scoped lang="scss">
.print-info-box {
  display: flex;
  flex-wrap: wrap;
}
.print-info-box .base-item {
  flex: 1;
  flex-basis: calc(33% - 24px);
  margin-bottom: 10px;
  margin-right: 24px;
  // word-wrap: break-word;
  // word-break: break-all;
}
</style>
