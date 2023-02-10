<template>
	<div>
		<div v-loading="loading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
			<div>
				<FinanceSearch ref="searchComp" :searchOption="searchOption" @search="search" />
				<div class="finance-search-list-gap"></div>
				<div class="finance-list-container">
					<div class="money-box">
						<div class="money-box-left">
							<el-button size="mini" type="primary" @click="handleAdd">新增</el-button>
							<el-button size="mini" type="success" @click="handleUse">启用</el-button>
							<el-button size="mini" type="danger" @click="handleDisabled">禁用</el-button>
						</div>
						<div class="money-box-right">
							<el-button @click="refreshListPage" size="mini" type="primary">刷新</el-button>
						</div>
					</div>
					<FinanceTable :option="tableOption" @getData="getData" @send-multi="sendMulti" />
				</div>
			</div>
		</div>
		<!-- 仓库详情 -->
		<detail-dialog v-if="detailOptions.show" :options="detailOptions" @getData="getData"></detail-dialog>
	</div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { tableData } from '@/views/wms/warehouse/data/materialMaint.js'
import { mixin } from '@/views/finance/mixins/mixin'
import detailDialog from './detailDialog'
import { getMaterialMaintList, enableConsumable, disableConsumable } from '@/api/wms/warehouse.js'
export default {
	name: 'materialMaint',
	components: {
		FinanceTable,
		FinanceSearch,
		detailDialog
	},
	mixins: [mixin],
	data() {
		return {
			loading: false,
			searchOption: {}, //查询参数
			tableOption: {}, //表格参数
			dataList: [], //列表数据
			detailOptions: {
				show: false,
				type: '',
				title: '',
				id: '',
				data: {}
			},
			selfColumnsBase: tableData.map(item => {
				let target = { ...item }
				if (target.callback) target.callback = row => this.showPic(row)
				return target
			}),
			multipleSelection: []
		}
	},
	created() {
		// 设置查询配置参数
		this.setSearchOption()
		// 设置表格配置参数
		this.setTableOption()
    // 获取列表
    this.getData()
	},
	methods: {
		/**
		 * @description: 设置查询参数
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-16 11:39:15
		 */
		setSearchOption() {
			// 在tableData中筛选出需要查询的字段
			let searchProps = ['consumableName', 'consumableNo']
			let searchData = tableData.filter(item => searchProps.includes(item.prop))
			let searchObj = {}
			searchData.forEach(v => {
				searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
			})
			let searchInputGroup = []
			let defaultSearchLength = 2
			let searchPropsNew = searchProps.slice(0, defaultSearchLength)
			searchPropsNew.forEach(item => {
				searchInputGroup.push({
					key: item,
					value: ''
				})
			})
			this.searchOption = {
				addFilter: {
					defaultSearchLength,
					searchInputGroup,
					filterGroups: { ...searchObj },
					callback: true
				}
			}
		},
		/**
		 * @description: 设置表格参数
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-16 17:14:47
		 */
		setTableOption() {
			// 分页配置
			let pagination = { ...this.option.pagination, show: true, pageSize: 20, isNew: true }
			// 操作按钮配置
			let operationBtns = {
				...this.option.operationBtns,
				width: '100px',
				data: [
					{
						label: '修改',
						action: 'Edit',
						style: 'color: #E9851F',
						show: true
					}
				]
			}
			// 整合列表配置参数
			this.tableOption = {
				...this.option,
				id: 'tableOption',
				pagination,
				sortable: false,
        index: {
          show: true
        },
				columns: [...this.selfColumnsBase],
				operationBtns,
				data: []
			}
		},
		/**
		 * @description: 获取列表数据
		 * @param {*} query 查询参数
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 14:10:16
		 */
		getData(query) {
			let data = {
				currPage: this.tableOption.pagination.currPage,
				pageSize: this.tableOption.pagination.pageSize,
				query
			}
			this.loading = true
			getMaterialMaintList(data)
				.then(({ code, data }) => {
					if (code === 0) {
            this.tableOption.pagination.hasNextPage = data.hasNextPage
            this.tableOption.pagination.hasPreviousPage = data.hasPreviousPage
            this.tableOption.pagination.isFirstPage = data.isFirstPage
            this.tableOption.pagination.isLastPage = data.isLastPage
						this.tableOption.data = data.list || []
						if (this.tableOption.data.length) {
							this.tableOption.data.forEach(item => {
								this.selfColumnsBase.forEach(ele => {
									if (ele.prop === 'fileName' && item.fileName) {
										ele.formatter = ({ row }) => {
											if (row.fileName) {
												return '查看'
											}
										}
									}
								})
							})
						}
					}
				})
				.finally(() => {
					this.loading = false
				})
		},
		// 分页页面数量change   有分页必写此方法
		handleSizeChange(val) {
			let query = this.$refs.searchComp.addFilterSearch()
			this.tableOption.pagination.pageSize = val
			this.getData(query)
		},
		// 分页改变当前页   有分页必写此方法
		handleCurrentChange(val, event) {
			let query = this.$refs.searchComp.addFilterSearch()
			this.tableOption.pagination.currPage = val
			this.getData(query)
		},
		// 搜索按钮
		search(query) {
			this.tableOption.pagination.currPage = 1
			this.getData(query)
		},
		// 新增
		handleAdd() {
			this.showDialog('add')
		},
		// 编辑
		handleEdit(row) {
			this.showDialog('edit', row)
		},
		/**
		 * @description: 显示弹框
		 * @param {*} type 操作类型
		 * @param {*} row 行数据
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 11:50:16
		 */
		showDialog(type, row) {
			this.detailOptions.show = true
			this.detailOptions.type = type
			this.detailOptions.title = `${type === 'add' ? '新增' : '修改'}辅材信息`
			if (['detail', 'edit'].includes(type)) {
				this.detailOptions.data = row
			} else {
				this.detailOptions.data = {}
			}
		},
		/**
		 * @description: 获取列表复选框选中的数据
		 * @param {*} data
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 11:48:40
		 */
		sendMulti(data) {
			this.multipleSelection = data
		},
		/**
		 * @description: 启用数据
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 11:48:34
		 */
		handleUse() {
			if (!this.multipleSelection.length) {
				this.$message.error('请选择要启用的数据！')
			} else {
				let flag = this.multipleSelection.every(item => item.enabled === 'no')
				if (flag) {
          this.$confirm('确定要进行此操作？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            dangerouslyUseHTMLString: true,
            type: 'warning'
          }).then(() => {
            let data = {
              consumableIdList: []
            }
            this.multipleSelection.forEach(item => {
              data.consumableIdList.push(item.consumableId)
            })
            enableConsumable(data)
              .then(({ code }) => {
                if (code === 0) {
                  this.$message.success('操作成功！')
                  this.getData()
                }
              })
              .catch(() => {})
          })
          .catch(() => {})
				} else {
					this.$message.error('所选数据必须全是已禁用的数据！')
				}
			}
		},
		/**
		 * @description: 禁用数据
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 11:48:26
		 */
		handleDisabled() {
			if (!this.multipleSelection.length) {
				this.$message.error('请选择要禁用的数据！')
			} else {
				let flag = this.multipleSelection.every(item => item.enabled === 'yes')
				if (flag) {
          this.$confirm('确定要进行此操作？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            dangerouslyUseHTMLString: true,
            type: 'warning'
          }).then(() => {
            let data = {
              consumableIdList: []
            }
            this.multipleSelection.forEach(item => {
              data.consumableIdList.push(item.consumableId)
            })
            disableConsumable(data)
              .then(({ code }) => {
                if (code === 0) {
                  this.$message.success('操作成功！')
                  this.getData()
                }
              })
              .catch(() => {})
          })
          .catch(() => {})
				} else {
					this.$message.error('所选数据必须全是已启用的数据！')
				}
			}
		},
		/**
		 * @description: 查看图片
		 * @param {*} row
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 11:48:16
		 */
		showPic(row) {
			if (row.fileNo) {
				window.open(`/base/fileView/preview/${row.fileNo}/sowoll`)
			} else {
				this.$message.error('该图片信息缺失，不能查看！')
			}
		}
	}
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
</style>
