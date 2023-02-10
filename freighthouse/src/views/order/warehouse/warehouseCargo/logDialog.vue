<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-table id="logTable" :data="list" style="width: 100%">
				<el-table-column prop="createdTime" label="时间"> </el-table-column>
				<el-table-column prop="createdName" label="执行人"> </el-table-column>
				<el-table-column prop="type" label="事件"> </el-table-column>
				<el-table-column prop="quantity" label="件数"> </el-table-column>
				<el-table-column prop="weight" label="毛重"> </el-table-column>
				<el-table-column prop="volume" label="体积"> </el-table-column>
				<el-table-column prop="packageType" label="包装"> </el-table-column>
				<el-table-column show-overflow-tooltip prop="remark" label="备注"> </el-table-column>
			</el-table>
			<div style="margin-top: 10px">
				<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
			</div>
		</BaseDialog>
	</div>
</template>

<script>
const defaultPage = {
	pageSize: 10,
	currPage: 1
}
import { copyArry, getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import { warehouseCargoLog } from '@/api/order/warehouse'
import Pagination from '@/components/Base/Table/newPagination'
export default {
	data() {
		return {
			tableConfig: {
				// 分页
				pagination: {
					pageSize: 10,
					show: true,
					total: 0,
					hasNextPage: false,
					hasPreviousPage: false,
					isFirstPage: false,
					isLastPage: false
				}
			},
			dialogConfig: {
				title: '日志',
				show: true,
				size: 'medium',
				width: '80%'
			},
			list: [],
			total: null,
			tableQuery: Object.assign({}, defaultPage)
		}
	},
	props: {
		stockId: {
			type: Number,
			default: 0
		},
		whId: {
			type: Number,
			default: 0
		},
		cargoId: {
			type: Number,
			default: 0
		},
		orderNo: {
			type: String,
			default: ''
		}
	},
	created() {
		this.getList()
	},
	components: {
		BaseDialog,
		Pagination
	},
	methods: {
		getList() {
			this.tableQuery = this.orderNo ? Object.assign({}, defaultPage, { orderNo: this.orderNo, cargoId: this.cargoId, whId: this.whId }) : Object.assign({}, defaultPage, { stockId: this.stockId })
			warehouseCargoLog(this.tableQuery).then(res => {
				res.data.list.map(item => {
					if (item.type == 'in') item.batchNo = item.inBatchNo
					if (item.type == 'out') item.batchNo = item.outBatchNo
					item.type = getDictLabel('warehouseStockLogType', item.type)
					item.packageType = getDictLabel('packageType', item.packageType)
				})
				this.list = res.data.list
				this.total = res.data.totalCount

				this.tableQuery.currPage = res.data.currPage
				this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
				this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
				this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
				this.tableConfig.pagination.isLastPage = res.data.isLastPage
				this.tableConfig.pagination.total = res.data.totalCount
				this.tableQuery.pageSize = res.data.pageSize
			})
		},
		dialogCallback(action, done) {
			this.close()
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 分页
		handleSizeChange() {
			this.getList()
		},
		handleCurrentChange() {
			this.getList()
		}
	}
}
</script>

<style lang="scss">
#logTable .el-table td {
	padding: 12px 0;
}
</style>
