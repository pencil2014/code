<template>
	<div class="app-container" id="putApply">
		<el-tabs v-model="activeName" @tab-click="handleClick" class="put-el-tabs">
			<el-tab-pane label="品名列表" name="Apply"></el-tab-pane>
			<!-- <el-tab-pane label="品名审核" name="Audit"></el-tab-pane> -->
		</el-tabs>
		<keep-alive>
			<component :is="component" :ref="activeName" :isJumpRouteFromPage.sync="isJumpRouteFromPage" />
		</keep-alive>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import ApplyList from '@/views/order/order/orderList/cargoNameList/index'
import AuditList from '@/views/order/order/orderList/cargoAuditList/index'

export default {
	mixins: [routerMixin],
	data() {
		return {
			activeName: 'Apply'
		}
	},
	activated() {
		if (this.$route.meta.refresh) {
			this.refresh()
		}
	},
	deactivated() {},
	created() {
		this.init()
	},
	mounted() {},
	computed: {
		...mapState('user', ['userId']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			roles: state => state.user.roles
		}),
		component() {
			return this.activeName === 'Apply' ? ApplyList : AuditList
		}
	},
	beforeRouteEnter(to, from, next) {
		// console.log('from', from, to)
		if (from.name === 'BlFinApplyDetail') {
			to.meta.refresh = true
		}
		next()
	},
	watch: {},
	components: {
		ApplyList,
		AuditList
	},
	methods: {
		handleClick(val) {},
		init() {
			if (this.$route.query.tab === 'audit') {
				this.activeName = 'Audit'
				this.$nextTick(() => {
					this.$refs.Audit.externalSearch()
				})
			}
		},
		refresh() {
			if ((this.activeName = 'Apply')) {
				this.$nextTick(() => {
					this.$refs.Apply.refresh()
				})
			}
		}
	}
}
</script>
<style lang="scss" scoped>
#putApply {
	.put-el-tabs {
		background: #ffffff;
		border-radius: 2px; // border-radius: 4px 4px 0px 0px;
		/deep/ .el-tabs__header {
			margin: 0;
		}
		/deep/ .el-tabs__nav-scroll {
			padding-left: 14px;
		}
		/deep/ .el-tabs__item {
			font-size: 14px;
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
