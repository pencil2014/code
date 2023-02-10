<template>
  <div class="flex1 component-main-cont" id="air-orderDetail">
    <component :is="currentComponent" ref="airOrderDetail" :orderInfo="orderInfo" @getInfo="getOrderInfo" :isJoint="isJoint"></component>
  </div>
</template>

<script>
import OrderDetail from '../orderDetail.vue'
import SelfOrderDetail from '../selfOrderDetail.vue'
import OrderDetailImport from '../orderDetail-import.vue'
import SelfOrderDetailImport from '../selfOrderDetail-import.vue'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { mapState } from 'vuex'
export default {
  mixins: [orderMixin],
  data() {
    return {}
  },
  computed: {
    ...mapState({
      airOrderInfo: (state) => state.airTransport.airOrderInfo
    }),
    currentComponent() {
      if (this.airOrderInfo.businessType === 'air_export') {
        // 空运出口
        if (
          this.airOrderInfo.serviceType === 'st05' ||
          this.airOrderInfo.serviceType === 'st20'
        ) {
          //-委托订舱
          return 'OrderDetail'
        } else if (
          this.airOrderInfo.serviceType === 'st06' ||
          this.airOrderInfo.serviceType === 'st21' ||
          this.airOrderInfo.serviceType === 'st22'
        ) {
          //-客户自订
          return 'SelfOrderDetail'
        }
      } else if (this.airOrderInfo.businessType === 'air_import') {
        // 空运进口
        if (this.airOrderInfo.serviceType === 'st13') {
          //-委托订舱
          return 'OrderDetailImport'
        } else if (this.airOrderInfo.serviceType === 'st14') {
          //-客户自订
          return 'SelfOrderDetailImport'
        }
      }
    }
  },
  methods: {},
  created() {},
  mounted() {},
  updated() {},
  components: {
    OrderDetail,
    SelfOrderDetail,
    OrderDetailImport,
    SelfOrderDetailImport
  }
}
</script>

<style>
</style>