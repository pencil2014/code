<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<!-- <el-button type="primary" size="mini" @click="handleApply">
				新增
			</el-button>
			<el-button type="danger" size="mini" @click="handleDisable" >
				禁用
			</el-button> -->
			<!-- <el-button type="default" size="mini" ref="btnExport" @click="handleExport">
				导出
			</el-button> -->
		</div>
		<div class="table-filter-right">
			<div class="pulish-status">
				<el-radio-group v-model="tableQuery.applyStatus" size="mini" @change="handleSearchByStatus">
					<el-radio-button size="mini" v-for="(item, index) in statusOptions" :key="index" :label="index">{{ item }}</el-radio-button>
				</el-radio-group>
			</div>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'

export default {
	data() {
		return {}
	},
	props: {
		config: {
			type: Object,
			default: () => ({})
		},
		// 接口传参
		tableQuery: {
			type: Object,
			default: () => ({})
		},
		callback: {
			type: Function,
			default: () => ({})
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap
		}),
		statusOptions() {
			return {
				all: '全部',
				SUBMIT: '待接单',
				ACCEPT: '已接单',
				REFUSE: '已拒绝',
				CANCEL: '已撤回'
			}
		}
	},
	components: {},
	methods: {
		// 自定义表头
		handleCustomColumns() {
			this.callback('CustomColumns')
		},
		// 导出
		handleExport() {
			this.$confirm('是否确认导出？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.callback('Export')
			})
		},
		handleApply() {
			this.callback('Apply')
		},
		handleDisable() {
			this.callback('Disable')
		},
		// 新增寄单任务
		handleAddPost() {},
		// 按发布状态查询
		handleSearchByStatus(value) {
			Object.assign(this.tableQuery, {
				applyStatus: value
			})
			console.log(this.tableQuery.applyStatus)

			this.callback('PenddingStatus')
		}
	}
}
</script>
<style scoped></style>
