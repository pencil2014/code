<template>
  <div>
    <el-alert v-if="$route.query.source === 'orderList' && custInfoObj && Object.keys(custInfoObj).length && custInfoObj.status !== 'valid' && custInfoObj.custClass !== 'DEPARTMENT'" class="forbid" type="warning">
      <template slot="title">
        <i class="tag-forbid">禁</i>
        <span class="text">该客户还未进行资质认证审核，不允许放舱给客户。</span>
      </template>
    </el-alert>
    <ul class="top-nav-tabs">
      <li :class="{ 'is-active': 'AirTransportOrderDetail' === $route.name }" @click="tabsClick('AirTransportOrderDetail')">
        订单详情
      </li>
      <div v-if="(isOp || isEcs || isCs) && !seviceIsDisabledEdit">
        <li v-for="(item, index) in serviceMenus" :key="index" @click="handleClickMenu(item)" :class="{ 'is-active': item.component === $route.name }">
          <span class="service-name">{{ item.cname }}</span>
          <i class="icon-warning" v-if="item.isCancelApply || item.isEdit || item.isCancelService"></i>
          <i class="icon-joint" v-if="item.isJoint">协</i>
          <i class="el-icon-success" v-if="item.isFinish" style="color: rgb(134, 204, 115)"></i>
        </li>
      </div>

      <li :class="{ 'is-active': 'GoodsInfo' === $route.name }" @click="tabsClick('GoodsInfo')">
        货物信息
      </li>
      <li :class="{ 'is-active': 'AirTransportMblList' === $route.name }" @click="tabsClick('AirTransportMblList')" v-if="['st05', 'st13', 'st14', 'st20'].includes(serviceType)">
        提单
      </li>
      <!-- <li :class="{ 'is-active': 'AirTransportHblList' === $route.name }" @click="tabsClick('AirTransportHblList')" v-if="['st05','st13','st20'].includes(serviceType) && showBlTable&&airOrderInfo&&airOrderInfo.billSplitNum&&airOrderInfo.billSplitNum>0">
        分单
      </li> -->
      <li :class="{ 'is-active': 'OrderFee' === $route.name }" @click="tabsClick('OrderFee')">
        费用
      </li>
      <!-- <li :class="{ 'is-active': 'AirOrderFee' === $route.name }" @click="tabsClick('AirOrderFee')">费用</li> -->
      <li :class="{ 'is-active': 'AirFileList' === $route.name }" @click="tabsClick('AirFileList')">
        附件
      </li>
      <li v-if="$route.query.showRelate" :class="{ 'is-active': 'AirRelateOrder' === $route.name }" @click="tabsClick('AirRelateOrder')">
        关联订单
      </li>
      <div v-if="userEditRoles.length>1 && !jointShow" class="role-select">
        <RoleSwitch />
      </div>
    </ul>
  </div>
</template>
<script>
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import store from '@/store'
import { mapState } from 'vuex'
import RoleSwitch from './roleSwitch2.vue'
const menus = [
  {
    key: 'AirTransportOrderDetail',
    value: '订单详情'
  }
]
export default {
  mixins: [orderMixin],
  data() {
    return {
      roleValue: '', // 当前角色
      serviceMenus: [],
      menus: [],
      childOrderList: [], // 关联子订单
      cTimestamp: 0
    }
  },
  props: {
    serviceType: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },
  created() {
    this.cTimestamp = new Date().getTime()
    this.initMenus()
    if (this.$route.name === 'OrderFee') {
      this.getOrderInfo()
    }
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
      this.activityKey = this.$route.name
      this.initMenus()
    }
  },
  mounted() {
    this.getServiceMenu(this.airOrderInfo)
  },
  computed: {
    ...mapState('order', ['custInfoObj']),
    ...mapState({
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      userId: (state) => state.user.userId,
      roleCodesOptions: (state) =>
        state.airTransport.orderList.roleCodesOptions,
      userEditRoles: (state) => state.airTransport.orderList.userEditRoles,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole
    }),
    seviceIsDisabledEdit() {
      // 未审核前服务项不能维护
      if (
        ['draft', 'refuse', 'submit'].includes(this.airOrderInfo.orderStatus)
      ) {
        return true
      } else {
        return false
      }
    },
    showHblTable() {
      return this.airOrderInfo && this.airOrderInfo.billSplitNum > 0
        ? true
        : false
    },

    isOp() {
      return this.userEditRoles.includes('op')
      // return this.ordDetRole === 'op'
    },
    isCs() {
      return this.userEditRoles.includes('cs')
      // return this.ordDetRole === 'ecs'
    },
    isEcs() {
      return this.userEditRoles.includes('ecs')
      // return this.ordDetRole === 'ecs'
    },
    // 是否协同单
    jointShow() {
      let { source, jointNo } = this.$route.query
      return source === 'jointList' || jointNo
    }
  },
  components: {
    RoleSwitch
  },
  watch: {
    airOrderInfo: {
      handler(newVal, oldVal) {
        this.getServiceMenu(newVal)
      },
      deep: true
    }
  },
  methods: {
    getServiceMenu(data) {
      console.log('🚀 ~ data', data)
      if (!data || !Object.keys(data).length) return (this.serviceMenus = [])
      let allServices = JSON.parse(
        JSON.stringify(store.state.airTransport.allServicesMenu)
      )
      let { serviceList, serviceInfoList } = data

      this.serviceMenus = allServices.filter((item) => {
        return (
          (item.code && serviceList.includes(item.code)) ||
          (item.child &&
            item.child.some((ele) => serviceList.includes(ele.code)))
        )
      })

      this.serviceMenus = this.serviceMenus.filter(
        (item) => item.component !== 'AirTransportOrderBook'
      )
      // 出口隐藏特定服务项
      // this.serviceMenus = this.serviceMenus.filter(item => !(data.businessType === 'air_export' && ['AirChangeDocument', 'AirPodClearance', 'AirPodWarehouseIng'].includes(item.component)))

      this.serviceMenus.map((item) => {
        if (item.child && item.child.length) {
          item.child = item.child.filter((ele) => {
            return serviceList.includes(ele.code)
          })
          // 是否需要取消服务项的协同
          item.isCancelService = item.child.some((ele) => {
            let tempItem = serviceInfoList.filter(
              (o) => o.serviceCode === ele.code
            )
            return (
              tempItem && tempItem.length && tempItem[0].cancelStatus === 'INIT'
            )
          })
          item.isCancelApply = item.child.some((ele) => {
            let tempItem = serviceInfoList.filter(
              (o) => o.serviceCode === ele.code
            )
            return (
              tempItem &&
              tempItem.length &&
              tempItem[0].cancelApplyStatus === 'applied'
            )
          })
          item.isFinish = item.child.every((ele) => {
            let tempItem = serviceInfoList.find(
              (o) => o.serviceCode === ele.code
            )
            return tempItem && tempItem.serviceStatus === 'finish'
          })
          item.isEdit = item.child.every((ele) => {
            let tempItem = serviceInfoList.find(
              (o) => o.serviceCode === ele.code
            )
            return tempItem && tempItem.isEdit === 'y'
          })
          item.isJoint = item.child.every((ele) => {
            let tempItem = serviceInfoList.find(
              (o) => o.serviceCode === ele.code
            )
            return tempItem && tempItem.isJoint === 'y'
          })
        } else {
          let serviceInfoItem = serviceInfoList.filter(
            (ele) => ele.serviceCode === item.code
          )
          // 是否需要取消服务项的协同
          item.isCancelService =
            serviceInfoItem &&
            serviceInfoItem.length &&
            serviceInfoItem[0].cancelStatus === 'INIT'
          item.isCancelApply =
            serviceInfoItem &&
            serviceInfoItem.length &&
            serviceInfoItem[0].cancelApplyStatus === 'applied'
          item.isFinish =
            serviceInfoItem &&
            serviceInfoItem.length &&
            serviceInfoItem[0].serviceStatus === 'finish'
          item.isEdit =
            serviceInfoItem &&
            serviceInfoItem.length &&
            serviceInfoItem[0].isEdit === 'y'
          item.isJoint =
            serviceInfoItem &&
            serviceInfoItem.length &&
            serviceInfoItem[0].isJoint === 'y'
        }
      })
      console.log('this.serviceMenus', this.serviceMenus)
    },
    handleClickMenu(item) {
      if (item.component === this.$route.name) return
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$emit('routerPush', {
        name: item.component,
        query: this.$route.query
      })
    },
    initMenus() {
      this.menus = [...menus]
    },
    // 点击切换顶部tabs
    tabsClick(activityKey) {
      // if (
      //   activityKey === 'AirTransportMblList' ||
      //   activityKey === 'AirTransportHblList'
      // ) {
      //   // 提单需要先完成订舱操作，不然提单需要的实际航程（订舱接口）没有
      //   if (
      //     !this.airOrderInfo.realVoyageList ||
      //     !this.airOrderInfo.realVoyageList[1] ||
      //     !this.airOrderInfo.realVoyageList[1]
      //       .carrierSupplierId
      //   ) {
      //     this.$message({
      //       message: `当前订舱状态是'未订舱'，不能进行提单操作`,
      //       type: 'warning'
      //     })
      //     return false
      //   }
      // }
      let { query, params } = this.$route
      let { orderNo } = query
      query = { ...query, businessBroad: 'air' }
      if (activityKey === this.$route.name) return
      let createOrderStr = sessionStorage.getItem('createAirOrderStr')
      // 创建订单时点击其他托书信息，集装箱等tab时提示先保存
      if (
        this.$route.query.action === 'add' &&
        createOrderStr &&
        activityKey !== 'AirTransportOrderDetail'
      ) {
        return this.$message({
          type: 'warning',
          message: '请先保存或提交订单',
          duration: 1000,
          onClose: () => {}
        })
      }
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({
        name: activityKey,
        params: {
          orderNo
        },
        query
      })
    }
  }
}
</script>
<style lang="scss">
.top-nav-tabs {
  position: relative;
  margin: 0;
  background-color: #fff;
  height: 24px;
  line-height: 24px;
  overflow: hidden;
  padding-right: 200px;
  .role-select {
    position: absolute;
    top: 0;
    right: 12px;
  }
  &:before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: #e9e9e9;
    height: 1px;
  }
  li {
    float: left;
    font-size: 14px;
    line-height: 24px;
    height: 24px;
    text-align: center;
    padding: 0 30px;
    position: relative;
    color: #3e80f5;
    cursor: pointer;
    &:before {
      content: '';
      position: absolute;
      display: block;
      height: 16px;
      width: 1px;
      right: -1px;
      top: 5px;
      background-color: #3e80f5;
    }
    &.is-active {
      color: #fff;
      background-color: #3e80f5;
      &:before {
        content: '';
        position: absolute;
        display: block;
        height: 16px;
        left: 1px;
        right: 0;
        top: 8px;
      }
      .icon-joint {
        color: #fff;
        border-color: #fff;
      }
    }
    .service-name {
      float: left;
    }
    .icon-warning {
      float: left;
      margin-top: 5px;
    }
  }
}
.top-nav-tabs-left {
  li {
    &:before {
      content: '';
      position: absolute;
      display: block;
      height: 16px;
      width: 1px;
      left: 0;
      top: 5px;
      background-color: #3e80f5;
    }
  }
}
</style>
