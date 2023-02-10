<template>
  <div class="edit-container order-book fullWrap" id="clearance">
    <div class="order-container">
      <div class="tabs-container">
        <div class="detail-container flex">
          <div class="flex1 component-main-cont">
            <div class="service-container">
              <ServiceCustInfo :serverIsJoint="isJoint" :orderInfo="orderInfoData" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute" @getProgressValue="getProgressValue"></ServiceCustInfo>
              <div class="order-cont">
                <div class="service-detail-cont">
                  <el-tabs v-model="activityKey" @tab-click="handleClick" v-if="clearanceMenu.length">
                    <el-tab-pane v-for="item in clearanceMenu" :label="item.value" :name="item.key" :key="item.key">
                      <span slot="label">
                        <i class="icon-warning" v-if="item.isCancelApply" style="margin-right: 5px"></i>
                        <i class="icon-joint" v-if="item.isJoint">协</i>
                        {{ item.value }}
                      </span>
                    </el-tab-pane>
                  </el-tabs>
                  <component :is="activityKey" :orderInfoData="orderInfoData" :tabMenus="clearanceMenu" :progressValue="progressValue"></component>
                  <!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="serviceCode" /> -->
                </div>
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
import { getAirServicChilds, getAirServiceCode } from '@/utils/tools'
import { orderInfo } from '@/api/airTransport/order'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import Agent from './agent'
import Inspection from './inspection'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'

export default {
  mixins: [orderMixin, routerMixin],
  data() {
    return {
      oQuery: this.$route.query,
      clearanceMenu: [],
      activityKey: '',
      serviceCode: 'air_pol_declaration',
      routeName: 'AirClearance',
      orderInfoData: {},
      progressValue:''
    }
  },
  created() {
    this.getOrderInfo()
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
  props: {},
  computed: {
    getCurrentServiceCode() {
      let find = this.clearanceMenu.find((item) => {
        return item.key === this.activityKey
      })
      return find && find.code
    }
  },
  components: {
    CancelApplyAlert,
    CancelAlert,
    RefuseAlert,
    TopNav,
    LeftNav,
    ServiceCustInfo,
    Agent,
    Inspection,
    JointWorkAssign,
    // OneServiceFee
  },
  watch: {
    serviceCode(newVal) {
      if (newVal && this.jointShow) {
        this.getJointServiceWorkList(newVal)
      }
    }
  },
  methods: {
    getProgressValue(val){
      this.progressValue=val
    },
    // 获取订单详情
    getOrderInfo() {
      let { source, orderNo, jointNo } = this.$route.query
      let params = {
        orderNo: this.$route.query.orderNo
      }
      if (jointNo) {
        params.jointNo = jointNo
      }
      orderInfo(params).then((res) => {
        this.$store.dispatch('airTransport/setAirOrderInfo', res.data)
        this.orderInfoData = res.data
        this.getInit()
      })
    },
    getInit() {
      if (!this.orderInfoData) return
      let { name } = this.$route
      let { serviceList, serviceInfoList } = this.orderInfoData
      this.clearanceMenu = getAirServicChilds(
        name,
        serviceList,
        serviceInfoList
      )
      if (!this.activityKey)
        this.activityKey = getAirServicChilds(
          name,
          serviceList,
          serviceInfoList
        )[0].key
      if (!this.serviceCode)
        this.serviceCode = getAirServiceCode(name, serviceList)
      sessionStorage.setItem('serviceCode', this.serviceCode)
      this.handleIsCancelApply(this.serviceCode) // 获取协同服务项取消申请状态
      // 获取业务发起取消的订单的取消原因备注等信息
      if (this.orderInfoData.cancelApplyStatus === 'applied') {
        this.getCancel(this.orderInfoData)
      }
      // 获取已拒绝的信息
      if (this.orderInfoData.orderStatus === 'refuse') {
        this.getRefuse(this.orderInfoData)
      }
      this.getUserEditRoles(this.orderInfoData)
    },
    handleClick(tab, event) {
      // 修改全局serviceType的值
      this.serviceCode = this.clearanceMenu.find(
        (item) => item.key == this.activityKey
      ).code
      this.$store.dispatch('order/changeServiceType', this.serviceCode)
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
.small-tit .icon {
  vertical-align: text-top;
  margin-right: 5px;
  width: 16px;
}
</style>
