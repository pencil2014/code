<template>
	<div class="app-container">
		<div class="search-container">
			<Search :searchConditionHide="searchConditionHide" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery"> </Search>
		</div>
		<div class="ware-detail-tab">
			<el-tabs v-model="activeName" @tab-click="handleTab">
				<el-tab-pane label="起运港仓储" name="pol"></el-tab-pane>
				<el-tab-pane label="目的港仓储" name="pod"></el-tab-pane>
			</el-tabs>
		</div>

		<div class="table-container table-com-layout">
			<el-table fit :data="tableData" style="width: 100%; margin-top: 10px">
				<el-table-column prop="orderNo" label="工作号" align="left"> </el-table-column>
				<el-table-column prop="cname" label="品名" align="left"> </el-table-column>
				<el-table-column prop="mark" label="唛头" align="left"> </el-table-column>
				<el-table-column prop="batchNo" label="进仓编号" align="left"> </el-table-column>
				<el-table-column prop="lastQuantity" label="库存数" align="left"> </el-table-column>
				<el-table-column prop="lastWeight" label="库存毛重" align="left"> </el-table-column>
				<el-table-column prop="lastVolume" label="库存体积" align="left"> </el-table-column>				
				<el-table-column prop="rentFreePeriod" label="是否超免租期" align="left">
					<template slot-scope="scope">
						{{ scope.row.rentFreePeriod | rentFreePeriodFilter }}
					</template>
				</el-table-column>
				<el-table-column label="操作" align="left">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleClick(scope.row)" type="text" size="mini">日志</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<div class="base-el-pagination">
				<div class="pagination-container">
					<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
				</div>
			</div>
			<div v-if="showLogDialog">
				<LogDialog @close="close" :whId="whId" :cargoId="cargoId" :orderNo="orderNo"></LogDialog>
			</div>
		</div>
	</div>
</template>

<script>
import searchTableUtil from '@/utils/searchTableUtil'
import Search from '@/components/Base/Search/index'
import { listPolOrderCargoStock, listPodOrderCargoStock, warehouseList } from '@/api/order/warehouse'
import LogDialog from './logDialog'

import Pagination from '@/components/Base/Table/newPagination'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}

const defaultTableQuery = {
	// columns: [],
	ascColumns: [],
	descColumns: ['lastQuantity'],
	query: [] // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
}

export default {
	data() {
		return {
			activeName: 'pol',
			orderNo: '',
			whId: 0,
			cargoId: 0,
			tableConfig: {
				// 分页
				pagination: {
					show: true,
					total: 0,
					hasNextPage: false,
					hasPreviousPage: false,
					isFirstPage: false,
					isLastPage: false
				}
			},
			btnList: [{ label: '新建', type: 'Add' }],
			freeSoList: [],
			searchConditionHide: true, // 隐藏搜索自定义
			searchConfig: [
				{ label: '工作号', key: 'orderNo', type: 'input', searchType: 'like', value: '' },
				{ label: '进仓编号', key: 'batchNo', type: 'input', searchType: 'like', value: '' },
				{ label: '品名', key: 'cname', type: 'input', searchType: 'like', value: '' },
				{
					label: '是否超免租期',
					key: 'isOverFreeDay',
					type: 'select',
					searchType: 'eq',
					nonDictionary: true,
					data: [
						{ label: '是', value: 'y' }, //gt
						{ label: '否', value: 'n' } //le
					],
					value: ''
				}
			],
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			tableData: [], // table数据
			showLogDialog: false, // 日志弹窗显示
			stockId: null
		}
	},
	filters: {
		rentFreePeriodFilter(rentFreePeriod) {
			let text = ``
			// if (rentFreePeriod > 0) {
			// 	text = `剩余${rentFreePeriod}天`
			// } else if (rentFreePeriod == 0) {
			// 	text = `今天到期`
			// } else {
			// 	text = `超期${-rentFreePeriod}天`
			// }
			if (rentFreePeriod < 0) {
				text = `是`
			} else {
				text = `否`
			}
			return text
		}
	},
	created() {
		// this.init()
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	destroyed() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	components: {
		Search,
		Pagination,
		LogDialog
	},
	methods: {
		handleTab(val) {
			console.log('🚀 ~ val', val)
			this.tableQuery.currPage = 1
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		init() {
			this.getList()
		},
		// enter按键事件
		handleKeyDown(e) {
			let key = null
			if (window.event === undefined) {
				key = e.keyCode
			} else {
				key = window.event.keyCode
			}
			if (key === 13) {
				// 阻止分页的页码enter键触发全局的监听事件
				let className = window.event.target.parentNode.className
				if (className.includes('el-pagination__editor')) return
				//触发的事件
				this.searchCallBack('Search')
			}
		},
		getListQuery() {
			this.tableQuery.query = this.searchConfig
				.filter(item => item.value)
				.map(item => {
					let type = 'eq',
						value = item.value
					// 特殊处理是否超免租期
					if (item.key === 'isOverFreeDay') {
						value = 0
						if (item.value === 'y') {
							type = 'gt'
						} else {
							type = 'le'
						}
					} else {
						type = item.searchType
					}
					return {
						column: item.key,
						type: type,
						value: value
					}
				})
			console.log('🚀 ~ this.tableQuery.query', this.tableQuery.query)
			this.tableQuery.query = [...this.tableQuery.query, { column: 'whId', type: 'eq', value: this.$route.query.whId }]
		},
		getList() {
			// let data = searchTableUtil.getListQuery(this.tableQuery)
			// console.log(data)
			this.getListQuery()
			let fn = this.activeName === 'pol' ? listPolOrderCargoStock : listPodOrderCargoStock
			fn(this.tableQuery).then(res => {
				this.tableData = [...res.data.list]
				// 特殊处理体积毛重
				this.tableData = this.tableData.map(item => {
					item.lastVolume = item.lastVolume.replace('.000', '')
					item.lastWeight = item.lastWeight.replace('.000', '')
					return item
				})
				this.tableQuery.totalCount = res.data.totalCount
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
			if (action === 'Confirm') {
				if (!this.validCheck()) return false
				this.handleCreateSo(done)
			} else {
				this.close('Cancel')
			}
		},
		searchCallBack(action) {
			console.log('🚀 ~ action', action)
			if (action === 'Search') {
				this.tableQuery.currPage = 1
			}
			if (action === 'Reset') {
				this.tableQuery = Object.assign({}, defaultTableQuery, defaultPage)
				this.searchConfig.map(item => (item.value = ''))
			}
			this.getList()
		},
		handleClick(row) {
			this.showLogDialog = true
			this.whId = row.whId
			this.cargoId = row.cargoId
			this.orderNo = row.orderNo
		},

		// 分页
		handleSizeChange(val) {
			// this.tableQuery.pageSize = val
			this.getList()
		},
		handleCurrentChange(val) {
			// this.tableQuery.currPage = val
			this.getList()
		},
		close() {
			this.showLogDialog = false
		}
	}
}
</script>

<style lang="scss">
.ware-detail-tab {
	background: #ffff;
	padding: 0 10px;
}
.create-form .el-col {
	padding-bottom: 20px;
}
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
	width: auto;
}
.filter-container {
	margin-bottom: 10px;
}
.table-com-layout {
	.el-table th,
	.el-table td,
	.el-table__body td {
		height: 30px;
		border-bottom: 1px solid #e9e9e9;
	}
}
</style>
