<template>
	<div class="edit-container order-book fullWrap" id="" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="order-container">
			<div id="alertCont">
				<!-- 订单已取消提示 -->
				<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
				<!-- 订单拒绝提示 -->
				<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			</div>
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="activityKey" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<!-- 海运出口拼箱-委托订舱 -->
						<LclDetail :orderInfo="orderInfo" v-if="['st03', 'st18'].includes(orderInfo.serviceType)" @getInfo="getOrderInfo" />
						<!-- 海运出口拼箱-客户自订 -->
						<LclSelfDetail :orderInfo="orderInfo" v-if="['st04', 'st19'].includes(orderInfo.serviceType)" @getInfo="getOrderInfo" />
						<!-- 海运进口拼箱 -->
						<LclDetailImport :orderInfo="orderInfo" v-if="['st11', 'st12'].includes(orderInfo.serviceType)" @getLeftServiceList="getLeftServiceList" @getInfo="getOrderInfo" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { orderInfo, orderJointInfo } from '@/api/order/list'
import { getDictMap, getServicChilds } from '@/utils/tools'
import CancelAlert from '@/views/order/order/orderList/components/cancelAlert'
import RefuseAlert from '@/views/order/order/orderList/components/refuseAlert'
import RefuseJoint from '@/views/order/order/orderList/components/refuseJoint'
import LclDetail from './detail'
import LclSelfDetail from './selfDetail'
// import TopNav from '@/views/order/order/orderList/components/topNav'
// import LeftNav from '@/views/order/order/orderList/components/leftNav'
import LclDetailImport from '@/views/order/order/orderList/lclImport/lclDetail'

export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			oQuery: this.$route.query,
			activityKey: 'LclOrderDetail',
			// orderInfo: {},
			cTimestamp: 0
		}
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.getOrderInfo()
		// console.log('created', this.orderInfo);
	},
	activated() {
		let timestamp = new Date().getTime()
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.isCancel = false
			this.isRefuse = false
			this.orderInfo = {}
			this.getOrderInfo()
			// console.log('activated', this.orderInfo)
		}
	},
	mounted() {},
	computed: {},
	watch: {},
	components: {
		CancelAlert,
		RefuseAlert,
		RefuseJoint,
		LclDetail,
		LclSelfDetail,
		TopNav,
		LeftNav,
		LclDetailImport
	},
	methods: {
		getLeftServiceList() {
			let { orderNo, jointNo } = this.$route.query
			if (jointNo) {
				return orderJointInfo({ jointNo: jointNo }).then(res => {
					this.orderInfo = res.data
				})
			}
			orderInfo({ orderNo: orderNo }).then(res => {
				this.orderInfo = res.data
			})
		}
	}
}
</script>
<style lang="scss">
@import '@/views/order/order/less/index.scss';
.order-book .edit-row {
	margin: 0 !important;
	.row-form {
		padding: 0 !important;
	}
}
</style>
