<template>
	<div class="assign-wrap" v-loading="loading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div>
			<FinanceSearch :searchOption="searchOption1" @search="search" />
			<div class="finance-search-list-gap"></div>
			<div class="finance-list-container">
				<div class="money-box">
					<div class="money-box-left">
						<el-button @click="toAdd" size="mini" type="primary">新增</el-button>
						<el-button @click="handleOn" size="mini" type="success">启用</el-button>
						<el-button @click="handleOff" size="mini" type="danger">禁用</el-button>
						<el-button @click="handleBatchDelete" size="mini" type="danger">删除</el-button>
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
import { workTeamQueryPage, workTeamModifyEnabled, warehouseList, workTeamRemove, queryWarehousePage } from '@/api/wms'

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
			saveName: 'AssiginClassList',
			saveShow: false,
			// saveDefault: true,
			listHeightFunc: this.computeFinTableHeight,
			addFilter: {
				defaultSearchLength: 6,
				searchInputGroup: [
					// { key: 'cityCode', value: '', showType: '1' },
					{ key: 'warehouseId', value: '', showType: '2' },
					{ key: 'workTeamName', value: '', showType: '3' },
					{ key: 'createdTime', value: '', showType: '4' },
					{ key: 'enabled', value: '', showType: '5' }
				],
				filterGroups: {
					// cityCode: { label: '城市', type: 'remoteSelect', showType: '1', remoteSelectList: [], remoteMethod: (name, item) => this.getDomesticCity(name, item), visibleChange: (name, item) => this.getDomesticCity(name, item) },
					warehouseId: { label: '仓库名称', type: 'remoteSelect', showType: '2', remoteSelectList: [], remoteMethod: (name, item) => this.getWarehouseOptions(name, item), visibleChange: (name, item) => this.getWarehouseOptions(name, item) },

					workTeamName: { label: '班组名称', type: 'input', showType: '3' },
					createdTime: { label: '创建日期区间', type: 'daterange', showType: '4', format: 'yyyy-MM-dd', ranges: ['beginDate', 'endDate'] },
					enabled: { label: '班组状态', type: 'select', propInDict: 'openOrClose', showType: '5' }
				}
			}
		}
		let operationBtns = Object.assign(this.option.operationBtns, {
			data: [
				{
					label: '修改',
					type: 'text',
					show: true,
					action: 'Modify',
					style: {
						color: '#E9851F'
					}
				},
				{
					label: '删除',
					type: 'text',
					show: true,
					action: 'Delete'
				}
			],
			width: 120
		})
		let pagination = Object.assign({}, this.option.pagination, {
			show: true,
			isNew: true,
      pageSize: 20
		})
		this.option1 = Object.assign({}, this.option, {
			disableFixedIndex0: true,
			id: 'option1',
			$name: 'AssignClassList',
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
				prop: 'cityName',
				label: '城市',
				type: 'text',
				width: 160
			},
			{
				prop: 'warehouseName',
				label: '仓库名称',
				type: 'text',
				width: 200
			},
			{
				prop: 'workTeamName',
				label: '班组名称',
				type: 'text',
				width: 120
			},
			{
				prop: 'workTeamMembers',
				label: '班组成员',
				type: 'text'
			},
			{
				prop: 'enabled',
				label: '班组状态',
				type: 'text',
				formatter: ({ cellValue }) => {
					return cellValue === 'yes' ? '<span style="color:#33B18A;" >启用</span>' : cellValue === 'no' ? '<span style="color:#CD4130;">禁用</span>' : cellValue
				}
			},

			{
				prop: 'createdName',
				label: '创建人',
				type: 'text'
			},
			{
				prop: 'createdTime',
				label: '创建时间',
				type: 'text',
				width: 130
			},

			{
				prop: 'updatedName',
				label: '修改人',
				type: 'text'
			},
			{
				prop: 'updatedTime',
				label: '修改时间',
				type: 'text',
				width: 130
			}
		]
		this.option1.columns = columns
	},
	activated() {
		this.refreshListPage()
	},
	methods: {
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
		handleDelete(row) {
			this.$confirm('是否删除已选作业班组?', '', {
				confirmButtonText: '删除',
				cancelButtonText: '取消',
				type: 'warning',
				center: true,
				customClass: 'confirm-wrap',
				confirmButtonClass: 'confirm-off'
			})
				.then(() => {
					let workTeamId = [row.workTeamId]
					workTeamRemove({ workTeamId }).then(() => {
						this.refreshListPage()
						this.$message({
							type: 'success',
							message: '删除成功!'
						})
					})
				})
				.catch(() => {})
		},
		// 批量删除
		handleBatchDelete() {
			if (this.multipleSelection1.length === 0) return this.$message.warning('请先勾选数据!')
			this.$confirm('是否删除已选作业班组?', '', {
				confirmButtonText: '删除',
				cancelButtonText: '取消',
				type: 'warning',
				center: true,
				customClass: 'confirm-wrap',
				confirmButtonClass: 'confirm-off'
			})
				.then(() => {
					let workTeamId = this.multipleSelection1.map(item => item.workTeamId)
					workTeamRemove({ workTeamId }).then(() => {
						this.refreshListPage()
						this.$message({
							type: 'success',
							message: '删除成功!'
						})
					})
				})
				.catch(() => {})
		},
		// 禁用
		handleOff() {
			if (this.multipleSelection1.length === 0) return this.$message.warning('请先勾选数据!')
			if (this.multipleSelection1.some(item => item.enabled === 'no')) return this.$message.warning('包含已禁用的数据!')
			this.$confirm('是否禁用已选作业班组?', '', {
				confirmButtonText: '禁用',
				cancelButtonText: '取消',
				type: 'warning',
				center: true,
				customClass: 'confirm-wrap',
				confirmButtonClass: 'confirm-off'
			})
				.then(() => {
					let workTeamId = this.multipleSelection1.map(item => item.workTeamId)
					workTeamModifyEnabled({ workTeamId, enabled: 'no' }).then(() => {
						this.refreshListPage()
						this.$message({
							type: 'success',
							message: '禁用成功!'
						})
					})
				})
				.catch(() => {})
		},
		// 启用
		handleOn() {
			if (this.multipleSelection1.length === 0) return this.$message.warning('请先勾选数据!')
			if (this.multipleSelection1.some(item => item.enabled === 'yes')) return this.$message.warning('包含已启用的数据!')
			this.$confirm('是否启用已选作业班组?', '', {
				confirmButtonText: '启用',
				cancelButtonText: '取消',
				type: 'warning',
				center: true,
				customClass: 'confirm-wrap',
				confirmButtonClass: 'confirm-on'
			})
				.then(() => {
					let workTeamId = this.multipleSelection1.map(item => item.workTeamId)
					workTeamModifyEnabled({ workTeamId, enabled: 'yes' }).then(() => {
						this.refreshListPage()
						this.$message({
							type: 'success',
							message: '启用成功!'
						})
					})
				})
				.catch(() => {})
		},
		// 新增
		toAdd() {
			this.$router.push({ path: '/wms/assign/classDetail', query: { type: 'add' } })
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
			workTeamQueryPage(data)
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

		// 修改
		handleModify(row) {
			this.$router.push({ path: '/wms/assign/classDetail', query: { type: 'modify', workTeamId: row.workTeamId } })
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
