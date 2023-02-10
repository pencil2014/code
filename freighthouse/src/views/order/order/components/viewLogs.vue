<template>
	<el-dialog class="so-view-log" @close="handleClose" :title="'日志SO号 : ' + soNo" :visible="showLogs" width="1200px">
		<el-table :data="soLogData" style="width: 100%" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
			<el-table-column prop="polPortName" label="大船起运港" width="150"> </el-table-column>
			<el-table-column prop="podPortName" label="目的港" width="150"> </el-table-column>
			<el-table-column prop="containerInfo" label="箱型/箱量" width="120"> </el-table-column>
			<el-table-column prop="vessel" width="100" label="船名"> </el-table-column>
			<el-table-column prop="voyage" label="航次"> </el-table-column>
			<el-table-column prop="cutOffDate" width="100" label="截关时间"> </el-table-column>
			<el-table-column prop="bdEmployeeName" width="100" label="业务"> </el-table-column>
			<el-table-column prop="opEmployeeName" width="100" label="操作"> </el-table-column>
			<el-table-column prop="action" label="动作">
				<template slot-scope="scope">
					{{ actionFilter(scope.row.action) }}
				</template>
			</el-table-column>
			<el-table-column prop="remark" width="100" label="备注"> </el-table-column>
			<el-table-column prop="fileName" label="附件" align="center" width="150">
				<template slot-scope="scope"
					><span class="to-detail-btn" @click="handleViewDrop(scope.row)">{{ scope.row.fileName }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="actionTime" width="150" label="执行时间"> </el-table-column>
		</el-table>
		<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
	</el-dialog>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import tableTooltip from '@/components/Base/Table/table-tooltip'

export default {
	filters: {},
	data() {
		return {
			tableData: [],
			tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null // 行数据
      },
		}
	},
	props: {
		dialogOrderShow: {
			type: Boolean,
			default: false
		},
		blNo: {
			type: String,
			default: ''
		}
	},
	created() {
		console.log('🚀 ~ this.soNo', this.soNo)
	},

	mounted() {},
	activated() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			showLogs: state => state.book.showLogs,
			soLogData: state => state.book.soLogData,
			soNo: state => state.book.soNo
		}),
		actionFilter() {
			return function(action) {
				let actionItem = this.dictMap.soAction.find(item => item.value === action)
				if (actionItem) {
					return actionItem.label
				}
				return ''
			}
		}
	},
	components: {
		tableTooltip
	},
	watch: {},
	methods: {
		...mapMutations('book', ['setShowLogs']),
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
		handleClose() {
			this.setShowLogs(false)
		},
		// 预览附件
		handleViewDrop(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		}
	}
}
</script>
<style lang="scss" scoped>
.so-view-log {
	.to-detail-btn {
		cursor: pointer;
		color: #3e80f5;
	}
	/deep/ .el-table .cell.el-tooltip {
		overflow: hidden;
	}
	/deep/ .el-table .cell {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
	}
}
</style>
