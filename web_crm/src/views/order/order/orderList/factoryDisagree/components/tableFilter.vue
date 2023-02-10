<template>
	<div class="table-filter">
		<div class="table-filter-left">
			<el-button type="primary" size="mini" @click="handleApply">
				发起申请
			</el-button>
			<el-button type="primary" size="mini" @click="handleCancel" class="btn-blFinApply-recall">
				取消申请
			</el-button>
			<el-button type="primary" size="mini" @click="handleAudit">
				审批
			</el-button>
			<!-- <el-button type="default" size="mini" ref="btnExport" @click="handleExport">
				导出
			</el-button> -->
		</div>
		<div class="table-filter-right">
			<div class="pulish-status">
				<el-radio-group v-model="tableQuery.agreeReleaseStatus" size="mini" @change="handleSearchByStatus">
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
				init: '待申请',
				applied: '待审批',
				passAgree: '审批通过（工厂已同意)',
				passDisAgree: '审批通过（工厂未同意）',
				refuse: '审批拒绝',
				cancel: '已取消'
			}
		}
	},
	components: {},
	methods: {
		// // 导出
		// handleExport() {
		// 	this.$confirm('是否确认导出？', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     this.callback('Export')
    //   })
		// },
		handleApply() {
			this.callback('Apply')
		},
		handleCancel() {
			this.callback('Cancel')
		},
		handleAudit() {
			this.callback('Audit')
		},
		// 按发布状态查询
		handleSearchByStatus(value) {
			Object.assign(this.tableQuery, {
				agreeReleaseStatus: value
			})
			// console.log(this.tableQuery.agreeReleaseStatus)
			this.callback('SearchByStatus')
		}
	}
}
</script>
<style scoped></style>
