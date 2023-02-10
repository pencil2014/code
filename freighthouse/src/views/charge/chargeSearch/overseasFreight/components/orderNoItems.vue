<template>
  <div class="overseasFreight-orderNo-items">
    <el-popover v-if="orderList.length" placement="bottom" width="150" trigger="click">
      <div>
        <div v-for="(item, index) in orderList" :key="index">
          <span size="mini" @click.stop="toDetail(item)" class="underline" style="color: #1890ff; cursor: pointer;">{{ item }}</span>
        </div>
      </div>
      <span size="mini" class="underline" slot="reference">View associated order number</span>
    </el-popover>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  props: ['param', 'item'],
  created() {},

  mounted() {},
  computed: {
    orderList() {
      return this.param.orderNoList || [] //this.param.orderNoList ||
    }
  },
  watch: {},
  components: {},
  methods: {
    toDetail(orderNo) {
      let routeUrl = this.$router.resolve({
        name: 'OrderRedirect',
        query: {
          orderNo: orderNo
        }
      })
      window.open(routeUrl.href, '_blank')
      // if (this.param.businessType.indexOf('ship_') > -1) {
      //   console.log('海运')
      // } else if (this.param.businessType.indexOf('air_') > -1) {
      //   console.log('空运')
      // } else if (this.param.businessType.indexOf('rail_') > -1) {
      //   console.log('铁路')
      // }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
<style lang="scss">
.overseasFreight-orderNo-items {
  display: flex;
  align-items: center;
}
</style>
