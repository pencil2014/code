<template>
	<div class="edit-container order-book fullWrap" id="" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div class="order-container">
			<div id="alertCont">
				<!-- 发起取消提示，待协同单确认是否取消协同 -->
				<el-alert type="warning" :closable="false" class="orange" v-if="isOp && ['orderList', 'whOrderList'].includes(oQuery.source) && ['CANCEL', 'BREAK'].includes(orderInfo.cancelJointHandleStatus)">
					<template slot="title">
						<span class="txt">订单已发起{{ orderInfo.cancelJointHandleStatus === 'BREAK' ? '终止' : '取消' }}申请，待协同单确认是否取消协同。</span>
					</template>
				</el-alert>
				<!-- 协同单服务项是否取消协同的提示(进口订单详情不显示这个提示，它在topNav的cancelJointAlert组件里有做处理) -->
				<el-alert
					type="warning"
					:closable="false"
					class="orange"
					v-if="['jointList', 'whJointList'].includes(oQuery.source) && ['CANCEL', 'BREAK'].includes(orderInfo.cancelJointHandleStatus) && !['st09', 'st10', 'st11', 'st12'].includes(orderInfo.serviceType)"
				>
					<template slot="title">
						<span class="txt">主单已发起{{ orderInfo.cancelJointHandleStatus === 'BREAK' ? '终止' : '取消' }}，请确认是否要取消协同。</span>
					</template>
				</el-alert>
				<!-- <CancelJointAlert v-if="$route.query.source === 'jointList' && isCancelJointAlert" @getInfo="getOrderInfo" /> -->
				<!-- 订单已取消提示 -->
				<!-- 海运单是操作显示此提示，报关单是关务操作显示此提示 -->
				<CancelAlert v-if="(isOp || isCop) && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
				<!-- 订单拒绝提示 -->
				<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
				<!-- 进口拼箱的代订舱撤回申请审核 -->
				<ProxyCancelApplyAlert v-if="orderInfo.businessType === 'ship_import_lcl' && (isBkg || isOp) && proxyCancelApplyParams.submitCancelStatus === 'APPLIED'" :params="proxyCancelApplyParams" @getInfo="getOrderInfo" />
				<!-- 套约提示信息 -->
				<ContractTempPop :contractTempInfo="contractTempInfo" v-if="isAc && Object.keys(contractTempInfo).length" />
				<arkReply v-if="isOp" />
			</div>
			<div class="tabs-container relative">
				<RoleSwitchAuth @callback="initQuery" v-if="!jointShow" :serviceType="orderInfo.serviceType" />
				<TopNav ref="topNav" :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="'OrderDetail'" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<!-- st15,st16,st17,st18,st19已废弃 -->
						<!-- 海运出口整箱-委托订舱, 散杂滚装-委托订舱 -->
						<OrderDetail :orderInfo="orderInfo" v-if="['st01', 'st15', 'st24'].includes(orderInfo.serviceType)" @getLeftServiceList="getLeftServiceList" @getInfo="getOrderInfo" />
						<!-- 海运出口整箱-客户自订, 散杂滚装-客户自订 -->
						<SelfOrderDetail :orderInfo="orderInfo" v-if="['st02', 'st16', 'st17', 'st25'].includes(orderInfo.serviceType)" @getLeftServiceList="getLeftServiceList" @getInfo="getOrderInfo" />
						<!-- 海运出口拼箱-委托订舱 -->
						<LclDetail :orderInfo="orderInfo" v-if="['st03', 'st18'].includes(orderInfo.serviceType)" @getLeftServiceList="getLeftServiceList" @getInfo="getOrderInfo" />
						<!-- 海运出口拼箱-客户自订 -->
						<LclSelfDetail :orderInfo="orderInfo" v-if="['st04', 'st19'].includes(orderInfo.serviceType)" @getLeftServiceList="getLeftServiceList" @getInfo="getOrderInfo" />
						<!-- 海运进口拼箱-委托订舱,客户自订 -->
						<LclDetailImport :orderInfo="orderInfo" v-if="['st11', 'st12'].includes(orderInfo.serviceType)" @getLeftServiceList="getLeftServiceList" @getInfo="getOrderInfo" />
						<!-- 海运进口整箱-委托订舱、客户自订 -->
						<ImportOrderDetail :orderInfo="orderInfo" v-if="['st09', 'st10'].includes(orderInfo.serviceType)" @getLeftServiceList="getLeftServiceList" @getInfo="getOrderInfo" @getServiceList="getServiceList" />
						<!-- 海外仓--跨境电商海外仓 -->
						<WhOrderDetail :orderInfo="orderInfo" v-if="['st23'].includes(orderInfo.serviceType)" @getLeftServiceList="getLeftServiceList" @getInfo="getOrderInfo" @getServiceList="getServiceList" />
						<!-- 报关单，出口报关、进口报关、进口和出口报关 -->
						<CtOrderDetail :orderInfo="orderInfo" v-if="['st26', 'st27', 'st28'].includes(orderInfo.serviceType)" @getLeftServiceList="getLeftServiceList" @getInfo="getOrderInfo" @getServiceList="getServiceList" />
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
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { orderInfo, orderJointInfo, orderMainCustCheck } from '@/api/order/list'
import { getDictMap, getServicChilds } from '@/utils/tools'
// import CancelJointAlert from './components/cancelJointAlert'
import CancelAlert from './components/cancelAlert'
import RefuseAlert from './components/refuseAlert'
import RefuseJoint from './components/refuseJoint'
import ContractTempPop from '../components/contractInfoPop'
import arkReply from './components/arkReply'
import OrderDetail from './orderDetail'
import SelfOrderDetail from './selfOrderDetail'
import LclDetail from './lcl/lclDetail'
import ImportOrderDetail from './shipImport/orderDetail'
// import ImportLclOrderDetail from './shipImport/lclDetail'
import LclDetailImport from './lclImport/lclDetail'
import TopNav from './components/topNav'
import LeftNav from './components/leftNav'
import RoleSwitchAuth from './components/roleSwitch2'
import LclSelfDetail from './lcl/lclSelfDetail'
import WhOrderDetail from './wh/orderDetail'
import CtOrderDetail from './customs/orderDetail'
import ProxyCancelApplyAlert from '@/views/order/order/bookShip/components/proxyCancelApplyAlert'
import { mapState } from 'vuex'
export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			oQuery: this.$route.query,
			activityKey: ['orderList', 'planOrderList', 'whOrderList', ''].includes(this.$route.query.source) ? 'OrderDetail' : ['jointList', 'whJointList'].includes(this.$route.query.source) ? 'JointOrderDetail' : '',
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
		this.getContractInfo()
	},
	activated() {
		console.log('this.orderInfo', this.orderInfo)
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
		...mapState({
			userEditRoles: state => state.order.orderList.userEditRoles
		})
	},
	watch: {},
	components: {
		// CancelJointAlert,
		CancelAlert,
		RefuseAlert,
		RefuseJoint,
		OrderDetail,
		arkReply,
		SelfOrderDetail,
		LclDetail,
		ImportOrderDetail,
		LclDetailImport,
		TopNav,
		LeftNav,
		RoleSwitchAuth,
		LclSelfDetail,
		WhOrderDetail,
		ContractTempPop,
		ProxyCancelApplyAlert,
		CtOrderDetail
	},
	methods: {
		initQuery() {},
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
		},
		getServiceList() {
			orderInfo({ orderNo: this.$route.query.orderNo }).then(res => {
				this.$set(this.orderInfo, 'serviceList', res.data.serviceList)
			})
		},
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
