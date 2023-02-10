<template>
  <span class="review-row-table-header-container">
    <el-tooltip placement="top" v-if="surchargeList && surchargeList.length">
      <div slot="content">
        <div class="payment-advance" >
          <!-- <div v-if="surchargeList[0] && surchargeList[0].payMode">{{$t(`dict.payMode.${surchargeList[0].payMode}`)}}：</div> -->
          <div class="payment-advance-list"  v-for="(sItem, index) in surchargeList" :key="'sItem' + index">
            {{sItem.chargeName}}({{sItem.chargeCode}}):
            <span v-if="sItem.rateUnit === 'container_type'">
              {{sItem.priceGp20 ? sItem.priceGp20 : '-'}}/{{sItem.priceGp40 ? sItem.priceGp40 : '-'}}/{{sItem.priceHq40 ? sItem.priceHq40 : '-'}}/{{sItem.priceHq45 ? sItem.priceHq45 : '-'}}
            </span>
            <span v-else>{{sItem.price}} </span>
              ({{sItem.currency}})
          </div>
        </div>
      </div>
      <div class="cnt-box">
        {{getStr()}}
      </div>
      <!-- <el-button type="text" size="mini">{{param.label}}</el-button> -->
    </el-tooltip>
    <div v-else class="cnt-box"></div>
  </span>
</template>

<script>
export default {
  data() {
    return {
    }
  },
  props: ['param', 'item'],
  created() {
  },
  mounted() {
  },
  computed: {
    surchargeList() {
      let {prop} = this.item
      return this.param[prop]
    }
  },
  watch: {
  },
  components: {
  },
  methods: {
    getStr () {
      let str = []
      this.surchargeList.forEach(ele => {
        let {chargeName, chargeCode, priceGp20, priceGp40, priceHq40, priceHq45, price, currency} = ele
        let sub = `${chargeName}(${chargeCode}): `
        if (ele.rateUnit === 'container_type') {
          sub += `${priceGp20 ? priceGp20 : '-'}/${priceGp40 ? priceGp40 : '-'}/${priceHq40 ? priceHq40 : '-'}/${priceHq45 ? priceHq45 : '-'}`
        } else {
          sub += price
        }
        sub += `(${currency})`
        str.push(sub)
      })
      return str.join(' ')
    }
  }
};
</script>

<style lang="scss" scoped>
.review-row-table-header-container{
  white-space: normal;
}
.cnt-box{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-tooltip__popper.is-dark{
  transform: translateY(10px);
}
</style>
