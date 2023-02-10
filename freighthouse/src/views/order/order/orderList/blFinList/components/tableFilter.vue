<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<!-- <el-button size="mini" ref="btnCustomColumns" @click="handleCustomColumns" plain class="ml10">自定义表头</el-button> -->
			<!-- <el-button size="mini" ref="btnAuditPass" @click="handleAuditPass" plain class="ml10">批量通过</el-button> -->
			<el-button type="primary" size="mini" ref="btnAudit" @click="handleAuditBatch" class="">审核</el-button>
			<!-- <el-button type="primary" size="mini" ref="btnAuditCommonPass" @click="handleAuditBatch" class="">普通审核</el-button>
			<el-button type="primary" size="mini" ref="btnAuditSpecialPass" @click="handleAuditBatch('special')" class="ml10">特殊审核</el-button> -->
			<el-button type="default" size="mini" ref="btnRecall" @click="handleRecall" class="btn-blFinApply-recall ml10">撤回</el-button>
			<el-button type="default" size="mini" ref="btnExport" @click="handleExport">导出</el-button>
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
				submit: '待审核',
				processing: '处理中',
				pass: '审核通过',
				state: '已取消'
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
		// 批量审核
		handleAuditBatch(type) {
			this.callback('AuditBatch', type)
		},
		// handleAudit() {
		// 	this.callback('Audit')
		// },
		handleRecall() {
			this.callback('Recall')
		}
	}
}
</script>
<style scoped></style>
