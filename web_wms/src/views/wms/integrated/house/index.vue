<template>
	<div class="assign-wrap" v-loading="loading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div>
			<FinanceSearch :searchOption="searchOption1" @search="search" />
			<div class="finance-search-list-gap"></div>
			<div class="finance-list-container">
				<div class="money-box">
					<div class="money-box-left">
						<el-button @click="handleExport" size="mini">导出</el-button>
					</div>
					<div class="money-box-right">
						<el-button @click="refreshListPage" size="mini" type="primary">刷新</el-button>
					</div>
				</div>
				<FinanceTable :option="option1" @send-multi="sendMulti" />
			</div>
		</div>
		<!-- 卸柜数详情 -->
		<el-dialog title="卸柜数详情" :visible.sync="discardingVisible" :close-on-click-modal="false" width="1000px">
			<el-table :data="discardingData" style="width: 100%">
				<el-table-column prop="inboundNo" label="入库单号" width="200" align="center"> </el-table-column>
				<el-table-column prop="workOrderNo" label="客户入仓单号" width="160" align="center"> </el-table-column>
				<el-table-column prop="inboundTime" label="入库时间" width="160" align="center"> </el-table-column>
				<el-table-column prop="dispatchTime" label="派工时间" width="160" align="center"> </el-table-column>
				<el-table-column prop="licensePlate" label="车牌" width="100" align="center"> </el-table-column>
				<el-table-column prop="estimatedQuantity" label="预计入库数" align="center"> </el-table-column>
				<el-table-column prop="actualQuantity" label="实际入库数" align="center"> </el-table-column>
				<el-table-column prop="volume" label="总体积" width="120" align="center"> </el-table-column>
				<el-table-column prop="weight" label="总重量" align="center"> </el-table-column>
			</el-table>
			<NewPagination style="margin-top: 10px" :config="disPagination" @size-change="handleDisSizeChange" @current-change="handleDisCurrentChange" />
		</el-dialog>
		<!-- 装柜数详情 -->
		<el-dialog title="装柜数详情" :visible.sync="loadingVisible" :close-on-click-modal="false" width="1000px">
			<el-table :data="loadingData" style="width: 100%">
				<el-table-column prop="outboundNo" label="出库号" width="200" align="center"> </el-table-column>
				<el-table-column prop="workOrderNo" label="客户入仓单号" width="160" align="center"> </el-table-column>
				<el-table-column prop="inboundNo" label="入库单号" width="160" align="center"> </el-table-column>
				<el-table-column prop="dispatchTime" label="派工时间" width="160" align="center"> </el-table-column>
				<el-table-column prop="outboundTime" label="出库时间" width="160" align="center"> </el-table-column>
				<el-table-column prop="licensePlate" label="装货车牌" width="100" align="center"> </el-table-column>
				<el-table-column prop="cabinetType" label="柜型" align="center"> </el-table-column>
				<el-table-column prop="estimatedQuantity" label="预计入库数" align="center"> </el-table-column>
				<el-table-column prop="actualQuantity" label="实际入库数" align="center"> </el-table-column>
				<el-table-column prop="volume" label="总体积" width="120" align="center"> </el-table-column>
				<el-table-column prop="weight" label="总重量" align="center"> </el-table-column>
			</el-table>
			<NewPagination style="margin-top: 10px" :config="loadingPagination" @size-change="handleLoadingSizeChange" @current-change="handleLoadingCurrentChange" />
		</el-dialog>
	</div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import NewPagination from '@/views/finance/components/financeTableMass/newPagination'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/mixins/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { summaryTally, warehouseList, exportTally, detailDiscarding, detailLoading, queryWarehousePage } from '@/api/wms'

export default {
	mixins: [mixin, mixin2],
	data() {
		return {
			curType: '',
			loadingVisible: false,
			loadingData: [],
			loadingPagination: {
				hasNextPage: false,
				hasPreviousPage: false,
				isFirstPage: false,
				isLastPage: false,
				show: false,
				currPage: 1,
				pageSize: 10,
				totalCount: 0,
				total: 0
			},
			disPagination: {
				hasNextPage: false,
				hasPreviousPage: false,
				isFirstPage: false,
				isLastPage: false,
				show: false,
				currPage: 1,
				pageSize: 10,
				totalCount: 0,
				total: 0
			},
			discardingVisible: false,
			discardingData: [],
			keyDownActive: true,
			option1: {},
			searchOption1: {},
			loading: false,
			multipleSelection1: []
		}
	},
	watch: {},
	created() {
		this.searchOption1 = {
			saveName: 'IntiWareList',
			saveShow: false,
			// saveDefault: true,
			listHeightFunc: this.computeFinTableHeight,
			addFilter: {
				defaultSearchLength: 6,
				searchInputGroup: [
					{ key: 'warehouseId', value: '', showType: '1' },
					{ key: 'createdTime', value: '', showType: '2' },
					{ key: 'tallyManId', value: '', showType: '3' }
				],
				filterGroups: {
					warehouseId: { label: '仓库名称', type: 'remoteSelect', showType: '4', remoteSelectList: [], remoteMethod: (name, item) => this.getWarehouseOptions(name, item), visibleChange: (name, item) => this.getWarehouseOptions(name, item) },
					createdTime: { label: '作业时间区间', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['beginDate', 'endDate'] },
					tallyManId: { label: '作业人员', type: 'remoteSelect', remoteSelectList: [], remoteMethod: (name, item) => this.getEmployeeList(name, item, 'company'), visibleChange: (name, item) => this.getEmployeeList(name, item, 'company') }
				}
			}
		}
		let operationBtns = Object.assign(this.option.operationBtns, {
			data: [
				// {
				// 	label: '修改',
				// 	type: 'text',
				// 	show: true,
				// 	action: 'Modify',
				// 	style: {
				// 		color: '#E9851F'
				// 	}
				// },
				// {
				// 	label: '删除',
				// 	type: 'text',
				// 	show: true,
				// 	action: 'Delete'
				// }
			],
			width: 120,
			show: false
		})
		let pagination = Object.assign({}, this.option.pagination, {
			show: true,
			isNew: true,
      pageSize: 20
		})
		this.option1 = Object.assign({}, this.option, {
			id: 'option1',
			$name: 'IntiWareList',
			data: [],
			tips: {
				text: '',
				show: false
			},
      index: {
        show: true
      },
			selection: { show: true, fixed: true },
			operationBtns,
			pagination
		})
		let columns = [
			{
				prop: 'warehouseName',
				label: '仓库',
				type: 'text'
			},
			{
				prop: 'tallyManName',
				label: '作业人员',
				type: 'text'
			},
      {
				prop: 'jobTypeName',
				label: '岗位',
				type: 'text'
			},
			{
				prop: 'boundDate',
				label: '作业时间区间',
				type: 'text',
				width: 160
			},
			{
				prop: 'dischargeCar',
				label: '卸柜数',
				type: 'button',
				width: 128,
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						row.dischargeCar > 0 && this.getDiscardingData(row)
					}
				},
				formatter: ({ cellValue }, row) => {
					return cellValue > 0 ? '<span style="cursor:pointer;">查看</span>' : '--'
				}
			},
			{
				prop: 'dischargeVolume',
				label: '卸柜体积',
				type: 'select',
				propInDict: 'feeAdjustReason'
			},
			{
				prop: 'loadingCar',
				label: '装柜数',
				type: 'button',
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						row.loadingCar > 0 && this.getLoadingData(row)
					}
				},
				formatter: ({ cellValue }, row) => {
					return cellValue > 0 ? '<span style="cursor:pointer;">查看</span>' : '--'
				}
			},
			{
				prop: 'loadingVolume',
				label: '装柜体积(CBM)',
				type: 'select',
				propInDict: 'feeAdjustReason'
			},
			{
				prop: 'quality20GP',
				label: '柜型20',
				type: 'button',
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						row.quality20GP > 0 && this.getLoadingData(row, '20')
					}
				},
				formatter: ({ cellValue }, row) => {
					return cellValue > 0 ? '<span style="cursor:pointer;">查看</span>' : '--'
				}
			},
			{
				prop: 'quality40GP',
				label: '柜型40',
				type: 'button',
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						row.quality40GP > 0 && this.getLoadingData(row, '40')
					}
				},
				formatter: ({ cellValue }, row) => {
					return cellValue > 0 ? '<span style="cursor:pointer;">查看</span>' : '--'
				}
			},
      {
      	prop: 'quality45GP',
				label: '柜型45',
				type: 'button',
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						row.quality45GP > 0 && this.getLoadingData(row, '45')
					}
				},
				formatter: ({ cellValue }, row) => {
					return cellValue > 0 ? '<span style="cursor:pointer;">查看</span>' : '--'
				}
			},
      {
				prop: 'qualityOther',
				label: '其它',
				type: 'button',
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						row.qualityOther > 0 && this.getLoadingData(row, 'LCL')
					}
				},
				formatter: ({ cellValue }, row) => {
					return cellValue > 0 ? '<span style="cursor:pointer;">查看</span>' : '--'
				}
			},
			{
				prop: 'performance',
				label: '绩效结果',
				type: 'text'
			}
		]
		this.option1.columns = columns
	},
	activated() {
		this.refreshListPage()
	},
	methods: {
		handleLoadingSizeChange(val) {
			this.disPagination.pageSize = val
			this.getLoadingData(this.curRow, this.curType)
		},
		handleLoadingCurrentChange(val) {
			this.loadingPagination.currPage = val
			this.getLoadingData(this.curRow, this.curType)
		},
		// 卸柜详情
		getLoadingData(row, type) {
			this.curRow = row
			this.curType = type
			let boundDate = row.boundDate.split(' ~ ')
			let beginDate = boundDate[0] + ' 00:00:00'
			let endDate = boundDate[1] + ' 23:59:59'
			let query = [
				{
					column: 'warehouseId',
					type: 'eq',
					value: row.warehouseId
				},
				{
					column: 'tallyManId',
					type: 'eq',
					value: row.tallyManId
				},
				{
					column: 'beginDate',
					type: 'eq',
					value: beginDate
				},
				{
					column: 'endDate',
					type: 'eq',
					value: endDate
				}
			]
			if (type) {
				query.push({
					column: 'cabinetType',
					type: 'in',
					value: type
				})
			}
			let data = {
				currPage: this.loadingPagination.currPage,
				pageSize: this.loadingPagination.pageSize,
				query
			}
			detailLoading(data).then(res => {
				if (res.code === 0) {
					this.loadingData = res.data?.list
					Object.assign(this.loadingPagination, res.data)
					this.loadingVisible = true
				}
			})
		},
		handleDisSizeChange(val) {
			this.disPagination.pageSize = val
			this.getDiscardingData()
		},
		handleDisCurrentChange(val) {
			this.disPagination.currPage = val
			this.getDiscardingData()
		},
		// 卸柜详情
		getDiscardingData(row) {
			this.curRow = row
			let boundDate = row.boundDate.split(' ~ ')
			let beginDate = boundDate[0] + ' 00:00:00'
			let endDate = boundDate[1] + ' 23:59:59'
			let data = {
				currPage: this.disPagination.currPage,
				pageSize: this.disPagination.pageSize,
				query: [
					{
						column: 'warehouseId',
						type: 'eq',
						value: row.warehouseId
					},
					{
						column: 'tallyManId',
						type: 'eq',
						value: row.tallyManId
					},
					{
						column: 'beginDate',
						type: 'eq',
						value: beginDate
					},
					{
						column: 'endDate',
						type: 'eq',
						value: endDate
					}
				]
			}
			detailDiscarding(data).then(res => {
				if (res.code === 0) {
					this.discardingData = res.data?.list
					Object.assign(this.disPagination, res.data)
					this.discardingVisible = true
				}
			})
		},
		// 仓库列表
		getWarehouseOptions(name, item) {
      let data = {
        currPage: 1,
        pageSize: 30,
        query: [
          {
            column: "employeeId",
            type: "eq",
            value: JSON.parse(localStorage.getItem('userInfo')).sysUserId
          },
          {
            column: "warehouseName",
            type: "like",
            value: name
          }
        ]
      }
      queryWarehousePage(data)
        .then(({ data: { list } }) => {
          item.remoteSelectList.splice(
            0,
            1000,
            ...list.map((v) => ({
              ...v,
              label: v.warehouseName,
              value: v.wmsWarehouseId
            }))
          )
        })
			// warehouseList({ warehouseName: name }).then(res => {
			// 	item.remoteSelectList = res.data.map(item => {
			// 		return { ...item, label: item.warehouseName, value: item.wmsWarehouseId }
			// 	})
			// })
		},
		// 删除
		handleDelete() {
			this.$confirm('是否删除已选作业班组?', '', {
				confirmButtonText: '删除',
				cancelButtonText: '取消',
				type: 'warning',
				center: true,
				customClass: 'confirm-wrap',
				confirmButtonClass: 'confirm-off'
			})
				.then(() => {
					this.$message({
						type: 'success',
						message: '删除成功!'
					})
				})
				.catch(() => {})
		},
		// 导出
		handleExport() {
			let data = {
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				query: []
			}
			this.finCommonSearch(data.query, this.searchOption1, true)

			exportTally(data).then(res => {
				let link = document.createElement('a')
				link.href = window.URL.createObjectURL(res)
				link.download = '理货统计.xlsx'
				link.click()
			})
		},
		handleSizeChange(val) {
			this.option1.pagination.pageSize = val
			this.getData && this.getData()
		},
		handleCurrentChange(val) {
			this.option1.pagination.currPage = val
			this.getData && this.getData()
		},
		search() {
			this.option1.pagination.currPage = 1
			this.getData(true)
		},
		getData(isSearch) {
			let data = {
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				query: []
			}
			this.finCommonSearch(data.query, this.searchOption1, true)

			if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || []

			this.loading = true
			summaryTally(data)
				.then(res => {
					if (res.code === 0) {
						this.option1.data = res.data.list
						Object.assign(this.option1.pagination, res.data)
					}
				})
				.finally(() => {
					this.loading = false
				})
		},
		sendMulti(data, option) {
			console.log('🚀 ~ data', data)
			this.multipleSelection1 = data
		}
	},
	components: {
		FinanceTable,
		FinanceSearch,
		NewPagination
	}
}
</script>
<style></style>
<style lang="scss">
.confirm-wrap {
	.el-icon-error {
		color: #ffba00;
	}
	.el-message-box__btns {
		display: flex;
		flex-direction: row-reverse;
		.confirm-on {
			background: #33b18a;
			border: 0;
		}
		.confirm-off {
			background: #cd4130;
			border: 0;
		}

		.el-button {
			margin-left: 8px;
		}
	}
}
.assign-wrap {
	.el-button--mini {
		padding: 3px 7px;
	}
	.el-input--mini .el-input__inner,
	.el-input--mini .el-input__icon,
	.el-range-editor--mini.el-input__inner {
		height: 20px;
		line-height: 20px;
	}
	.select-template-box {
		float: left;
	}
	.select-template-box .el-dropdown {
		margin-left: 0;
		margin-bottom: 0;
		border-radius: 0;
		font-size: 12px;
		border: 1px solid #d9d9d9;
		border-radius: 4px;
	}
	.select-template-box:hover .el-dropdown {
		background: rgb(236, 245, 255);
		color: rgb(64, 158, 255);
	}
	.select-template-box .el-dropdown-link {
		cursor: pointer;
		padding-left: 5px;
		line-height: 18px;
		display: inline-block;
	}
	.select-template-box .el-icon--right {
		margin-left: 0;
	}
	.select-template-box .el-dropdown-link:focus {
		outline: none;
	}
}
</style>
