<template>
	<div class="edit-container order-book fullWrap" id="orderBook">
		<div class="order-container">
			<!-- 协同撤回申请提示 -->
			<CancelApplyAlert v-if="jointShow && isCancelApply && serviceCode !== 'book'" :serviceInfo="serviceInfo" :serviceList="orderInfo.serviceList" @callback="getOrderInfo" />
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="'OrderBook'" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container">
							<ServiceCustInfo :orderInfo="orderInfo" :serviceCode="getCurrentServiceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div class="component-cont inner">
								<el-tabs v-model="activityKey" @tab-click="handleClick" class="" v-if="orderBookMenu.length">
									<el-tab-pane v-for="item in orderBookMenu" :label="item.value" :name="item.key" :key="item.key">
										<span slot="label">
											<i class="icon-warning" v-if="item.isCancelApply" style="margin-right: 5px"></i>
											<i class="icon-joint" v-if="item.isJoint">协</i>
											{{ item.value }}
										</span>
									</el-tab-pane>
								</el-tabs>
								<component :is="activityKey" :orderInfoData="orderInfo" :tabMenus="orderBookMenu"></component>
								<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="getCurrentServiceCode" /> -->
							</div>
						</div>
						<JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="getCurrentServiceCode" @callback="jointWorkAssignCallback" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { orderInfo, orderJointInfo } from '@/api/order/list'
import { getServicChilds, getDictLabel, getServiceCode } from '@/utils/tools'
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
			serviceCode: '',
			routeName: 'OrderBook',
			orderInfo: {}
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
			history.pushState(null, null, document.URL);
			window.addEventListener('popstate', this.browserBack, false);
		}
	},
	destroyed(){
  	window.removeEventListener('popstate', this.browserBack, false);
	},
	computed: {
		getCurrentServiceCode() {
			let find = this.orderBookMenu.find(item => {
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
		JointWorkAssign,
		Book,
		Bl,
		Vgm,
		Dangerous,
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
		...mapMutations('order', ['setServiceList', 'setServiceInfoList']),
		// 获取订单详情
		getOrderInfo() {
			let { source, orderNo, jointNo } = this.$route.query
			if (jointNo) {
				return orderJointInfo({ jointNo: jointNo }).then(res => {
					this.orderInfo = res.data
					this.setServiceList(res.data.serviceList)
					this.setServiceInfoList(res.data.serviceInfoList)
					this.getInit()
				})
			}
			orderInfo({ orderNo: orderNo }).then(res => {
				this.orderInfo = res.data
				this.setServiceList(res.data.serviceList)
				this.setServiceInfoList(res.data.serviceInfoList)
				this.getInit()
			})
		},
		getInit() {
			if (!this.orderInfo) return
			let { name } = this.$route
			let { serviceList, serviceInfoList } = this.orderInfo
			this.orderBookMenu = getServicChilds(name, serviceList, serviceInfoList)
			if (!this.activityKey) this.activityKey = getServicChilds(name, serviceList, serviceInfoList)[0].key
			if (!this.serviceCode) this.serviceCode = getServiceCode(name, serviceList)
			sessionStorage.setItem('serviceCode', this.serviceCode)
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
			// 修改全局serviceType的值
			this.serviceCode = this.orderBookMenu.find(item => item.key === this.activityKey).code
			this.$store.dispatch('order/changeServiceType', this.serviceCode)
			this.handleIsCancelApply(this.serviceCode) // 获取协同服务项取消申请状态
		},
		jointWorkAssignCallback() {
			this.getJointServiceWorkList(this.serviceCode)
		}
		// handleToRoute({name, query}) {
		//   this.routerPush(name, query)
		// }
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
</style>
