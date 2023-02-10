<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<div class="ship-data">
				<el-table fit highlight-current-row style="width: 100%" :data="tableData" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip" class="workFlow-table">
					<el-table-column prop="configNodeName" label="节点名称" align="center"> </el-table-column>
					<el-table-column prop="auditEmployeeName" label="审批人名称" align="center"> </el-table-column>
					<el-table-column prop="auditDeptName" label="审批人部门" align="center" width=""> </el-table-column>
					<el-table-column prop="auditContent" label="备注内容" align="center" width=""> </el-table-column>
					<el-table-column prop="auditStatus" label="审核状态" align="center">
						<template slot-scope="scope">
							<span>{{auditStatusObj[scope.row.auditStatus]}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="auditTime" label="审核时间" align="center"> </el-table-column>
				</el-table>
				<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
			</div>
		</BaseDialog>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import { workFlowActNodeList } from '@/api/order/bl'
import tableTooltip from '@/components/Base/Table/table-tooltip'
export default {
	filters: {},
	data() {
		return {
			tableData: [],
			dialogConfig: {
				title: '特殊审批参与人',
				show: true,
				size: 'medium',
				width: '1120px',
				showBtns: false
			},
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			},
			auditStatusObj: {
				PASS: '审核通过',
				REFUSE: '审核拒绝',
				SUBMIT: '待审核'
			}
		}
	},
	props: {
		workFlowPopQuery: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.getList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	components: {
		BaseDialog,
		tableTooltip
	},
	watch: {},
	methods: {
		// 鼠标移入cell
		showTooltip(row, column, cell) {
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
		},
		// so列表
		getList() {
			let data = {
				actId: this.workFlowPopQuery.actId
			}
			workFlowActNodeList(data).then(res => {
				this.tableData = res.data
			})
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.close('Confirm', this.tableData)
			} else {
				this.close('Cancel', this.tableData)
			}
		},
	}
}
</script>
<style lang="scss">
.workFlow-table {
	.cell {
		display: block;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
}
</style>
