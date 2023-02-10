<template>
	<div class="app-container">
		<div class="search-container">
			<Search 
				:searchConditionHide="searchConditionHide"
				:config.sync="searchConfig"
				:callback="searchCallBack" 
				:tableQuery.sync="tableQuery" 
				:searchFiledGroup="searchInputGroup" 
				:filterGroups="filterGroups"
			>
				<AddFilter
					:searchInputGroup="searchInputGroup"
					:allFilterGroups="allFilterGroups"
					:filterGroups="filterGroups"
					:defaultSearchLength="defaultSearchLength"
					:callback="searchCallBack"
					:index="index"
					:item="item"
					v-for="(item, index) in searchInputGroup"
					:key="'filter' + index"
				/>
				<div class="btn-plus-search" @click="handleAddFilter"></div>
			</Search>
		</div>
		<div class="table-container">
			<div class="table-filter">
				<div class="table-filter-left">
					<!-- <el-button size="mini" ref="btnExport" @click="handleExport" plain>
						导出
					</el-button> -->
					<el-button size="mini" ref="btnCreate" @click="handleCreate" type="primary">新建</el-button>
					<!-- <el-button size="mini" ref="btnApply" @click="handleApply" type="default" plain>合约号申请</el-button> -->
				</div>
				<div class="table-filter-right">
					<div class="pulish-status">
						<el-radio-group v-model="tableQuery.tabVal" size="mini" @change="handleSearchByStatus">
							<el-radio-button size="mini" v-for="(item, index) in statusOptions" :key="index" :label="index" >{{item}}</el-radio-button>
						</el-radio-group>
					</div>
				</div>
			</div>
			<BaseTableMuti v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
		<!-- 详情弹窗 -->
		<div v-if="infoPopShow">
			<Info :infoPopQuery="infoPopQuery" @close="infoPopClose" />
		</div>
		<!-- 合约号申请 -->
		<div v-if="applyPopShow">
			<Apply :applyPopQuery="applyPopQuery" @close="applyPopClose" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import Info from './components/infoPop'
import Apply from '../components/apply'
import CustomColumns from '@/components/customColumns/index'
import { baseEmployeeListName, searchConditionInfo, searchConditionSave, searchConditionDelete, columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { contractTitleList, contractTitleSave, contractTitleDelete, contractTitleInvalid} from '@/api/order/contract'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	tabVal: '0'
}
const defaultSearchInputGroup = [
	{ key: 'ename', value: '', placeholder: '英文名称', category: 'all', queryValue: '' },
	{ key: 'cname', value: '', placeholder: '中文名称', category: 'all', queryValue: '' },
	{ key: 'identNumber', value: '', placeholder: '纳税人识别号', category: 'all', queryValue: '' },
	// { key: 'contact', value: '', placeholder: '联系人', category: 'all', queryValue: '' }
]
export default {
	mixins: [routerMixin],
	data() {
		return {
			oldParams:{},
			cTimestamp: 0,
			loading: false,
			defaultStyle: {
				width: '100%'
			},
			searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			searchConditionHide: true,
			allFilterGroups: {
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				ename: { label: '英文名称', key: 'ename', type: 'input', searchType: 'like', value: '' },
				cname: { label: '中文名称', key: 'cname', type: 'input', searchType: 'like', value: '' },
				identNumber: { label: '纳税人识别号', key: 'identNumber', type: 'input', searchType: 'like', value: '' },
				// contact: { label: '联系人', key: 'contact', type: 'input', searchType: 'like', value: '' },
			},
			// 默认展示的搜索条件，搜索条件分类
			searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			searchConfig: [],
			// table复选框多选的值
			selectedCheckbox: [],
			// table基础组件
			tableConfig: {
				style: {},
				tableIndex: {
					show: true
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: true,
					// 是否支持列表项选中功能
					mutiSelect: true,
					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ oid }) {
						return oid ? true : false
					}
				},
				customColumns: {
					show: true,
					handleCustomColumns: this.handleCustomColumns
				},
				defaultEmpty: true,	// 数据默认不加载的显示文案
				list: [],
				configColumns: [],
				columns: [],
				allColumns: store.state.contract.titleList.columnsBase(),
				// 操作按钮组
				operationBtns: {
					minWidth: '120',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Info') {
							this.handleInfo(row)
						}
						if (action === 'Delete') {
							this.handleDelete(row)
						}
						if (action === 'Invalid') {
							this.handleInvalid(row)
						}
					},
					data: [
						{
							label: '编辑',
							type: 'text',
							show: (item, row) => {
								if (row.titleStatus !== 'INVALID' && row.createdBy === this.userId) {
									return true
								}
								return false
							},
							action: 'Info'
						},
						{
							label: '失效',
							type: 'text',
							className: 'red',
							show: (item, row) => {
								if (row.titleStatus !== 'INVALID' && row.createdBy === this.userId) {
									return true
								}
								return false
							},
							action: 'Invalid'
						},
						{
							label: '删除',
							type: 'text',
							className: 'red',
							show: (item, row) => {
								if (row.createdBy === this.userId) {
									return true
								}
								return false
							},
							action: 'Delete'
						}
					]
				},
				// 操作提示
				tips: {
					text: '',
					show: false
				},
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
			tableColumnsWidthList: [],
			// 显示自定义表头的弹窗状态
			customColumnsPopShow: false,
			infoPopShow: false,
			infoPopQuery: {
				oid: undefined
			},
			applyPopShow: false,
			applyPopQuery: {}
		}
	},
	beforeRouteLeave (to, from, next) {
    next()
  },
	activated() {
		let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
      this.getList()
    }
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.init()
	},
	mounted() {},
	computed: {
		...mapState('user', ['userId']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			defaultColumns: state => state.contract.titleList.defaultColumns,
			specialColumns: state => state.contract.titleList.specialColumns,
			columnsBase: state => state.contract.titleList.columnsBase()
		}),
		statusOptions() {
      return {
        "0": "全部",
        "1": "有效",
        "2": "无效"
      }
    }
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		Info,
		Apply,
		CustomColumns
	},
	methods: {
		handleMuti(arr) {
			this.selectedCheckbox = arr
		},
		handleApply() {
			if (this.selectedCheckbox.length != 1) {
				return this.$message.warning('请选择一条数据!')
			}
			this.applyPopShow = true
			this.applyPopQuery = this.selectedCheckbox[0]
			this.applyPopQuery.titleId = this.selectedCheckbox[0].oid
		},
		applyPopClose(action, value) {
			this.applyPopShow = false
			if (action === 'Confirm') {
				this.getList()
			}
		},
		// 按状态查询
    handleSearchByStatus(value) {
			this.$set(this.tableQuery, 'tabVal', value)
			this.$set(this.tableQuery, 'currPage', 1)
			this.getList()
		},
		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},
		handleCreate() {
			this.infoPopQuery = {
				oid: undefined
			}
			this.infoPopShow = true
		},
		infoPopClose(action) {
			this.infoPopShow = false
			if (action === 'Confirm') {
				this.getList()
			}
		},
		// 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			}).then(res => {
				// console.log('res', res)
				// console.log('this.tableConfig.columns', this.tableConfig.columns)
				let {columnWidthList} = res.data
				// table列宽重新渲染
				this.tableConfig.columns.map(item => {
					let findItem = columnWidthList.find(ele => ele.column === item.prop)
					// 服务器返回的新的列宽宽度 
					let newWidth = findItem ? findItem.width : ''
					return Object.assign(item, {width: newWidth || item.width})
				})
				this.tableColumnsWidthList = this.getTableColumnsWidth()
				console.log('this.tableColumnsWidthList', this.tableColumnsWidthList)
			})
		},
		// 获取本地table列表的字段和宽为数组集合
		getTableColumnsWidth() {
			let result = this.tableConfig.columns.map(item => {
				return {column: item.prop, width: item.width}
			})
			return result
		},
		// 自定义列宽度保存
		handleSaveColumnWidth(params) {
			console.log(params)
			let data = this.tableColumnsWidthList.map(item => {
				if (item.column === params.prop) {
					item.width = params.width
				}
				return {...item}
			})
			columnWidthConfigSave({
				scenesCode: `${this.$route.name}`,
				columnWidthList: data
			}).then(res => {
			}).finally(() => {
			})
		},
		init() {
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
		},
		// 增加一条搜索条件
		handleAddFilter() {
			this.searchInputGroup.push({ key: '', value: '', category: 'all', queryValue: '' })
		},
		// 搜索条件el-select下拉数据处理
		searchSelectVisibleData(data, item) {
			// 单选下拉不保存选择后的数据
			if (!item.multiple) item.saveList = []
			let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.key))
			let itemList = filterArr.map(ele => {
				return { ...ele, label: ele.value, value: ele.key }
			})
			item.data = [...item.saveList, ...itemList]
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
		// 获取列表请求参数
		getListQuery() {
			// console.log('this.tableQuery.orderStatus', this.tableQuery.orderStatus)
			let statusQuery = []
			// 全部
			if (this.tableQuery.tabVal === '0') {
				statusQuery = []
			} else if (this.tableQuery.tabVal === '1') {
				statusQuery = [{column: 'titleStatus', type: 'ne', value: 'INVALID'}]
			} else if (this.tableQuery.tabVal === '2') {
				statusQuery = [{column: 'titleStatus', type: 'eq', value: 'INVALID'}]
			}
			// 合并状态参数
			let data = {}
			// console.log(this.tableQuery)
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.tabVal
			return data
		},
		// 列表数据
		async getList() {
			this.loading = true
			let {data} = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			})
			let {columnWidthList} = data
			let query = this.getListQuery()
			this.oldParams = query
			contractTitleList(query)
				.then(response => {
					let { list, totalCount, allColumns, configColumns, pageSize } = response.data
					// 请求无数据显示的文案
					if (!list || !list.length) {
						this.$set(this.tableConfig, 'defaultEmpty', false)
					}
					this.tableConfig.list = this.setFileNameStr(list)
					this.tableQuery.pageSize = pageSize
					this.tableConfig.pagination.total = totalCount
					this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
            this.tableConfig.pagination.isLastPage = response.data.isLastPage
            this.tableQuery.currPage = response.data.currPage
					this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
					this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
					this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
					this.handleFilterColumns(this.tableConfig.configColumns)
					// 设置列宽为服务器返回的新的列宽宽度
					// console.log('this.tableConfig.columns', this.tableConfig.columns)
					this.tableConfig.columns.map(item => {
						// 取服务器返回的宽度
						let findItem = columnWidthList.find(ele => ele.column === item.prop)
						let newWidth = findItem ? findItem.width : ''
						return Object.assign(item, { width: newWidth || item.width })
					})
					this.tableColumnsWidthList = this.getTableColumnsWidth()
					// this.getTableColumnWidthInfo()
				})
				.finally(() => {
					this.loading = false
				})
		},
		handleInvalid(row) {
			this.$confirm(`是否设置该抬头为失效?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				contractTitleInvalid({ oid: row.oid }).then(res => {
					this.$message({
						type: 'success',
						message: '设置失效成功',
						duration: 1000,
						onClose: () => {
							this.getList()
						}
					})
				})
			}).catch(err => {
				console.log('err')
			})
		},
		// 删除
		handleDelete(row) {
			this.$confirm(`是否删除此抬头?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				contractTitleDelete({ oid: row.oid }).then(res => {
					this.$message({
						type: 'success',
						message: '删除成功',
						duration: 1000,
						onClose: () => {
							let totalPage = Math.ceil((this.tableConfig.pagination.total - 1) / this.tableQuery.pageSize)
							let currPage = this.tableQuery.currPage > totalPage ? totalPage : this.tableQuery.currPage
							this.tableQuery.currPage = currPage < 1 ? 1 : currPage
							this.getList()
						}
					})
				})
			}).catch(err => {
				console.log('err')
			})
		},
		// 查询组件回调
		async searchCallBack(action, param) {
			let query = []

			if (action === 'Search') {
				// 新增的查询条件组装tableQuery参数
				if (this.searchInputGroup.length) {
					this.searchInputGroup.forEach((item, index) => {
						let tempItem = {}
						if (item.key) {
							// 非自动补全的查询参数从item.value中取值合并到query
							if (this.filterGroups[item.key].type !== 'autocomplete') {
								// 多选下拉框
								if (this.filterGroups[item.key].type === 'cascader') {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || 'eq',
                    value: item.value ? item.value[item.value.length-1] : ''
                  })
                } else if (this.filterGroups[item.key].multiple) {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value ? item.value.toString() : ''
									})
									// 中转港特殊处理
									if (item.key === 'transitPortCode') {
										Object.assign(tempItem, {
											column: 'transitPortCodeStr',
											type: 'like',
											value: item.value ? item.value.join('#') : ''
										})
									}
								} else if (this.filterGroups[item.key].category === 'daterange') {
									// 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
									if (item.value) query.push({ column: item.key, type: 'ge', value: item.value[0] + ' 00:00:00' }, { column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
								} else if (['prefinCloseStatus', 'finCloseStatus'].includes(item.key)) {
									// 特殊处理预关账状态，关账状态
									if (item.value) {
										// 选择未关账传值不等于yes
										if (item.value === 'yes') {
											Object.assign(tempItem, {
												column: item.key,
												type: 'eq',
												value: 'yes'
											})
										} else {
											Object.assign(tempItem, {
												column: item.key,
												type: 'ne',
												value: 'yes'
											})
										}
									}
								} else {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value
									})
								}
							} else {
								Object.assign(tempItem, {
									column: item.key,
									type: this.filterGroups[item.key].searchType || 'eq',
									value: this.filterGroups[item.key].queryValue
								})
							}

							if (item.key === 'orderStatus') {
								this.tableQuery.orderStatus = item.value
							}
							query.push(tempItem)
						}
					})
				}

				Object.assign(this.tableQuery, {
					query: query.filter(item => {
						return item.value
					}),
					currPage: 1
				})
				// console.log('serach:', this.tableQuery)
				this.getList()
			}
			if (action === 'Reset') {
				this.handleSearchValueReset()
			}
			// 模板加载后修改搜索组件的数组
			if (action === 'Update') {
				this.searchInputGroup = param.length ? [...param] : [...defaultSearchInputGroup]
			}
			// 刷新
      if (action === 'Refresh') {
        this.loading = true
				let {data} = await columnWidthConfigInfo({
					scenesCode: `${this.$route.name}`
				})
				let {columnWidthList} = data
				contractTitleList(this.oldParams)
					.then(response => {
						let { list, totalCount, allColumns, configColumns, pageSize } = response.data
						// 请求无数据显示的文案
						if (!list || !list.length) {
							this.$set(this.tableConfig, 'defaultEmpty', false)
						}
						this.tableConfig.list = this.setFileNameStr(list)
						this.tableQuery.pageSize = pageSize
						this.tableConfig.pagination.total = totalCount
						this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
            this.tableConfig.pagination.isLastPage = response.data.isLastPage
            this.tableQuery.currPage = response.data.currPage
						this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
						this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
						this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
						this.handleFilterColumns(this.tableConfig.configColumns)
						// 设置列宽为服务器返回的新的列宽宽度
						// console.log('this.tableConfig.columns', this.tableConfig.columns)
						this.tableConfig.columns.map(item => {
							// 取服务器返回的宽度
							let findItem = columnWidthList.find(ele => ele.column === item.prop)
							let newWidth = findItem ? findItem.width : ''
							return Object.assign(item, { width: newWidth || item.width })
						})
						this.tableColumnsWidthList = this.getTableColumnsWidth()
						// this.getTableColumnWidthInfo()
					})
					.finally(() => {
						this.loading = false
					})
      }
		},
		setFileNameStr(list) {
			let result = list.map(item => {
				let fileNameStr = ''
				item.fileList.map((ele, index) => {
					fileNameStr += !index ? `${ele.name}` : `,${ele.name}`
				})
				return {...item, fileNameStr}
			})
			console.log(result)
			return result
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return {...item}
			})
		},
		// // 导出
		// handleExport() {
		// 	let data = this.getListQuery()
		// 	orderJointListExport({
		// 		ascColumns: data.ascColumns,
		// 		descColumns: data.descColumns,
		// 		query: data.query
		// 	}).then(response => {
		// 		let { filePath } = response.data
		// 		window.location.href = filePath
		// 	})
		// },
		handleSizeChange(val) {
			this.getList()
		},
		handleCurrentChange(val) {
			// 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
			// if (val) {
			// 	this.tableQuery.currPage = val
			// 	// this.getSearchConditionInfo()
			// }
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 去详情页
		handleInfo(row) {
			this.$set(this.infoPopQuery, 'oid', row.oid)
			this.infoPopShow = true
		},
		// 排序
		handleSort(query) {
			this.getList()
		},
		// 过滤显示自定义的表头
		handleFilterColumns(value) {
			let { allColumns, columns } = this.tableConfig
			let temp = []
			let arr = []
			temp = allColumns.filter((item, index) => {
				return value.includes(item.prop)
			})
			// 排序 temp
			temp.sort((prev, next) => {
				const p = value.indexOf(prev.prop)
				const n = value.indexOf(next.prop)
				return p - n
			})
			temp.map(item => {
				arr.push(item.prop)
			})
			Object.assign(this.tableConfig, {
				columns: temp,
				configColumns: arr
			})
			// console.log('tableColumns:', this.tableConfig.columns);
		},
		// 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
		getColumnsValues(value) {
			// 20211202 订单号表头不固定在第一列
			let result = []
			value.map(item => {
				if (this.specialColumns[item]) {
					result = result.concat(this.specialColumns[item])
				} else {
					result.push(item)
				}
			})
			result = Array.from(new Set(result))
			return result
		},
		// 自定义表头关闭回调
		customColumnsPopClose(action, value) {
			this.customColumnsPopShow = false
			if (action === 'Confirm') {
				let columnsKeys = this.getColumnsValues(value)
				Object.assign(this.tableQuery, {
					columns: columnsKeys
				})
				// console.log('columnsKeys:',this.tableQuery.columns)
				this.getList()
			}
		},
	}
}
</script>
<style lang="scss">
</style>
