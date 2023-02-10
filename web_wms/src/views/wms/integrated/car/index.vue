<template>
	<div class="assign-wrap" v-loading="loading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div>
			<FinanceSearch :searchOption="searchOption1" @search="search" />
			<div class="finance-search-list-gap"></div>
			<div class="finance-list-container">
				<div class="money-box">
					<div class="money-box-left">
						<el-button @click="handleExport" size="mini">导出</el-button>
						<!-- <el-button @click="handleOn" size="mini" type="success">启用</el-button>
						<el-button @click="handleOff" size="mini" type="danger">禁用</el-button>
						<el-button @click="handleBatchDelete" size="mini" type="danger">删除</el-button> -->
					</div>
					<div class="money-box-right">
						<el-button @click="refreshListPage" size="mini" type="primary">刷新</el-button>
					</div>
				</div>
				<FinanceTable :option="option1" @send-multi="sendMulti" />
			</div>
		</div>
	</div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/mixins/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { summaryVehicle, exportVehicle, queryWarehousePage, yardQueryPage } from '@/api/wms'

export default {
	mixins: [mixin, mixin2],
	data() {
		return {
			option1: {},
			searchOption1: {},
			loading: false,
			multipleSelection1: []
		}
	},
	watch: {},
	created() {
		this.searchOption1 = {
			saveName: 'IntiCarList',
			saveShow: false,
			// saveDefault: true,
			listHeightFunc: this.computeFinTableHeight,
			addFilter: {
				defaultSearchLength: 6,
				searchInputGroup: [
					{ key: 'vehicleTeamName', value: '', showType: '1' },
					{ key: 'createdTime', value: '', showType: '2' },
          { key: 'warehouseId', value: '', showType: '3' },
          { key: 'wharfYardId', value: '', showType: '4' }
				],
				filterGroups: {
					vehicleTeamName: { label: '车队名称', type: 'input', showType: '1' },
					createdTime: { label: '出车时间区间', type: 'daterange', showType: '2', format: 'yyyy-MM-dd', ranges: ['beginDate', 'endDate'] },
          warehouseId: { label: '仓库名称', type: 'remoteSelect', showType: '4', remoteSelectList: [], remoteMethod: (name, item) => this.getWarehouseOptions(name, item), visibleChange: (name, item) => this.getWarehouseOptions(name, item) },
          wharfYardId: { label: '码头堆场', type: 'remoteSelect', showType: '4', remoteSelectList: [], remoteMethod: (name, item) => this.getWharfYardList(name, item), visibleChange: (name, item) => this.getWharfYardList(name, item) }
				}
			}
		}
		let operationBtns = Object.assign(this.option.operationBtns, {
			data: [
				// {
				// 	label: '详情',
				// 	type: 'text',
				// 	show: true,
				// 	action: 'Detail'
				// },
				// {
				// 	label: '修改',
				// 	type: 'text',
				// 	show: true,
				// 	action: 'Modify',
				// 	style: {
				// 		color: '#E9851F'
				// 	}
				// }
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
			$name: 'IntiCarList',
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
				prop: 'vehicleTeamName',
				label: '车队名称',
				type: 'text',
				width: 160
			},

			{
				prop: 'warehouseName',
				label: '仓库',
				type: 'text',
				width: 200
			},
			{
				prop: 'wharfYardName',
				label: '码头堆场',
				type: 'text',
				width: 120
			},
			{
				prop: 'totalDispatchCar',
				label: '出车次数',
				type: 'text'
			},

			{
				prop: 'quality20GP',
				label: '柜型20',
				type: 'text'
			},

			{
				prop: 'quality40GP',
				label: '柜型40',
				type: 'text'
			},
      {
				prop: 'quality45GP',
				label: '柜型45',
				type: 'text'
			},
			{
				prop: 'qualityOther',
				label: '其它',
				type: 'text',
				width: 130
			},

			{
				prop: 'diffPlaceTimes',
				label: '异提次数',
				type: 'text'
			}
		]
		this.option1.columns = columns
	},
	activated() {
    this.refreshListPage()
  },
	methods: {
    /**
		 * @description: 获取堆场列表信息
		 * @param {*} str
		 * @param {*} index
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-23 11:52:50
		 */
		getWharfYardList(name, item) {
			// if (str === '') {
			//   str = this.formData.warehouseDiffLocalYards[index].wharfYardName
			// }
			let data = {
				currPage: 1,
				pageSize: 30,
				query: []
			}
			if (name) {
				data.query.push({
					column: 'wharfYardName',
					type: 'like',
					value: name
				})
			}
			yardQueryPage(data)
        .then(({ data: { list } }) => {
          item.remoteSelectList.splice(
            0,
            1000,
            ...list.map((v) => ({
              ...v,
              label: v.wharfYardName,
              value: v.wharfYardId
            }))
          )
        })
				// .then(({ code, data }) => {
				// 	if (code === 0) {
				// 		this.formData.warehouseDiffLocalYards[index].wharfYardList = data.list || []
				// 		if (type === 'echo') {
				// 			let find = this.formData.warehouseDiffLocalYards[index].wharfYardList.find(item => item.wharfYardId === this.formData.warehouseDiffLocalYards[index].wharfYardId)
				// 			this.formData.warehouseDiffLocalYards[index].wharfYardName = find?.wharfYardName
				// 			this.formData.warehouseDiffLocalYards[index].cityName = find?.cityName
				// 			this.formData.warehouseDiffLocalYards[index].wharfYardCode = find?.wharfYardCode
				// 			this.formData.warehouseDiffLocalYards[index].address = find?.address
				// 			this.formData.warehouseDiffLocalYards[index].webUrl = find?.webUrl
				// 			this.formData.warehouseDiffLocalYards[index].wharfYardType = find?.wharfYardType
				// 		}
				// 		this.$forceUpdate()
				// 	}
				// })
				.catch(() => {})
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
		// 批量删除
		handleBatchDelete() {
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
		// 禁用
		handleOff() {
			this.$confirm('该费用模板为启用状态，是否改为禁用状态?', '', {
				confirmButtonText: '禁用',
				cancelButtonText: '取消',
				type: 'warning',
				center: true,
				customClass: 'confirm-wrap',
				confirmButtonClass: 'confirm-off'
			})
				.then(() => {
					this.$message({
						type: 'success',
						message: '禁用成功!'
					})
				})
				.catch(() => {})
		},
		// 启用
		handleOn() {
			this.$confirm('该费用模板为禁用状态，是否改为启用状态?', '', {
				confirmButtonText: '启用',
				cancelButtonText: '取消',
				type: 'warning',
				center: true,
				customClass: 'confirm-wrap',
				confirmButtonClass: 'confirm-on'
			})
				.then(() => {
					this.$message({
						type: 'success',
						message: '启用成功!'
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

			exportVehicle(data).then(res => {
				let link = document.createElement('a')
				link.href = window.URL.createObjectURL(res)
				link.download = '车队统计.xlsx'
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
			summaryVehicle(data)
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
		// 详情
		handleDetail() {
			this.$router.push({ path: '/wms/basic/feeDetail', query: { type: 'detail' } })
		},
		// 修改
		handleModify() {
			this.$router.push({ path: '/wms/basic/feeDetail', query: { type: 'modify' } })
		},
		sendMulti(data, option) {
			console.log('🚀 ~ data', data)
			this.multipleSelection1 = data
		}
	},
	components: {
		FinanceTable,
		FinanceSearch
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
