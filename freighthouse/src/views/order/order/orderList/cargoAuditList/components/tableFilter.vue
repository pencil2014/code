<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<el-button type="primary" size="mini" ref="btnRecall" @click="handlePass">审核通过</el-button>
			<el-button type="danger" size="mini" ref="btnAudit" @click="handleRefuse">审核拒绝</el-button>

			<!-- <el-button type="default" size="mini" ref="btnExport" @click="handleExport">导出</el-button> -->
		</div>
		<div class="table-filter-right">
			<div class="pulish-status">
				<el-radio-group v-model="tableQuery.auditStatus" size="mini" @change="handleSearchByStatus">
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
				approving: '待审核',
				pass: '审核通过',
				refuse: '审核拒绝'
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
		// 新增寄单任务
		handleAddPost() {},
		// 按发布状态查询
		handleSearchByStatus(value) {
			Object.assign(this.tableQuery, {
				auditStatus: value
			})
			this.callback('SearchByAuditStatus')
		},
		// 批量通过
		// handleAuditPass() {
		// 	this.callback('AuditPassBatch')
		// },
		// 拒绝
		handleRefuse(type) {
			this.callback('BatchRefuse', type)
		},
		// handleAudit() {
		// 	this.callback('Audit')
		// },
		handlePass() {
			this.callback('BatchPass')
		}
	}
}
</script>
<style scoped></style>
