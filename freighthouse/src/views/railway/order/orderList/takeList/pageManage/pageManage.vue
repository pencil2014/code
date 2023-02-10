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
				<!-- <i class="el-icon-circle-plus-outline icon-search-plus" @click="handleAddFilter"></i> -->
				<div class="btn-plus-search" @click="handleAddFilter" ref="btnPlus"></div>
			</Search>
		</div>
		<div class="table-container">
			<TableFilter :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
			<div class="static-class">
				<div class="item">
					<div class="key">未使用合计：</div>
					<div class="value">{{ staticObj.unuse}}</div>
				</div>
				<div class="item">
					<div class="key">已使用合计：</div>
					<div class="value">{{ staticObj.used}}</div>
				</div>
				<div class="item">
					<div class="key">已作废合计：</div>
					<div class="value">{{ staticObj.invalid}}</div>
				</div>
			</div>
			<BaseTableMuti class="table-fixed" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
    <div v-if="addShow">
      <add @close="addClose" />
    </div>
    <div v-if="invalidPopShow">
      <invalidPop :rowData="rowData" @close="invalidPopClose" />
    </div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './page/tableFilter'
// 弹出框
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import { baseEmployeeListName, companyPageList, columnWidthConfigInfo, columnWidthConfigSave, getTakeEmployee } from '@/api/base'
import { getBlPagerList, getBlPagerCountPaperStatus, blPaperExport } from '@/api/railway/blPage'
import add from './page/addPop.vue'
import invalidPop from './page/invalidPop.vue'
import { getParamMethod } from '@/utils/allKindNumber'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['paperCode'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	paperStatus: 'all', // 提单纸状态
}
const defaultSearchInputGroup = [
	{ key: 'universalNo', value: '', placeholder: '各类编号', category: 'all', queryValue: '' },
	{ key: 'paperCode', value: '', placeholder: '提单纸编码', category: 'all', queryValue: '' },
	{ key: 'blNo', value: '', placeholder: '提单号', category: 'all', queryValue: '' },
]
export default {
	mixins: [routerMixin],
	data() {
		return {
			rowData: {},
			cTimestamp: 0,
			state: '',
			showVal: null,
			defaultStyle: {
				width: '100%'
			},
			serviceTypeOptions: {},
			orderNo: '',
			searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				universalNo: { key: 'universalNo', label: '各类编号', type: 'input', searchType: 'eq', value: '' },
				orderNo: { key: 'orderNo', label: '工作号', type: 'input', searchType: 'like', value: '' },
				blNo: { key: 'blNo', label: '提单号', type: 'input', searchType: 'like', value: '' },
        paperCode: { key: 'paperCode', label: '提单纸编码', type: 'numberRange', searchType: 'like', value: '', category: 'numberRange' },
				companyId: {
					key: 'companyId',
					label: '提单纸所在分公司',
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
				invalidEmployeeId: {
					key: 'invalidEmployeeId',
					label: '作废人',
					type: 'remoteSelect',
					searchType: 'in',
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item)
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item)
					}
				},
				invalidTime: {
					label: '作废时间',
					key: 'invalidTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
        invalidReason: { key: 'invalidReason', label: '作废原因', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true, propInDict: 'blPaperInvalidReason' },
        expressNo: { key: 'expressNo', label: '快递单号', type: 'input', searchType: 'like', value: '' },
        transferStatus: { key: 'transferStatus', label: '转移状态', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true, propInDict: 'blPaperTransferStatus' },
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
					show: true,
					handleCustomColumns: this.handleCustomColumns
				},
				defaultEmpty: true, // 数据默认不加载的显示文案
				list: [],
				configColumns: [],
				columns: [],
				allColumns: store.state.railway.blPagesList.columnsBase(this.handleOrderNoInfo),
				// 操作按钮组
				operationBtns: {
					width: '120',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Info') {
							this.handleInfo(row)
						}
						if (action === 'Invalid') {
							this.handleInvalid(row)
						}
					},
					data: [
						{
							label: '详情',
							type: 'text',
							show: true,
							action: 'Info'
						},
						{
							label: '作废',
							type: 'text',
							show: (item, row) => {
								return !row.invalidTime && row.companyId === this.userInfo.compCode
							},
							action: 'Invalid'
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
			resDefaConfList: [], // 后端配置的默认搜索模板
			oldParams: {},
      addShow: false,
      invalidPopShow: false,
			staticObj: {
				unuse: 0,
				used: 0,
				invalid: 0
			}
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
			userInfo: (state) => state.user.userInfo,
			dictMap: state => state.dict.dictMap,
			defaultColumns: state => state.railway.blPagesList.defaultColumns,
			specialColumns: state => state.railway.blPagesList.specialColumns,
			columnsBase: state => state.railway.blPagesList.columnsBase()
		}),
		isAc() {
			return this.currRole === 'ac'
		},
		isDoc() {
			return this.currRole === 'doc'
		},
		isOp() {
			return this.currRole === 'op'
		},
		isBd() {
			return this.currRole === 'bd' || this.currRole === 'obd'
		}
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		BaseDialog,
		CustomColumns,
    add,
    invalidPop,
	},
	methods: {
		getCompanyName(value, item) {
			let data = {
        query: [
          { column: 'companyName', type: 'like', value },
          { column: 'state', type: 'eq', value: 'valid' }
        ],
        pageSize: 1000
      }
			companyPageList(data).then(res => {
				let {list} = res.data
				list = list.map(item => {
					return Object.assign({}, item, {
						label: item.name,
						value: item.companyCode
					})
				})
				item.data = [...list]
			})
		},
		getMulEmployeeName(val, item, roleCode) {
		  let data =  val ? val.replace(/^\s+|\s+$/g, '') : ''
			getTakeEmployee(data).then(res => {
				let itemList = res.data.map(ele => {
					return { ...ele, label: ele.cname, value: ele.employeeId }
				})
				item.data = [ ...itemList ]
			})
		},
		// 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: `${this.$route.name}_pager`
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
				scenesCode: `${this.$route.name}_pager`,
				columnWidthList: data
			})
				.then(res => {})
				.finally(() => {})
		},
		handleClick() {},
		init() {
			// 默认展示全部
			this.tableQuery.paperStatus = 'all'
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			this.tableConfig.columns = store.state.railway.blPagesList.columnsBase(this.handleOrderNoInfo)
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
		// 获取订舱代理
		getSupplierList(type, queryString, item) {
			this.$store.dispatch('dict/queryBkgAgentSupplierList', { category: 'category', value: 'bkg_carrier,bkg_agent', queryString: queryString, categoryType: 'in' }).then(data => {
				item.data = data.list.map(ele => {
					return Object.assign(ele, {
						label: this.$language == 'en' ? ele.ename : ele.name,
						value: ele.supplierId ? Number(ele.supplierId) : ''
					})
				})
			})
		},
		// 获取列表请求参数
		getListQuery() {
			let statusQuery = []
			// 提单纸状态 全部
			if (this.tableQuery.paperStatus === 'all') {
				statusQuery = []
			} else {
				statusQuery = [{ column: 'paperStatus', type: 'eq', value: this.tableQuery.paperStatus }]
			}
			// 合并状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.paperStatus
			return data
		},

		// 列表数据
		async getList() {
			let { data } = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}_pager`
			})
			let { columnWidthList } = data
			let query = this.getListQuery()
			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'so', 'blNo'].includes(item.column)) {
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s+]/)
						.filter(Boolean)
						.join('#')
				}
			})
			getParamMethod(this.$route.name, query).then(queryObj => {
				getBlPagerList(queryObj).then(response => {
					this.oldParams = queryObj
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
					this.tableConfig.configColumns.push('isCancelApply', 'isNotify', 'isChange')
					this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
					this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
					this.tableQuery.pageSize = pageSize
					this.handleFilterColumns(this.tableConfig.configColumns)
					// 设置列宽为服务器返回的新的列宽宽度
					this.tableConfig.columns.map(item => {
						let findItem = columnWidthList.find(ele => ele.column === item.prop)
						let newWidth = findItem ? findItem.width : ''
						return Object.assign(item, { width: newWidth || item.width })
					})
					this.tableColumnsWidthList = this.getTableColumnsWidth()
					// this.getTableColumnWidthInfo()
					// this.fillPolName()
				})
				getBlPagerCountPaperStatus(queryObj)
				.then(res => {
					this.staticObj.unuse = res.data.unuse || 0
					this.staticObj.used = res.data.used || 0
					this.staticObj.invalid = res.data.invalid || 0
				})
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
								} else if (this.filterGroups[item.key].category === 'numberRange') {
                  if (item.value && item.value[0]) query.push({ column: item.key, type: 'ge', value: item.value[0]})
									if (item.value && item.value[1]) query.push({ column: item.key, type: 'le', value: item.value[1]})
								} else if (
									// 特殊处理预关账状态，关账状态
									['prefinCloseStatus', 'finCloseStatus'].includes(item.key)
								) {
									// 选择未关账传值不等于yes
									if (item.value) {
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
								} else if (['isJoint'].includes(item.key)) {
									// 已协同=y
									if (item.value) {
										if (item.value === 'y') {
											Object.assign(tempItem, {
												column: item.key,
												type: 'eq',
												value: 'y'
											})
										} else {
											Object.assign(tempItem, {
												column: item.key,
												type: 'ne',
												value: 'y'
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
			// if (action === 'Reset') {
			// 	// 存在自定义的模板
			// 	if (param.composeKey) {
			// 		this.setSearchCondition(param.composeKey)
			// 	} else {
			// 		// 后端有配置默认模板
			// 		if (this.resDefaConfList.length) {
			// 			let composeKey = this.resDefaConfList[0].composeKey
			// 			this.setSearchCondition(composeKey, this.resDefaConfList)
			// 		} else {
			// 			// 后端无配置默认模板
			// 			this.init()
			// 		}
			// 	}
			// 	Object.assign(this.tableQuery, defaultTableQuery, {
			// 		currPage: 1
			// 	})
			// 	this.getList()
			// 	Object.assign(this.tableConfig, { tips: { text: '', show: false } })
			// }
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
		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},
		// 新增提单纸
		handleAdd() {
      this.addShow = true
		},
    addClose(action, value) {
      this.addShow = false
			this.getList()
    },
		// 按取单状态筛选
		handleSearchByTakeStatus() {
			this.tableQuery.currPage = 1
			this.getList()
		},
		// 多选
		handleMuti(arr) {
			console.log('🚀 ~ arr', arr)
			this.selectedCheckbox = arr
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
		handleOrderNoInfo(row) {
			this.handleInfo(row)
		},
		// 获取table选中行的orderNo
		getOrderNos() {
			let orderNos = []
			this.selectedCheckbox.forEach(item => {
				orderNos.push(item.orderNo)
			})
			return orderNos
		},
		// 去详情页
		handleInfo(row) {
			this.$router.push({
				name: 'RailwayHblPageDetail',
				query: {
					paperCode: row.paperCode,
					oid: row.oid,
					orderNo: row.orderNo
				}
			})
		},
		// 作废
		handleInvalid(row) {
			console.log('🚀 ~ row', row)
			this.rowData = row
			this.invalidPopShow = true
		},
		invalidPopClose(action) {
			this.invalidPopShow = false
			if (action === 'Confirm') {
				this.getList()
			}
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
		// 导出
		handleExport() {
			let data = this.getListQuery()
			blPaperExport({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: this.oldParams.query,
			}).then(response => {
				let { filePath } = response.data
				window.location.href = filePath
			})
		}
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
