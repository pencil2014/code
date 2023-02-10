<template>
	<!-- serviceMenus && serviceMenus.length &&  -->
	<ul class="columns-menu" v-show="viewState">
		<li v-for="(item, index) in serviceMenuArr" :key="index" @click="handleClickMenu(item)" :class="activityKey === item.component ? 'active' : ''">
			<span class="name">{{ $language === 'en' ? item.ename : item.cname }}</span>
			<!-- <i class="el-icon-caret-top" v-if="index === 0"></i> -->
			<i class="icon-warning" v-if="item.isCancelApply || item.isEdit || item.isCancelService"></i>
			<i class="icon-joint" v-if="item.isJoint && !['jointList', 'whJointList'].includes($route.query.source)">协</i>
			<i class="el-icon-success" v-if="item.isFinish" style="color: rgb(134, 204, 115)"></i>
		</li>
	</ul>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
export default {
	data() {
		return {
			serviceMenus: [],
			// 海运进口-委托订舱无需显示的服务项
			importFclHideService: ['vgm', 'truck', 'pol_ltl', 'pol_declaration', 'pol_inspection', 'stuffing', 'pol_warehouse', 'ocean_manifest', 'fume', 'bv', 'ciq', 'coc_saso', 'pod_wh_matter'],
			importLclHideService: ['vgm', 'pol_ltl', 'pol_declaration', 'pol_inspection', 'stuffing', 'pol_warehouse', 'ocean_manifest', 'fume', 'bv', 'ciq', 'coc_saso', 'pod_wh_matter', 'insurance'],
			crossBorderPodHideService: ['pod_comm_clearance', 'pod_ltl_delivery', 'pod_fcl_delivery'],
			ecsAndepricingService: ['pod_change_doc', 'pod_ltl_delivery', 'pod_fcl_delivery', 'pod_comm_clearance', 'pod_warehouse']
		}
	},
	props: {
		orderInfo: {
			type: Object,
			default: () => ({})
		},
		activityKey: {
			type: String,
			default: ''
		}
	},
	activated() {},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			orderInfoDataObj: state => state.order.orderInfoDataObj,
			ordDetRole: state => state.order.orderList.ordDetRole
		}),
		viewState() {
			// console.log('serviceMenus', this.serviceMenus)
			let { action } = this.$route.query
			return !['add', 'copy'].includes(action) && this.serviceMenus.length
		},
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		serviceMenuArr(){
			if(Array.isArray(this.serviceMenus) && this.serviceMenus.length>0){
				let findItem =this.serviceMenus.find(el=>el.code === 'whbook')
				if(findItem){
					let arr =this.serviceMenus.filter(el=>el.code!=='whbook')
					arr.unshift(findItem)
					return arr

				}else {
					return this.serviceMenus
				}

			}else{
				return []
			}
		}
	},
	components: {},
	watch: {
		orderInfo: {
			handler(newVal, oldVal) {
				this.getServiceMenu(newVal)
			},
			deep: true
		},
		ordDetRole(val) {
			this.getServiceMenu(this.orderInfo)
		}
	},
	methods: {
		getServiceMenu(data) {
			if (!data || !Object.keys(data).length) return (this.serviceMenus = [])
			let allServices = JSON.parse(JSON.stringify(store.state.order.allServicesMenu))
			console.log('🚀 ~ allServices', allServices, data)
			let { serviceList, serviceInfoList } = data
			console.log('🚀 ~ serviceList', serviceList)
			// 海运进口整箱业务的以下服务项暂不用显示
			if (['ship_import_fcl'].includes(this.orderInfo.businessType)) {
				serviceList = serviceList.filter(ele => !this.importFclHideService.includes(ele))
			}
			// 进口拼箱-委托订舱
			if (['st11'].includes(this.orderInfo.serviceType)) {
				let importLclHideService = this.importLclHideService.concat(['dangerous'])
				serviceList = serviceList.filter(ele => !importLclHideService.includes(ele))
			}
			// 进口拼箱-客户自订
			if (['st12'].includes(this.orderInfo.serviceType)) {
				serviceList = serviceList.filter(ele => !this.importLclHideService.includes(ele))
			}
			// // 海运出口整箱-跨境电商目的港清派
			// if (['st17'].includes(this.orderInfo.serviceType)) {
			// 	serviceList = serviceList.filter(ele => !this.crossBorderPodHideService.includes(ele))
			// }
			let { serviceType } = this.orderInfo
			// console.log('🚀 ~ serviceType', serviceType)
			// 过滤只显示该订单详情含有的服务项
			this.serviceMenus = allServices
				.filter(item => !['Fume', 'InspectionAndDetection', 'BehalfRecordManifest', 'DischargeRelease', 'MakePackingList'].includes(item.component)) // 过滤掉熏蒸，各类检验（不用维护细项）
				.filter(item => {
					return (item.code && serviceList.includes(item.code)) || (item.child && item.child.some(ele => serviceList.includes(ele.code)))
				})
				.filter(ele => {
					// 出口整箱的委托订舱，客户自订，跨境电商，跨境电商海外仓的;进口的整箱要过滤掉目的港散车
					if (['st01', 'st02', 'st15', 'st16', 'st17', 'st09', 'st10'].includes(this.orderInfo.serviceType)) return ele.component !== 'PodLtl'
					// // 散货拼箱的委托订舱、客户自订、跨境电商的要过滤掉目的港仓储
					// if (['st03', 'st04', 'st18', 'st19'].includes(this.orderInfo.serviceType)
					// || ['st11', 'st12'].includes(this.orderInfo.serviceType) && !serviceList.includes('pod_warehouse') ) {
					// 	return ele.component !== 'PodWarehouseIng'
					// }
					return ele.component
				})
			// 委托订舱, 散杂滚装的过滤掉保险和贸易单证
			if (['st01', 'st15', 'st03', 'st18', 'st09', 'st10', 'st11', 'st24', 'st25'].includes(this.orderInfo.serviceType)) {
				this.serviceMenus = this.serviceMenus.filter(item => item.component !== 'Insurance' && item.component !== 'Document')
			}
			// 进口委托订舱过滤掉订舱
			if (['st11'].includes(this.orderInfo.serviceType)) {
				this.serviceMenus = this.serviceMenus.filter(item => item.component !== 'LclWhBook')
			}
			this.serviceMenus.forEach(item => {
				if (item.child && item.child.length) {
					item.child = item.child.filter(ele => {
						return serviceList.includes(ele.code)
					})
					// 是否需要取消服务项的协同
					item.isCancelService = item.child.some(ele => {
						let tempItem = serviceInfoList.filter(o => o.serviceCode === ele.code)
						return tempItem && tempItem.length && tempItem[0].cancelStatus === 'INIT'
					})
					// 申请撤回的服务项
					item.isCancelApply = item.child.some(ele => {
						let tempItem = serviceInfoList.filter(o => o.serviceCode === ele.code)
						return tempItem && tempItem.length && tempItem[0].cancelApplyStatus === 'applied'
					})
					// 所有的子服务项进度为已完成的，父级显示完成图标
					item.isFinish = item.child.every(ele => {
						let tempItem = serviceInfoList.find(o => o.serviceCode === ele.code)
						return tempItem && tempItem.serviceStatus === 'finish'
					})
					// 所有的子服务项进度为进行中的父级服务项显示进行中图标
					item.isEdit = item.child.every(ele => {
						let tempItem = serviceInfoList.find(o => o.serviceCode === ele.code)
						return tempItem && tempItem.isEdit === 'y'
					})
					// 任一子服务项被协同的父级服务项显示协同图标
					item.isJoint = item.child.some(ele => {
						let tempItem = serviceInfoList.find(o => o.serviceCode === ele.code)
						return tempItem && tempItem.isJoint === 'y'
					})
				} else {
					let serviceInfoItem = serviceInfoList.filter(ele => ele.serviceCode === item.code)
					// 是否需要取消服务项的协同
					item.isCancelService = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].cancelStatus === 'INIT'
					item.isCancelApply = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].cancelApplyStatus === 'applied'
					item.isFinish = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].serviceStatus === 'finish'
					item.isEdit = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].isEdit === 'y'
					// 拼箱订舱详情的edit图标只在协同单条件下展示
					if (item.component === 'LclWhBook') {
						item.isEdit = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].isEdit === 'y' && this.$route.query.jointNo
					}
					item.isJoint = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].isJoint === 'y'
				}
			})
			if (this.isEpricing || this.isEcs) {
				this.serviceMenus = this.serviceMenus.filter(el => this.ecsAndepricingService.includes(el.code) || el.component === 'PodWarehouseIng')
			}
			console.log('🚀 ~ this.isEpricing', this.isEpricing, this.isEcs)
			console.log('🚀 ~ this.serviceMenus', this.serviceMenus)
			if (this.$route.name === 'BehalfRecordManifest' || this.$route.name === 'FileList') {
				// 舱单服务项返回当前服务项是否协同
				let oceanManifestIsJoint = ''
				let serviceMenus = this.serviceMenus.filter(item => {
					return item.code == 'ocean_manifest'
				})
				if (serviceMenus.length) {
					oceanManifestIsJoint = serviceMenus[0].isJoint
				}
				this.$emit('getOceanManifestIsJoint', oceanManifestIsJoint)
			}
			if (['ship_export_fcl', 'ship_import_fcl', 'ship_bulk_ro'].includes(this.orderInfo.businessType)) {
				if (!this.serviceMenus.some(el => el.component === 'OrderBook')) {
					let list = this.orderInfo.cargoList ? this.orderInfo.cargoList : []
					let result = list.some(el => el.property === 'dangerous')
					if (result) {
						this.serviceMenus.unshift({
							cname: '订舱',
							component: 'OrderBook',
							ename: 'booking',
							isCancelService: false,
							isCancelApply: false,
							isEdit: false,
							isFinish: false,
							isJoint: false
						})
					}
				}
			}

			if (['ship_export_lcl', 'ship_import_lcl'].includes(this.orderInfo.businessType)) {
				if (!this.serviceMenus.some(el => el.component === 'LclWhBook')) {
					let list = this.orderInfo.cargoList ? this.orderInfo.cargoList : []
					let result = list.some(el => el.property === 'dangerous')
					if (result) {
						this.serviceMenus.unshift({
							cname: '订舱',
							component: 'LclWhBook',
							ename: 'whbook',
							isCancelService: false,
							isCancelApply: false,
							isEdit: false,
							isFinish: false,
							isJoint: false
						})
					}
				}
			}

			console.log(this.serviceMenus)
		},
		handleClickMenu(item) {
			localStorage.insuranceJoint = item.isJoint
			if (item.component === this.$route.name) return
			this.$store.dispatch('tagsView/delView', this.$route)

			console.log('服务项跳转', item.component)
			this.$emit('routerPush', {
				name: item.component,
				query: this.$route.query
			})
		}
	}
}
</script>
<style lang="scss" scoped>
.columns-menu {
	display: block;
	// min-width: 116px;
	width: 160px;
	list-style: none;
	background-color: #fff;
	padding: 0 16px;
	margin: 0;
	position: relative;
	// box-shadow: 4px 0px 10px 0px rgba(233, 233, 233, 1);
	// margin-right: 5px;
	li {
		line-height: 18px;
		// height: 24px;
		border-bottom: 1px solid #e9e9e9;
		padding: 0;
		text-align: center;
		color: #4a4a4a;
		cursor: pointer;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 5px 0;
		// margin-top: 12px;
		.name {
			margin-right: 2px;
			flex: 1;
		}
		// .el-icon-caret-top {
		// 	color: #fff;
		// 	position: absolute;
		// 	top: -8px;
		// }
		&.active {
			// background-color: #3e80f5;
			color: #0062C4;
			// .icon-joint {
			// 	background-color: transparent;
			// 	color: #fff;
			// 	border: 1px solid #fff;
			// }
		}
		&:first-child {
			// &:before {
			// 	content: '';
			// 	display: block;
			// 	position: absolute;
			// 	background-color: #fff;
			// 	border-radius: 2px;
			// 	top: -3px;
			// 	left: 50%;
			// 	margin-left: -5px;
			// 	width: 10px;
			// 	height: 10px;
			// 	border-width: 5px 5px 0 0;
			// 	border-color: transparent;
			// 	border-style: solid;
			// 	-webkit-transform: matrix(0.71, -0.71, 0.71, 0.71, 0, 0);
			// 	transform: matrix(0.71, -0.71, 0.71, 0.71, 0, 0);
			// 	z-index: 3;
			// }
			&.active {
				&:before {
					background-color: #3e80f5;
				}
			}
		}
	}
}
</style>
