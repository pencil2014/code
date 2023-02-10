<template>
	<div class="finance-page">
		<el-tabs v-model="activeName" class="fin-el-tabs">
			<el-tab-pane
				v-for="(item, index) in tabsList"
				:key="'tabsList' + index"
				:label="item.label"
				:name="item.name"
				class="fin-el-tab-pane"
			>
			</el-tab-pane>
      <keep-alive>
				<template v-if="activeName === 'confirmBillList'">
					<ConfirmBillList
						key="ConfirmBillList"
						:isJumpRouteFromPage.sync="isJumpRouteFromPage"
					/>
				</template>
				<template v-if="activeName === 'sysLinePageList'">
					<SysLinePageList
						key="SysLinePageList"
						:isJumpRouteFromPage.sync="isJumpRouteFromPage"
					/>
				</template>
				<template v-if="activeName === 'pricingPageList'">
					<PricingPageList
						key="PricingPageList"
						:isJumpRouteFromPage.sync="isJumpRouteFromPage"
					/>
				</template>
				<template v-if="activeName === 'specialPageList'">
					<SpecialPageList
						key="SpecialPageList"
						:isJumpRouteFromPage.sync="isJumpRouteFromPage"
					/>
				</template>
				<!-- <template v-if="activeName === 'summaryBillList'">
					<SummaryBillList
						key="SummaryBillList"
						:isJumpRouteFromPage.sync="isJumpRouteFromPage"
					/>
				</template> -->
				<template v-if="activeName === 'commerceSettlementBillList'">
					<CommerceSettlementBillList
						key="CommerceSettlementBillList"
						:isJumpRouteFromPage.sync="isJumpRouteFromPage"
					/>
				</template>
				<template v-if="activeName === 'hedgeBillList'">
					<HedgeBillList
						key="HedgeBillList"
						:isJumpRouteFromPage.sync="isJumpRouteFromPage"
					/>
				</template>
				<template v-if="activeName === 'summaryFeeList'">
					<SummaryFeeList
						key="SummaryFeeList"
						:isJumpRouteFromPage.sync="isJumpRouteFromPage"
					/>
				</template>
      </keep-alive>
		</el-tabs>
	</div>
</template>

<script>
import ConfirmBillList from "./confirmBillList";
import SysLinePageList from "./sysLinePageList";
import PricingPageList from "./pricingPageList";
import SpecialPageList from "./specialPageList";
import SummaryFeeList from "./summaryFeeList";
import CommerceSettlementBillList from "./commerceSettlementBillList";
import HedgeBillList from "./hedgeBillList";
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from "@/views/finance/mixins/routerMixin";
export default {
	components: {
		ConfirmBillList,
		SysLinePageList,
		PricingPageList,
		// SummaryBillList,
		CommerceSettlementBillList,
		HedgeBillList,
		SummaryFeeList,SpecialPageList
	},
	mixins: [mixin, routerMixin],
	data () {
		return {
			activeName: "",
			tabsList: [
				{
					label: "账单确认",
					name: "confirmBillList",
				},
				{
					label: "航线月度汇总",
					name: "sysLinePageList",
				},
				{
					label: "商务月度汇总",
					name: "pricingPageList",
				},
				{
					label: "特种柜月度汇总",
					name: "specialPageList",
				},
				{
					label: "结算申请",
					name: "commerceSettlementBillList",
				},
				{
					label: "亏损对冲",
					name: "hedgeBillList",
				},
				{
					label: "费用汇总",
					name: "summaryFeeList",
				},
			],
			cTimestamp: 0,
		};
	},
	created () {
    console.log('created');
		this.cTimestamp = new Date().getTime();
	},
	activated () {
    // url有值tabFromOther,说明是链接跳转
    if (this.$route.query.tabFromOther == 'commerceSettlementBillList') {
      // 不使用nextTick 直接设置this.activeName无效
      this.$nextTick(() => {
        this.isNotFirstActivated = true
        this.activeName = 'commerceSettlementBillList'
        // 不使用nextTick 直接跳转路由，search组件activated钩子则无法读取原url参数
        // search内已处理，此处不需跳转
        // this.$nextTick(() => {
        //   this.$router.push({ name: 'SeaCommerceList' }) // this.$router.push('seaCommerceList')
				// })
      })
    } else if (this.$route.query.tabFromOther === 'confirmBillList') {
			this.$nextTick(() => {
        this.isNotFirstActivated = true
        this.activeName = 'confirmBillList'
        // 确认账单页面有单独的逻辑，所有再此处跳转
				this.$nextTick(() => {
          this.$router.push({ name: 'SeaCommerceList' })
				})
      })
		} else if (!this.isNotFirstActivated) {
      // activeName最好不要设置初始值，设置初始值初次进入有参数tabFromOther时，会请求confirmBillList、commerceSettlementBillList两个页面接口
      this.isNotFirstActivated = true
      this.activeName = 'confirmBillList'
    }
	},
	methods: {
	},
};
</script>
