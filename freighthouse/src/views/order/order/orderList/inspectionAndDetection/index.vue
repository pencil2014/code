<template>
	<div class="edit-container order-book fullWrap" id="inspectionAndDetection">
		<div class="order-container">
			<!-- 协同撤回申请提示 -->
			<CancelApplyAlert v-if="jointShow && isCancelApply && serviceCode !== 'book'" :serviceInfo="serviceInfo" :serviceList="orderInfo.serviceList" @callback="getOrderInfo" />
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" activityKey="ciq" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container" id="container" @scroll="handleScroll">
							<ServiceCustInfo :orderInfo="orderInfo" serviceCode="ciq" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div class="component-cont">
								<div class="inspection-menu-checkbox">
									<span class="menu-title">请选择类型:</span>

									<el-checkbox @change="subTypeSave('ciq')" v-model="ciqValue" true-label="y" false-label="n">
										 CIQ
									</el-checkbox>
									<el-checkbox @change="subTypeSave('bv')" v-model="bvValue" true-label="y" false-label="n">
										 BV
									</el-checkbox>
									<el-checkbox @change="subTypeSave('coc_saso')" v-model="coc_sasoValue" true-label="y" false-label="n">
										 COC/SASO
									</el-checkbox>
								</div>
								<div v-if="serviceCheckout.length > 0" class="ship-cont">
									<el-tabs v-model="activityKey" @tab-click="handleClick" class="pl20">
										<el-tab-pane v-for="item in serviceCheckout" :name="item.value" :key="item.value">
											<span slot="label">
												<!-- <i class="icon-warning" v-if="item.isCancelApply" style="margin-right: 5px"></i>
												<i class="icon-joint" v-if="item.isJoint && $route.query.source !== 'jointList'">协</i> -->
												{{ item.label }}
											</span>
										</el-tab-pane>
									</el-tabs>
									<component :is="activityKey" :orderInfo="orderInfo" :saveBarFixed="saveBarFixed"></component>
								</div>
							</div>
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" serviceCode="ciq" /> -->
						</div>
						<JointWorkAssign :jointServiceWorkList="jointServiceWorkList" serviceCode="ciq" @callback="jointWorkAssignCallback" />
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
import { orderInfo, orderJointInfo, subTypeSave, getSubTypeList } from '@/api/order/list'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import ciq from './ciq'
import bv from './bv'
import coc_saso from './cocsosa'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'

export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			ciqValue:  'n',
			bvValue:  'n',
			coc_sasoValue:  'n',
			oQuery: this.$route.query,
			// menus: [],
			activityKey: 'ciq',
			serviceCode: '',
			routeName: 'InspectionAndDetection',
			orderInfo: {},
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
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
		serviceCheckout() {
			return this.dictMap.serviceCheckout.filter(item => this[item.value + 'Value'] ===  'y')
		}
		// getCurrentServiceCode() {
		// 	let find = this.menus.find(item => {
		// 		return item.key === this.activityKey
		// 	})
		// 	return find && find.code
		// }
	},
	components: {
		CancelApplyAlert,
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		ServiceCustInfo,
		ciq,
		bv,
		coc_saso,
		JointWorkAssign,
		// OneServiceFee
	},
	props: {},
	watch: {
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
			let sItem = serviceInfoList.find(item => item.serviceCode === 'ciq')
			return sItem ? sItem.serviceStatus : ''
		},
		// 获取子服务类型选中状态
		getSubTypeList() {
			getSubTypeList({ orderNo: this.oQuery.orderNo, serviceCodes: ['ciq'] }).then(res => {
				if (res.data) {
					// 设置选中状态
					;['ciq', 'bv', 'coc_saso'].map(item => {
						this.setCheckValue(res.data, item)
					})

					//设置当前tab
					if (this.serviceCheckout.length > 0) {
						this.activityKey = this.serviceCheckout[0].value
					}
				} else {
					// 全部设为未选中
					this.ciqValue =  'n'
					this.bvValue =  'n'
					this.coc_sasoValue =  'n'
				}
			})
		},
		// 查找对应类型的状态
		setCheckValue(data, prop) {
			let item = data.find(item => item.typeCode === prop)
			if (item) {
				this[prop + 'Value'] = item.chooseStatus
			} else {
				this[prop + 'Value'] =  'n'
			}
		},
		// 子服务类型保存
		subTypeSave(typeCode) {
			console.log('🚀 ~ typeCode', typeCode)
			let typeName, chooseStatus
			switch (typeCode) {
				case 'ciq':
					typeName = 'CIQ'
					chooseStatus = this.ciqValue
					break
				case 'bv':
					typeName = 'BV'
					chooseStatus = this.bvValue
					break
				case 'coc_saso':
					typeName = 'COC/SASO'
					chooseStatus = this.coc_sasoValue
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
							serviceCode: 'ciq',
							typeCode: typeCode,
							typeName: typeName,
							orderNo: this.oQuery.orderNo,
							chooseStatus: chooseStatus
						})
							.then(_ => {
								// 刷新服务项进度
								this.getOrderInfo()
								// 选中类型  跳转到对应的tab
								this.activityKey = typeCode
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
					serviceCode: 'ciq',
					typeCode: typeCode,
					typeName: typeName,
					orderNo: this.oQuery.orderNo,
					chooseStatus: chooseStatus
				})
					.then(_ => {
						if (chooseStatus ===  'y') {
							// 选中类型  跳转到对应的tab
							this.activityKey = typeCode
						} else if (chooseStatus ===  'n' && this.serviceCheckout.length > 0) {
							this.activityKey = this.serviceCheckout[0].value
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
			// this.menus = getServicChilds(name, serviceList, serviceInfoList)
			// if (!this.activityKey) this.activityKey = getServicChilds(name, serviceList, serviceInfoList)[0].key
			// if (!this.serviceCode) this.serviceCode = getServiceCode(name, serviceList)
			sessionStorage.setItem('serviceCode', 'ciq')
			// 存储客户id
			let cust = {
				custid: this.orderInfo.custid,
				custName: this.orderInfo.custName,
				custIntrustNo: this.orderInfo.custIntrustNo,
				businessType: this.orderInfo.businessType,
				serviceType: this.orderInfo.serviceType
			}
			sessionStorage.setItem('custStr', JSON.stringify(cust))
			this.handleIsCancelApply('ciq') // 获取协同服务项取消申请状态
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
		handleClick(tab, event) {
			// 修改全局serviceType的值
			// this.serviceCode = this.menus.find(item => item.key == this.activityKey).code
			// this.$store.dispatch('order/changeServiceType', this.serviceCode)
			// this.handleIsCancelApply(this.serviceCode) // 获取协同服务项取消申请状态
		},
		jointWorkAssignCallback() {
			this.getJointServiceWorkList('ciq')
		}
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
#inspectionAndDetection .component-cont {
	padding: 10px 0;
}
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
#inspectionAndDetection .operateBtn-tip{
	padding: 0; 
	display: inline-block;
}
</style>
