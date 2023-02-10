<template>
	<div class="component-info cust-info">
		<span class="small-tit">工作号：{{ orderInfo.orderNo }}</span>
		<span class="ml20" style="display: inline-block">
			<entrustUnitComp />
		</span>
		<span class="ml20">客户委托号：{{ orderInfo.custIntrustNo }}</span>
		<!-- <el-button type="default" size="mini" @click="handleGoBack" class="btn-goBack" :disabled="returnDisabled">返回</el-button> -->
		<slot></slot>
		<workBtn />
	</div>
</template>
<script>
import workBtn from '@/views/order/order/orderList/components/workBtn.vue'
export default {
	data() {
		return {}
	},
	props: {
		orderInfo: {
			type: Object,
			default: () => ({})
		},
		returnDisabled: {
			type: Boolean,
			default: false
		}
	},
	activated() {},
	created() {},
	mounted() {},
	computed: {},
	components: {
		workBtn
	},
	watch: {},
	methods: {
		handleGoBack() {
			this.$router.push({
				name: 'RailwayOrderList'
			})
		}
	}
}
</script>
<style lang="scss">
.component-info.cust-info {
	overflow: initial !important;
}
.cust-info {
	position: relative;
}
.cust-info .small-tit .icon {
	vertical-align: text-top;
	margin-right: 5px;
	width: 16px;
}
.cust-info .btn-goBack {
	position: absolute;
	right: 15px;
}
</style>
