<template>
	<div class="finance-page">
		<div class="finance-container">
			<el-tabs
				v-model="activeName"
				@tab-click="handleClick"
				class="fin-el-tabs"
			>
				<el-tab-pane
					v-for="item in tabsList"
					:label="item.label"
					:name="item.name"
					:key="item.name"
				>
				</el-tab-pane>
			</el-tabs>
			<!-- 组件不能放在el-tab-pane内，会引发所有tab页激活接口 -->
			<keep-alive>
        <component
          :ref="activeName"
          :is="activeName"
          :isJumpRouteFromPage.sync="isJumpRouteFromPage"
          :noticeTypeOptions="noticeTypeOptions"
        ></component>
			</keep-alive>
		</div>
	</div>
</template>

<script>
import BaddeList from './components/baddeList'
import SettleOrder from './components/settleOrderList'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
export default {
	mixins: [mixin, routerMixin],
	components: {
		BaddeList,
		SettleOrder
	},
	data () {
		return {
			tabsList: [
				{
					name: "baddeList",
					label: this.$t('Charge.baddeList')
				},
				{
					name: "settleOrder",
					label: this.$t('Charge.settleOrder')
				}
			],
			activeName: 'baddeList',
			noticeTypeOptions: {
				'baddeList': this.$t('Charge.baddeList'),
				'settleOrder': this.$t('Charge.settleOrder')
			},
			isJumpRouteFromPage: false
		}
	},
	methods: {
		handleClick (tab, event) {
		},
	}
}
</script>

<style lang="scss">
</style>