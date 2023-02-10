<template>
	<div
		class="finance-container finance-regwriteoff regwriteoff"
	>
		<div class="finance-page">
			<el-tabs v-model="activeName" @tab-click="tabClick" class="fin-el-tabs">
				<el-tab-pane
					v-for="(item, index) in tabsList"
					:key="'tabsList' + index"
					:label="item.label"
					:name="item.name"
				>
					<!-- class="fin-el-tab-pane" -->
					<!-- <template>
						<div class="finance-search-tabs-gap"></div>
						<div v-if="item.name === 'orderList' && activeName === 'orderList'">
							<OrderList ref="first" :isJumpRouteFromPage.sync="isJumpRouteFromPage" />
						</div>
						<div v-if="item.name === 'writeoffPayList' && activeName === 'writeoffPayList'">
							<WriteoffPayList ref="second" :isJumpRouteFromPage.sync="isJumpRouteFromPage"
							/>
						</div>
					</template> -->
				</el-tab-pane>
			</el-tabs>
      <!-- 为提升性能，暂时牺牲部分不常用的路由跳转问题 -->
      <keep-alive>
        <component
          :ref="activeName"
          :is="component"
          :isJumpRouteFromPage.sync="isJumpRouteFromPage"
        />
      </keep-alive>
		</div>
	</div>
</template>
<script>
import OrderList from '../order/'
import WriteoffPayList from '../writeoffPay/'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
export default {
	mixins: [mixin, routerMixin],
	data () {
		return {
			activeName: 'orderList',
			tabsList: [
				{
					label: this.$t('PayApplyList.payOrder'), // '付款单',
					name: 'orderList'
				},
				{
					label: this.$t('PayApplyList.payWriteOff'), // '付款核销',
					name: 'writeoffPayList'
				},
			],
			isJumpRouteFromPage: false,
      componentCfg: {
        orderList: OrderList,
        writeoffPayList: WriteoffPayList,
      },
		}
	},
	created () {
	},
	components: {
		OrderList,
		WriteoffPayList,
	},
	methods: {
		tabClick (tab, event) {
		},
	},
  computed: {
    component() {
      return this.componentCfg[this.activeName]
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-container.finance-regwriteoff .fin-el-tab-pane {
  padding: 0;
  min-height: calc(100vh - 246px);
}
.finance-search-tabs-gap{
  height: 16px;
  background: #F8F9FD;
}
</style>
<style lang="scss" scoped>
.regwriteoff .finance-search-tabs-gap{
  height: 0px;
  background: #F8F9FD;
}
</style>


