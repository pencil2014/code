<template>
	<div class="edit-container order-book fullWrap" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div style="margin:0;" class="order-container">
			<div id="alertCont">
				<!-- 发起取消提示，待协同单确认是否取消协同 -->
				<el-alert type="warning" :closable="false" class="orange" v-if="isBkg && $route.query.source === 'orderList' && orderInfo.main && ['CANCEL', 'BREAK'].includes(orderInfo.main.cancelJointHandleStatus)">
					<template slot="title">
						<span class="txt">订单已发起{{orderInfo.main.cancelJointHandleStatus === 'BREAK' ? '终止' : '取消'}}申请，待协同单确认是否取消协同。</span>
					</template>
				</el-alert>
				<!-- 协同单服务项是否取消协同的提示 -->
				<CancelJointAlert v-if="$route.query.source === 'jointList' && isCancelJointAlert" @getInfo="getOrderInfo" />
				<!-- 订单已取消提示 -->
				<CancelAlert v-if="isBkg && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
				<!-- 商务拒绝提示 -->
				<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
				<!-- bkg拒绝提示 -->
				<RefuseAlert v-if="(isBd || isPricing) && isBkgRefuse" :refuseReason="bkgRefuseReason" />

				<!-- 海外客服 ecs -->
				<!-- <OverseasAlert v-if="isEcs && overseasTipMsg" :overseasTipMsg="overseasTipMsg" @updateOverseas="getOverseasTips" @getInfo="getOrderInfo"/>
				<OverseasAlertOp v-if="!isEcs && isBkg && overseasTipMsg" /> -->
			</div>

			<div class="tabs-container">
				<TopNav :custid="orderInfo.main && orderInfo.main.custid" @getInfo="getOrderInfo" :serviceType="orderInfo.main && orderInfo.main.serviceType" :activityKey="activityKey" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="'OrderDetail'" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<!-- 铁路出口整箱 -->
						<OrderDetail :orderInfo="orderInfo" v-if="orderInfo.main && orderInfo.main.serviceType === 'st07'" @getInfo="getOrderInfo" />
						<!-- 铁路出口拼箱 -->
						<LclDetail :orderInfo="orderInfo" v-if="orderInfo.main && orderInfo.main.serviceType === 'st08'" @getInfo="getOrderInfo" />
					</div>
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
import { orderMixin } from '@/views/railway/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import CancelJointAlert from './components/cancelJointAlert'
import CancelAlert from './components/cancelAlert'
import RefuseAlert from './components/refuseAlert'
import OrderDetail from './orderDetail'
import LclDetail from './lcl/lclDetail'
import TopNav from './components/topNav'
import { mapState } from 'vuex'
import OverseasAlert from '@/views/order/order/orderList/components/overseasAlert'
import OverseasAlertOp from '@/views/order/order/orderList/components/overseasAlertOp'
import { overseasTips, orderMainCustCheck } from '@/api/order/list'
import LeftNav from './components/leftNav'
export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			oQuery: this.$route.query,
			activityKey: ['orderList','jointList'].includes(this.$route.query.source) ? 'RailwayOrderDetail' : '',
			cTimestamp: 0,
			dialogObj: {
				visible: false,
				tip: ''
			}
		}
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.getCustCheck()
		this.getOrderInfo()
		// this.getOverseasTips()
	},
	activated() {
		let timestamp = new Date().getTime()
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.isCancel = false
			this.isRefuse = false
			this.orderInfo = {}
			this.getCustCheck()
			this.getOrderInfo()
		}
		this.getInit(this.orderInfo)
	},
	mounted() {},

	computed: {
		...mapState('railway', ['ordDetRole', 'userEditRoles', 'overseasTipMsg']),
		isOp() {
			return this.ordDetRole === 'op'
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isBd() {
			return this.ordDetRole === 'bd'
		},
		isPricing() {
			return this.ordDetRole === 'pricing'
		},
		isEpricing() {
			return this.userEditRoles.includes('epricing')
		},
		isEcs() {
			return this.userEditRoles.includes('ecs')
		}
	},
	watch: {},
	components: {
		CancelJointAlert,
		CancelAlert,
		RefuseAlert,
		OrderDetail,
		LclDetail,
		TopNav,
		OverseasAlert,
		OverseasAlertOp,
		LeftNav
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
		},
		getOverseasTips() {
			overseasTips({ orderNo: this.$route.query.orderNo }).then(res => {
				if (res.data) {
					this.$store.dispatch('railway/setOverseasTipMsg', res.data)
				} else {
					this.$store.dispatch('railway/setOverseasTipMsg', '')
				}
			})
		},
		initQuery() {}
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
