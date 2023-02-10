<template>
	<div class="edit-container order-book fullWrap" id="carPage">
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
							<SoInfo :soList="soList" id="soInfo"></SoInfo>
							<div class="order-cont">
								<div class="service-detail-cont">
									<div class="warehouse-menu-checkbox">
										<span class="menu-title">请选择类型:</span>	
										<el-checkbox v-for="item in menu" :key="item.value" v-model="item.chooseStatusModel" @change="menuChange($event, item)">{{item.label}}</el-checkbox>
			           	</div>
									<el-tabs v-model="activityKey" v-if="tabsMenuList.length">
										<el-tab-pane v-for="item in tabsMenuList" :label="item.label" :name="item.component" :key="item.component"> </el-tab-pane>
									</el-tabs>
									<component v-if="tabsMenuList.length" :is="activityKey" :isDisabledEdit="isDisabledEdit" :orderInfo="orderInfo" :tabMenus="menu" :saveBarFixed="saveBarFixed"></component>
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
import { orderInfo, orderJointInfo, orderBookInfo, getSubTypeList, subTypeSave } from '@/api/order/list'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import Warehouse from './components/warehouse'
import YardBox from '@/views/order/order/orderList/yardBox/yardBox.vue'
import Car from './components/car'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import SoInfo from './components/soInfo'

export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			oQuery: this.$route.query,
			menu: [],
			activityKey: '',
			serviceCode: 'pol_warehouse',
			routeName: 'Warehouse',
			orderInfo: {},
			soList: [],
			saveBarFixed: false,
		}
	},
	created() {
		this.getOrderInfo()
		this.getSoInfo()
		// this.init()
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
		...mapState({
      dictMap: state => state.dict.dictMap
    }),
		activityTab() {
			let tab = this.$store.state.order.warehouseActivityKey || 'Warehouse'
			this.activityKey = tab
			return tab
		},
		tabsMenuList() {
       return this.menu.filter(item => {
				 return item.chooseStatus === 'y'
			 })
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'pol_warehouse')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isDisabledEdit(){
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if(this.isFinish){
				return true
				// 放开已关账、已完成的限制
				// ['complete','cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)
			}else if(['cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus) || (this.$store.state.order.orderInfoDataObj.finCloseStatus === 'yes' && !this.finCloseStatusCanEdit)){
				return true
			}else{
				return false
			}
		},
	},
	props: {},
	components: {
		CancelApplyAlert,
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		ServiceCustInfo,
		Warehouse,
		YardBox,
		Car,
		JointWorkAssign,
		// OneServiceFee,
		SoInfo
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
			let soInfo = document.querySelector("#soInfo")
			let scrollTop  = contDom.scrollTop
			let tableContHeight = tableCont.offsetHeight
			let soInfoHeight = soInfo.offsetHeight
			if (scrollTop > tableContHeight +soInfoHeight +36 +8 +24 +20) {	// table高度和custInfo组件的高度及tab切换的高度
				this.saveBarFixed = true
			} else {
				this.saveBarFixed = false
			}
		},
		// 获取so列表
		getSoInfo() {
			orderBookInfo({ orderNo: this.$route.query.orderNo, jointNo: this.$route.query.jointNo }).then(res => {
				this.soList = res.data.soList
			})
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
				console.log('服务项包含的tab数据：', this.dictMap['serviceStorage'])
				let serviceTabList = this.dictMap['serviceStorage']
				let { name } = this.$route
		  	let { serviceList, serviceInfoList } = this.orderInfo
				let initArr = getServicChilds(name, serviceList, serviceInfoList)
				let initObj = initArr.find(item => {
					return item.code === this.serviceCode
				})
				let chooseStatus = ''
				this.menu = []
				let componentObj = {
					'pol_warehouse': 'Warehouse',
					'stuffing': 'YardBox'
				}
				serviceTabList.forEach(item => {
					 chooseStatus = this.getChooseStatus(item.value, res.data)
           this.menu.push({
						 ...item,
						 code: this.serviceCode,
             chooseStatus,
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
			if (!this.orderInfo) return
			this.refreshsubType('init')
			sessionStorage.setItem('serviceCode', this.serviceCode)
			// 存储客户id
			let cust = {
				custid: this.orderInfo.custid,
				custName: this.orderInfo.custName,
				custIntrustNo: this.orderInfo.custIntrustNo,
				businessType: this.orderInfo.businessType,
				serviceType: this.orderInfo.serviceType
			}
			sessionStorage.setItem("custStr", JSON.stringify(cust))
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
		// handleClick() {
		// 	this.$store.dispatch('order/changeWarehouseComp', this.activityKey)
		// 	// 修改全局serviceType的值
		// 	this.serviceCode = this.menu.find(item => item.key == this.activityKey).code
		// 	this.$store.dispatch('order/changeServiceType', this.serviceCode)
		// 	this.handleIsCancelApply(this.serviceCode) // 获取协同服务项取消申请状态
		// },
		jointWorkAssignCallback() {
			this.getJointServiceWorkList(this.serviceCode)
		}
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
#carPage {
	.small-tit .icon {
		vertical-align: text-top;
		margin-right: 5px;
		width: 14px;
	}
	.addException {
		position: absolute;
		right: 20px;
		margin-top: 6px;
		z-index: 1;
	}
	.order-cont .ship-cont {
		width: 100%;
	}
	.order-cont .el-tabs{
		margin-bottom: 10px;
	}
	tbody tr td .el-button--mini {
		padding: 0;
	}
}
.edit-container .order-cont .service-detail-cont .finance-one-service-fee {
	padding-bottom: 5px;
}
.warehouse-menu-checkbox {
	padding: 5px 20px;
	display: flex;
  align-items: center;
	border-bottom: 1px solid #dfe6ec; 
	.menu-title{
		margin-right: 10px;
	}
}
</style>
