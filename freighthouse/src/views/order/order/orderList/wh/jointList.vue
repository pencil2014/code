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
		<div class="table-container show-refuse-row-tabel" :class="['cancel', 'break', 'close', 'complete'].includes(tableQuery.orderStatus) ? 'init-table-container' : ''" ref="tableCont">
			<TableFilter :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
			<BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" v-loading="loading" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapMutations, mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
// 弹出框
import CustomColumns from '@/components/customColumns/index'
import { baseEmployeeListName, columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { whJointList, orderCreate, whJointListExport, orderCopy, orderDelete, orderRelationList } from '@/api/order/list'
import { customerListAllStatus } from '@/api/crm/supplier'
import { getParamMethod } from '@/utils/allKindNumber'
import { formatDate } from '@/utils/index'
const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	orderStatus: 'all' // 订单状态，默认展示未审核
}
const defaultSearchInputGroup = [
	{
		key: 'universalNo',
		value: '',
		placeholder: '各类编号',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'orderNo',
		value: '',
		placeholder: '工作号',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'bizDate',
		value: '',
		placeholder: '业务日期',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'prefinCloseTime',
		value: '',
		placeholder: '预关账时间',
		category: 'all',
		queryValue: ''
	},
]

export default {
	data() {
		return {
			oldParams: {},
			cTimestamp: 0,
			loading: false,
			state: '',
			// searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
			selectDate: '',
			// 查询条件下拉选项
			filterGroups: {
				universalNo: { key: 'universalNo', label: '各类编号', type: 'input', searchType: 'in', value: '', showValue: '' },
				orderNo: { key: 'orderNo', label: '工作号', type: 'input', searchType: 'like', value: '' },
				jointNo: { key: 'jointNo', label: '协同单号', type: 'input', searchType: 'like', value: '' },
				custClass: {
          key: 'custClass',
          label: '客户类型',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.customerClassNew,
          nonDictionary: true
        },
				bdEmployeeId: {
					key: 'bdEmployeeId',
					label: '销售',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getEmployeeName('', item, 'bd')
					},
					filterMehod: (val, item) => {
						this.getEmployeeName(val, item, 'bd')
					}
				},
				opEmployeeName: {
					key: 'opEmployeeName',
					label: '操作',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'op')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'op')
					}
				},
				orderStatus: {
					label: '订单状态',
					key: 'orderStatus',
					type: 'select',
					searchType: 'in',
					value: '',
					data: [],
					multiple: true,
					saveList: [],
					'collapse-tags': true,
					queryValue: '',
					nonDictionary: true,
					disabledEdit: true,
					// propInDict: 'orderStatus'
				},
				custid: {
					key: 'custid',
					label: '委托单位',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.getCustList('', item)
					},
					filterMehod: (val, item) => {
						this.getCustList(val, item)
					}
				},
				prefinCloseTime: { label: '预关账时间', key: 'prefinCloseTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				finCloseTime: { label: '关账时间', key: 'finCloseTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				bizDate: { label: '业务日期', key: 'bizDate', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				polPortCode: {
					key: 'polPortCode',
					label: '起运港',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_basic', this.state, 'polPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_basic', this.state, 'polPortCode', item)
					}
				},
				podPortCode: {
					key: 'podPortCode',
					label: '目的地',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_destination', this.state, 'podPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_destination', this.state, 'podPortCode', item)
					}
				},
				serviceCode: { key: 'serviceCode', label: '服务项', type: 'select', searchType: 'like', value: '', filterable: true, data: [], nonDictionary: true, propInDict: 'orderServiceNameList', saveList: [] },
			},
			// 默认展示的搜索条件，搜索条件分类
			searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
			searchConfig: [],

			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
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
					checkSelectable({ orderNo }) {
						return orderNo ? true : false
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
				allColumns: store.state.order.whJointList.columnsBase(this.handleOrderNoInfo),
				// 操作按钮组
				operationBtns: {
					// 宽度设为180，因为已拒绝状态会同时存在4个按钮：详情，复制，撤回取消，关闭
					minWidth: '100',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Info') {
							this.handleInfo(row)
						}
					},
					data: [
						{
							label: '详情',
							type: 'text',
							show: true,
							action: 'Info'
						}
					]
				},
				// 操作提示
				tips: {
					text: '',
					totalTxt: '',
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
		}
	},
	beforeRouteLeave(to, from, next) {
		next()
	},
	activated() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},

	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		this.init()
	},
	mounted() {
	},
	computed: {
		...mapState('user', ['deptCode', 'userId', 'roles']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			defaultColumns: state => state.order.whJointList.defaultColumns,
			specialColumns: state => state.order.whJointList.specialColumns,
			columnsBase: state => state.order.whJointList.columnsBase()
		}),
		isBd() {
			return this.roles.includes('bd')
		},
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		CustomColumns
	},
	methods: {
		// 获取委托单位
		getCustList(val, item) {
			let data = {
				currPage: 1,
				pageSize: 50,
				query: val
					? [
							{ column: 'name', type: 'like', value: val },
							{ column: 'roleType', type: 'eq', value: 'client' }
					  ]
					: [{ column: 'roleType', type: 'eq', value: 'client' }]
			}
			customerListAllStatus(data).then(res => {
				let list = res.data.list.map(ele => {
					return {
						...ele,
						label: ele.name,
						value: ele.custid
					}
				})
				let formatArr = () => {
					let map = new Map()
					for (let item of list) {
						if (!map.has(item.value)) {
							map.set(item.value, item)
						}
					}
					return [...map.values()]
				}
				let newArr = formatArr()
				let filterArr = newArr.filter(ele => !item.saveList.find(o => o.value === ele.value))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: ele.label, value: ele.value }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 获取员工name
		getEmployeeName(val, item, roleCode) {
			// console.log('item', item)
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: roleCode // 角色
			}
			if (!roleCode) delete data.roleCode
			baseEmployeeListName(data).then(res => {
				// 单选下拉不保存选择后的数据
				if (!item.multiple) item.saveList = []
				let filterArr = res.data.filter(ele => !item.saveList.find(o => o.value === ele.employeeId))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: this.$language === 'en' ? ele.ename : ele.cname, value: ele.employeeId ? Number(ele.employeeId) : '' }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		getMulEmployeeName(val, item, role) {
			// console.log('item.saveList', item.saveList)
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: role // 角色
			}
			baseEmployeeListName(data).then(res => {
				let list = res.data.map(ele => {
					return {
						...ele,
						label: this.$language === 'en' ? ele.ename : ele.cname,
						value: this.$language === 'en' ? ele.ename : ele.cname
					}
				})
				let formatArr = () => {
					let map = new Map()
					for (let item of list) {
						if (!map.has(item.value)) {
							map.set(item.value, item)
						}
					}
					return [...map.values()]
				}
				let newArr = formatArr()
				let filterArr = newArr.filter(ele => !item.saveList.find(o => o.value === ele.value))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: ele.label, value: ele.value }
				})
				item.data = [...item.saveList, ...itemList]
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
		},
		init() {
			// 默认展示全部
			this.tableQuery.orderStatus = 'all'
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
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
		// 远程搜索港口下拉数据
		portSearch(queryString, portAttribute, state, type, item) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				this.searchSelectVisibleData(data, item)
			})
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
				// console.log(window.event.target)
				// 阻止分页的页码enter键触发全局的监听事件
				let className = window.event.target.parentNode.className
				if (window.event.target.id === 'bdRemark' || className.includes('el-pagination__editor')) return
				//触发的事件
				this.searchCallBack('Search')
			}
		},
		// 获取列表请求参数
		getListQuery() {
			let statusQuery = []
			// 全部
			if (this.tableQuery.orderStatus === 'all') {
				statusQuery = [{column: 'orderStatus', type: 'in', value: 'pass,cancel,break,complete'}]
			} else if (this.tableQuery.orderStatus === 'unFinished') {
				statusQuery = [{ column: 'isServiceComplete', type: 'eq', value: 'n' },{column: 'orderStatus', type: 'in', value: 'pass,cancel,break'}]
			} else if (this.tableQuery.orderStatus === 'cancelApply') {
				statusQuery = [{ column: 'cancelApplyStatus', type: 'eq', value: '1' }, {column: 'orderStatus', type: 'in', value: 'pass,cancel,break'}]
			} else if (this.tableQuery.orderStatus === 'finished') {
				statusQuery = [{ column: 'isServiceComplete', type: 'eq', value: 'y' }]
			}
			// 合并状态参数
			let data = {}
			// console.log(this.tableQuery)
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.orderStatus
			return data	
		},
		// 列表数据
		async getList() {
			this.loading = true
			let query = this.getListQuery()

			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'so', 'blNo', 'cn', 'carrierLineName', 'whPoNo'].includes(item.column)) {
					// item.type = item.column === 'so' || item.column === 'blNo' ? 'like' : 'in'
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			this.oldParams = query
			let { data } = await columnWidthConfigInfo({
				scenesCode: this.$route.name
			})
			let { columnWidthList } = data
			getParamMethod(this.$route.name, query).then(queryObj => {
				whJointList(queryObj)
				.then(response => {
					this.oldParams = queryObj
					let { list, totalCount, pageSize, allColumns, configColumns } = response.data
					list.forEach(item => {
						item.serviceTypeName = getDictLabel('shipServiceType', item.serviceType)
						item.businessTypeCn = getDictLabel('shipBusinessType', item.businessType)
						if (item.orderStatus === 'cancel' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsCancel: true })
						if (item.orderStatus === 'close' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsClose: true })
						if (item.orderStatus === 'complete' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsFinish: true })
					})
					this.tableConfig.list = list
					// 请求无数据显示的文案
					if (!list || !list.length) {
						this.$set(this.tableConfig, 'defaultEmpty', false)
					}
					this.tableQuery.pageSize = pageSize
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
			})
		},
		// 查询组件回调
		async searchCallBack(action, param, isFirstLoad) {
			let query = []
			console.log('this.searchInputGroup', this.searchInputGroup)
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
								} else if (['serviceCode'].includes(item.key)) {
									Object.assign(tempItem, {
										column: item.key,
										type: 'like',
										value: item.value ? `,${item.value},` : ''
									})
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
							query.push(tempItem)
						}
					})
					// 按orderStatus查询，特殊处理表格tab除了我的业务其他tab值为空，不按orderStatus查的默认值为all,显示全部tab
					if (this.searchInputGroup.some(ele => ele.key === 'orderStatus' && ele.value && ele.value.length && !['mine'].includes(this.tableQuery.orderStatus))) {
						this.tableQuery.orderStatus = ''
					} else if (!this.tableQuery.orderStatus) {
						this.tableQuery.orderStatus = 'all'
					} else {
					}
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
				// console.log('this.searchInputGroup-update', this.searchInputGroup);
			}
			// 刷新
			if (action === 'Refresh') {
				this.loading = true
				let { data } = await columnWidthConfigInfo({
					scenesCode: this.$route.name
				})
				let { columnWidthList } = data
				whJointList(this.oldParams)
					.then(response => {
						let { list, totalCount, pageSize, allColumns, configColumns } = response.data
						list.forEach(item => {
							item.serviceTypeName = getDictLabel('shipServiceType', item.serviceType)
							item.businessTypeCn = getDictLabel('shipBusinessType', item.businessType)
							if (item.orderStatus === 'cancel' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsCancel: true })
							if (item.orderStatus === 'close' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsClose: true })
							if (item.orderStatus === 'complete' && this.tableQuery.orderStatus === 'all') Object.assign(item, { orderIsFinish: true })
						})
						this.tableConfig.list = list
						this.tableQuery.pageSize = pageSize
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
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				if (item.key !== 'createdTime') {
           item.value = ''
				   return { ...item }
				}
			})
			// console.log('重置')
		},
		// 反显查询条件的订单状态
		getOrderStatusArr(arr) {
			return this.dictMap.orderStatus.filter(item => arr.includes(item.value)).map(item => ({label: item.label, value: item.value}))
		},
		// 搜索条件的订单状态的默认下拉选中值
		setSearchOrderStatusValue(isFirstLoad) {
			if (this.searchInputGroup.some(item => item.key === 'orderStatus')) {
				this.searchInputGroup.map(item => {
					if (item.key === 'orderStatus' && !['mine'].includes(this.tableQuery.orderStatus)) {
						item.value = []
					}
				})
			} 
		},
		// 导出
		handleExport() {
			let data = this.getListQuery()
			whJointListExport({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: this.oldParams.query
			}).then(response => {
				let { filePath } = response.data
				window.location.href = filePath
			})
		},
		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},
		// 按订单状态筛选
		handleSearchByOrderStatus() {
			// 除我的业务tab以外。其他按tab查询，如果搜索条件已选了订单状态的可以直接忽略，直接按tab的状态查
			if (!['mine'].includes(this.tableQuery.orderStatus)) {
				this.tableQuery.query = this.tableQuery.query.filter(item => item.column !== 'orderStatus')
			}
			this.tableQuery.currPage = 1
			this.setSearchOrderStatusValue()
			this.getList()
		},
		// 多选
		handleMuti(arr) {
			this.selectedCheckbox = arr
		},
		handleSizeChange() {
			this.getList()
		},
		handleCurrentChange(val) {
			// // console.log('default', val)
			// // 20220221 默认不请求列表
			// if (val === 1) {
			// 	return (this.tableConfig.list = [])
			// }
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 点击订单号查看详情
		handleOrderNoInfo(row) {
			this.handleInfo(row)
		},
		// 去详情页
		async handleInfo(row) {
			// let action = ''
			// // 业务除草稿和拒绝状态都不可编辑
			// if (this.isBd && !['draft', 'refuse'].includes(row.orderStatus)) {
			// 	action = 'view'
			// }
			// // 操作角色非审核通过都不可编辑
			// if (this.isOp && !['pass','break'].includes(row.orderStatus)) {
			// 	action = 'view'
			// }
			// this.isJumpRouteFromPage = true
			// let isSameCode = await this.$store.dispatch('order/getValueByKeys', { custid: row.custid })
			// let {data} = await orderRelationList({ orderNo: row.orderNo })
			// console.log('isSameCode', isSameCode, data)
			let routeUrl = this.$router.resolve({
				name: 'JointOrderDetail',
				params: {
					orderNo: row.orderNo
				},
				query: {
					orderNo: row.orderNo,
					jointNo: row.jointNo,
					source: 'whJointList',
					showContainer: false, // 不显示集装箱tab
					showBl: false,
					showRelate: false
				}
			})
			window.open(routeUrl.href, '_blank')
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
		}
	}
}
</script>
<style lang="scss">
</style>
