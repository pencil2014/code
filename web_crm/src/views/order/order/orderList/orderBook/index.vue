<template>
	<div class="edit-container order-book fullWrap" id="orderBook">
		<div class="order-container">
			<!-- 协同撤回申请提示 -->
			<CancelApplyAlert v-if="jointShow && isCancelApply && serviceCode !== 'book'" :serviceInfo="serviceInfo" :serviceList="orderInfo.serviceList" @callback="getOrderInfo" />
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container relative">
				<RoleSwitchAuth />
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="'OrderBook'" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container" id="container" @scroll="handleScroll">
							<ServiceCustInfo :orderInfo="orderInfo" :serviceCode="getCurrentServiceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div class="component-cont inner">
								<el-tabs v-model="activityKey" @tab-click="handleClick" class="" v-if="orderBookMenu.length || isShowDangerous">
									<el-tab-pane v-for="item in orderBookMenu" :label="item.value" :name="item.key" :key="item.key">
										<span slot="label">
											<i class="icon-warning" v-if="item.isCancelApply" style="margin-right: 5px"></i>
											<i class="icon-joint" v-if="item.isJoint && $route.query.source !== 'jointList'">协</i>
											{{ item.value }}
										</span>
									</el-tab-pane>
									<el-tab-pane v-if="isShowDangerous" label="海事申报" :name="'dangerous'" :key="'dangerous'">
										<span slot="label">海事申报</span>
									</el-tab-pane>
									<el-tab-pane v-if="isShowVgm" label="VGM" :name="'vgm'" :key="'vgm'">
										<span slot="label">VGM</span>
									</el-tab-pane>
								</el-tabs>
								<component :is="activityKey" :orderInfoData="orderInfo" :tabMenus="orderBookMenu" :saveBarFixed="saveBarFixed"></component>
								<OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="getCurrentServiceCode" />
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
import RoleSwitchAuth from '../components/roleSwitch2'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
// import TopNav from '../components/topNav'
// import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
// import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
import Book from './components/book'
// import Bl from './components/bl'
import Vgm from './components/vgm'
import Dangerous from './components/dangerous'
import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'

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
			orderInfo: {},
			saveBarFixed: false
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
	computed: {
		getCurrentServiceCode() {
			let find = this.orderBookMenu.find(item => {
				return item.key === this.activityKey
			})
			return find && find.code
		},
		isShowDangerous() {
			//property dangerous
			let list = this.orderInfo.cargoList ? this.orderInfo.cargoList : []
			let result = list.some(el => el.property === 'dangerous')
			return result
		},
		isShowVgm() {
			let result = !this.isBulkRo && this.orderBookMenu.some(el => el.code === 'proxy_book' || el.code === 'book')
			return result
		},
		// 散杂滚装
		isBulkRo() {
			return this.orderInfo.businessType === 'ship_bulk_ro'
		}
	},
	components: {
		RoleSwitchAuth,
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
		OneServiceFee
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
		handleScroll() {
			// let saveBarDom = document.querySelector("#saveBar")
			let contDom = document.querySelector('#container')
			let tableCont = document.querySelector('#tableCont')
			let scrollTop = contDom.scrollTop
			let tableContHeight = tableCont.offsetHeight
			if (scrollTop > tableContHeight + 36 + 8 + 24) {
				// table高度和custInfo组件的高度及tab切换的高度
				this.saveBarFixed = true
			} else {
				this.saveBarFixed = false
			}
		},
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
			let { serviceList, serviceInfoList, businessType, serviceType } = this.orderInfo
			// 海运进口整箱业务-委托订舱不做vmg，客户自订没有vgm服务项，拼箱业务-委托订舱不做vgm
			if (['st09', 'st10', 'st12'].includes(serviceType)) {
				serviceList = serviceList.filter(item => !['vgm'].includes(item))
				serviceInfoList = serviceInfoList.filter(item => !['vgm'].includes(item.code))
			}
			// 海运进口拼箱-委托订舱业务不需显示vgm，危险品
			if (serviceType === 'st11') {
				serviceList = serviceList.filter(item => !['vgm', 'dangerous'].includes(item))
				serviceInfoList = serviceInfoList.filter(item => !['vgm', 'dangerous'].includes(item.code))
			}
			this.orderBookMenu = getServicChilds(name, serviceList, serviceInfoList)
			let serviceFirstItem = getServicChilds(name, serviceList, serviceInfoList)[0]
			let toTab = this.$route.query.toTab
			if (!this.activityKey) {
        if (toTab === 'vgm') {
          this.activityKey = 'vgm'
				}else if (serviceFirstItem) {
					this.activityKey = serviceFirstItem.key
				} else {
					this.activityKey = 'dangerous'
				}
			}
			if (!this.serviceCode) this.serviceCode = serviceFirstItem ? getServiceCode(name, serviceList) : ''
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
			this.serviceCode = this.orderBookMenu.find(item => item.key === this.activityKey) ? this.orderBookMenu.find(item => item.key === this.activityKey).code : ''
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
