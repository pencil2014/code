<template>
  <div class="print-apply-info">
    <template v-if="item.orderType === 'special_refund'">
      <div class="base-item">申请日期：{{ item.createdTime }}</div>
      <div class="base-item">申请人：{{ item.createdName }}</div>
      <div class="base-item">审核时间：{{ item.confirmTime }}</div>
      <div class="base-item">审核人：{{ item.confirmName }}</div>
    </template>
    <template v-else>
      <div class="base-item">申请日期：{{ item.createdTime }}</div>
      <div class="base-item">发票登记日期：{{ item.invoiceRegisterTime }}</div>
      <div class="base-item">审核时间：{{ item.confirmTime }}</div>
      <div class="base-item">推送出纳人：{{ item.sendPayOrderUserName }}</div>
      <div class="base-item">申请人：{{ item.createdName }}</div>
      <div class="base-item">发票登记人：{{ item.invoiceRegisterName }}</div>
      <div class="base-item">审核人：{{ item.confirmName }}</div>
      <div class="base-item">推送出纳时间：{{ item.sendPayOrderTime }}</div>
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
  width: 25%;
  margin-bottom: 10px;
  word-wrap: break-word;
  word-break: break-all;
}
</style>
