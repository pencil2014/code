<template>
	<div class="app-container">
		<div class="search-container">
			<Search :searchConditionHide="searchConditionHide" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery"> </Search>
		</div>
		<div class="table-container table-com-layout">
			<el-table fit :data="tableData" style="width: 100%; margin-top: 10px">
				<el-table-column prop="warehouseName" label="仓库名称" align="left"> </el-table-column>
				<el-table-column prop="warehouseSupplierName" label="供应商" align="left"> </el-table-column>
				<el-table-column prop="custName" label="客户名称" align="left"> </el-table-column>
				<el-table-column prop="cargoName" label="品名" align="left"> </el-table-column>
				<el-table-column prop="mark" label="唛头" align="left"> </el-table-column>
				<el-table-column prop="quantity" label="库存数" align="left"> </el-table-column>
				<el-table-column prop="weight" label="库存毛重" align="left"> </el-table-column>
				<el-table-column prop="volume" label="库存体积" align="left"> </el-table-column>
				<el-table-column label="操作" align="left">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleClick(scope.row)" type="text" size="mini">详情</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<div class="base-el-pagination">
				<div class="pagination-container">
					<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import searchTableUtil from '@/utils/searchTableUtil'
import Search from '@/components/Base/Search/index'
import { warehouseStockList, warehouseList } from '@/api/order/warehouse'
import LogDialog from './logDialog'
import Pagination from '@/components/Base/Table/newPagination'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}

const defaultTableQuery = {
	ascColumns: [],
	descColumns: ['quantity']
}

export default {
	data() {
		return {
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
				{
					key: 'whid',
					searchType: 'eq',
					label: '仓库名称',
					type: 'remoteSelect',
					data: [],
					value: '',
					visibleChange: (val, item) => {
						this.wareHouseSearch('', item)
					},
					filterMehod: (val, item) => {
						this.wareHouseSearch(val, item)
					},
					change: (val, item) => {
						item.value = val
					}
				},
				{
					key: 'supplierId',
					searchType: 'eq',
					label: '供应商',
					type: 'remoteSelect',
					data: [],
					value: '',
					visibleChange: (val, item) => {
						this.supplierSearch('', item)
					},
					filterMehod: (val, item) => {
						this.supplierSearch(val, item)
					},
					change: (val, item) => {
						item.value = val
					}
				},
				{
					key: 'custid',
					searchType: 'eq',
					label: '客户名称',
					type: 'remoteSelect',
					data: [],
					value: '',
					visibleChange: (val, item) => {
						this.customerSearch('', item)
					},
					filterMehod: (val, item) => {
						this.customerSearch(val, item)
					},
					change: (val, item) => {
						item.value = val
					}
				}
			],
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			tableData: [], // table数据
			stockId: null
		}
	},
	created() {
		this.init()
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
		getListQuery() {
			this.tableQuery.query = this.searchConfig
				.filter(item => item.value)
				.map(item => {
					return {
						column: item.key,
						type: item.searchType,
						value: item.value || ''
					}
				})
			console.log('🚀 ~ this.tableQuery.query', this.tableQuery.query)
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
		getList() {
			// let data = searchTableUtil.getListQuery(this.tableQuery)
			// console.log(data)
			this.getListQuery()
			warehouseStockList(this.tableQuery).then(res => {
				this.tableData = [...res.data.list]
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
			if (action === 'Search') {
				this.tableQuery.currPage = 1
				// this.tableQuery.whId = this.searchConfig.filter(item => item.key == 'whId')[0].value || ''
				// this.tableQuery.custid = this.searchConfig.filter(item => item.key == 'custid')[0].value || ''
				// this.tableQuery.supplierId = this.searchConfig.filter(item => item.key == 'supplierId')[0].value || ''
			}
			if (action === 'Reset') {
				this.tableQuery = Object.assign({}, defaultTableQuery, defaultPage)
				this.searchConfig.map(item => (item.value = ''))
			}
			this.getList()
		},
		handleClick(row) {
			this.$router.push({
				path: 'warehouseCargoDetail',
				query: { whId: row.whid }
			})
		},
		wareHouseSearch(queryString, item) {
			let data = {
				currPage: 1,
				pageSize: 50,
				warehouseName: queryString
			}
			warehouseList(data).then(res => {
				let list = res.data.list
				item.data = list.map(item => {
					return {
						value: item.whId,
						label: item.warehouseName
					}
				})
			})
		},
		customerSearch(val, item) {
			this.$store.dispatch('dict/queryCustomerList', val || '').then(data => {
				let list = data.list
				item.data = list.map(o => {
					return {
						value: o.custid,
						label: this.$language == 'en' ? o.ename : o.name
					}
				})
			})
		},
		supplierSearch(val, item) {
			this.$store.dispatch('dict/querySupplierList', { category: 'category', value: 'ware_house', queryString: val || '' }).then(data => {
				let list = data.list
				item.data = list.map(o => {
					return {
						value: o.supplierId,
						label: this.$language == 'en' ? o.ename : o.name
					}
				})
			})
		},
		// 分页
		handleSizeChange(val) {
			// this.tableQuery.pageSize = val
			this.getList()
		},
		handleCurrentChange(val) {
			// this.tableQuery.currPage = val
			this.getList()
		}
	}
}
</script>

<style lang="scss">
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
