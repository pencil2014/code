<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<el-button size="mini" @click="handleDo('Add')" plain>新增</el-button>
			<el-button size="mini" @click="handleDo('Invalid')" plain class="ml10">批量禁用</el-button>
		</div>
		<div class="table-filter-right">
		</div>
	</div>
</template>
<script>
export default {
	data() {
		return {}
	},
	props: {
		callback: {
			type: Function,
			default: () => ({})
		}
	},
	created() {
	},
	mounted() {},
	components: {},
	methods: {
		handleDo(type) {
			this.callback(type)
		},
	}
}
</script>
<style scoped></style>
