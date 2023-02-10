<template>
  <div class="edit-container order-book fullWrap air-detail" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
    <div class="order-container">
      <!-- 发起取消提示，待协同单确认是否取消协同 -->
      <el-alert type="warning" :closable="false" class="orange" v-if="isOp && $route.query.source === 'orderList' && ['CANCEL', 'BREAK'].includes(airOrderInfo.cancelJointHandleStatus)">
        <template slot="title">
          <span class="txt">订单已发起{{airOrderInfo.cancelJointHandleStatus === 'BREAK' ? '终止' : '取消'}}申请，待协同单确认是否取消协同。</span>
        </template>
      </el-alert>
      <!-- 协同单服务项是否取消协同的提示 -->
      <!-- <el-alert type="warning" :closable="false" class="orange" v-if="oQuery.source === 'jointList' && ['CANCEL','BREAK'].includes(orderInfo.cancelJointHandleStatus)">
        <template slot="title">
          <span class="txt">主单已发起取消，请确认是否要取消协同。</span>
        </template>
      </el-alert> -->
      <!-- 协同单服务项是否取消协同的提示 -->
      <CancelJointAlert v-if="$route.query.source === 'jointList' && isCancelJointAlert" @getInfo="getOrderInfo" />
      <!-- 订单已取消提示 -->
      <CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
      <!-- 当前登录用户是建单人 -->
      <RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
      <!-- 协同撤回申请提示 -->
      <CancelApplyAlert v-if="jointShow && isCancelApply" :serviceInfo="serviceInfo" :serviceList="airOrderInfo.serviceList" @callback="getOrderInfo" />
      <!-- 订舱单拒绝提示 -->
      <RefuseAlertPricing v-if="isPricing && isRefusePricing" :refuseReason="refuseReasonPricing" />
      <div class="tabs-container">
        <TopNav v-if="airOrderInfo.serviceType" :serviceType="airOrderInfo.serviceType" :activityKey="activityKey" @routerPush="handleToRoute" />
        <div class="detail-container" style="width:100%">
          <router-view v-if="airOrderInfo && airOrderInfo.orderNo"></router-view>
        </div>
      </div>
    </div>
    <el-dialog 
			:visible.sync="dialogObj.visible" 
			width="500px" 
			title="该订单不允许任何操作" 
			:show-close="false" class="custCheck-dialog"
			:close-on-click-modal="false"
			:close-on-press-escape="false">
			<div class="cont">{{dialogObj.tip}}</div>
		</el-dialog>
  </div>
</template>
<script>
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { orderMainCustCheck } from '@/api/order/list'
import CancelJointAlert from './components/cancelJointAlert'
import CancelAlert from './components/cancelAlert'
import RefuseAlert from './components/refuseAlert'
import RefuseJoint from './components/refuseJoint'
import OrderDetail from './orderDetail'
import SelfOrderDetail from './selfOrderDetail'
import TopNav from './components/topNav'
import LeftNav from './components/leftNav'
import RefuseAlertPricing from '../bookShip/components/refuseAlert'
import { mapState } from 'vuex'
import CancelApplyAlert from './components/cancelApplyAlert'
export default {
  mixins: [orderMixin, routerMixin],
  data() {
    return {
      oQuery: this.$route.query,
      activityKey: 'AirTransportOrderDetail',
      cTimestamp: 0,
      orderNo: '',
      pricingIsRefuse: false,
      pricingRefuseReason: '',
      dialogObj: {
				visible: false,
				tip: ''
			}
    }
  },
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole,
      order: (state) => state.order,
      finance: (state) => state.finance,
      orderList: (state) => state.airTransport.orderList,
      userId: (state) => state.user.userId,
      roles: (state) => state.user.roles,
      airOrderInfo: (state) => state.airTransport.airOrderInfo || {},
      userEditRoles: (state) => state.airTransport.orderList.userEditRoles
    }),
    bdId() {
      let { workAssign } = this.airOrderInfo
      let bdItem = workAssign && workAssign.find((el) => el.jobCode === 'bd')
      if (bdItem && bdItem.employeeId) {
        return bdItem.employeeId
      }
      return ''
    },
    obdId() {
      let { workAssign } = this.airOrderInfo
      let obdItem = workAssign && workAssign.find((el) => el.jobCode === 'obd')
      if (obdItem && obdItem.employeeId) {
        return obdItem.employeeId
      }
      return ''
    },
    asstId() {
      let { workAssign } = this.airOrderInfo
      let asstItem =
        workAssign && workAssign.find((el) => el.jobCode === 'asst')
      if (asstItem && asstItem.employeeId) {
        return asstItem.employeeId
      }
      return ''
    },
    ecsId() {
      let { workAssign } = this.airOrderInfo
      let asstItem = workAssign && workAssign.find((el) => el.jobCode === 'ecs')
      if (asstItem && asstItem.employeeId) {
        return asstItem.employeeId
      }
      return ''
    },
    isOp() {
      return this.ordDetRole === 'op'
    },
    isBd() {
      if (this.userEditRoles.length === 0) {
        return (
          !this.isPricing &&
          (((this.roles.includes('bd') ||
            this.roles.includes('obd') ||
            this.roles.includes('asst')) &&
            (this.roles.includes('manager') || this.roles.includes('duty'))) ||
            this.bdId === this.userId ||
            this.obdId === this.userId ||
            this.asstId === this.userId ||
            !this.bdId)
        )
      } else {
        return this.ordDetRole === 'bd'
      }
    },
    isPricing() {
      if (
        this.userEditRoles.length === 1 &&
        this.userEditRoles[0] === 'pricing' &&
        this.ordDetRole === 'pricing'
      ) {
        return true
      }
      if (this.userEditRoles.length === 0) {
        if (this.roles.includes('pricing')) {
          if (['draft', 'refuse'].includes(this.airOrderInfo.orderStatus)) {
            if (
              this.userId == this.currentPricingId &&
              (this.bdId === this.userId ||
                this.obdId === this.userId ||
                this.asstId === this.userId ||
                !this.bdId)
            ) {
              // 草稿状态下，参与人商务是登录人,展示商务视图
              return true
            } else {
              // 有商务角色，但是参与人商务不是登录人，这是不需要他审核订单，也不展示商务视图
              return false
            }
          } else {
            // 其他状态
            if (
              this.userId == this.currentPricingId ||
              (this.roles.includes('pricing') &&
                (this.roles.includes('manager') || this.roles.includes('duty')))
            ) {
              // 如果登录人id是商务参与人
              return true
            } else if (
              this.userId == this.bdId ||
              this.userId == this.obdId ||
              this.userId == this.asstId
            ) {
              return false
            } else {
              return false
            }
          }
        } else {
          return false
        }
      } else {
        return this.ordDetRole === 'pricing'
      }
    }
  },
  created() {
    this.cTimestamp = new Date().getTime()
    this.getCustCheck()
    this.getOrderInfo()
  },
  activated() {
    // let timestamp = new Date().getTime()
    // if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
    //   this.orderNo = this.$route.query.orderNo
    //   this.isCancel = false
    //   this.isRefuse = false
    //   this.orderInfo = {}
    //   this.getOrderInfo()
    // }
  },
  mounted() {},
  watch: {
    $route() {
      this.getOrderInfo()
    }
  },
  components: {
    CancelJointAlert,
    CancelAlert,
    RefuseAlert,
    RefuseJoint,
    OrderDetail,
    SelfOrderDetail,
    // LclDetail,
    // LclSelfDetail,
    TopNav,
    LeftNav,
    RefuseAlertPricing,
    CancelApplyAlert
  },
  methods: {
    // 获取客户资质认证审核是否通过
		getCustCheck() {
			orderMainCustCheck({orderNo: this.$route.query.orderNo}).then(res => {
				if (res.code === 125059) {
					this.dialogObj = {
						visible: true,
						tip: res.msg
					}
				} else {
					this.dialogObj.visible = false
				}
			}).catch(err => {})
		}
  }
}
</script>
<style lang="scss">
@import '../less/index.scss';
.order-book .edit-row {
  margin: 0 !important;
  .row-form {
    padding: 0 !important;
  }
}
.custCheck-dialog {
	.el-dialog__header {
		background-color: #CD4130;
	}
	.cont {
		line-height: 20px;
		height: 100px; 
		text-align:left; 
		padding: 35px 0 0; 
		color: #CD4130;
	}
}
</style>
