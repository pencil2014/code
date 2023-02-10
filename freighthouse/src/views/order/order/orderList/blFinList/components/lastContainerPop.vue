<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<div class="ship-data" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
				<el-table fit highlight-current-row style="width: 100%" :data="tableData" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip" class="lastContainer-table">
					<el-table-column prop="orderNo" label="工作号" align="center"> </el-table-column>
					<el-table-column prop="blNo" label="提单号" align="center"> </el-table-column>
					<el-table-column prop="blMode" label="出单方式" align="center" width="100">
						<template slot-scope="scope">
							{{scope.row.blMode | getDictLabelFilter('blMode')}}
						</template>
					</el-table-column>
					<el-table-column prop="tAmount" label="T量" align="center" width="100"> </el-table-column>
					<el-table-column prop="etdTime" label="预计开船时间" align="center" width=""> </el-table-column>
					<el-table-column prop="tdTime" label="实际开船时间" align="center" width=""> </el-table-column>
					<el-table-column prop="etaTime" label="预计到港时间" align="center"> </el-table-column>
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
import { blListBackContainer } from '@/api/order/bl'
import tableTooltip from '@/components/Base/Table/table-tooltip'
export default {
	filters: {},
	data() {
		return {
			tableData: [],
			dialogConfig: {
				title: '后有柜详情',
				show: true,
				size: 'medium',
				width: '900px',
				showBtns: false
			},
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			},
		}
	},
	props: {
		lastContainerPopQuery: {
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
			this.lsLoading = true
			let data = {
				blIdList: this.lastContainerPopQuery.custBlIds
			}
			blListBackContainer(data).then(res => {
				this.tableData = res.data
			}).finally(() => {
				this.lsLoading = false
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
.lastContainer-table {
	.cell {
		display: block;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
}
</style>
