<template>
	<div class="app-container">
		<div class="search-container">
			<Search :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
				<!-- 新增条件下拉查询 -->
				<AddFilter
					:defaultSearchLength="defaultSearchLength"
					:filterGroups="filterGroups"
					:allFilterGroups="allFilterGroups"
					:searchInputGroup="searchInputGroup"
					:callback="searchCallBack"
					:item="item"
					:index="index"
					v-for="(item, index) in searchInputGroup"
					:key="'filter' + index"
				/>
				<div class="btn-plus-search" @click="handleAddFilter"></div>
			</Search>
		</div>
		<div class="table-container" id="knowledge-base-class-tabel">
			<TableFilter :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
			<BaseTableMuti v-loading="loading" class="seaFreight" ref="classListTabel" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>

		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
		<div v-if="showAddClassDialog">
			<AddClass @close="addClassPopClose" :detailData="detailData" />
		</div>
		<!-- 附件列表 -->
		<div v-if="fileListShow">
			<FileList @close="fileListShow = false" :param="detailData" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import Search from '@/views/charge/maintain/mainRoute/components/search'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
import AddFilter from './components/addFilter'
import AddClass from './components/addClass'
import FileList from './components/fileList'
// 弹出框
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import { columnWidthConfigInfo, columnWidthConfigSave, saveHscodeType, editHscodeType, hscodeTypePageList, typeChangeStatus } from '@/api/base'
const defaultPage = {
	pageSize: -1,
	currPage: 1
}

const defaultTableQuery = {
	ascColumns: [],
	descColumns: ['createdTime'],
	columns: [],
	query: [] // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
}
const defaultSearchInputGroup = [
	{
		key: 'name',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'status',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	}
]

export default {
	mixins: [routerMixin],
	data() {
		return {
			fileListShow: false,
			detailData: {},
			editId: '',
			showAddClassDialog: false,
			loading: false,
			state: '',
			showVal: null,
			defaultStyle: {
				width: '100%'
			},
			// searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			// 中转港
			transitPortList: [],
			// 查询条件下拉选项
			allFilterGroups: {
				all: this.filterGroups
			},
			filterGroups: {
				name: {
					key: 'name',
					label: '分类名称',
					type: 'input',
					value: '',
					searchType: 'like'
				},
				status: {
					label: '状态',
					key: 'status',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '无效', value: 'invalid' },
						{ label: '有效', value: 'valid' }
					],
					nonDictionary: true
				}
			},
			searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
			// 查询条件
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			searchConfig: [],

			// table复选框多选的值
			selectedCheckbox: [],

			// table基础组件
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				customColumns: {
					show: false,
					handleCustomColumns: this.handleCustomColumns
				},
				defaultEmpty: true, // 数据默认不加载的显示文案
				options: {
					// api: this.$api.system.user.list,
					// 是否支持解锁列表修改
					lockState: true,

					// 是否支持列表项选中功能
					mutiSelect: true,

					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ status }) {
						return true
						// if (status === 'valid') {
						//   return true
						// } else {
						//   return false
						// }
					},

					// 行key,用于行展开
					rowKeyId: 'rowKey',
					//定义children名字
					treeProps: {
						children: 'children',
						hasChildren: 'hasChildren',
						expandAll: true,
						expandDefaultNot: true
					}
				},
				list: [],
				configColumns: [],
				columns: [],
				allColumns: [
					{
						prop: 'className',
						label: '分类名称',
						// fixed: true,
						align: 'left',
						width: '400px',
						'header-align': 'left',
						sortable: 'custom',
						formatter: (row, column) => {
							// let str = '<i class="recommend"></i><span>--</span>'
							// let recommend = `<i class="recommend"></i>`
							// let className = row.chapterName || row.className
							// if (row.children && row.children.length > 0) {
							// 	str = `<div class="column-block">${className}</div>`
							// } else {
							// 	str = `<div class="column-block">${className}</div>${recommend}`
							// }
							// return str

							return row.chapterName || row.className
						},
						type: 'text'
					},
					{
						prop: 'fileNos',
						label: '申报附件',
						type: 'text',
						width: '100',
						formatter: (row, column) => {
							if (row.fileNos) {
								return `<span class="underline">查看</span>`
							} else {
								return ''
							}
						},
						method: (index, row) => {
							// 查看附件
							if (row.fileNos) {
								this.handleFiles(row)
							}
						}
					},
					{
						prop: 'status',
						label: '状态',
						type: 'text',
						width: '100',
						sortable: 'custom',
						formatter: (row, column) => {
							if (row.status === 'valid') {
								return '有效'
							} else {
								return '无效'
							}
						}
					},
					{
						prop: 'createdName',
						label: '创建人',
						type: 'text',
						width: '200'
					},
					{
						prop: 'createdTime',
						label: '创建时间',
						type: 'text',
						width: '200',
						sortable: 'custom'
					},
					{
						prop: 'updatedName',
						label: '更新人',
						type: 'text',
						width: '200'
					},
					{
						prop: 'updatedTime',
						label: '更新时间',
						type: 'text',
						width: '200',
						sortable: 'custom'
					}
				],

				// 操作按钮组
				operationBtns: {
					minWidth: '200',
					fixed: 'right',
					show: true,
					resizable: true,
					callback: (action, $index, row, item, $event) => {
						if (action === 'Detail') {
							this.handleDetail(row)
						}
						if (action === 'AddClass') {
							this.handleAddClass(row)
						}
						if (action === 'Disable') {
							this.handleDisable(row)
						}
					},
					data: [
						{
							label: '查看',
							type: 'text',
							show: (item, row) => {
								return true
							},
							action: 'Detail'
						},
						{
							label: '新增子分类',
							type: 'text',
							show: (item, row) => {
								if (!row.chapterCode && row.status === 'valid') {
									return true
								} else {
									return false
								}
							},
							action: 'AddClass'
						},
						{
							label: '禁用',
							type: 'text',
							className: 'red',
							show: (item, row) => {
								if (row.status === 'valid') {
									return true
								} else {
									return false
								}
							},
							action: 'Disable'
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
					oldPagination: false,
					show: true,
					total: 0,
					hasNextPage: false,
					hasPreviousPage: false,
					isFirstPage: false,
					isLastPage: false
				}
			},
			// 显示自定义表头的弹窗状态
			customColumnsPopShow: false,
			// 新建订单弹窗
			routeId: '',
			isFeederRoute: 'y',
			feederRouteId: undefined,
			isClickInfo: false,
			resDefaConfList: [], // 后端配置的默认搜索模板
			tableColumnsWidthList: [],
			// 自定义复制模板
			copyColumns: []
		}
	},
	activated() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		this.init()
		let copyColumns = window.localStorage.getItem('copyColumns')
		if (copyColumns) {
			this.copyColumns = JSON.parse(copyColumns)
		}
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			shipTerms: state => state.dict.dictMap.shipTerms,
			publishStatus: state => state.dict.dictMap.publishStatus,
			routeQuery: state => state.charge.knowledgeBaseClassList,
			defaultColumns: state => state.charge.knowledgeBaseClassList.defaultColumns,
			specialColumns: state => state.charge.knowledgeBaseClassList.specialColumns,
			columnsBase: state => state.charge.knowledgeBaseClassList.columnsBase
		})
	},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		BaseDialog,
		CustomColumns,
		AddClass,
		FileList
	},
	methods: {
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
		handleBatchDisable() {
			// if (this.selectedCheckbox.length == 0) {
			//   this.$message.warning('请至少选择一条数据')
			//   return
			// }
			let selectedCheckboxArr = this.selectedCheckbox.filter(el => el.status === 'valid')
			if (selectedCheckboxArr.length === 0) {
				return this.$message.error('请至少选择一条状态为【有效】的数据')
			}
			let text = '是否确定要禁用所选的分类？（如果选择的分类下面有子分类，当前操作会将该分类及其子级分类都禁用？）'
			let params = {
				status: 'invalid'
			}
			this.$confirm(text, '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let arr = []
					for (let i = 0; i < selectedCheckboxArr.length; i++) {
						if (selectedCheckboxArr[i].chapterCode) {
							arr.push({ chapterCode: selectedCheckboxArr[i].chapterCode })
						} else {
							arr.push({ classCode: selectedCheckboxArr[i].classCode })
						}
					}
					params.typeCodes = arr
					typeChangeStatus(params).then(res => {
						this.$message.success('禁用成功')
						this.selectedCheckbox = []
						this.$refs.classListTabel.$refs.multipleTable.handleSelectionClear()
						this.getList()
					})
				})
				.catch(() => {})
		},
		handleDisable(row) {
			// 禁用
			let text = '是否确定要将该分类及其子级分类都禁用？'
			if (row.chapterCode) {
				text = '是否确定要禁用此分类？'
			}
			this.$confirm(text, '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let params = {
						status: 'invalid'
					}
					let arr = []
					if (row.chapterCode) {
						arr = [{ chapterCode: row.chapterCode }]
					} else {
						arr = [{ classCode: row.classCode }]
					}
					params.typeCodes = arr
					typeChangeStatus(params).then(res => {
						this.$message.success('禁用成功')
						this.getList()
					})
				})
				.catch(() => {})
		},
		// 编辑
		handleDetail(row) {
			this.detailData = Object.assign({}, row)
			this.editId = row.oid
			this.showAddClassDialog = true
		},
		handleAddClass(row) {
			this.editId = ''
			this.detailData = {
				classCode: row.classCode,
				className: row.className
			}
			this.showAddClassDialog = true
		},
		handleFiles(row) {
			this.detailData = Object.assign({}, row)
			this.fileListShow = true
		},
		addClassPopClose(action, value) {
			if (action === 'Confirm') {
				if (this.editId) {
					let params = {
						oid: this.editId,
						name: value.name,
						classCode: value.classCode,
						fileList: value.fileList
					}
					if (value.chapterCode) {
						params.chapterCode = value.chapterCode
					}
					editHscodeType(params).then(res => {
						this.$message.success('编辑成功')
						this.getList()
						this.showAddClassDialog = false
					})
					// .finally(() => {
					//   this.showAddClassDialog = false
					// })
				} else {
					let params = {
						name: value.name,
						fileList: value.fileList
					}
					if (value.classCode) {
						params.classCode = value.classCode
					}
					saveHscodeType(params).then(res => {
						this.$message.success('新增品类成功')
						this.getList()
						this.showAddClassDialog = false
					})
					// .finally(() => {
					//   this.showAddClassDialog = false
					// })
				}
			} else {
				this.showAddClassDialog = false
			}
		},
		handleAdd() {
			// 新增分类
			this.editId = ''
			this.detailData = {}
			this.showAddClassDialog = true
		},
		init() {},
		// 后端没有配置模板
		initSearch() {
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
		},
		// 增加一条搜索条件
		handleAddFilter() {
			this.searchInputGroup.push({ value: '', key: '', queryValue: '' })
			//console.log('新增一条：', this.searchInputGroup)
		},

		// 列表数据
		async getList() {
			let publishStatusQuery = []
			// 合并发布状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(publishStatusQuery)
			})
			this.loading = true
			let res = await columnWidthConfigInfo({
				scenesCode: this.$route.name
			})
			let { columnWidthList } = res.data
			hscodeTypePageList(data)
				.then(response => {
					let { list, totalCount, configColumns } = response.data
					//处理返回的数据，映射关系
					this.tableConfig.list = list
					// 请求无数据显示的文案
					if (!list || !list.length) {
						this.$set(this.tableConfig, 'defaultEmpty', false)
					}
					this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns

					this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
					this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
					this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
					this.tableConfig.pagination.isLastPage = response.data.isLastPage
					this.tableQuery.currPage = response.data.currPage
					this.tableQuery.pageSize = response.data.pageSize
					this.tableConfig.pagination.total = totalCount
					this.handleFilterColumns(this.tableConfig.configColumns)
					this.tableConfig.columns.map(item => {
						// 取服务器返回的宽度
						let findItem = columnWidthList.find(ele => ele.column === item.prop)
						let newWidth = findItem ? findItem.width : ''
						return Object.assign(item, { width: newWidth || item.width })
					})
					this.tableColumnsWidthList = this.getTableColumnsWidth()
					this.getTableConfigList(list)
					// setTimeout(()=>{
					//   this.$refs.classListTabel.$refs.multipleTable.$refs.tableLayout.setAllRowExpand(true)
					// },3000)
				})
				.finally(() => {
					this.loading = false
				})
		},
		getTableConfigList(list) {
			this.tableConfig.tableCellClassName = ({ row, column, rowIndex, columnIndex }) => {
				if (row.children?.length) {
					return 'td-hasChildren'
				} else {
					return ''
				}
			}
		},
		// 查询组件回调
		searchCallBack(action, param) {
			let query = []
			if (action === 'Search') {
				//默认的查询条件组装tableQuery参数
				if (this.searchConfig.length) {
					this.searchConfig.forEach((item, index) => {
						let tempQuery = {}
						if (item.value) {
							Object.assign(tempQuery, {
								column: item.key,
								type: item.searchType || 'eq',
								value: item.queryValue
							})
							query.push(tempQuery)
						}
					})
				}

				// 新增的查询条件组装tableQuery参数
				if (this.searchInputGroup.length) {
					this.searchInputGroup.forEach((item, index) => {
						if (['publishTime', 'beginDate'].includes(item.key)) {
							if (item.key === 'beginDate' && item.value?.length) {
								query.push({ column: 'beginDate', type: 'eq', value: item.value[0] }, { column: 'endDate', type: 'eq', value: item.value[1] })
							}
							if (item.key === 'publishTime' && item.value?.length) {
								query.push(
									{
										column: 'publishBeginDate',
										type: 'eq',
										value: item.value[0]
									},
									{ column: 'publishEndDate', type: 'eq', value: item.value[1] }
								)
							}
						} else if (item.value) {
							let tempItem = {}
							Object.assign(tempItem, {
								column: item.key,
								type: this.filterGroups[item.key].searchType || 'eq'
							})

							// 非自动补全的查询参数从item.value中取值合并到tableQuery
							if (this.filterGroups[item.key].type !== 'autocomplete') {
								Object.assign(tempItem, {
									value: item.value
								})

								// 时间区间，beginDate开始时间区数组第一个
								if (item.key === 'beginDate') {
									Object.assign(tempItem, {
										value: item.value ? item.value[0] : ''
									})
								}

								// if (item.key === 'transitPortCodes') {
								//   Object.assign(tempItem, {
								//     "value": item.value ? item.value.toString() : ''
								//   })
								// }
								// 多选
								if (this.filterGroups[item.key].type === 'remoteSelect' && this.filterGroups[item.key].multiple) {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value ? item.value.toString() : ''
									})
								}
							}

							// 自动补全的查询参数从item.queryvalue中取值合并到query
							if (this.filterGroups[item.key].type === 'autocomplete') {
								Object.assign(tempItem, {
									value: item.queryValue
								})
							}
							query.push(tempItem)
							// console.log('query:', query);
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
				if (!param.length) return this.initSearch()
				this.searchInputGroup = [...param]
			}
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return { ...item }
			})
			// console.log('重置')
		},
		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},

		// 发布状态筛选
		handleSearchByPublishStatus() {
			this.tableQuery.currPage = 1
			this.getList()
		},

		// 多选
		handleMuti(arr) {
			this.selectedCheckbox = arr
		},

		handleSizeChang() {
			this.getList()
		},

		handleCurrentChange(val) {
			console.log('val', val)
			// 刷新页面的如果搜索条件都为空的话，不请求列表接口
			if (val === 1) {
				return (this.tableConfig.list = [])
			}
			this.getList()
		},
		handleSizeChange() {
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			// console.log(action, arr)
			let fn = this['handle' + action]
			// Add、Export、CustomColumns、ChangeLockState、Muti、SizeChange、CurrentChange、SingleEdit
			// MultiEdit、 MultiPublish、MultiInvalid、MultiDelete
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},

		// 远程排序
		handleSort() {
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
		},

		// 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
		getColumnsValues(value) {
			let result = ['routeId', 'sameFlagCode', 'feederRouteId', 'recommendLevel']
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
				this.getList()
			}
		},

		// 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: this.$route.name
			}).then(res => {
				// console.log('res', res)
				// console.log('this.tableConfig.columns', this.tableConfig.columns)
				let { columnWidthList } = res.data
				// table列宽重新渲染
				this.tableConfig.columns.map(item => {
					let findItem = columnWidthList.find(ele => ele.column === item.prop)
					// 服务器返回的新的列宽宽度
					let newWidth = findItem ? Math.min(findItem.width, item.minWidth) : ''
					return Object.assign(item, { width: newWidth || item.width })
				})
				this.tableColumnsWidthList = this.getTableColumnsWidth()
				// console.log('this.tableColumnsWidthList', this.tableColumnsWidthList)
			})
		},
		// 获取本地table列表的字段和宽为数组集合
		getTableColumnsWidth() {
			let result = this.tableConfig.columns.map(item => {
				return { column: item.prop, width: item.width }
			})
			return result
		},
		// 自定义列宽度保存
		handleSaveColumnWidth(params) {
			// console.log(params)
			let data = this.tableColumnsWidthList.map(item => {
				if (item.column === params.prop) {
					item.width = params.width
				}
				return { ...item }
			})
			columnWidthConfigSave({
				scenesCode: this.$route.name,
				columnWidthList: data
			})
				.then(res => {})
				.finally(() => {})
		}
	},
	mounted() {},
	beforeDestroy() {}
}
</script>

<style lang="scss" scoped>
.knowledge-base-class-list .el-table__expand-icon {
	display: block !important;
	position: absolute;
	top: 8px;
}
.table-layout.knowledge-base-class-list .column-text {
	display: block;
}
.table-layout.knowledge-base-class-list .el-table__placeholder + .column-text {
	display: inline-block;
}
.knowledge-base-class-list .el-table__row--level-1 {
	background-color: #e7eeff !important;
}
#knowledge-base-class-tabel {
	/deep/ .vxe-table--render-default {
		tr {
			td {
				padding-top: 0px;
				padding-bottom: 0px;
			}
			.vxe-cell {
				line-height: 16px;
			}
		}
		.vxe-tree-cell {
			padding-left: 2em;
		}
		.vxe-cell--tree-node {
			.vxe-tree--btn-wrapper {
				left: -8px;
				z-index: 10;
				&::before {
					content: '展开';
					display: block;
					position: absolute;
					left: 12px;
					color: #3e80f5;
					line-height: 12px;
				}
				.vxe-tree--node-btn {
					color: #3e80f5;
				}
			}
			&.is--active {
				.vxe-tree--btn-wrapper {
					&::before {
						content: '收起';
					}
				}
			}
		}
	}
}
/deep/ .vxe-table--render-default .vxe-cell--tree-node {
	position: inherit;
}
</style>
