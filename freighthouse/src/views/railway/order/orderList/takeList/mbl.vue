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
			<BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
		<div v-if="uploadShow">
			<FileUpload sourceType="RailwayMblTakeList" :row="rowData" @close="uploadPopClose" />
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
import TableFilter from './components/tableFilter'
// 弹出框
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import { baseEmployeeListName, searchConditionInfo, searchConditionSave, searchConditionDelete, columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { blTakeList, blTakeExport, blTakeFinish, finishBatch, takeFinish } from '@/api/railway/bl'
import FileUpload from './components/fileUploadTableM'
import { getParamMethod } from '@/utils/allKindNumber'
import { departmentTreeList } from '@/api/companyResource'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: ['etdTime', 'td_time', 'oid'],
	descColumns: [],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	takeStatus: 'all', // 补料状态，默认展示未审核
	scenesCode: 'RailwayMblTakeList'
}
const defaultSearchInputGroup = [
	{ key: 'universalNo', value: '', placeholder: '各类编号', category: 'all', queryValue: '' },
	{ key: 'bkgAgentSupplierId', value: '', placeholder: '订舱代理', category: 'all', queryValue: '' },
	{ key: 'tdTime', value: '', placeholder: '实际出发时间', category: 'all', queryValue: '' },
	{ key: 'shipCarrierCode', value: '', placeholder: '船司/陆港', category: 'all', queryValue: '' },
	{
		key: 'bdEmployeeName',
		value: '',
		placeholder: '销售',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'obdEmployeeName',
		value: '',
		placeholder: '销售助理',
		category: 'all',
		queryValue: ''
	}
]
const confirmOptions = [
	{ label: '是', value: 'y' },
	{ label: '否', value: 'n' }
]
const getOptions = [
	{ label: '已收到', value: 'y' },
	{ label: '未收到', value: 'n' }
]
export default {
	mixins: [routerMixin],
	data() {
		return {
			rowData: {},
			uploadShow: false,
			cTimestamp: 0,
			activeName: 'HBL',
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
				shipCarrierCode: { key: 'shipCarrierCode', label: '船司/陆港', type: 'input', searchType: 'like', value: '' },
				universalNo: { key: 'universalNo', label: '各类编号', type: 'input', searchType: 'eq', value: '' },
				orderNo: { key: 'orderNo', label: '工作号', type: 'input', searchType: 'like', value: '' },
				blType: { label: '提单类型', key: 'blType', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				blMode: { label: '出单方式', key: 'blMode', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				blNo: { key: 'blNo', label: '提单号', type: 'input', searchType: 'like', value: '' },
				orderStatus: { key: 'orderStatus', label: '订单状态', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				// takeStatus: {label: '取单状态', key: 'takeStatus', type: 'select', searchType: 'eq', value: '', data: [
				//   {label: '未取单', value: 'init'},
				//   {label: '已取单', value: 'finish'}
				// ], nonDictionary: true},
				bkgAgentSupplierId: {
					key: 'bkgAgentSupplierId',
					label: '订舱代理',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getSupplierList('bkg_agent', '', item)
					},
					filterMehod: (val, item) => {
						this.getSupplierList('bkg_agent', val, item)
					},
					change: (val, item) => {
						let findItem = item.data.find(ele => ele.value === val)
						Object.assign(item, {
							queryValue: val,
							text: findItem ? findItem.label : ''
						})
					}
				},
				bdEmployeeName: {
					key: 'bdEmployeeName',
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
						this.getMulEmployeeName('', item, 'bd')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'bd')
					}
				},
				obdEmployeeName: {
					key: 'obdEmployeeName',
					label: '销售助理',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'obd')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'obd')
					}
				},
				etdTime: {
					label: '预计出发时间',
					key: 'etdTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				tdTime: {
					label: '实际出发时间',
					key: 'tdTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				etaTime: {
					label: '预计到达时间',
					key: 'etaTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				// createdTime: {label: '派单时间', key: 'createdTime', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd'},
				takeTime: { label: '取单完成时间', key: 'takeTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				takeExpTime: { label: '取单期限', key: 'takeExpTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				payExpTime: { label: '付款期限', key: 'payExpTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				transferStatus: {
					label: '提单转移状态',
					key: 'blTransferStatus',
					type: 'select',
					searchType: 'in',
					value: '',
					data: [],
					multiple: true,
					'collapse-tags': true,
					nonDictionary: true
				},
				placeCompCode: {
					label: '提单所在地',
					key: 'placeCompCode',
					type: 'select',
					searchType: 'in',
					value: '',
					data: [],
					multiple: true,
					filterable:true,
					'collapse-tags': true,
					nonDictionary: true
				}
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
				allColumns: store.state.railway.blTakeList.columnsBase(this.handleOrderNoInfo),
				// 操作按钮组
				operationBtns: {
					minWidth: '120',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Info') {
							this.handleInfo(row)
						}
						if (action === 'File') {
							this.handleFile(row)
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
							label: '添加附件',
							type: 'text',
							// show: true,
							show: (item, row) => {
								return row.state != 'invalid'
							},
							action: 'File'
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
			// 点击的是补料列表里的详情
			isClickInfo: false,
			resDefaConfList: [], // 后端配置的默认搜索模板
			oldParams: {}
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
		// 保存url中的orderNo
		let queryOrderNo = this.$route.query.orderNo || ''
		sessionStorage.setItem('queryOrderNo', queryOrderNo)
		// 有orderNo 请求列表接口
		queryOrderNo && this.getList()
		// this.getSearchConditionInfo()
		this.getDeptList()
	},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.user.currRole,
			dictMap: state => state.dict.dictMap,
			blTakeList: state => state.railway.blTakeList,
			defaultColumns: state => state.railway.blTakeList.defaultColumns,
			specialColumns: state => state.railway.blTakeList.specialColumns,
			columnsBase: state => state.railway.blTakeList.columnsBase()
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
		FileUpload
	},
	methods: {
		// 所属部门下拉框
		getDeptList() {
			departmentTreeList({ state: 'valid' }).then(res => {
				if(!(res.data && res.data[0] &&res.data[0].childList)){
					return false
				}
				let companyListOptions = res.data[0].childList.map(item => {
					return Object.assign({}, item, {
						label: item.deptCname,
						value: item.deptCode
					})
				})
				this.$set(this.filterGroups, 'placeCompCode', {
					label: '提单所在地',
					key: 'placeCompCode',
					type: 'select',
					searchType: 'eq',
					filterable:true,
					value: '',
					data: companyListOptions,
					nonDictionary: true
				})
			})
		},
		getMulEmployeeName(val, item, role) {
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
		// 获取员工name
		getEmployeeName(val, item, role) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: role // 角色
			}
			baseEmployeeListName(data).then(res => {
				let filterArr = res.data.filter(ele => !item.saveList.find(o => o.value === ele.employeeId))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: this.$language === 'en' ? ele.ename : ele.cname, value: ele.employeeId ? Number(ele.employeeId) : '' }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
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
				console.log('this.tableColumnsWidthList', this.tableColumnsWidthList)
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
				scenesCode: `${this.$route.name}`,
				columnWidthList: data
			})
				.then(res => {})
				.finally(() => {})
		},
		handleClick() {},
		init() {
			// 默认展示全部
			this.tableQuery.takeStatus = 'all'
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
			let delQuery = [{ column: 'state', type: 'eq', value: 'valid' }]
			// 全部
			if (this.tableQuery.takeStatus === 'all') {
				statusQuery = []
				delQuery = []
			}
			// 待取单
			if (this.tableQuery.takeStatus === 'init') {
				statusQuery = [
					{ column: 'takeStatus', type: 'eq', value: 'init' },
					{ column: 'isCancel', type: 'ne', value: 'y' },
					{ column: 'orderStatus', type: 'in', value: 'pass' }
					// { column: 'orderStatus', type: 'ne', value: 'break' }
				]
			}
			// 取单申请
			if (this.tableQuery.takeStatus === 'finish') {
				statusQuery = [{ column: 'takeStatus', type: 'eq', value: 'finish' }]
			}
			// 已撤回
			if (this.tableQuery.takeStatus === 'isCancel') {
				statusQuery = [{ column: 'isCancel', type: 'eq', value: 'y' }]
			}
			// 已取消
			if (this.tableQuery.takeStatus === 'state') {
				delQuery = [{ column: 'state', type: 'eq', value: 'invalid' }]
			}

			let typeQuery = [{ column: 'takeType', type: 'eq', value: 'mbl' }]
			// 合并状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery, typeQuery, delQuery)
			})
			delete data.takeStatus
			return data
		},
    // 把url中的orderNo加入到查询参数中
		mapOrderNo(query) {
			let queryOrderNo = sessionStorage.getItem('queryOrderNo')
			if (queryOrderNo) {
				let ind = -1
				if (query.query) {
					ind = query.query.findIndex(item => item.column === 'orderNo')
				}
				if (ind !== -1) {
					console.log('查询条件有orderNo字段')
					query.query.splice(ind, 1, {
						column: 'orderNo',
						value: queryOrderNo,
						type: 'like'
					})
				} else {
					console.log('查询条件没有orderNo字段')
					query.query.push({
						column: 'orderNo',
						value: queryOrderNo,
						type: 'like'
					})
				}
			}
			sessionStorage.removeItem('queryOrderNo')
		},
		// 列表数据
		async getList() {
			let { data } = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			})
			let { columnWidthList } = data
			let query = this.getListQuery()
			this.mapOrderNo(query)
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
				blTakeList(queryObj).then(response => {
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
								if (this.filterGroups[item.key].multiple) {
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
		searchConditionSave(param, type) {
			let searchItemList = []
			this.searchInputGroup.map(item => {
				if (item.key) {
					// 特殊处理的几种查询类型,daterange,remoteSelect,mulitple
					let searchValue = ''
					searchValue = item.value
					if (this.filterGroups[item.key].category === 'daterange') {
						searchValue = item.value ? item.value.toString() : ''
					}
					if (this.filterGroups[item.key].type === 'remoteSelect') {
						// 单选
						if (!this.filterGroups[item.key].multiple) {
							let text = this.filterGroups[item.key].text
							searchValue = item.value ? `${item.value}|${text}` : ''
						} else {
							// 多选-中转港
							searchValue = item.value ? item.value.toString() : ''
						}
					}
					searchItemList.push({
						searchField: item.key,
						searchValue: searchValue
					})
				}
			})

			if (type === 'immediateSave') {
				searchItemList = param.searchItemList
			}
			searchConditionSave({
				scenesCode: this.$route.name,
				composeKey: param.composeKey,
				searchConfigList: searchItemList
			}).then(res => {
				if (type === 'immediateSave') {
					// 选中的模板切换设置相应的搜索条件反显
					this.setSearchCondition(param.composeKey)
					return
				} else {
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.getSearchConditionInfo()
						}
					})
				}
			})
		},
		// 删除搜索模板
		searchConditionDelete(param) {
			this.$confirm('是否确认删除该搜索模板?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					searchConditionDelete({
						scenesCode: this.$route.name,
						composeKey: param.composeKey
					}).then(res => {
						this.$message({
							type: 'success',
							message: '删除成功',
							duration: 1000,
							onClose: () => {
								this.getSearchConditionInfo()
							}
						})
					})
				})
				.catch(err => {})
		},
		// 获取自定义搜索查询
		getSearchConditionInfo() {
			searchConditionInfo({
				scenesCode: this.$route.name
			}).then(res => {
				let { defaultConfigList, customConfigList } = res.data
				this.resDefaConfList = defaultConfigList
				// 搜索模板存在，就默认显示第一个模板的搜索条件。不存在搜索模板，则显示后端配置的默认模板
				// 后端如果没有配置模板的话，则前端显示默认一个空的搜索条件
				if (!customConfigList || !customConfigList.length) {
					// 后端无配置默认模板
					if (!defaultConfigList || !defaultConfigList.length) {
						this.searchConditionList = []
						this.init()
						return
					}
					// 有配置默认模板
					this.searchConditionList = []
					let composeKey = defaultConfigList[0].composeKey
					this.setSearchCondition(composeKey, defaultConfigList)
					// this.getList()
				} else {
					this.searchConditionList = customConfigList
					// 获取自定义搜索数据后默认选中第一个模板
					let composeKey = customConfigList[0].composeKey
					this.setSearchCondition(composeKey)
				}
			})
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
		// 取单完成
		handleFinishTake() {
			if (this.selectedCheckbox.length === 0) return this.$message.warning('请至少选择一条数据!')

			let isValid = this.selectedCheckbox.every(item => item.takeStatus !== 'finish')
			if (!isValid) return this.$message.warning('不能选择已取单的数据!')
			let oidList = this.selectedCheckbox.map(item => item.oid)
			if(oidList.length>1){
				finishBatch({ ids: oidList }).then(res => {
					if(res.data){
						this.$message.warning(`${res.data} 需先上传附件才能取单完成。其它提单已取单成功!`)
					}else{
						this.$message.success('批量取单成功!')
					}
					this.getList()
				})
			}else{
				let orderNo=this.selectedCheckbox.map(item => item.orderNo)
				takeFinish({ oid: oidList[0], orderNo:orderNo[0] }).then(res => {
					if(res.data){
						this.$message.error(`${res.data} 需先上传附件才能取单完成。`)
					}else{
						this.$message.success('取单成功!')
					}
					this.getList()
				})
			}
			
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
			// 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
			// if (val) {
			// 	this.tableQuery.currPage = val
			// 	// this.getSearchConditionInfo()
			// }
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
			let urlQuery = ''
			this.isClickInfo = true
			this.$router.push({
				name: 'MblRailwayTakeDetail',
				params: {
					oid: row.oid
				},
				query: {
					orderNo: row.orderNo,
					oid: row.oid,
					blId: row.blId,
					source: this.$route.path, // 添加当前path给takeDetail设置当前菜单
					routerName: this.$route.name, //添加当前路由标识 以便返回到指定路由
					blNo: row.blNo // 提单号
				}
			})
			// this.routerPush('TakeDetail', {
			// 	orderNo: row.orderNo,
			// 	oid: row.oid,
			// 	blId: row.blId,
			// 	source: this.$route.path, // 添加当前path给takeDetail设置当前菜单
			// 	routerName: this.$route.name //添加当前路由标识 以便返回到指定路由
			// })
		},
		// 上传附件
		handleFile(row) {
			console.log('🚀 ~ row', row)
			this.rowData = row
			this.uploadShow = true
		},
		uploadPopClose(action) {
			this.uploadShow = false
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
			blTakeExport({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: this.oldParams.query,
				scenesCode: 'RailwayMblTakeList'
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
</style>
