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
					label: "????????????",
					name: "confirmBillList",
				},
				{
					label: "??????????????????",
					name: "sysLinePageList",
				},
				{
					label: "??????????????????",
					name: "pricingPageList",
				},
				{
					label: "?????????????????????",
					name: "specialPageList",
				},
				{
					label: "????????????",
					name: "commerceSettlementBillList",
				},
				{
					label: "????????????",
					name: "hedgeBillList",
				},
				{
					label: "????????????",
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
    // url??????tabFromOther,?????????????????????
    if (this.$route.query.tabFromOther == 'commerceSettlementBillList') {
      // ?????????nextTick ????????????this.activeName??????
      this.$nextTick(() => {
        this.isNotFirstActivated = true
        this.activeName = 'commerceSettlementBillList'
        // ?????????nextTick ?????????????????????search??????activated????????????????????????url??????
        // search?????????????????????????????????
        // this.$nextTick(() => {
        //   this.$router.push({ name: 'SeaCommerceList' }) // this.$router.push('seaCommerceList')
				// })
      })
    } else if (this.$route.query.tabFromOther === 'confirmBillList') {
			this.$nextTick(() => {
        this.isNotFirstActivated = true
        this.activeName = 'confirmBillList'
        // ????????????????????????????????????????????????????????????
				this.$nextTick(() => {
          this.$router.push({ name: 'SeaCommerceList' })
				})
      })
		} else if (!this.isNotFirstActivated) {
      // activeName??????????????????????????????????????????????????????????????????tabFromOther???????????????confirmBillList???commerceSettlementBillList??????????????????
      this.isNotFirstActivated = true
      this.activeName = 'confirmBillList'
    }
	},
	methods: {
	},
};
</script>
