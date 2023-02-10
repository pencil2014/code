<template>
	<div class="app-container">
		<div class="search-container">
			<Search :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
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
			<TableFilter :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
			<BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
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
import TableFilter from './components/tableFilter'
// 弹出框
import CustomColumns from '@/components/customColumns/index'
import { baseBusinessList, searchConditionInfo, searchConditionSave, searchConditionDelete, citySelectList, baseEmployeeListName, columnWidthConfigSave, columnWidthConfigInfo } from '@/api/base'
import { lclAuditList, lclAuditListExport } from '@/api/order/list'
import { customerListAllStatus } from '@/api/crm/supplier'
import { getParamMethod } from '@/utils/allKindNumber'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	orderStatus: 'all' // 订舱状态
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
		key: 'receiptPlace',
		value: '',
		placeholder: '装货地',
		category: 'all',
		queryValue: ''
	},
	// {
	// 	key: 'polPortCode',
	// 	value: '',
	// 	placeholder: '起运港',
	// 	category: 'all',
	// 	queryValue: ''
	// },
	{
		key: 'podPortCode',
		value: '',
		placeholder: '目的地',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'unloadingPortCode',
		value: '',
		placeholder: '卸货港',
		category: 'all',
		queryValue: ''
	},
	// {
	// 	key: 'cyCutOff',
	// 	value: '',
	// 	placeholder: '大船截关时间',
	// 	category: 'all',
	// 	queryValue: ''
	// },
	{
		key: 'etWhCyCutOff',
		value: '',
		placeholder: '预计截仓时间',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'bdEmployeeId',
		value: '',
		placeholder: '销售',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'whAgentSupplierId',
		value: '',
		placeholder: '订舱代理',
		category: 'all',
		queryValue: ''
	}
]

export default {
	mixins: [routerMixin],
	data() {
		return {
			intervalTimer: null,
			cTimestamp: 0,
			state: '',
			defaultStyle: {
				width: '100%'
			},
			businessTypeOptions: [],
			serviceTypeOptions: {},
			// searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				whAgentSupplierId: {
					key: 'whAgentSupplierId',
					label: '订舱代理',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					queryValue: '',
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getSupplierList('bkg_carrier,bkg_agent', '', item)
					},
					filterMehod: (val, item) => {
						this.getSupplierList('bkg_carrier,bkg_agent', val, item)
					}
				},
				universalNo: { key: 'universalNo', label: '各类编号', type: 'input', searchType: 'eq', value: '' },
				orderNo: { key: 'orderNo', label: '工作号', type: 'input', searchType: 'like', value: '' },
				whPoNo: { key: 'whPoNo', label: '入舱单号', type: 'input', searchType: 'like', value: '' },

				// bdEmployeeName: { key: 'bdEmployeeName', label: '销售', type: 'input', searchType: 'like', value: '' },
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
				obdEmployeeName: {
					key: 'obdEmployeeName',
					label: '销售助理',
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
						this.getMulEmployeeName('', item, 'obd')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'obd')
					}
				},
				whBookType: {
					key: 'whBookType',
					label: '订舱类型',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: store.state.dict.dictMap.whBookType,
					nonDictionary: true
				},
				whBookStatus: { label: '订舱状态', key: 'whBookStatus', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true },
				sysLineCode: {
					key: 'sysLineCode',
					label: '系统航线',
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
						if (val) {
							this.sysLineQuerySearch('', item)
						}
					},
					filterMehod: (val, item) => {
						this.sysLineQuerySearch(val, item)
					}
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
				intrustRemark: { key: 'intrustRemark', label: '委托备注', type: 'input', searchType: 'like', value: '' },
				auditRemark: { key: 'auditRemark', label: '商务备注', type: 'input', searchType: 'like', value: '' },
				businessType: { label: '业务类型', key: 'businessType', propInDict: 'shipBusinessType', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true },
				serviceType: { label: '服务类型', key: 'serviceType', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true, propInDict: 'shipServiceType' },
				createdTime: { label: '订单创建时间', key: 'createdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				cancelExecTime: {
					label: '取消/终止/关闭时间',
					key: 'cancelExecTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				receiptPlace: {
					key: 'receiptPlace',
					label: '装货地',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.receiptPlaceSearch('', item)
					},
					filterMehod: (val, item) => {
						this.receiptPlaceSearch(val, item)
					}
				},
				// polPortCode: {
				// 	key: 'polPortCode',
				// 	label: '起运港',
				// 	type: 'remoteSelect',
				// 	searchType: 'in',
				// 	multiple: true,
				// 	'collapse-tags': true,
				// 	value: '',
				// 	data: [],
				// 	saveList: [],
				// 	nonDictionary: true,
				// 	queryValue: '',
				// 	visibleChange: (val, item) => {
				// 		this.portSearch('', 'port_of_destination', this.state, 'polPortCode', item)
				// 	},
				// 	filterMehod: (val, item) => {
				// 		this.portSearch(val, 'port_of_destination', this.state, 'polPortCode', item)
				// 	}
				// },
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
				unloadingPortCode: {
					key: 'unloadingPortCode',
					label: '卸货港',
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
						this.portSearch('', 'port_of_destination', this.state, 'unloadingPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_destination', this.state, 'unloadingPortCode', item)
					}
				},
				// cyCutOff: { label: '大船截关时间', key: 'cyCutOff', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etWhCyCutOff: { label: '预计截仓时间', key: 'etWhCyCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				whCyCutOff: { label: '实际截仓时间', key: 'whCyCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etdTime: { label: '大船预计开船时间', key: 'etdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				quantity: { key: 'quantity', label: '总件数', type: 'input', searchType: 'like', value: '' },
				weight: { key: 'weight', label: '总毛重', type: 'input', searchType: 'like', value: '' },
				volume: { key: 'volume', label: '总体积', type: 'input', searchType: 'like', value: '' },
				hscode: { key: 'hscode', label: 'hscode', type: 'input', searchType: 'like', value: '' },
				cname: { key: 'cname', label: '中文品名', type: 'input', searchType: 'like', value: '', maxlength: '1024' },
				ename: { key: 'ename', label: '英文品名', type: 'input', searchType: 'like', value: '', maxlength: '1024' }
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
				allColumns: store.state.order.lclAuditList.columnsBase(this.handleOrderNoInfo),
				// 操作按钮组
				operationBtns: {
					minWidth: '80',
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
			oldParams: {}
		}
	},
	activated() {
		console.log('store.roles', this.roles)
		let timestamp = new Date().getTime()
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.getList()
		}
		if (this.roles.includes('pricing')) {
			this.intervalTimer = setInterval(() => {
				this.getList()
			}, 10000)
		}
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	deactivated() {
		clearInterval(this.intervalTimer)
		this.intervalTimer = null
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.getBusinessType()
		this.init()
		// this.getSearchConditionInfo()
	},
	mounted() {
		// window.addEventListener('resize', () => {
		//   let tableLayout = document.getElementsByClassName('table-layout')[0]
		//   if (!tableLayout) {
		//     return
		//   }
		//   let OFFSETTOP = tableLayout.getBoundingClientRect().top
		//   let BODYHEIGHT = document.body.clientHeight
		//   this.tableConfig.style.height = (BODYHEIGHT - OFFSETTOP - 40 - 70)
		// })
	},
	computed: {
		...mapState({
			roles: state => state.user.roles,
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap,
			defaultColumns: state => state.order.lclAuditList.defaultColumns,
			specialColumns: state => state.order.lclAuditList.specialColumns,
			columnsBase: state => state.order.lclAuditList.columnsBase()
		})
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
		// 获取员工name
		getEmployeeName(val, item, roleCode) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: roleCode // 角色
			}
			baseEmployeeListName(data).then(res => {
				// item.data = res.data.filter(item => item.status === 'on').map(item => {
				// 	return Object.assign({}, item, {
				// 		label: this.$language === 'en' ? item.ename : item.cname,
				// 		value: item.employeeId ? Number(item.employeeId) : ''
				// 	})
				// })
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
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch(queryString, item) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then(data => {
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
		// 获取订舱代理
		getSupplierList(type, queryString, item) {
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'whbook,proxy_whbook', categoryType: 'in' }).then(data => {
				// item.data = data.list.map(ele => {
				// 	return Object.assign({}, ele, {
				// 		label: this.$language == 'en' ? ele.ename : ele.name,
				// 		value: ele.supplierId ? Number(ele.supplierId) : ''
				// 	})
				// })
				let filterArr = data.list.filter(ele => !item.saveList.find(o => o.value === ele.supplierId))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: this.$language == 'en' ? ele.ename : ele.name, value: ele.supplierId ? Number(ele.supplierId) : '' }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 获取服务类型
		getBusinessType() {
			let result = []
			baseBusinessList().then(res => {
				this.businessTypeOptions = res.data
				res.data.forEach(item => {
					if (item.business === 'ship' && item.serviceTypeList && item.serviceTypeList.length) {
						item.serviceTypeList.forEach(ele => {
							result.push({
								label: ele.businessType === 'ship_export_fcl' ? '海运出口整箱-' + ele.name : '海运出口拼箱-' + ele.name,
								value: ele.serviceType
							})
						})
					}
				})
				result.forEach(item => {
					Object.assign(this.serviceTypeOptions, {
						[item.value]: item.label
					})
				})
				this.$set(this.dictMap, 'serviceType', result)
				// console.log('set', this.dictMap);
			})
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

		// 装货地下拉
		receiptPlaceSearch(queryString, item) {
			citySelectList({
				countryCode: '',
				cityCode: queryString || '',
				state: 'valid'
			}).then(res => {
				item.data =
					res.data &&
					res.data.map(ele => {
						return Object.assign(ele, {
							label: this.$language === 'en' ? ele.ename : ele.cname,
							value: ele.cityCode
						})
					})
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
			if (this.tableQuery.orderStatus === 'all') {
				statusQuery = [{ column: 'orderStatus', type: 'in', value: 'submit,pass,refuse' }]
			} else {
				statusQuery = [{ column: 'orderStatus', type: 'eq', value: this.tableQuery.orderStatus }]
			}
			// 合并状态参数
			let data = {}
			// console.log(this.tableQuery);
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.orderStatus
			return data
		},

		// 列表数据
		async getList() {
			let { data } = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			})
			let { columnWidthList } = data
			let query = this.getListQuery()
			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'whPoNo'].includes(item.column)) {
					// item.type = 'in'
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			getParamMethod(this.$route.name, query).then(queryObj => {
				lclAuditList(queryObj).then(response => {
					this.oldParams = queryObj
					let { list, totalCount, allColumns, configColumns, pageSize } = response.data
					// 请求无数据显示的文案
					if (!list || !list.length) {
						this.$set(this.tableConfig, 'defaultEmpty', false)
					}
					list.forEach(item => {
						item.serviceTypeName = item.serviceType ? this.serviceTypeOptions[item.serviceType] : ''
						let findItem = this.businessTypeOptions.find(ele => ele.businessType === item.businessType)
						item.businessTypeCn = findItem ? findItem.name : ''
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
					this.handleFilterColumns(this.tableConfig.configColumns)
					// 设置列宽为服务器返回的新的列宽宽度
					this.tableConfig.columns.map(item => {
						let findItem = columnWidthList.find(ele => ele.column === item.prop)
						let newWidth = findItem ? findItem.width : ''
						return Object.assign(item, { width: newWidth || item.width })
					})
					this.tableColumnsWidthList = this.getTableColumnsWidth()
					// this.getTableColumnWidthInfo()
				})
			})
		},

		// 查询组件回调
		searchCallBack(action, param) {
			let query = []

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
									// if (item.value) query.push({ column: item.key, type: 'ge', value: item.value[0] + ' 00:00:00' }, { column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
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
									value: item.queryValue
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
		// 导出
		handleExport() {
			let data = this.getListQuery()
			lclAuditListExport({
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
			this.tableQuery.currPage = 1
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
			// 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
			// if (val) {
			// 	this.tableQuery.currPage = val
			// }
			// 20220221 默认不请求列表
			if (val === 1) return (this.tableConfig.list = [])
			this.getList()
		},

		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},

		// 获取table选中行的orderNo
		getOrderNos() {
			let orderNos = []
			this.selectedCheckbox.forEach(item => {
				orderNos.push(item.orderNo)
			})
			return orderNos
		},
		// 点击订单号查看详情
		handleOrderNoInfo(row) {
			this.handleInfo(row)
		},
		// 去详情页
		handleInfo(row) {
			let name = 'LclAuditDetail'

			this.routerPush(name, {
				orderNo: row.orderNo
			})
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
		}
	}
}
</script>
<style lang="scss"></style>
