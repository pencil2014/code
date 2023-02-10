<template>
	<div class="app-container" id="order-pedding-wrap">
		<RoleSwitch @callback="initQuery" />
		<el-tabs v-model="activeName" class="put-el-tabs">
			<el-tab-pane label="订单列表" name="Order"></el-tab-pane>
			<el-tab-pane v-if="currRole == 'bd'" label="待接单列表" name="Pendding"></el-tab-pane>
		</el-tabs>
		<keep-alive>
			<component :is="component" :ref="activeName" />
		</keep-alive>
	</div>
</template>
<script>
import RoleSwitch from './components/roleSwitch'
import OrderList from '@/views/order/order/orderList/orderList'
import PenddingList from '@/views/order/order/orderList/penddingList/index'
import { mapState } from 'vuex'

export default {
	data() {
		return {
			activeName: 'Order'
		}
	},

	created() {},
	mounted() {
		this.setCurTab()
	},

	computed: {
		...mapState({
			currRole: state => state.order.currRole
		}),
		component() {
			return this.activeName === 'Order' ? OrderList : PenddingList
		}
	},
	watch: {},
	components: {
		RoleSwitch,
		OrderList,
		PenddingList
	},
	methods: {
		setCurTab() {
			if (this.$route.query.curTab === 'pendding') {
				this.activeName = 'Pendding'
			} else {
				this.activeName = 'Order'
			}
		},
		async initQuery() {
			console.log('🚀 ~ this.currRole', this.currRole)
			if (this.activeName === 'Pendding' && this.currRole !== 'bd') {
				this.activeName = 'Order'
			}
			await this.$nextTick()
			if (this.activeName == 'Order') {
				this.$refs[this.activeName].initQuery()
			}
		}
	}
}
</script>
<style lang="scss" scoped>
#order-pedding-wrap {
	.put-el-tabs {
		// background: #ffffff;
		border-radius: 2px; // border-radius: 4px 4px 0px 0px;
		/deep/ .el-tabs__header {
			margin: 0;
		}
		/deep/ .el-tabs__nav-scroll {
			padding-left: 14px;
		}
		/deep/ .el-tabs__item {
			font-size: 12px;
			color: #bfbfbf;
			line-height: 20px;
			padding: 4px 18px; // 5px 18px 5px
			height: 28px; // 30px
			&:nth-child(2) {
				padding-left: 0;
			}
			&:last-child {
				padding-right: 0;
			}
			&.is-active {
				color: #222;
				font-weight: 600;
			}
		}
	}
}
</style>
