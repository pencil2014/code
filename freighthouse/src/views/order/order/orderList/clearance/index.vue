<template>
	<div class="edit-container order-book fullWrap" id="clearance">
		<div class="order-container">
			<!-- 协同撤回申请提示 -->
			<CancelApplyAlert v-if="jointShow && isCancelApply && serviceCode !== 'book'" :serviceInfo="serviceInfo" :serviceList="orderInfo.serviceList" @callback="getOrderInfo" />
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container" id="container" @scroll="handleScroll">
							<ServiceCustInfo :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div class="order-cont">
								<div class="service-detail-cont">
									<div class="clearance-menu-checkbox">
										<span class="menu-title">请选择类型:</span>	
									  <el-checkbox v-for="item in menu" :key="item.value" v-model="item.chooseStatusModel" @change="menuChange($event, item)">{{item.label}}</el-checkbox>
			           	</div>
									<el-tabs v-model="activityKey"  v-if="tabsMenuList.length">
										<el-tab-pane v-for="item in tabsMenuList" :label="item.label" :name="item.component" :key="item.component">
											<span slot="label">
												<i class="icon-warning" v-if="item.isCancelApply" style="margin-right: 5px"></i>
												<i class="icon-joint" v-if="item.isJoint && $route.query.source !== 'jointList'">协</i>
												{{ item.label }}
											</span>
										</el-tab-pane>
									</el-tabs>
									<component v-if="tabsMenuList.length" :is="activityKey" :orderInfoData="orderInfo" :tabMenus="menu" :saveBarFixed="saveBarFixed"></component>
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
import { mapState, mapMutations } from 'vuex'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { getServicChilds, getServiceCode } from '@/utils/tools'
import { orderInfo, orderJointInfo, getSubTypeList, subTypeSave } from '@/api/order/list'
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
			menu: [],
			activityKey: '',
			serviceCode: 'pol_declaration',
			routeName: 'Clearance',
			orderInfo: {},
			saveBarFixed: false
		}
	},
	created() {
		this.getOrderInfo()
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
	props: {},
	computed: {
		tabsMenuList() {
       return this.menu.filter(item => {
				 return item.chooseStatus === 'y'
			 })
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
		...mapMutations('order', ['setServiceList', 'setServiceInfoList']),
		handleScroll() {
			// let saveBarDom = document.querySelector("#saveBar")
			let contDom = document.querySelector("#container")
			let tableCont = document.querySelector("#tableCont")
			let scrollTop  = contDom.scrollTop
			let tableContHeight = tableCont.offsetHeight
			if (scrollTop > tableContHeight + 36 +8 +24) {	// table高度和custInfo组件的高度及tab切换的高度
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
					this.$store.dispatch('order/setOrderInfoData', res.data)
					this.setServiceList(res.data.serviceList)
					this.setServiceInfoList(res.data.serviceInfoList)
					this.getInit()
				})
			}
			orderInfo({ orderNo: orderNo }).then(res => {
				this.orderInfo = res.data
				this.$store.dispatch('order/setOrderInfoData', res.data)
				this.setServiceList(res.data.serviceList)
				this.setServiceInfoList(res.data.serviceInfoList)
				this.getInit()
			})
		},
		getChooseStatus(value, list) {
			if (list && list.length) {
				let obj = list.find(item => {
					return item.typeCode === value
				})
				return (obj && obj.chooseStatus) || 'n'
			} else {
				return 'n'
			}
		},
		refreshsubType(init) {
			getSubTypeList({orderNo: this.$route.query.orderNo, serviceCodes: [this.serviceCode]})
			.then(res=> {
				console.log('服务项包含的tab数据：', this.dictMap['serviceCustoms'])
				let serviceTabList = this.dictMap['serviceCustoms']
				let { name } = this.$route
		  	let { serviceList, serviceInfoList } = this.orderInfo
				let initArr = getServicChilds(name, serviceList, serviceInfoList)
				let initObj = initArr.find(item => {
					return item.code === this.serviceCode
				})
				let chooseStatus = ''
				this.menu = []
				let componentObj = {
					'pol_declaration': 'Agent',
					'pol_inspection': 'Inspection'
				}
				serviceTabList.forEach(item => {
					 chooseStatus = this.getChooseStatus(item.value, res.data)
           this.menu.push({
						 ...item,
             chooseStatus,
						 code: this.serviceCode,
						 chooseStatusModel: chooseStatus === 'y',
						 component: componentObj[item.value],
						 isCancelApply: initObj.isCancelApply,
						 isJoint: initObj.isJoint,
					 })
				})
				if(this.tabsMenuList.length && (!this.activityKey || !this.checkActivityKeystay())) {
					 let toTab = this.$route.query.toTab
					 if (toTab && init && this.tabsMenuList.some(item => item.component === toTab)) {
              this.activityKey = toTab
					 } else {
              this.activityKey = this.tabsMenuList[0].component
					 }
				}
				console.log('this.menu', 	this.menu)
			})
		},
		checkActivityKeystay() {
       let obj = this.tabsMenuList.find(item => {
				 return item.component === this.activityKey
			 })
			 return obj || ''
		},
		getInit() {
			console.log('🚀 ~ this.orderInfo', this.orderInfo)
			if (!this.orderInfo) return
			this.refreshsubType('init')
			sessionStorage.setItem('serviceCode', this.serviceCode)
			this.handleIsCancelApply(this.serviceCode) // 获取协同服务项取消申请状态
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
		// handleClick(tab, event) {
		// 	// 修改全局serviceType的值
		// 	this.serviceCode = this.menu.find(item => item.key == this.activityKey).code
		// 	this.$store.dispatch('order/changeServiceType', this.serviceCode)
		// 	this.handleIsCancelApply(this.serviceCode) // 获取协同服务项取消申请状态
		// },
		handleGetServiceStatus() {
      let { serviceInfoList } = this.orderInfo
      let sItem = serviceInfoList.find(item => item.serviceCode === this.serviceCode)
      return sItem ? sItem.serviceStatus : ''
    },
		menuChange(val, item) {
     	if(val && this.handleGetServiceStatus() === 'finish') {
				 this.$confirm('服务项进度已完成，新增新类型，服务项进度将自动变为处理中，是否确定要新增？', '确认?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
						this.changeCheck({
							typeCode: item.value,
							typeName: item.label,
							chooseStatus: val ? 'y' : 'n'
						}, true)
					})
					.catch(() => {
            item.chooseStatusModel = false
					})
			} else {
					this.changeCheck({
						typeCode: item.value,
						typeName: item.label,
						chooseStatus: val ? 'y' : 'n'
					})
			}
		},
		changeCheck(obj, refresh) {
      console.log(obj)
			subTypeSave({...obj, serviceCode: this.serviceCode, orderNo: this.$route.query.orderNo})
			.then(res => {
         this.refreshsubType()
				 refresh && this.getOrderInfo()
			})
			.catch(() => {
         this.refreshsubType()
			})
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
	width: 14px;
}
.clearance-menu-checkbox {
	padding: 5px 20px;
	display: flex;
  align-items: center;
	border-bottom: 1px solid #dfe6ec; 
	.menu-title{
		margin-right: 10px;
	}
}
</style>
