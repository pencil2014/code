<template>
  <div class="edit-container order-book" id="">
    <div class="order-container">
      <div class="tabs-container">
        <TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" @routerPush="handleToRoute" :type="'fcl'"/>
        <div class="detail-container flex">
          <LeftNav :orderInfo="orderInfo" :activityKey="'FclOrderDetail'" @routerPush="handleToRoute"/>
          <div class="flex1 component-main-cont">
            <!-- 海运出口整箱-委托订舱 -->
            <OrderDetail 
              :orderInfo="orderInfo"
              @getInfo="getOrderInfo"/>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
<script>
import { mapState, mapGetters, mapMutations} from 'vuex'
import {orderMixin} from '@/views/order/order/mixins/orderMixin'
import {routerMixin} from '@/views/order/order/mixins/routerMixin'
import {orderInfo, orderJointInfo} from '@/api/order/list'
import {getDictMap, getServicChilds} from '@/utils/tools'
import OrderDetail from "./orderDetail"
import TopNav from "../components/topNav"
import LeftNav from '../components/leftNav'

export default {
  mixins: [orderMixin, routerMixin],
  data() {
    return {
      oQuery: this.$route.query,
      activityKey: "FclOrderDetail",
      // orderInfo: {},
      cTimestamp: 0,
    }
  },
  created() {
    this.cTimestamp = new Date().getTime()
    this.getOrderInfo()
    console.log('created', this.orderInfo);
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
      this.isCancel = false
      this.isRefuse = false
      this.orderInfo = {}
      this.getOrderInfo()
      console.log('activated', this.orderInfo)
    }
  },
  mounted() {
  },
  computed: {
  },
  watch: {
  },
  components: {
    OrderDetail,
    TopNav,
    LeftNav,
  },
  methods: {
    
  }
}
</script>
<style lang="scss">
@import "../../less/index.scss";
.order-book .edit-row {
  margin: 0 !important;
  .row-form {
    padding: 0 !important;
  }
} 
</style>