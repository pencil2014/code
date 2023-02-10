<template>
	<div class="edit-container order-book fullWrap" id="fume">
		<div class="order-container">
			<!-- 协同撤回申请提示 -->
			<CancelApplyAlert v-if="jointShow && isCancelApply && serviceCode !== 'book'" :serviceInfo="serviceInfo" :serviceList="orderInfo.serviceList" @callback="getOrderInfo" />
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="routeName" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container" id="container" @scroll="handleScroll">
							<ServiceCustInfo :orderInfo="orderInfo" :serviceCode="getCurrentServiceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div class="component-cont">
								<div class="ship-cont">
									<Fume  :orderInfo="orderInfo"  :saveBarFixed="saveBarFixed"></Fume>
								</div>
							</div>
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="getCurrentServiceCode" /> -->
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
import { getServicChilds, getServiceCode } from '@/utils/tools'
import { orderInfo, orderJointInfo } from '@/api/order/list'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import Fume from '@/views/order/order/orderList/inspectionAndDetection/fume'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'

export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			checkList: [],
			oQuery: this.$route.query,
			serviceCode: 'fume',
			routeName: 'Fume',
			orderInfo: {},
			saveBarFixed: false
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
    if (this.jointShow) {
      this.getJointServiceWorkList(this.serviceCode)
    }
	},
	destroyed() {
		window.removeEventListener('popstate', this.browserBack, false)
	},
	computed: {
		getCurrentServiceCode() {
			return 'fume'
		}
	},
	components: {
		CancelApplyAlert,
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		ServiceCustInfo,
		Fume,
		JointWorkAssign,
		// OneServiceFee
	},
	props: {},
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
			let { serviceList, serviceInfoList } = this.orderInfo
			sessionStorage.setItem('serviceCode', this.serviceCode)
			// 存储客户id
			let cust = {
				custid: this.orderInfo.custid,
				custName: this.orderInfo.custName,
				custIntrustNo: this.orderInfo.custIntrustNo,
				businessType: this.orderInfo.businessType,
				serviceType: this.orderInfo.serviceType
			}
			sessionStorage.setItem('custStr', JSON.stringify(cust))
			this.handleIsCancelApply(this.serviceCode) // 获取协同服务项取消申请状态
			// 获取业务发起取消的订单的取消原因备注等信息
			if (this.orderInfo.cancelApplyStatus === 'applied') {
				this.getCancel(this.orderInfo)
			}
			// 获取已拒绝的信息
			if (this.orderInfo.orderStatus === 'refuse') {
				this.getRefuse(this.orderInfo)
			}
			this.getUserEditRoles(this.orderInfo)
		},
		jointWorkAssignCallback() {
			this.getJointServiceWorkList(this.serviceCode)
		}
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
#fume .component-cont {
	padding: 10px 0;
}
.inspection-menu-checkbox{
	padding-left: 20px;
	display: flex;
	align-items: center;
	.menu-title{
		margin-right: 10px;
	}
}
</style>
