<template>
	<el-tooltip placement="top" popper-class="file-name-pop" :visible-arrow="false">
		<div class="copy-label" slot="content">
			<div v-for="(item, index) in param.fileNameList" :key="item" class="file-name-list">
				<el-button class="underline name-label" type="text" size="mini" @click="handleView(index)">{{ item }}</el-button>
			</div>
		</div>
		<span class="file-row-table-header-container">
			<span size="mini">{{ param.fileNameList.join(',') }}</span>
		</span>
	</el-tooltip>
</template>

<script>
export default {
	data() {
		return {
			copyShow: false
		}
	},
	props: ['param', 'item'],
	created() {},

	mounted() {},
	computed: {},
	watch: {},
	components: {},
	methods: {
		handleView(index) {
			let fileNo = this.param.fileNoList[index]
			let fileName = this.param.fileNameList[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		}
	}
}
</script>

<style lang="scss" scoped>
.file-row-table-header-container {
	white-space: nowrap;
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
}
.el-tag--mini {
	font-size: 10px;
	height: 16px;
	padding: 0 4px;
	line-height: 16px;
	cursor: pointer;
}
</style>
<style lang="scss">
.file-name-pop.is-dark {
	font-size: 12px;
	text-align: center;
	cursor: pointer;
	background: #ecf5ff;
	color: #409eff;
	border: 1px solid #d9ecff;
	padding: 2px 5px;
	margin-left: 5px;

	.file-name-list {
		display: flex;
		justify-content: space-between;
		.name-label {
			display: block;
			height: 20px;
			line-height: 20px;
			padding: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
}
</style>
