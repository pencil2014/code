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
						</div>
						<div class="money-box-right">
							<el-button @click="refreshListPage" size="mini" type="primary">刷新</el-button>
						</div>
					</div>
					<FinanceTable :option="tableOption" @getData="getData" />
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
import { tableData } from '@/views/wms/warehouse/data/warehouseList.js'
import { mixin } from '@/views/finance/mixins/mixin'
import detailDialog from './detailDialog'
import { queryPageList } from '@/api/wms/warehouse.js'
import { countrySelectList, getDomesticCity, getForeignCity } from '@/api/base'
export default {
	name: 'warehouseList',
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
				data: {},
				activeName: ''
			},
			selfColumnsBase: tableData.map(item => {
				let target = { ...item }
				if (target.callback) target.callback = row => this.showDetail(row)
				return target
			})
		}
	},
	created() {
		// 设置查询配置参数
		this.setSearchOption()
		// 设置表格配置参数
		this.setTableOption()
    // 获取省份信息
		this.getDomesticProvince()
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
			let defaultSearchLength = 6
			this.searchOption = {
				addFilter: {
					defaultSearchLength,
					searchInputGroup: [
						{ key: 'countryCode', value: '', showType: '1' },
						{ key: 'provinceCode', value: '', showType: '2' },
						{ key: 'cityCode', value: '', showType: '3' },
						{ key: 'warehouseName', value: '', showType: '4' },
						{ key: 'warehouseCode', value: '', showType: '5' },
						{ key: 'warehouseSupervisorName', value: '', showType: '5' }
					],
					filterGroups: {
						countryCode: { label: '国家', type: 'remoteSelect', showType: '1', remoteSelectList: [], remoteMethod: (name, item) => this.countrySelectList(name, item), visibleChange: (name, item) => this.countrySelectList(name, item) },
						provinceCode: {
							label: '省份',
							type: 'select',
							showType: '2',
							selectOptions: [],
							filterable: true,
							change: () => {
								this.getDomesticCity()
							}
						},
						cityCode: { label: '城市', type: 'select', showType: '3', selectOptions: [], filterable: true },
						warehouseName: { label: '仓库名称', type: 'input', showType: '4' },
						warehouseCode: { label: '仓库代码', type: 'input', showType: '4' },
						warehouseSupervisorName: { label: '仓库负责人', type: 'input', showType: '4' }
					},
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
				width: '150px',
				data: [
					{
						label: '修改',
						action: 'Edit',
						style: 'color: #E9851F',
						show: true
					},
					{
						label: '同市异地费堆场',
						action: 'FeeYard',
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
		// 城市下拉
		getDomesticCity(name, item) {
			// 获取省份code
			let codeObj = this.searchOption.addFilter.searchInputGroup.find(item => item.key === 'provinceCode')
			let code = codeObj?.value
			code &&
				getDomesticCity({ code }).then(res => {
					this.searchOption.addFilter.filterGroups.cityCode.selectOptions = (res.data || []).map(item => {
						return { ...item, label: item.cname, value: item.code }
					})
				})
		},
		// 省份下拉
		getDomesticProvince(code, item) {
			getDomesticCity({}).then(res => {
				this.searchOption.addFilter.filterGroups.provinceCode.selectOptions = (res.data || []).map(item => {
					return { ...item, label: item.cname, value: item.code }
				})
			})
		},
		// 国家下拉
		countrySelectList(countryCode, item) {
			countrySelectList({ countryCode, state: 'valid' }).then(res => {
				item.remoteSelectList = (res.data || []).map(item => {
					return { ...item, label: item.cname, value: item.countryCode }
				})
				item.remoteSelectList = item.remoteSelectList.filter(item => item.value === 'CN')
			})
		},
		getData(query) {
			let data = {
				currPage: this.tableOption.pagination.currPage,
				pageSize: this.tableOption.pagination.pageSize,
				query
			}
			this.loading = true
			queryPageList(data)
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
									if (ele.prop === 'hasWarehouseInsideZone' && item.hasWarehouseInsideZone === 'yes') {
										ele.formatter = ({ row }) => {
											if (row.hasWarehouseInsideZone === 'yes') {
												return '查看'
											}
										}
									}
									if (ele.prop === 'hasWarehouseForklift' && item.hasWarehouseForklift === 'yes') {
										ele.formatter = ({ row }) => {
											if (row.hasWarehouseForklift === 'yes') {
												return '查看'
											}
										}
										ele.callback = row => this.showDetail(row, 'forkliftInfo')
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
		handleAdd() {
			this.showDialog('add')
			this.detailOptions.activeName = 'warehouseInfo'
		},
		handleEdit(row) {
			this.showDialog('edit', row)
			this.detailOptions.activeName = 'warehouseInfo'
		},
		showDetail(row, activeName) {
			this.showDialog('detail', row)
			this.detailOptions.activeName = activeName || 'warehouseInfo'
      if (activeName === 'forkliftInfo') {
        // this.detailOptions.title = '查看叉车信息'
      }
		},
		showDialog(type, row) {
			this.detailOptions.show = true
			this.detailOptions.type = type
			// this.detailOptions.title = `${type === 'add' ? '新增' : '修改'}仓库信息`
			if (['detail', 'edit'].includes(type)) {
				this.detailOptions.data = row
			}
		},
		handleFeeYard(row) {
			this.showDialog('edit', row)
			this.detailOptions.activeName = 'feeYardInfo'
		}
	}
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
</style>
