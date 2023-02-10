<template>
	<div class="edit-container order-book fullWrap" id="podWarehouse">
		<div class="order-container">
			<div class="tabs-container">
				<div class="detail-container flex">
					<div class="flex1 component-main-cont">
						<div class="service-container" id="container">
							<ServiceCustInfo :serverIsJoint="isJoint" :orderInfo="orderInfo" :serviceCode="'pod_ltl_delivery'" @getOrderInfo="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>

							<div v-if="['air_import'].includes(orderInfo.businessType)" class="component-cont" style="padding-bottom:0;">
								<div class="inspection-menu-checkbox">
									<span class="menu-title">请选择类型:</span>
									<el-checkbox @change="subTypeSave('pod_ltl_delivery_bonded')" v-model="pod_ltl_delivery_bonded" :disabled="isDisabledEdit" true-label="y" false-label="n">
										保税类型
									</el-checkbox>
									<el-checkbox @change="subTypeSave('pod_ltl_delivery_not_bonded')" v-model="pod_ltl_delivery_not_bonded" :disabled="isDisabledEdit" true-label="y" false-label="n">
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

							<div v-if="(['air_import'].includes(orderInfo.businessType) && serviceCheckout.length > 0) || !['air_import'].includes(orderInfo.businessType)" class="component-cont">
								<component ref="podLtlDelivery" :activityType="activityType" :is="'PodLtlDelivery'" :orderInfo="orderInfo"></component>
							</div>
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="serviceCode" /> -->
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- 创建委派信息弹窗 -->
		<div v-if="createShow">
			<Create @close="createPopClose" />
		</div>
	</div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { orderInfo, orderJointInfo, serviceInfoSave, serviceInfoList, serviceInfoDelete, subTypeSave, getSubTypeList } from '@/api/order/list'

import ServiceCustInfo from '../../components/serviceCustInfo'
import PodWarehouse from '../warehouse'
// import PodWhMatter from '../whMatter'
import PodLtlDelivery from '../ltlDelivery'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
// import PodLtl from '../../../podLtl/index.vue'
// import SoInfo from './components/soInfo'
import Create from './components/create'

export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			isBonded: 'N',
			activityType: 'pod_ltl_delivery_not_bonded',
			pod_ltl_delivery_not_bonded: 'n',
			pod_ltl_delivery_bonded: 'n',
			oQuery: this.$route.query,
			activityKey: '',
			serviceCode: 'pod_ltl_delivery',
			routeName: 'PodLtlDelivery',
			remarkShow: true,
			createShow: false,
			soList: [] //so列表
		}
	},
	created() {
		// this.getOrderInfo()
		this.getServiceInfoList()
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
			dictMap: state => state.dict.dictMap,
			airOrderInfo: state => state.airTransport.airOrderInfo || {}
		}),

		serviceCheckout() {
			return this.dictMap.servicePodLtlDelivery.filter(item => this[item.value] === 'y')
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === this.serviceCode)
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isImport() {
			return ['air_import'].includes(this.orderInfo.businessType)
		},
		isDisabledEdit() {
			if(!this.isEcs && !this.isOp && (!this.isCs || !this.isImport)){
				return true
			}
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if (this.isFinish) {
				return true
			} else if (this.isJoint) {
				return true
			}else if (['complete', 'cancel'].includes(this.orderInfo.orderStatus)) {
				return true
			} else {
				return false
			}
		}
	},
	components: {
		ServiceCustInfo,
		PodWarehouse,
		// PodWhMatter,
		PodLtlDelivery,
		// OneServiceFee,
		// PodLtl,
		// SoInfo,
		Create
	},
	watch: {
		activityType: {
			handler(val) {
				console.log('🚀 ~ val', val)
				this.getOrderInfo()
				// 新增参数是否保税
				this.isBonded = val === 'pod_ltl_delivery_bonded' ? 'Y' : 'N'
				console.log('🚀 ~ this.isBonded', this.isBonded)
				this.$nextTick(() => {
					this.$refs.podLtlDelivery.getList()
					this.$refs.podLtlDelivery.detailShow = false
				})
			},
			immediate: true
		}
	},
	methods: {
		...mapMutations('order', ['setServiceList', 'setServiceInfoList']),
		handleGetServiceStatus() {
			let { serviceInfoList } = this.orderInfo
			let sItem = serviceInfoList.find(item => item.serviceCode === 'pod_ltl_delivery')
			return sItem ? sItem.serviceStatus : ''
		},
		// 获取子服务类型选中状态
		getSubTypeList() {
			getSubTypeList({ orderNo: this.oQuery.orderNo, serviceCodes: ['pod_ltl_delivery'] }).then(res => {
				if (res.data) {
					// 设置选中状态
					;['pod_ltl_delivery_not_bonded', 'pod_ltl_delivery_bonded'].map(item => {
						this.setCheckValue(res.data, item)
					})

					//设置当前tab
					if (this.serviceCheckout.length > 0) {
						this.activityType = this.serviceCheckout[0].value
					}
				} else {
					// 全部设为未选中
					this.pod_ltl_delivery_not_bonded = 'n'
					this.pod_ltl_delivery_bonded = 'n'
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
				case 'pod_ltl_delivery_not_bonded':
					typeName = '非保税类型'
					break
				case 'pod_ltl_delivery_bonded':
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
							serviceCode: 'pod_ltl_delivery',
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
					serviceCode: 'pod_ltl_delivery',
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
		jointWorkAssignCallback() {
			this.getJointServiceWorkList(this.serviceCode)
		},
		handleToogleExpand() {
			this.remarkShow = !this.remarkShow
		},
		handleDeleteServiceInfo(row) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						groupKey: row.groupKey,
						orderNo: this.$route.query.orderNo,
						serviceCode: this.serviceCode
					}
					serviceInfoDelete(data).then(res => {
						this.$message({ type: 'success', message: '删除成功' })
						this.getServiceInfoList()
					})
				})
				.catch(() => {})
		},
		handleCreate() {
			this.createShow = true
		},
		createPopClose(action, value) {
			if (action === 'Confirm') {
				this.handleServiceInfoSave(value)
			} else {
				this.createShow = false
			}
		},
		// 保存委派信息
		handleServiceInfoSave(value) {
			console.log(value)
			let data = {
				orderNo: this.$route.query.orderNo,
				serviceCode: this.serviceCode,
				infoData: []
			}
			data.infoData.push(value)
			serviceInfoSave(data).then(res => {
				this.$message({ type: 'success', message: '保存成功' })
				this.createShow = false
				this.getServiceInfoList()
			})
		},
		// 获取委派信息列表
		getServiceInfoList() {
			serviceInfoList({
				orderNo: this.$route.query.orderNo,
				serviceCode: this.serviceCode
			}).then(res => {
				this.soList = res.data || []
				// // 按创建时间戳降序排序
				// this.soList.sort((a, b) => {
				// 	return b.createTimeStr - a.createTimeStr
				// })
				console.log('this.soList', this.soList)
			})
		}
	}
}
</script>
<style lang="scss">
// @import '../../../../less/index.scss';

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
.remark-container {
	background-color: #fff;
	margin-top: 8px;
	.remark-tit-row {
		display: flex;
		justify-content: space-between;
		height: 28px;
		line-height: 20px;
		padding: 4px 20px;
		border-bottom: 1px solid #e6ebf5;
		.tit {
			display: block;
			font-weight: bold;
			font-size: 12px;
		}
		.operate {
			display: flex;
			.expand {
				cursor: pointer;
			}
			.trusk-time {
				display: flex;
			}
		}
	}
	.remark-row {
		padding: 8px 20px;
		overflow: hidden;
	}
}
</style>
