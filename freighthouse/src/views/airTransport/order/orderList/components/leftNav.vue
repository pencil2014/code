<template>
	<!-- serviceMenus && serviceMenus.length &&  -->
	<ul class="columns-menu" v-show="viewState">
		<li v-for="(item, index) in serviceMenus" :key="index" @click="handleClickMenu(item)" :class="activityKey === item.component ? 'active' : ''">
			<span class="name">{{ item.cname }}</span>
			<i class="icon-warning" v-if="item.isCancelApply || item.isEdit"></i>
			<i class="icon-joint" v-if="item.isJoint">协</i>
			<i class="el-icon-success" v-if="item.isFinish" style="color: rgb(134,204,115)"></i>
		</li>
		<!-- {{serviceMenus}} -->
	</ul>
</template>
<script>
import store from '@/store'
export default {
	data() {
		return {
			serviceMenus: []
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
		viewState() {
			let { action } = this.$route.query
			return action !== 'add' && action !== 'copy'
		}
	},
	components: {},
	watch: {
		orderInfo: {
			handler(newVal, oldVal) {
				this.getServiceMenu(newVal)
			},
			deep: true
		}
	},
	methods: {
		getServiceMenu(data) {
			if (!data || !Object.keys(data).length) return (this.serviceMenus = [])
			let allServices = JSON.parse(JSON.stringify(store.state.airTransport.allServicesMenu))
			let { serviceList, serviceInfoList } = data
			console.log(serviceList)
			console.log('🚀 ~ allServices', allServices)
			this.serviceMenus = allServices.filter(item => {
				return (item.code && serviceList.includes(item.code)) || (item.child && item.child.some(ele => serviceList.includes(ele.code)))
			})
			// // 委托订舱过滤掉保险和贸易单证
			// if (this.orderInfo.serviceType === 'st05') {
			// 	this.serviceMenus = this.serviceMenus.filter(item => item.component !== 'AirDocument' && item.component !== 'AirInsurance')
			// }

			console.log(this.serviceMenus)
			this.serviceMenus.map(item => {
				if (item.child && item.child.length) {
					item.child = item.child.filter(ele => {
						return serviceList.includes(ele.code)
					})
					item.isCancelApply = item.child.some(ele => {
						let tempItem = serviceInfoList.filter(o => o.serviceCode === ele.code)
						return tempItem && tempItem.length && tempItem[0].cancelApplyStatus === 'applied'
					})
					item.isFinish = item.child.every(ele => {
						let tempItem = serviceInfoList.find(o => o.serviceCode === ele.code)
						return tempItem && tempItem.serviceStatus === 'finish'
					})
					item.isEdit = item.child.every(ele => {
						let tempItem = serviceInfoList.find(o => o.serviceCode === ele.code)
						return tempItem && tempItem.isEdit === 'y'
					})
					item.isJoint = item.child.every(ele => {
						let tempItem = serviceInfoList.find(o => o.serviceCode === ele.code)
						return tempItem && tempItem.isJoint === 'y'
					})
				} else {
					let serviceInfoItem = serviceInfoList.filter(ele => ele.serviceCode === item.code)
					item.isCancelApply = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].cancelApplyStatus === 'applied'
					item.isFinish = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].serviceStatus === 'finish'
					item.isEdit = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].isEdit === 'y'
					item.isJoint = serviceInfoItem && serviceInfoItem.length && serviceInfoItem[0].isJoint === 'y'
				}
			})
			console.log('this.serviceMenus', this.serviceMenus)
		},
		handleClickMenu(item) {
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
<style lang="scss">
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
		padding: 0 3px;
		border-bottom: 1px solid #e9e9e9;
		text-align: center;
		color: #4a4a4a;
		cursor: pointer;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		.name {
			margin-right: 5px;
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
			&:before {
				content: '';
				display: block;
				position: absolute;
				background-color: #fff;
				border-radius: 2px;
				top: -4px;
				left: 50%;
				margin-left: -5px;
				width: 9px;
				height: 9px;
				border-width: 5px 5px 0 0;
				border-color: transparent;
				border-style: solid;
				-webkit-transform: matrix(0.71, -0.71, 0.71, 0.71, 0, 0);
				transform: matrix(0.71, -0.71, 0.71, 0.71, 0, 0);
				z-index: 3;
			}
			&.active {
				&:before {
					background-color: #3e80f5;
				}
			}
		}
	}
}
</style>
