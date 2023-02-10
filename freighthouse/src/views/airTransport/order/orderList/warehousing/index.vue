<template>
	<div class="edit-container order-book fullWrap" id="podWarehouse">
		<div class="order-container">
			<div class="tabs-container">
				<div class="detail-container flex">
					<div class="flex1 component-main-cont">
						<div class="service-container" id="container" @scroll="handleScroll">
							<ServiceCustInfo :serverIsJoint="isJoint" :orderInfo="orderInfo" :serviceCode="'pod_warehouse'" @getOrderInfo="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div v-if="isImport" class="component-cont" style="padding-bottom:0;">
								<div class="inspection-menu-checkbox">
									<span class="menu-title">请选择类型:</span>
									<el-checkbox @change="subTypeSave('pod_warehouse_bonded')" v-model="pod_warehouse_bonded" :disabled="isDisabledEdit || isJoint" true-label="y" false-label="n">
										保税类型
									</el-checkbox>
									<el-checkbox @change="subTypeSave('pod_warehouse_not_bonded')" v-model="pod_warehouse_not_bonded" :disabled="isDisabledEdit|| isJoint" true-label="y" false-label="n">
										非保税类型
									</el-checkbox>
								</div>
								<div v-if="serviceCheckout.length > 0" class="ship-cont">
									<el-tabs v-model="activityType" class="pl20">
										<el-tab-pane v-for="item in serviceCheckout" :name="item.value" :key="item.value">
											<span slot="label">
												{{ item.label }}
											</span>
										</el-tab-pane>
									</el-tabs>
								</div>
							</div>
							<div v-if="!isImport" class="component-cont">
								<div class="ship-cont">
									<el-tabs v-model="activityKey" @tab-click="handleClick" class="pl20">
										<el-tab-pane v-for="item in menus" :label="item.value" :name="item.key" :key="item.key">
											<span slot="label">
												<i class="icon-warning" v-if="item.isCancelApply" style="margin-right: 5px"></i>
												<i class="icon-joint" v-if="item.isJoint && $route.query.source !== 'jointList'">协</i>
												{{ item.value }}
											</span>
										</el-tab-pane>
									</el-tabs>
								</div>
							</div>
							<component v-if="(isImport && serviceCheckout.length > 0) || !isImport" :is="'PodWarehouse'" :activityType="activityType" :orderInfo="orderInfo" :tabMenus="menus" :saveBarFixed="saveBarFixed"></component>
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="serviceCode" /> -->
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { mapMutations } from 'vuex'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
// import { getServicChilds, getServiceCode } from '@/utils/tools'
import { subTypeSave, getSubTypeList } from '@/api/order/list'

import ServiceCustInfo from '../components/serviceCustInfo'
import PodWarehouse from './warehouse'
// import PodWhMatter from './whMatter'
import PodLtlDelivery from './ltlDelivery'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'

export default {
	mixins: [orderMixin, routerMixin],
	// mixins: [routerMixin],

	data() {
		return {
			activityType: 'pod_warehouse_not_bonded',
			pod_warehouse_not_bonded: 'n',
			pod_warehouse_bonded: 'n',
			oQuery: this.$route.query,
			menus: [],
			activityKey: '',
			serviceCode: 'pod_warehouse',
			routeName: 'AirPodWarehouseIng',
			saveBarFixed: false
		}
	},
	created() {
		this.getOrderInfo()
		this.getSubTypeList()
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
		isDisabledEdit() {
			if(!this.isEcs && !this.isOp && !this.isCs){
				return true
			}
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if (this.isFinish) {
				return true
			} else if (['complete', 'cancel'].includes(this.orderInfo.orderStatus)) {
				return true
			} else {
				return false
			}
		},
		serviceCheckout() {
			return this.dictMap.servicePodWarehouse.filter(item => this[item.value] === 'y')
		},
		activityTab() {
			console.log('state', this.$store.state.order.podWarehouseActivityKey)
			let tab = this.$store.state.order.podWarehouseActivityKey
			this.activityKey = tab
			console.log('tab', this.activityKey)
			return tab
		},
		getCurrentServiceCode() {
			let find = this.menus.find(item => {
				return item.key === this.activityKey
			})
			return find && find.code
		},
		// 业务类型为进口，海外仓的
		isImport() {
			return ['air_import'].includes(this.orderInfo.businessType)
		},
	},
	components: {
		ServiceCustInfo,
		PodWarehouse,
		// PodWhMatter,
		PodLtlDelivery,
		// OneServiceFee
	},
	watch: {
		activityType(val) {
			this.getOrderInfo()
		},
		serviceCode(newVal) {
			if (newVal && this.jointShow) {
				this.getJointServiceWorkList(newVal)
			}
		}
	},
	methods: {
		...mapMutations('order', ['setServiceList', 'setServiceInfoList']),
		handleGetServiceStatus() {
			let { serviceInfoList } = this.orderInfo
			let sItem = serviceInfoList.find(item => item.serviceCode === 'pod_warehouse')
			return sItem ? sItem.serviceStatus : ''
		},
		// 获取子服务类型选中状态
		getSubTypeList() {
			getSubTypeList({ orderNo: this.oQuery.orderNo, serviceCodes: ['pod_warehouse'] }).then(res => {
				if (res.data) {
					// 设置选中状态
					;['pod_warehouse_not_bonded', 'pod_warehouse_bonded'].map(item => {
						this.setCheckValue(res.data, item)
					})

					//设置当前tab
					if (this.serviceCheckout.length > 0) {
						this.activityType = this.serviceCheckout[0].value
					}
				} else {
					// 全部设为未选中
					this.pod_warehouse_not_bonded = 'n'
					this.pod_warehouse_bonded = 'n'
				}
			})
		},
		// 查找对应类型的状态
		setCheckValue(data, prop) {
			let item = data.find(item => item.typeCode === prop)
			if (item) {
				this[prop] = item.chooseStatus
			} else {
				this[prop] = 'n'
			}
		},
		// 子服务类型保存
		subTypeSave(typeCode) {
			console.log('🚀 ~ typeCode', typeCode)
			let typeName
			let chooseStatus = this[typeCode]
			switch (typeCode) {
				case 'pod_warehouse_not_bonded':
					typeName = '非保税类型'
					break
				case 'pod_warehouse_bonded':
					typeName = '保税类型'
					break

				default:
					break
			}
			// 校验服务项进度
			if (chooseStatus === 'y' && this.handleGetServiceStatus() === 'finish') {
				this.$confirm('服务项进度已完成，新增新类型，服务项进度将自动变为处理中，是否确定要新增？', '确认?', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						subTypeSave({
							serviceCode: 'pod_warehouse',
							typeCode: typeCode,
							typeName: typeName,
							orderNo: this.oQuery.orderNo,
							chooseStatus: chooseStatus
						})
							.then(_ => {
								// 刷新服务项进度
								this.getOrderInfo()
								// 选中类型  跳转到对应的tab
								this.activityType = typeCode
							})
							.catch(() => {
								// 保存失败时重置选中状态
								this.getSubTypeList()
							})
					})
					.catch(() => {
						// 重置选中状态
						this.getSubTypeList()
					})
			} else {
				subTypeSave({
					serviceCode: 'pod_warehouse',
					typeCode: typeCode,
					typeName: typeName,
					orderNo: this.oQuery.orderNo,
					chooseStatus: chooseStatus
				})
					.then(_ => {
						if (chooseStatus === 'y') {
							// 选中类型  跳转到对应的tab
							this.activityType = typeCode
						} else if (chooseStatus === 'n' && this.serviceCheckout.length > 0) {
							this.activityType = this.serviceCheckout[0].value
						}
					})
					.catch(() => {
						// 保存失败时重置选中状态
						this.getSubTypeList()
					})
			}
		},
		handleScroll() {
			// let saveBarDom = document.querySelector("#saveBar")
			let contDom = document.querySelector('#container')
			let tableCont = document.querySelector('#tableCont')
			let scrollTop = contDom.scrollTop
			let tableContHeight = tableCont.offsetHeight
			if (scrollTop > tableContHeight + 36 + 8 + 24 + 20) {
				// table高度和custInfo组件的高度及tab切换的高度
				this.saveBarFixed = true
			} else {
				this.saveBarFixed = false
			}
		},
		// // 获取订单详情
		// getOrderInfo() {
		// 	let { source, orderNo, jointNo } = this.$route.query
		// 	if (jointNo) {
		// 		return orderJointInfo({ jointNo: jointNo }).then(res => {
		// 			this.orderInfo = res.data
		// 			this.setServiceList(res.data.serviceList)
		// 			this.setServiceInfoList(res.data.serviceInfoList)
		// 			this.getInit()
		// 		})
		// 	}
		// 	orderInfo({ orderNo: orderNo }).then(res => {
		// 		this.orderInfo = res.data
		// 		this.setServiceList(res.data.serviceList)
		// 		this.setServiceInfoList(res.data.serviceInfoList)
		// 		this.getInit()
		// 	})
		// },
		// getInit() {
		// 	if (!this.orderInfo) return
		// 	let { name } = this.$route
		// 	let { serviceList, serviceInfoList, serviceType, businessType } = this.orderInfo
		// 	// 海运进口整箱业务-不做目的港进仓事项服务项
		// 	if (this.isImport) {
		// 		serviceList = serviceList.filter(item => !['pod_wh_matter'].includes(item))
		// 		serviceInfoList = serviceInfoList.filter(item => !['pod_wh_matter'].includes(item.code))
		// 	}
		// 	// 海运进口拼箱业务-不在目的港仓储里做散车派送
		// 	if (['ship_import_lcl'].includes(businessType)) {
		// 		serviceList = serviceList.filter(item => !['pod_ltl_delivery'].includes(item))
		// 		serviceInfoList = serviceInfoList.filter(item => !['pod_ltl_delivery'].includes(item.code))
		// 	}
		// 	this.menus = getServicChilds(name, serviceList, serviceInfoList)
		// 	// if (!this.activityKey) this.activityKey = getServicChilds(name, serviceList, serviceInfoList)[0].key
		// 	if (!this.activityKey) this.activityKey = this.menus[0].key
		// 	if (!this.serviceCode) this.serviceCode = getServiceCode(name, serviceList)
		// 	console.log('this.activityKey', this.activityKey, this.serviceCode)
		// 	this.$store.dispatch('order/changePodWarehouseComp', this.activityKey)
		// 	sessionStorage.setItem('serviceCode', this.serviceCode)
		// 	sessionStorage.setItem('serviceListStr', JSON.stringify(serviceList))
		// 	sessionStorage.setItem('serviceInfoListStr', JSON.stringify(serviceInfoList))
		// 	// 存储客户id
		// 	let cust = {
		// 		custid: this.orderInfo.custid,
		// 		custName: this.orderInfo.custName,
		// 		custIntrustNo: this.orderInfo.custIntrustNo,
		// 		businessType: this.orderInfo.businessType,
		// 		serviceType: this.orderInfo.serviceType
		// 	}
		// 	sessionStorage.setItem('custStr', JSON.stringify(cust))
		// 	this.handleIsCancelApply(this.serviceCode)
		// 	// 获取业务发起取消的订单的取消原因备注等信息
		// 	if (this.orderInfo.cancelApplyStatus === 'applied') {
		// 		this.getCancel(this.orderInfo)
		// 	}
		// 	// 获取已拒绝的信息
		// 	if (this.orderInfo.orderStatus === 'refuse') {
		// 		this.getRefuse(this.orderInfo)
		// 	}
		// 	this.getUserEditRoles(this.orderInfo)
		// },
		handleClick(tab, event) {
			this.$store.dispatch('order/changePodWarehouseComp', this.activityKey)
			// 修改全局serviceType的值
			this.serviceCode = this.menus.find(item => item.key === this.activityKey).code
			this.$store.dispatch('order/changeServiceType', this.serviceCode)
			this.handleIsCancelApply(this.serviceCode) // 获取协同服务项取消申请状态"pod_warehouse"
		},
		// handleClick(tab, event) {
		// 	this.handleIsCancelApply('pod_warehouse') // 获取协同服务项取消申请状态
		// },
		// podWarehouseCallback(item) {
		//   this.$emit('podWarehouseCallback', item)
		// },
		jointWorkAssignCallback() {
			this.getJointServiceWorkList(this.serviceCode)
		}
	}
}
</script>
<style lang="scss">
.inspection-menu-checkbox {
	padding-left: 20px;
	padding-bottom: 6px;
	border-bottom: 1px solid #dfe6ec;
	display: flex;
	align-items: center;
	.menu-title {
		margin-right: 10px;
	}
}
// @import '../../../less/index.scss';
</style>
