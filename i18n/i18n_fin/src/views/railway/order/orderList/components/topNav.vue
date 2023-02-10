<template>
	<div class="rail-detail-top">
		<el-alert v-if="$route.query.source === 'orderList' && Object.keys(custInfoObj).length && custInfoObj.status !== 'valid'&& custInfoObj.custClass !== 'DEPARTMENT'" class="forbid" type="warning">
			<template slot="title">
				<i class="tag-forbid">禁</i>
				<span class="text">该客户还未进行资质认证审核，不允许放舱给客户。</span>
			</template>
		</el-alert>
		<ul class="top-nav-tabs">
			<li :class="{ 'is-active': item.key === activityKey }" v-for="(item, index) in menus" :key="'top-nav-' + index" @click="tabsClick(item.key, item.path)">
				{{ item.value }}
			</li>
			<!-- 委托订舱的提单tab-->
			<li :class="{ 'is-active': 'BlList' === activityKey }" @click="tabsClick('RailwayBlList')">
				提单
			</li>
			<li :class="{ 'is-active': 'OrderFee' === activityKey }" @click="tabsClick('OrderFee')">费用</li>
			<!-- <li :class="{ 'is-active': 'OrderFee' === activityKey }" @click="tabsClick('RailwayOrderFee')">费用</li> -->
			<li :class="{ 'is-active': 'FileList' === activityKey }" @click="tabsClick('RailwayFileList')">附件</li>
			<!-- 商务 整箱才显示-->
			<li v-if="showRelate || asyncRelate" :class="{ 'is-active': 'ChildOrderList' === activityKey }" @click="tabsClick('RailwayChildOrderList')">
				关联订单
			</li>
		</ul>

		<div v-if="userRoles.length > 1" class="rail-toggle-btn margin-init">
			<span :class="ordDetRole === 'bd' ? 'rail-active' : ''" v-if="userEditRoles.includes('bd')" type="default" size="mini" @click="handleChangeRole('bd')"> 业务视角 </span>
			<span :class="ordDetRole === 'pricing' ? 'rail-active' : ''" v-if="userEditRoles.includes('pricing')" type="default" size="mini" @click="handleChangeRole('pricing')"> 商务视角 </span>
			<span :class="ordDetRole === 'bkg' ? 'rail-active' : ''" v-if="userEditRoles.includes('bkg')" type="default" size="mini" @click="handleChangeRole('bkg')"> bkg视角 </span>
			<span :class="ordDetRole === '' ? 'rail-active' : ''" v-if="userEditRoles.includes('op')" type="default" size="mini" @click="handleChangeRole('')"> 操作视角 </span>
			<span :class="ordDetRole === 'epricing' ? 'rail-active' : ''" v-if="userEditRoles.includes('epricing')" type="default" size="mini" @click="handleChangeRole('epricing')">海外商务</span>
			<span :class="ordDetRole === 'ecs' ? 'rail-active' : ''" v-if="userEditRoles.includes('ecs')" type="default" size="mini" @click="handleChangeRole('ecs')"> 海外客服 </span>
		</div>
	</div>
</template>
<script>
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { lclChildList, getValueByKey } from '@/api/railway/list'
import { mapState, mapMutations } from 'vuex'
import { orderMixin } from '@/views/railway/order/mixins/orderMixin'
const menus = [
	{
		key: 'RailwayOrderDetail',
		value: '订单详情'
	}
]
export default {
	mixins: [routerMixin, orderMixin],
	data() {
		return {
			// curRole: '',
			menus: [],
			childOrderList: [], // 关联子订单
			cTimestamp: 0,
			asyncRelate: false
		}
	},
	props: {
		serviceType: {
			type: String,
			default: ''
		},
		activityKey: {
			type: String,
			default: ''
		},
		type: {
			type: String,
			default: ''
		},
		custid: {
			type: Number,
			default: 0
		}
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.getOrderInfo()
		this.initMenus()
	},
	activated() {
		let timestamp = new Date().getTime()
		if (timestamp - this.cTimestamp > 300) {
			// getOrderInfo 不同的订单服务项不同
			this.getOrderInfo()
			this.initMenus()
		}
	},
	mounted() {},

	computed: {
		...mapState('order', ['custInfoObj']),
		...mapState('railway', ['orderList', 'serviceList', 'ordDetRole', 'userEditRoles']),
		...mapState('user', ['deptCode']),
		...mapState({
			roles: state => state.user.roles,
			dictMap: state => state.dict.dictMap
		}),
		showRelate() {
			if (this.$route.query.showRelate === undefined) {
				this.$store.dispatch('railway/getValueByKeys', { custid: this.custid }).then(data => {
					this.asyncRelate = data && ['st07'].includes(this.serviceType) && (this.isPricing || this.isBkg || this.isOp)
					return data && ['st07'].includes(this.serviceType) && (this.isPricing || this.isBkg || this.isOp)
				})
			} else {
				return JSON.parse(this.$route.query.showRelate)
			}
		},
		showBl() {
			if (this.$route.query.showBl === undefined) {
				return ['st07', 'st08'].includes(this.serviceType)
			} else {
				return JSON.parse(this.$route.query.showBl)
			}
		},

		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isBd() {
			return this.ordDetRole === 'bd'
		},
		isPricing() {
			return this.ordDetRole === 'pricing'
		},
		userRoles() {
			return this.userEditRoles.filter(item => item !== 'op')
		}
	},
	components: {},
	watch: {
		serviceType: {
			handler(newVal, oldVal) {
				if (newVal) {
				}
			},
			deep: true
		}
	},
	methods: {
		...mapMutations('railway', ['setRailCurRole', 'setRole']),
		handleChangeRole(val) {
			this.setRole(val)
			// this.$emit('getInfo')
		},
		initMenus() {
			this.menus = [...menus]
			let { source } = this.$route.query
			// 散货拼箱创建整柜的订单多个关联订单的tab
			if (this.type === 'fcl') {
				this.menus[0].key = 'FclOrderDetail'
			} else if (source === 'lclOrderList') {
				this.menus[0].key = 'LclOrderDetail'
			} else if (source === 'orderList') {
				this.menus[0].key = 'RailwayOrderDetail'
			}
		},
		lclChildList() {
			let { query, params } = this.$route
			let orderNo = query.orderNo
			lclChildList({ orderNo: orderNo }).then(res => {
				this.childOrderList = res.data
			})
		},
		// 点击切换顶部tabs
		tabsClick(activityKey) {
			let { query, params } = this.$route
			let { orderNo } = query
			if (activityKey === this.$route.name) return
			let createOrderStr = sessionStorage.getItem('createOrderStr')
			// 创建订单时点击其他托书信息，集装箱等tab时提示先保存
			if (this.$route.query.action === 'add' && createOrderStr && activityKey !== 'OrderDetail') {
				return this.$message({
					type: 'warning',
					message: '请先保存或提交订单',
					duration: 1000,
					onClose: () => {}
				})
			}

			this.$store.dispatch('tagsView/delView', this.$route)
			query = { ...query, ...{ businessBroad: 'rail' } }
			this.$emit('routerPush', { name: activityKey, query })
		}
	}
}
</script>
<style lang="scss" scoped> // 暂加scoped，后面如需使用该组件，再修改
.rail-detail-top {
	position: relative;
	.rail-toggle-btn {
		position: absolute;
		top: 6px;
		right: 0px;
		span {
			border: 1px solid #dcdfe6;
			padding: 1px 8px;
			margin-right: 6px;
			border-radius: 3px;
			cursor: pointer;
		}
		.rail-active {
			color: #3e80f5;
			border-color: #3e80f5;
		}
	}
	.el-button.active {
		color: #3e80f5;
		border-color: #3e80f5;
	}
	.margin-init {
		margin: initial !important;
	}
}
.top-nav-tabs {
	position: relative;
	margin: 0;
	background-color: #fff;
	height: 24px;
	line-height: 24px;
	overflow: hidden;
	&:before {
		content: '';
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		background-color: #e9e9e9;
		height: 1px;
	}
	li {
		float: left;
		font-size: 14px;
		line-height: 24px;
		height: 24px;
		text-align: center;
		padding: 0 30px;
		position: relative;
		color: #3e80f5;
		cursor: pointer;
		&:before {
			content: '';
			position: absolute;
			display: block;
			height: 16px;
			width: 1px;
			right: -1px;
			top: 5px;
			background-color: #3e80f5;
		}
		&.is-active {
			color: #fff;
			background-color: #3e80f5;
			&:before {
				content: '';
				position: absolute;
				display: block;
				height: 16px;
				left: 1px;
				right: 0;
				top: 8px;
			}
		}
	}
}
</style>
