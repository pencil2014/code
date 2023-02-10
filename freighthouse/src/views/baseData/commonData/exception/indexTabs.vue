<template>
	<div class="finance-page">
		<div class="finance-container finance-regwriteoff regwriteoff">
			<el-tabs v-model="activeName" @tab-click="tabClick" class="fin-el-tabs">
				<el-tab-pane v-for="(item, index) in tabsList" :key="'tabsList' + index" :label="item.label" :name="item.name" class="fin-el-tab-pane"> </el-tab-pane>
			</el-tabs>
			<keep-alive>
				<component :isJumpRouteFromPage1.sync="isJumpRouteFromPage" :ref="refStr" :is="component" />
			</keep-alive>
		</div>
	</div>
</template>
<script>
import Parent from '@/views/baseData/commonData/exception/parent'
import Son from '@/views/baseData/commonData/exception/son'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
	mixins: [mixin, routerMixin],
	data() {
		return {
			activeName: 'Son',
			tabsList: [
				{
					label: '异常子类',
					name: 'Son'
				},
				{
					label: '异常大类',
					name: 'Parent'
				}
			],
			isJumpRouteFromPage: false
		}
	},
	components: {
		Parent,
		Son
	},
	methods: {
		tabClick(tab, event) {}
	},
	computed: {
		component() {
			return this.activeName.substring(0, 1).toUpperCase() + this.activeName.substring(1)
		},
		refStr() {
			return this.activeName
		}
	}
}
</script>
<style lang="scss" scoped></style>
