<template>
  <div class="money-total">
    <!-- <span class="money-total-span-black">费用条数：{{num}}</span> -->
    <span class="money-total-span-left-space" v-if="$route.query.supplierBillId">{{$t('Supplier.totalreceivables')}}：</span>
    <span
      v-for="(item, index) in receive"
      :key="'supplierReceive' + index"
      class="money-total-span-black"
    >
      {{item.currency}}
      <span :class="{'money-pay-color': item.isPay}">{{item.amt}}</span>
    </span>
    <span class="money-total-span-left-space">{{$t('Supplier.totalpayable')}}：</span>
    <span v-for="(item, index) in pay" :key="'supplierPay' + index" class="money-total-span-black">
      {{item.currency}}
      <span :class="{'money-pay-color': item.isPay}">{{item.amt}}</span>
    </span>
  </div>
</template>
<script>
export default {
  name: 'tabelTitle',
  props: {
    num: {
      type: Number,
      default: 0,
    },
    receive: {
      type: Array,
      default: () => [],
    },
    pay: {
      type: Array,
      default: () => [],
    },
  },
  watch:{
    // pay(val){
    //   console.log(val);
    // }
  }
}
</script>
<style scoped>
.money-total {
  color: #222222;
  /* line-height: 40px; */
  margin-right: 6px;
}
.money-total > span {
  float: left;
}
.money-total .money-total-span-black {
  color: #222222;
  font-weight: 400;
  margin-right: 5px;
}
.money-total .money-total-span-left-space {
  color: #222222;
  margin-left: 8px;
  font-weight: 400;
}
</style>