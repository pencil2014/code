<template>
	<div class="" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
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
			<BaseTableMuti v-loading="loading" class="bl-fin-list" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
		<!-- 审核拒绝弹窗 -->
		<div v-if="refusePopShow">
			<RefusePop @close="refusePopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
import CustomColumns from '@/components/customColumns/index'
import { columnWidthConfigInfo, columnWidthConfigSave, hscodeGetApplyList, finApplyEmployeeList, companyPageList } from '@/api/base'
import { blFinList, blFinExport, blFinAuditPass, blFinAuditProcessing, finAuditRefuse, blFinAuditCancel, blFinSpecialAudit, auditBatch, specialAuditBatch, checkCanBatchApply } from '@/api/order/bl'
import { customerListAllStatus, customerSettlementList } from '@/api/crm/supplier'
import { departmentTreeList } from '@/api/companyResource'
import { getParamMethod } from '@/utils/allKindNumber'
import RefusePop from './components/auditBatchPop'
import { hscodeAuditPageList, cargoHscodeList, hscodeTypeList, cargoUnnoList, hscodeAudit, hscodePageList } from '@/api/base'
import { approvalEmployeeList, approvalEmployeeDelete } from '@/api/order/contract'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	auditStatus: 'all', // 补料状态，默认展示未审核
	scenesCode: 'CargoAuditList'
}
const defaultSearchInputGroup = [
	{
		key: 'cargoDesc',
		value: '',
		placeholder: '中文品名',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'cargoDescEn',
		value: '',
		placeholder: '英文品名',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'hscode',
		value: '',
		placeholder: 'HSCODE',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'classCode',
		value: '',
		placeholder: '一级分类',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'chapterCode',
		value: '',
		placeholder: '二级分类',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'cargoProperty',
		value: '',
		placeholder: '货物性质',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'dangerousGrade',
		value: '',
		placeholder: '危险等级',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'unNo',
		value: '',
		placeholder: '国际危码',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'auditEmployeeId',
		value: '',
		placeholder: '审核人',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'createdBy',
		value: '',
		placeholder: '申请人',
		category: 'all',
		queryValue: ''
	}
]

export default {
	data() {
		return {
			isSingle: true,
			curRow: {},
			loading: false,
			serviceTypeOptions: {},
			orderNo: '',
			defaultSearchLength: 0, // 默认显示搜索框的个数

			allFilterGroups: {
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				cargoDesc: {
					key: 'cargoDesc',
					label: '中文品名',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				cargoDescEn: {
					key: 'cargoDescEn',
					label: '英文品名',
					type: 'input',
					searchType: 'like',
					value: ''
				},

				hscode: {
					key: 'hscode',
					label: 'HSCODE',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: false,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getHscode('', item)
					},
					filterMehod: (val, item) => {
						this.getHscode(val, item)
					}
				},
				classCode: {
					key: 'classCode',
					label: '一级分类',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: false,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getClassNamelist('', item)
					},
					filterMehod: (val, item) => {
						this.getClassNamelist(val, item)
					}
				},
				chapterCode: {
					key: 'chapterCode',
					label: '二级分类',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: false,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getChapterNamelist('', item)
					},
					filterMehod: (val, item) => {
						this.getChapterNamelist(val, item)
					}
				},

				cargoProperty: {
					label: '货物性质',
					key: 'cargoProperty',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true
				},
				dangerousGrade: {
					label: '危险等级',
					key: 'dangerousGrade',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true
				},
				unNo: {
					key: 'unNo',
					label: '国际危码',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: false,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,

					filterMehod: (val, item) => {
						val && this.getUnNolist(val, item)
					}
				},

				createdBy: {
					key: 'createdBy',
					label: '申请人',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: false,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getEmployeeName('', item)
					},
					filterMehod: (val, item) => {
						this.getEmployeeName(val, item)
					}
				},

				createdTime: {
					label: '申请时间',
					key: 'createdTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},

				auditEmployeeId: {
					key: 'auditEmployeeId',
					label: '审核人',
					type: 'select',
					searchType: 'in',
					multiple: false,
					filterable: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getAuditEmployeeName('', item)
					},
					filterMehod: (val, item) => {
						this.getAuditEmployeeName(val, item)
					}
				},
				auditTime: {
					label: '审核时间',
					key: 'auditTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
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
				configColumns: store.state.order.cargoAuditList.defaultColumns,
				columns: [],
				allColumns: store.state.order.cargoAuditList.columnsBase(),
				// 操作按钮组
				operationBtns: {
					minWidth: '130',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Pass') {
							this.handlePass(row)
						}
						if (action === 'Refuse') {
							this.handleRefuse(row)
						}
					},
					data: [
						{
							label: '审核通过',
							type: 'text',
							show: (item, row) => {
								return row.auditStatus === 'approving'
							},
							action: 'Pass'
						},
						{
							label: '审核拒绝',
							type: 'text',
							show: (item, row) => {
								return row.auditStatus === 'approving'
							},
							action: 'Refuse',
							className: 'cargo-audit-refuse'
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
					isLastPage: false,
					pageSizeOptions: [
						{
							value: 10,
							label: '10条/页'
						},
						{
							value: 15,
							label: '15条/页'
						},
						{
							value: 20,
							label: '20条/页'
						},
						{
							value: 30,
							label: '30条/页'
						},
						{
							value: 50,
							label: '50条/页'
						},
						{
							value: 100,
							label: '100条/页'
						},
						{
							value: 200,
							label: '200条/页'
						},
						{
							value: 1000,
							label: '1000条/页'
						}
					]
				}
			},
			tableColumnsWidthList: [],
			// 显示自定义表头的弹窗状态
			customColumnsPopShow: false,
			soPopShow: false, // so弹窗
			soListQuery: {},
			resDefaConfList: [], // 后端配置的默认搜索模板
			oldParams: {},
			auditPopShow: false,
			auditPopQuery: {},
			refusePopShow: false,
			workFlowPopShow: false,
			workFlowPopQuery: {},
			custNameCrShow: false,
			custQuery: {},
			custPopTitle: ''
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
		// 保存url中的orderNo
		let queryOrderNo = this.$route.query.orderNo || ''
		sessionStorage.setItem('queryOrderNo', queryOrderNo)
		// 有orderNo 请求列表接口
		queryOrderNo && this.getList()
	},
	mounted() {},
	computed: {
		...mapState('user', ['userId']),
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap,
			defaultColumns: state => state.order.cargoAuditList.defaultColumns,
			specialColumns: state => state.order.cargoAuditList.specialColumns,
			columnsBase: state => state.order.cargoAuditList.columnsBase()
		})
	},
	watch: {
		// 一级分类改变时 清空二级分类
		'filterGroups.classCode.queryValue'(val) {
			console.log('🚀 ~ searchInputGroup', this.searchInputGroup)
			this.searchInputGroup.forEach(item => {
				if (item.key === 'chapterCode') {
					item.value = ''
					item.fieldValue = ''
				}
			})
		}
	},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		CustomColumns,
		RefusePop
	},
	methods: {
		// 获取hscode
		getHscode(val, item) {
			let data = val ? val.replace(/^\s+|\s+$/g, '') : ''
			hscodePageList({ query: [{ column: 'hscode', type: 'like', value: data }] }).then(res => {
				// 单选下拉不保存选择后的数据
				if (!item.multiple) item.saveList = []
				let filterArr = res.data.list.filter(ele => !item.saveList.find(o => o.value === ele.hscode))
				let itemList = filterArr.map(ele => {
					return {
						...ele,
						label: ele.hscode,
						value: ele.hscode
					}
				})
				item.data = [...item.saveList, ...itemList]
			})
		},

		getClassNamelist(val, item) {
			let data = val ? val.replace(/^\s+|\s+$/g, '') : ''
			hscodeTypeList({ name: data }).then(res => {
				item.data = res.data.map(ele => {
					return {
						label: ele.className,
						value: ele.classCode
					}
				})
			})
		},
		getUnNolist(val, item) {
			cargoUnnoList({ keyword: val }).then(res => {
				// 单选下拉不保存选择后的数据
				if (!item.multiple) item.saveList = []
				let filterArr = res.data.filter(ele => !item.saveList.find(o => o.value === ele.unNo))
				let itemList = filterArr.map(ele => {
					return {
						...ele,
						label: ele.unDesc,
						value: ele.unNo ? ele.unNo : ''
					}
				})
				item.data = [...item.saveList, ...itemList]
			})
		},

		getChapterNamelist(val, item) {
			let data = val ? val.replace(/^\s+|\s+$/g, '') : ''
			hscodeTypeList({ name: data, classCode: this.filterGroups.classCode.queryValue || '' }).then(res => {
				let filterArr = res.data?.filter(ele => ele.chapterCode)
				item.data = filterArr?.map(ele => {
					return {
						label: ele.chapterName,
						value: ele.chapterCode
					}
				})
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
		// 分公司下拉
		getCompanyList(val, item) {
			let data = {
				query: [
					{ column: 'companyName', type: 'like', value: val },
					{ column: 'state', type: 'eq', value: 'valid' }
				],
				pageSize: 1000
			}
			companyPageList(data).then(res => {
				let filterArr = res.data.list.filter(ele => !item.saveList.find(o => o.value === ele.companyCode))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: ele.name, value: ele.companyCode || '' }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},

		// 转化children的空数组为undefined
		getTreeData(data) {
			data.forEach(item => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
			return data
		},
		// 获取员工name
		getEmployeeName(val, item) {
			hscodeGetApplyList(val).then(res => {
				item.data = res.data?.map(ele => {
					return {
						label: ele.employeeName,
						value: ele.employeeId
					}
				})
			})
		},
		// 审核人
		getAuditEmployeeName(val, item) {
			let data = {
				query: [
					{
						column: 'approvalJobCode',
						type: 'eq',
						value: 'audit'
					}
				]
			}
			approvalEmployeeList(data).then(res => {
				let filterArr = res.data.list
				item.data = filterArr.map(ele => {
					return {
						label: ele.employeeName,
						value: ele.employeeId
					}
				})
			})
		},
		// 获取结算单位
		getSettleList(val, item) {
			let data = {
				currPage: 1,
				pageSize: 50,
				query: val ? [{ column: 'name', type: 'like', value: val }] : []
			}
			customerSettlementList(data).then(res => {
				let list = res.data.list.map(ele => {
					return {
						...ele,
						label: ele.name,
						value: ele.name
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
				scenesCode: `${this.$route.name}`,
				columnWidthList: data
			})
				.then(res => {})
				.finally(() => {})
		},
		// 过滤对象分类，按各种编号，各种时间，筛选类型分类
		filterObj(values) {
			const result = {}
			Object.keys(this.filterGroups)
				.filter(key => {
					return values.includes(key)
				})
				.forEach(key => {
					result[key] = this.filterGroups[key]
				})
			return result
		},
		init() {
			// 默认展示全部
			this.tableQuery.auditStatus = 'approving'
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
		},
		// 船公司下拉列表自动补充的数据
		shipQuerySearch(queryString, item) {
			this.$store
				.dispatch('dict/baseShippingCarrierList', {
					name: queryString,
					state: 'valid'
				})
				.then(data => {
					item.data = data.map(ele => {
						return Object.assign(ele, {
							label: ele.value,
							value: ele.key
						})
					})
				})
		},
		// 获取订舱代理
		getSupplierList(type, queryString, item) {
			this.$store
				.dispatch('dict/queryBkgAgentSupplierList', {
					category: 'category',
					value: 'bkg_carrier,bkg_agent',
					queryString: queryString,
					categoryType: 'in'
				})
				.then(data => {
					let filterArr = data.list.filter(ele => !item.saveList.find(o => o.value === ele.supplierId))
					let itemList = filterArr.map(ele => {
						return {
							...ele,
							label: this.$language == 'en' ? ele.ename : ele.name,
							value: ele.supplierId ? Number(ele.supplierId) : ''
						}
					})
					item.data = [...item.saveList, ...itemList]
				})
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
			// 全部
			if (this.tableQuery.auditStatus === 'all') {
				statusQuery = [{ column: 'auditStatus', type: 'in', value: 'approving,pass,refuse' }]
			}
			// 待审核
			if (this.tableQuery.auditStatus === 'approving') {
				statusQuery = [{ column: 'auditStatus', type: 'eq', value: 'approving' }]
			}

			// 审核通过
			if (this.tableQuery.auditStatus === 'pass') {
				statusQuery = [{ column: 'auditStatus', type: 'eq', value: 'pass' }]
			}
			// 已拒绝
			if (this.tableQuery.auditStatus === 'refuse') {
				statusQuery = [{ column: 'auditStatus', type: 'eq', value: 'refuse' }]
			}

			// 合并状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.auditStatus
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
			// 处理url中的orderNo
			this.mapOrderNo(query)
			console.log('query', query.query)
			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'pledgeBlNo', 'pledgeOrderNo', 'blNo', 'soInfo', 'pledgeSource'].includes(item.column)) {
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			getParamMethod(this.$route.name, query).then(queryObj => {
				this.loading = true
				hscodeAuditPageList(queryObj)
					.then(response => {
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
					})
					.finally(() => {
						this.loading = false
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
								// 多选下拉框
								if (this.filterGroups[item.key].type === 'cascader') {
									if (this.filterGroups[item.key].cascaderProps.multiple) {
										let arr = []
										if (item.value && item.value.length) {
											for (let i = 0; i < item.value.length; i++) {
												if (item.value[i] && item.value[i].length) {
													arr.push(item.value[i][item.value[i].length - 1])
												}
											}
										}
										Object.assign(tempItem, {
											column: item.key,
											type: this.filterGroups[item.key].searchType || 'in',
											value: arr.length ? arr.toString() : ''
										})
									} else {
										Object.assign(tempItem, {
											column: item.key,
											type: 'eq',
											value: item.value ? item.value[item.value.length - 1] : ''
										})
									}
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
								} else if (['isContainerReturn'].includes(item.key)) {
									// 特殊处理目的港是否还柜
									// 选择否传值不等于yes
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
							if (item.key === 'auditStatus') {
								this.tableQuery.auditStatus = item.value
							}
							if (item.key === 'isAgreeRelease') {
								if (tempItem.value === 'ys') {
									Object.assign(tempItem, {
										column: item.key,
										type: 'eq',
										value: 'y'
									})
									query.push(tempItem)
									query.push({
										column: 'agreeReleaseStatus',
										type: 'eq',
										value: 'pass'
									})
								} else if (tempItem.value === 'ns') {
									Object.assign(tempItem, {
										column: item.key,
										type: 'ne',
										value: 'y'
									})
									query.push(tempItem)
									query.push({
										column: 'agreeReleaseStatus',
										type: 'eq',
										value: 'pass'
									})
								} else {
									query.push(tempItem)
								}
							} else {
								query.push(tempItem)
							}
						}
					})
				}
				Object.assign(this.tableQuery, {
					query: query.filter(item => {
						return item.value
					}),
					currPage: 1
				})
				this.getList()
			}
			if (action === 'Reset') {
				this.handleSearchValueReset()
			}
			// 模板加载后修改搜索组件的数组
			if (action === 'Update') {
				this.searchInputGroup = param.length ? [...param] : [...defaultSearchInputGroup]
				let { blNo, orderNo } = this.$route.query
				if (blNo) {
					if (this.searchInputGroup.some(item => item.key === 'blNo')) {
						this.searchInputGroup.map(item => {
							if (item.key === 'blNo') {
								if (!item.value) item.value = blNo
							}
						})
					} else {
						this.searchInputGroup.push({
							key: 'blNo',
							value: blNo,
							placeholder: '提单号',
							category: 'all',
							queryValue: ''
						})
					}
				}
				if (orderNo) {
					if (this.searchInputGroup.some(item => item.key === 'orderNo')) {
						this.searchInputGroup.map(item => {
							if (item.key === 'orderNo') {
								if (!item.value) item.value = orderNo
							}
						})
					} else {
						this.searchInputGroup.push({
							key: 'orderNo',
							value: orderNo,
							placeholder: '工作单号',
							category: 'all',
							queryValue: ''
						})
					}
				}
			}
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return { ...item }
			})
		},
		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},
		// 按补料状态筛选
		handleSearchByAuditStatus() {
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
			if (val === 1) {
				return (this.tableConfig.list = [])
			}
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},

		// 审核通过
		handlePass(row) {
			let data = {
				oids: [row.oid],
				auditStatus: 'pass'
			}
			hscodeAudit(data).then(res => {
				this.$message({
					type: 'success',
					message: '审核成功',
					duration: 1000,
					onClose: () => {
						this.auditPopShow = false
						this.getList()
					}
				})
			})
		},
		// 批量审核通过
		handleBatchPass() {
			if (this.selectedCheckbox.length === 0) return this.$message.error('请先勾选数据')
			if (this.selectedCheckbox.some(item => item.auditStatus != 'approving')) return this.$message.error('只能勾选待审核的数据')
			let data = {
				oids: this.selectedCheckbox.map(item => item.oid),
				auditStatus: 'pass'
			}
			hscodeAudit(data).then(res => {
				this.$message({
					type: 'success',
					message: '审核成功',
					duration: 1000,
					onClose: () => {
						this.auditPopShow = false
						this.getList()
					}
				})
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
		},
		// 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
		getColumnsValues(value) {
			// 取消固定工作号 v20220415
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
				this.getList()
			}
		},

		// 拒绝
		handleRefuse(row) {
			this.isSingle = true
			this.curRow = row
			this.refusePopShow = true
		},
		// 批量拒绝
		handleBatchRefuse() {
			if (this.selectedCheckbox.length === 0) return this.$message.error('请先勾选数据')
			if (this.selectedCheckbox.some(item => item.auditStatus != 'approving')) return this.$message.error('只能勾选待审核的数据')

			this.isSingle = false
			this.refusePopShow = true
		},
		// 关闭弹窗回调
		refusePopClose(action, values) {
			console.log('values', values)
			if (action === 'Confirm') {
				let data = {}
				if (this.isSingle) {
					data = {
						oids: [this.curRow.oid],
						auditStatus: 'refuse',
						refuseRemark: values.refuseRemark
					}
				} else {
					data = {
						oids: this.selectedCheckbox.map(item => item.oid),
						auditStatus: 'refuse',
						refuseRemark: values.refuseRemark
					}
				}

				hscodeAudit(data).then(res => {
					this.$message({
						type: 'success',
						message: '拒绝成功',
						duration: 1000,
						onClose: () => {
							this.refusePopShow = false
							this.getList()
						}
					})
				})
			} else {
				this.refusePopShow = false
			}
		}
	}
}
</script>
<style lang="scss">
.cargo-audit-refuse {
	color: #ff0000;
}
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
.icon-joint-dept {
	display: inline-block;
	padding: 0 2px;
	background: #3e80f5;
	border-radius: 2px;
	color: #fff;
	font-style: normal;
	margin-right: 5px;
}
.icon-special-apply {
	display: inline-block;
	padding: 0 2px;
	background: #e65f95;
	border-radius: 2px;
	color: #fff;
	font-style: normal;
	margin-right: 5px;
}
</style>
