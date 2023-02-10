<template>
	<el-alert type="warning" :closable="false" class="gray">
		<template slot="title">
			<i class="tag-cancel">拒</i>
			<span class="txt refuse-reason"> 该订单已拒绝。拒绝原因：{{ refuseReason }} </span>
		</template>
	</el-alert>
</template>
<script>
export default {
	data() {
		return {}
	},
	props: {
		refuseReason: {
			type: String,
			default: ''
		}
	},
	created() {},
	mounted() {},
	computed: {},
	components: {},
	watch: {},
	methods: {}
}
</script>
<style lang="scss">
.refuse-reason {
	// word-break: break-all;
}
</style>
