<template>
	<div class="app-container">
		<div class="search-container">
			<Search ref="search" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
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
				<div class="btn-plus-search" @click="handleAddFilter" ref="btnPlus"></div>
			</Search>
		</div>
		<div class="table-container">
			<TableFilter :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
			<BaseTableMuti class="table-fixed" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
    <div v-if="addOrEditPopShow">
      <AddOrEditPop :addOrEditType="addOrEditType" :editForm="editForm" @close="addOrEditClose" />
    </div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './tableFilter'
import AddOrEditPop from './addOrEditPop'
import { getDictLabel } from '@/utils/tools'
import { columnWidthConfigInfo, columnWidthConfigSave, companyPageList } from '@/api/base'
import { getExpressListPage, expressInvalid } from '@/api/order/expressConfig'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
}
const defaultSearchInputGroup = [
	{ key: 'companyCode', value: '', placeholder: '分公司', category: 'all', queryValue: '' },
	{ key: 'expressSupplierId', value: '', placeholder: '快递公司', category: 'all', queryValue: '' },
	{ key: 'expressType', value: '', placeholder: '快递类型', category: 'all', queryValue: '' },
  { key: 'createdTime', value: '', placeholder: '创建时间', category: 'all', queryValue: '' },
  { key: 'status', value: '', placeholder: '状态', category: 'all', queryValue: '' },
]
export default {
	data() {
		return {
			rowData: {},
			cTimestamp: 0,
			state: '',
			defaultStyle: {
				width: '100%'
			},
			serviceTypeOptions: {},
			searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
      defaultColumns: [
         'companyName',
         'expressType',
         'expressSupplierName',
         'status',
         'createdName',
         'createdTime',
         'updatedName',
         'updatedTime',
      ],
			// 查询条件下拉选项
			filterGroups: {
				companyCode: {
					key: 'companyCode',
					label: '分公司',
					type: 'remoteSelect',
					searchType: 'in',
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
            this.getCompanyName('', item)
					},
					filterMehod: (val, item) => {
            this.getCompanyName(val, item)
					}
				},
        expressSupplierId: {
					key: 'expressSupplierId',
					label: '快递公司',
					type: 'remoteSelect',
					searchType: 'in',
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
            this.getExpressCompanyName('', item)
					},
					filterMehod: (val, item) => {
            this.getExpressCompanyName(val, item)
					}
				},
        expressType: { key: 'expressType', label: '快递类型', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true, propInDict: 'expressType' },
        createdTime: {
					label: '创建时间',
					key: 'createdTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
        status: { key: 'status', label: '状态', type: 'select', searchType: 'eq', value: '', data: [{label: '启用', value: 'valid'}, {label: '禁用', value: 'invalid'}], nonDictionary: true },
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
					show: false
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
					show: false,
				},
				defaultEmpty: true, // 数据默认不加载的显示文案
				list: [],
				configColumns: [],
				columns: [],
				allColumns: [
          {
            label: '分公司',
            key: 'companyName',
            prop: 'companyName',
            disabled: false,
          },
          {
            label: '快递类型',
            key: 'expressType',
            prop: 'expressType',
            disabled: false,
            width: '120',
            minWidth: '120',
            formatter: (row, column) => {
              return getDictLabel('expressType', row.expressType)
            }
          },
          {
            label: '快递公司',
            key: 'expressSupplierName',
            prop: 'expressSupplierName',
            disabled: false,
          },
          {
            label: '状态',
            key: 'status',
            prop: 'status',
            disabled: false,
            width: '120',
            minWidth: '120',
            formatter: (row, column) => {
              return row.status === 'valid' ? '启用' : row.status === 'invalid' ? '禁用' : ''
            }
          },
          {
            label: '创建人',
            key: 'createdName',
            prop: 'createdName',
            disabled: false,
            width: '150',
            minWidth: '150'
          },
          {
            label: '创建时间',
            key: 'createdTime',
            prop: 'createdTime',
            sortable: 'custom',
            disabled: false,
            width: '150',
            minWidth: '150',
          },
          {
            label: '更新人',
            key: 'updatedName',
            prop: 'updatedName',
            disabled: false,
            width: '150',
            minWidth: '150'
          },
          {
            label: '更新时间',
            key: 'updatedTime',
            prop: 'updatedTime',
            sortable: 'custom',
            disabled: false,
            width: '150',
            minWidth: '150',
          },
        ],
				// 操作按钮组
				operationBtns: {
					width: '60',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Edit') {
							this.handleEdit(row)
						}
					},
					data: [
						{
							label: '编辑',
							type: 'text',
							show: true,
							action: 'Edit'
						},
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
			resDefaConfList: [], // 后端配置的默认搜索模板
			oldParams: {},
      addOrEditPopShow: false,
      addOrEditType: '',
      editForm: {}
		}
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
		// this.getList()
	},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.user.currRole,
			dictMap: state => state.dict.dictMap,
		}),
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
    AddOrEditPop,
	},
	methods: {
    getCompanyName(val, item) {
			// 获取客户公司
     let data = {
				currPage: 1,
				pageSize: 50,
				query: [
					{ column: 'companyName', type: 'like', value: val || '' },
					{ column: 'state', type: 'eq', value: 'valid' }
				]
			}
			companyPageList(data).then(res => {
				let result = res.data.list.map(o => {
					return Object.assign(o, {
						id: o.companyId ? Number(o.companyId) : '',
						value: o.companyCode ? o.companyCode : '',
						label: this.$language == 'en' ? o.companyEname : o.companyName
					})
				})
				item.data = [...result]
			})
		},
    getExpressCompanyName(val, item) {
			this.$store
				.dispatch('dict/querySupplierList', {
					category: 'category',
					value: 'delivery',
					queryString: val
				})
				.then(data => {
					if (data.list && data.list.length) {
						let result =  data.list.map(ele => {
							return Object.assign(ele, {
								label: this.$language == 'en' ? ele.ename : ele.name,
								value: ele.supplierId ? Number(ele.supplierId) : ''
							})
						})
            item.data = [...result]
					}
				})
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
					let newWidth = findItem ? findItem.width : ''
					return Object.assign(item, { width: newWidth || item.width })
				})
				this.tableColumnsWidthList = this.getTableColumnsWidth()
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
			console.log(params)
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
		},
		handleClick() {},
		init() {
			// 默认展示全部
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			this.tableConfig.columns = this.tableConfig.allColumns
		},
		// 增加一条搜索条件
		handleAddFilter() {
			this.searchInputGroup.push({
				key: '',
				value: '',
				category: 'all',
				queryValue: ''
			})
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
			let statusQuery = []
			// 合并状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			return data
		},

		// 列表数据
		async getList() {
			let { data } = await columnWidthConfigInfo({
				scenesCode: this.$route.name
			})
			let { columnWidthList } = data
			let query = this.getListQuery()
			getExpressListPage(query).then(response => {
					this.oldParams = query
					let { list, totalCount, allColumns, configColumns, pageSize } = response.data
					// 请求无数据显示的文案
					if (!list || !list.length) {
						this.$set(this.tableConfig, 'defaultEmpty', false)
					}
					list.forEach(item => {
						item.serviceTypeName = item.serviceType ? this.serviceTypeOptions[item.serviceType] : ''
					})
					this.tableConfig.list = list
					this.tableConfig.pagination.total = totalCount
					this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
            this.tableConfig.pagination.isLastPage = response.data.isLastPage
            this.tableQuery.currPage = response.data.currPage
					this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
					this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
					this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
					this.tableQuery.pageSize = pageSize
					// 设置列宽为服务器返回的新的列宽宽度
					this.tableConfig.columns.map(item => {
						let findItem = columnWidthList.find(ele => ele.column === item.prop)
						let newWidth = findItem ? findItem.width : ''
						return Object.assign(item, { width: newWidth || item.width })
					})
					this.tableColumnsWidthList = this.getTableColumnsWidth()
				})
		},
		// 查询组件回调
		searchCallBack(action, param) {
			let query = []
			// console.log('this.searchInputGroup', this.searchInputGroup)
			if (action === 'Search') {
				// 新增的查询条件组装tableQuery参数
				if (this.searchInputGroup.length) {
					this.searchInputGroup.forEach((item, index) => {
						let tempItem = {}

						if (item.key) {
							// 非自动补全的查询参数从item.value中取值合并到query
							if (this.filterGroups[item.key].type !== 'autocomplete') {
								// 中转港
								if (this.filterGroups[item.key].type === 'remoteSelect' && this.filterGroups[item.key].multiple) {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value ? item.value.toString() : ''
									})
								} else if (this.filterGroups[item.key].category === 'daterange') {
									// 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
									if (item.value && item.value[0]) {
										if (item.value[0] === '-') {
                      query.push({
                        column: item.key,
                        type: 'empty',
                        value: '-'
                      })
                    } else {
                      query.push({
                        column: item.key,
                        type: 'ge',
                        value: item.value[0] + ' 00:00:00'
                      })
                    }
									}
									if (item.value && item.value[1]) query.push({ column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
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
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return { ...item }
			})
			// console.log('重置')
		},

		// 按选中的搜索模板设置搜索条件反显
		setSearchCondition(composeKey, defaultConfigList) {
			this.searchInputGroup = []
			let searchItemList = []
			let findItem = []
			findItem = this.searchConditionList.find(item => item.composeKey === composeKey)
			// 后端有配置好的模板
			if (defaultConfigList && defaultConfigList.length) {
				findItem = defaultConfigList.find(item => item.composeKey === composeKey)
			}
			searchItemList = findItem ? findItem.searchItemList : []
			searchItemList.map(item => {
				let value = ''
				value = item.searchValue
				// 时间区间，下拉搜索查询，下拉多选特殊处理反显
				if (this.filterGroups[item.searchField].category === 'daterange') {
					value = item.searchValue ? item.searchValue.split(',') : ''
				}
				if (this.filterGroups[item.searchField].type === 'remoteSelect') {
					// 单选
					if (!this.filterGroups[item.searchField].multiple) {
						let length = item.searchValue.length
						let indexOf = item.searchValue.indexOf('|')
						let code = item.searchValue.substring(0, indexOf)
						let text = item.searchValue.substring(indexOf + 1, length)
						value = code
						this.filterGroups[item.searchField].data = [{ label: text, value }]
					} else {
						// 多选
						if (item.searchValue) {
							// 中转港调港口接口获取下拉数据反显
							value = item.searchValue.split(',')
							this.$store
								.dispatch('dict/basePortListByCodes', {
									portCodes: item.searchValue
								})
								.then(data => {
									this.filterGroups[item.searchField].data = data
								})
						}
					}
				}
				this.searchInputGroup.push({
					key: item.searchField,
					value: value,
					category: 'all',
					queryValue: ''
				})
			})
		},
		// 多选
		handleMuti(arr) {
			console.log('🚀 ~ arr', arr)
			this.selectedCheckbox = arr
		},
    handleAdd() {
      this.addOrEditType = 'add'
      this.addOrEditPopShow = true
    },
    addOrEditClose(action) {
      this.addOrEditPopShow = false
      if (action === 'Confirm') {
        if (this.addOrEditType === 'add') {
          this.tableQuery.currPage = 1
        }
        this.getList()
      }
    },
    handleEdit(row) {
       this.addOrEditType = 'edit'
       this.editForm = row
       this.addOrEditPopShow = true
    },
    handleInvalid() {
			console.log('批量禁用')
      // 批量禁用
      if (!this.selectedCheckbox.length) {
        return this.$message.error('请至少选择一条禁用')
      }
			if (this.selectedCheckbox.some(item => item.status === 'invalid')) {
				return this.$message.error('不能选择已经禁用的数据进行禁用操作')
			}
      let data = this.selectedCheckbox.map(item => {
        return item.oid
      })
      expressInvalid(data)
			.then(res => {
				this.$message.success('禁用成功')
				this.getList()
			})
    },
		handleSizeChange(val) {
			// 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
			if (val) {
				this.tableQuery.currPage = val
			}
			this.getList()
		},
		handleCurrentChange(val) {
			if (val === 1) return (this.tableConfig.list = [])
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 排序
		handleSort(query) {
			this.getList()
		},
	}
}
</script>
<style lang="scss">
.icon-hbl2 {
	display: inline-block;
	width: 14px;
	height: 14px;
	background: #3e80f5;
	border-radius: 2px;
	color: #fff;
	line-height: 14px;
	text-align: center;
	font-style: normal;
	margin-right: 5px;
}
.table-container {
	.static-class {
		display: flex;
		margin-bottom: 10px;
		.item {
			display: flex;
		}
		.item+.item {
			margin-left: 10px;
		}
	}
}
</style>
