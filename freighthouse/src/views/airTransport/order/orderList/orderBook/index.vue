<template>
  <div class="edit-container order-book fullWrap" id="orderBook">
    <div class="order-container">
      <!-- 协同撤回申请提示 -->
      <CancelApplyAlert v-if="isCancelApply && serviceCode !== 'airbook'" :serviceInfo="serviceInfo" :serviceList="orderInfo.serviceList" @callback="getOrderInfo" />
      <!-- 订单已取消提示 -->
      <CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
      <!-- 订单拒绝提示 -->
      <RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
      <div class="tabs-container">
        <TopNav :serviceType="orderInfo.serviceType" :activityKey="'AirTransportOrderBook'" @routerPush="handleToRoute" />
        <div class="detail-container flex">
          <LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
          <div class="flex1 component-main-cont">
            <div class="service-container">
              <ServiceCustInfo :orderInfo="orderInfo" :serviceCode="serviceCode" @getOrderInfo="getOrderInfo" @routerPush="handleToRoute" @getProgressValue="getProgressValue"></ServiceCustInfo>
              <div class="component-cont inner">
                <component :is="'orderBookInfo'" :orderInfoData="orderInfo" :tabMenus="orderBookMenu" :progressValue="progressValue"></component>
                <div style="background: #f5f7f9;height:10px"></div>
                <!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="serviceCode" /> -->
              </div>
            </div>
            <JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="serviceCode" @callback="jointWorkAssignCallback" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
// import { orderInfo } from '@/api/airTransport/order'
import { getDictLabel } from '@/utils/tools'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
import Book from './components/book'
import Bl from './components/bl'
import Vgm from './components/vgm'
import Dangerous from './components/dangerous'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import orderBookInfo from './components/orderBookInfo'

export default {
  mixins: [orderMixin, routerMixin],
  filters: {
    bkgStatusFilter(status) {
      return getDictLabel('bkgStatus', status)
    }
  },
  data() {
    return {
      oQuery: this.$route.query,
      orderBookMenu: [],
      activityKey: '',
      serviceCode: 'airbook',
      routeName: 'AirTransportOrderBook',
      // orderInfo: {},
      progressValue:''
    }
  },
  props: {},
  created() {
    this.cTimestamp = new Date().getTime()
    this.getOrderInfo()
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
      this.getOrderInfo()
    }
  },
  mounted() {
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL)
      window.addEventListener('popstate', this.browserBack, false)
    }
  },
  destroyed() {
    window.removeEventListener('popstate', this.browserBack, false)
  },
  computed: {},
  components: {
    CancelApplyAlert,
    CancelAlert,
    RefuseAlert,
    TopNav,
    LeftNav,
    ServiceCustInfo,
    JointWorkAssign,
    Book,
    Bl,
    Vgm,
    Dangerous,
    // OneServiceFee,
    orderBookInfo
  },
  watch: {
  },
  methods: {
    getProgressValue(val){
      this.progressValue=val
    },
    // 获取订单详情
    // getOrderInfo() {
    //   let { orderNo, jointNo } = this.$route.query
    //   let params = {
    //     orderNo: orderNo
    //   }
    //   if (jointNo) {
    //     params.jointNo = jointNo
    //   }
    //   orderInfo(params).then((res) => {
    //     this.orderInfo = res.data
    //     this.getInit()
    //   })
    // },
    getInit() {
      if (!this.orderInfo) return
      this.handleIsCancelApply(this.serviceCode)
      // 获取业务发起取消的订单的取消原因备注等信息
      if (this.orderInfo.cancelApplyStatus === 'applied') {
        this.getCancel(this.orderInfo)
      }
      // 获取已拒绝的信息
      if (this.orderInfo.orderStatus === 'refuse') {
        this.getRefuse(this.orderInfo)
      }
      // 获取登录用户拥有可编辑订单的角色集合
      this.getUserEditRoles(this.orderInfo)
    },
    handleClick(tab, event) {
      this.handleIsCancelApply(this.serviceCode) // 获取协同服务项取消申请状态
    },
    jointWorkAssignCallback() {
      this.getJointServiceWorkList(this.serviceCode)
    }
  }
}
</script>
<style lang="scss">
@import '../../less/index.scss';
@import '../../less/detail.scss';
</style>
