<template>
  <div class="print-apply-info">
    <template v-if="item.orderType === 'special_refund'">
      <div class="base-item">{{$t('PayApplyList.createdTime')}}：{{ item.createdTime }}</div><!-- 申请日期 -->
      <div class="base-item">{{$t('PayApplyList.createdName')}}：{{ item.createdName }}</div><!-- 申请人 -->
      <div class="base-item">{{$t('OrderFee.approvalTime')}}：{{ item.confirmTime }}</div><!-- 审核时间 -->
      <div class="base-item">{{$t('OrderFee.approver')}}：{{ item.confirmName }}</div><!-- 审核人 -->
    </template>
    <template v-else>
      <div class="base-item">{{$t('PayApplyList.createdTime')}}：{{ item.createdTime }}</div><!-- 申请日期 -->
      <!-- <div class="base-item">发票登记日期：{{ item.invoiceRegisterTime }}</div> 海外版不显示 -->
      <div class="base-item">{{$t('OrderFee.approvalTime')}}：{{ item.confirmTime }}</div><!-- 审核时间 -->
      <div class="base-item">{{$t('PayApplyList.sender')}}：{{ item.sendPayOrderUserName }}</div><!-- 推送出纳人 -->
      <div class="base-item">{{$t('PayApplyList.createdName')}}：{{ item.createdName }}</div><!-- 申请人 -->
      <!-- <div class="base-item">发票登记人：{{ item.invoiceRegisterName }}</div> 海外版不显示 -->
      <div class="base-item">{{$t('OrderFee.approver')}}：{{ item.confirmName }}</div><!-- 审核人 -->
      <div class="base-item">{{$t('PayApplyList.sendTime')}}：{{ item.sendPayOrderTime }}</div><!-- 推送出纳时间 -->
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'printBottomDetail',
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
.print-apply-info {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
}
.print-apply-info .base-item {
  width: calc(33% - 24px); // 25%;
  margin-right: 24px;
  margin-bottom: 10px;
  // word-wrap: break-word;
  // word-break: break-all;
}
</style>
