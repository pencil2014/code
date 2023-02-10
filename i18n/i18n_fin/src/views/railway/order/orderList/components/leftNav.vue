<template>
	<ul class="columns-menu" v-show="viewState">
		<li v-for="(item, index) in serviceMenus" :key="index" @click="handleClickMenu(item)" :class="activityKey === item.component ? 'active' : ''">
			<span class="name">{{ $lang === 'zh' ? item.cname : item.ename }}</span>
			<i class="el-icon-caret-top" v-if="index === 0"></i>
			<i class="icon-warning" v-if="item.isCancelApply || item.isEdit || item.isCancelService"></i>
			<i class="icon-joint" v-if="item.isJoint && !['jointList', 'whJointList'].includes($route.query.source)">协</i>
			<i class="el-icon-success" v-if="item.isFinish" style="color: rgb(134,204,115)"></i>
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
			ordDetRole: state => state.railway.ordDetRole
		}),
		viewState() {
			let { action } = this.$route.query
			return !['add', 'copy'].includes(action) && this.serviceMenus.length
		},
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
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
			let allServices = JSON.parse(JSON.stringify(store.state.railway.allServicesMenu))
      console.log("🚀 ~ allServices", allServices)
			let { serviceList, serviceInfoList } = data
			// 过滤只显示该订单详情含有的服务项
			if (this.$route.query.source === 'jointList') {
				this.serviceMenus = allServices.filter(item => {
					return (item.code && serviceInfoList.find(ele => ele.serviceCode === item.code)) || (item.child && item.child.some(ele => serviceInfoList.find( o => o.serviceCode === ele.code)))
				})
			} else {
				this.serviceMenus = allServices.filter(item => {
					return (item.code && serviceList.includes(item.code)) || (item.child && item.child.some(ele => serviceList.includes(ele.code)))
				})
			}
			// 过滤掉保险和贸易单证
			this.serviceMenus = this.serviceMenus.filter(item => item.component !== 'Insurance' && item.component !== 'Document')

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
					item.isJoint = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].isJoint === 'y'
				}
			})
			if (this.isEpricing || this.isEcs) {
				this.serviceMenus = this.serviceMenus.filter(el => this.ecsAndepricingService.includes(el.code) || el.component === 'PodWarehouseIng')
			}
			console.log('this.serviceMenus', this.serviceMenus);
			
		},
		handleClickMenu(item) {
			localStorage.insuranceJoint = item.isJoint
			if (item.component === this.$route.name) return
			this.$store.dispatch('tagsView/delView', this.$route)
			this.$emit('routerPush', {
				name: item.component,
				query: this.$route.query
			})
		}
	}
}
</script>
<style lang="scss" scoped> // 暂加scoped，后面如需使用该组件，再修改
.columns-menu {
	display: block;
	min-width: 116px;
	list-style: none;
	background-color: #fff;
	padding: 0;
	margin: 0;
	position: relative;
	box-shadow: 4px 0px 10px 0px rgba(233, 233, 233, 1);
	margin-right: 5px;
	li {
		line-height: 24px;
		height: 24px;
		border-bottom: 1px solid #e9e9e9;
		padding: 0 3px;
		text-align: center;
		color: #4a4a4a;
		cursor: pointer;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		.name {
			margin-right: 2px;
		}
		.el-icon-caret-top {
			color: #fff;
			position: absolute;
			top: -8px;
		}
		&.active {
			background-color: #3e80f5;
			color: #fff;
			.icon-joint {
				background-color: transparent;
				color: #fff;
				border: 1px solid #fff;
			}
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
