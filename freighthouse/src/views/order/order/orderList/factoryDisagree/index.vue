<template>
	<div class="app-container">
		<div class="factory-disagree-noticeTip">注意：此页面仅用于“工厂不同意放货，但代理是可靠的，需着急放M单” 的放单申请及审批。请谨慎操作！</div>
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
			<BaseTableMuti v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
		<!-- 日志弹窗 -->
		<div v-if="blLogPopShow">
			<BlLog :params="logParams" @close="blLogPopClose" />
		</div>
		<div v-if="applyPopShow">
			<Apply :param="applyQuery" @close="applyPopClose" />
		</div>
		<div v-if="auditPopShow">
			<Audit :param="auditQuery" @close="auditPopClose" />
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
import CustomColumns from '@/components/customColumns/index'
import { columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { blFactoryDisagreeApply, blFactoryDisagreeList, blFactoryDisagreeAudit, blFactoryDisagreeCancel } from '@/api/order/bl'
import { customerListAllStatus, customerSettlementList } from '@/api/crm/supplier'
import { getParamMethod } from '@/utils/allKindNumber'
import BlLog from './components/blLog'
import Apply from './components/apply'
import Audit from './components/audit'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: [],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	agreeReleaseStatus: 'all', // 补料状态，默认展示未审核
	scenesCode: 'FactoryDisagree'
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
		key: 'blNo',
		value: '',
		placeholder: 'MBL',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'custid',
		value: '',
		placeholder: '委托单位',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'businessType',
		value: '',
		placeholder: '业务类型',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'blMode',
		value: '',
		placeholder: '出单方式',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'taTime',
		value: '',
		placeholder: '实际到港时间',
		category: 'all',
		queryValue: ''
	}
]
const confirmOptions = [
	{ label: '是', value: 'y' },
	{ label: '否', value: 'n' }
]
const takeStatusOptions = [
	{ label: '未取单', value: 'init' },
	{ label: '已取单', value: 'finish' }
]
export default {
	mixins: [routerMixin],
	data() {
		return {
			onlyShowYMDParam: ['podTakeDate'],
			loading: false,
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				universalNo: {
					key: 'universalNo',
					label: '各类编号',
					type: 'input',
					searchType: 'eq',
					value: ''
				},
				orderNo: {
					key: 'orderNo',
					label: '工作号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				blNo: {
					key: 'blNo',
					label: 'MBL号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				businessType: {
					label: '业务类型',
					key: 'businessType',
					propInDict: 'shipBusinessType',
					type: 'select',
					searchType: 'in',
					multiple: true,
					data: [],
					saveList: [],
					'collapse-tags': true,
					queryValue: '',
					value: '',
					nonDictionary: true
				},
				blMode: {
					label: '出单方式',
					key: 'blMode',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true
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
				taTime: { label: '实际到港时间', key: 'taTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' }
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
					checkSelectable({ parentBlId }) {
						return !parentBlId ? true : false
					},
					rowKeyId: 'blId',
					treeProps: {
						children: 'hblList',
						hasChildren: 'hasChildren',
						expandAll: true
						// rowField: 'id',
						// parentField: 'parentId'
					}
				},
				customColumns: {
					show: true,
					handleCustomColumns: this.handleCustomColumns
				},
				defaultEmpty: true, // 数据默认不加载的显示文案
				list: [],
				configColumns: store.state.order.factoryDisagree.defaultColumns,
				columns: store.state.order.factoryDisagree.columnsBase(this.getList),
				allColumns: store.state.order.factoryDisagree.columnsBase(this.getList),
				// 操作按钮组
				operationBtns: {
					minWidth: '60',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Log') {
							this.handleViewLog(row)
						}
					},
					data: [
						{
							label: '日志',
							type: 'text',
							show: (item, row) => {
								if (!row.parentBlId) {
									return true
								}
								return false
							},
							action: 'Log'
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
			oldParams: {},
			applyQuery: {},
			applyPopShow: false,
			blLogPopShow: false,
			logParams: {},
			auditPopShow: false,
			auditQuery: {}
		}
	},
	activated() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
		if (this.$route.meta.refresh) {
			this.refresh()
		}
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	beforeRouteEnter(to, from, next) {
		// console.log('from', from, to)
		if (from.name === 'FactoryDisagreeApplyDetail') {
			to.meta.refresh = true
		}
		next()
	},
	created() {
		this.init()
		// this.getList()
		// this.getSearchConditionInfo()

		console.log('🚀 ~ this.dictMap', this.dictMap)
	},
	mounted() {
		console.log('🚀 ~ this.columnsBase', this.columnsBase)
	},

	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap,
			blFinList: state => state.order.blFinList,
			defaultColumns: state => state.order.factoryDisagree.defaultColumns,
			specialColumns: state => state.order.factoryDisagree.specialColumns,
			columnsBase: state => state.order.factoryDisagree.columnsBase()
		})
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		CustomColumns,
		BlLog,
		Apply,
		Audit
	},
	methods: {
		refresh() {
			this.$nextTick(() => {
				this.getList()
			})
		},
		handleViewLog(row) {
			this.logParams = row
			this.blLogPopShow = true
		},
		blLogPopClose(action) {
			this.blLogPopShow = false
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
			this.tableQuery.auditStatus = 'all'
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			this.externalSearch()
		},
		externalSearch() {
			let { orderNo } = this.$route.query
			if (orderNo) {
				this.getList(orderNo)
			}
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
		getListQuery(orderNo) {
			let statusQuery = []
			// 全部
			if (this.tableQuery.agreeReleaseStatus === 'all') {
				statusQuery = []
			} else if (this.tableQuery.agreeReleaseStatus === 'passAgree') {
				statusQuery = [
					{ column: 'agreeReleaseStatus', type: 'eq', value: 'pass' },
					{ column: 'isAgreeRelease', type: 'eq', value: 'y' }
				]
			} else if (this.tableQuery.agreeReleaseStatus === 'passDisAgree') {
				statusQuery = [
					{ column: 'agreeReleaseStatus', type: 'eq', value: 'pass' },
					{ column: 'isAgreeRelease', type: 'ne', value: 'y' }
				]
			} else {
				// 待申请,待审核，审核通过，审核拒绝，已取消
				statusQuery = [{ column: 'agreeReleaseStatus', type: 'eq', value: this.tableQuery.agreeReleaseStatus }]
			}
			if (orderNo) {
				this.tableQuery.query.push({ column: 'orderNo', type: 'like', value: orderNo })
			}
			// 合并状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.agreeReleaseStatus
			return data
		},
		// 列表数据
		async getList(orderNo) {
			let { data } = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			})
			let { columnWidthList } = data
			let query = this.getListQuery(orderNo)
			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'blNo'].includes(item.column)) {
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			getParamMethod(this.$route.name, query).then(queryObj => {
				this.loading = true
				blFactoryDisagreeList(queryObj)
					.then(response => {
						this.oldParams = queryObj
						let { list, totalCount, allColumns, configColumns, pageSize } = response.data
						// 设置子集HBL的补料状态为--
						list = list.map(item => {
							if (item.hblList && item.hblList.length) {
								item.hblList = item.hblList.map(ele => {
									return {
										...ele,
										siStatus: '--',
										copyCheckStatus: '--',
										orderNo: '',
										checkable: false
									}
								})
							}
							return { ...item }
						})
						// 请求无数据显示的文案
						if (!list || !list.length) {
							this.$set(this.tableConfig, 'defaultEmpty', false)
						}
						// hblList新增agreeReleaseStatus,isMblAgreeRelease字段
						this.tableConfig.list = list.map(item => {
							item.hblList.map(hbl => {
								hbl.agreeReleaseStatus = item.agreeReleaseStatus
								hbl.isMblAgreeRelease = item.isAgreeRelease
								hbl.orderNo = item.orderNo
								hbl.custid = item.custid
								hbl.agreeApplyEmployeeId = item.agreeApplyEmployeeId
								hbl.blType = 'hbl'
								return hbl
							})
							return item
						})
						console.log('🚀 ~ this.tableConfig.list', this.tableConfig.list)
						this.tableConfig.pagination.total = totalCount
						this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
						this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
						this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
						this.tableConfig.pagination.isLastPage = response.data.isLastPage
						this.tableQuery.currPage = response.data.currPage
						this.tableQuery.pageSize = pageSize
						this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns

						// this.tableConfig.configColumns.push('isCancelApply', 'isNotify', 'isChange')
						this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
						this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
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
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value ? item.value[item.value.length - 1] : ''
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
									// if (item.value)
									// 	query.push(
									// 		{
									// 			column: item.key,
									// 			type: 'ge',
									// 			value: item.value[0] + ' 00:00:00'
									// 		},
									// 		{
									// 			column: item.key,
									// 			type: 'le',
									// 			value: item.value[1] + ' 23:59:59'
									// 		}
									// 	)
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
												value: item.value[0] + (this.onlyShowYMDParam.includes(item.key) ? '' : ' 00:00:00')
											})
										}
									}
									if (item.value && item.value[1]) query.push({ column: item.key, type: 'le', value: item.value[1] + (this.onlyShowYMDParam.includes(item.key) ? '' : ' 23:59:59') })
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
				this.getList()
			}
			if (action === 'Reset') {
				this.handleSearchValueReset()
			}
			// 模板加载后修改搜索组件的数组
			if (action === 'Update') {
				this.searchInputGroup = param.length ? [...param] : [...defaultSearchInputGroup]
				let { blNo, orderNo } = this.$route.query
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
			// console.log('重置')
		},
		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},
		// 按补料状态筛选
		handleSearchByStatus() {
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
			if (val === 1) return (this.tableConfig.list = [])
			// 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
			if (val) {
				this.tableQuery.currPage = val
				// this.getSearchConditionInfo()
			}
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 发起申请弹窗
		handleApply() {
			// 只能选择未同意放货的M单
			let isAgreeValid = this.selectedCheckbox.some(item => item.isAgreeRelease !== 'n')
			if (isAgreeValid || this.selectedCheckbox.length === 0) {
				return this.$message.error('请选择客户未同意放货的提单!')
			}
			// let blNos = this.selectedCheckbox.map(item => item.blNo)
			// let blIdList = this.selectedCheckbox.map(item => item.blId)
			// this.applyQuery = {
			// 	blNos,
			// 	blIdList
			// }
			// this.applyPopShow = true
			let blNosArr = this.selectedCheckbox.map(item => {
				return {
					blNo: item.blNo,
					orderNo: item.orderNo,
					blId: item.blId,
					bdEmployeeName: item.bdEmployeeName,
					agreeAuditEmployeeName: item.agreeAuditEmployeeName
				}
			})
			this.routerPush('FactoryDisagreeApplyDetail', {
				blNosArr: JSON.stringify(blNosArr)
			})
		},
		// 申请弹窗关闭回调
		async applyPopClose(action, value) {
			console.log('value', value)
			if (action === 'Confirm') {
				blFactoryDisagreeApply(value).then(res => {
					this.$message({
						type: 'success',
						message: '发起申请成功',
						duration: 1000,
						onClose: () => {
							this.applyPopShow = false
							this.getList()
						}
					})
				})
			} else {
				this.applyPopShow = false
			}
		},
		// 取消申请
		handleCancel() {
			if (this.selectedCheckbox.length === 0) return this.$message.error('请选择要取消申请的提单!')
			if (this.selectedCheckbox.some(item => !['applied', 'wait_audit'].includes(item.agreeReleaseStatus))) return this.$message.error('请选择审批状态为待审核的提单!')
			this.$confirm('是否确认取消，请仔细核对，谨慎操作。', '提示', {
				dangerouslyUseHTMLString: true,
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let blIdList = this.selectedCheckbox.map(item => item.blId)
					blFactoryDisagreeCancel({ blIdList }).then(res => {
						this.$message({
							type: 'success',
							message: '取消成功',
							duration: 1000,
							onClose: () => {
								this.getList()
							}
						})
					})
				})
				.catch(() => {})
		},
		// 审核弹窗
		handleAudit() {
			// 只能选择待审核的M单
			if (this.selectedCheckbox.length === 0) return this.$message.error('请选择审批状态为待审核的提单!')
			if (this.selectedCheckbox.some(item => !['applied', 'wait_audit'].includes(item.agreeReleaseStatus))) return this.$message.error('请选择审批状态为待审核的提单!')
			let blNosArr = this.selectedCheckbox.map(item => {
				return {
					blNo: item.blNo,
					orderNo: item.orderNo,
					blId: item.blId,
					bdEmployeeName: item.bdEmployeeName,
					agreeApplyEmployeeName: item.agreeApplyEmployeeName,
					agreeApplyReason: item.agreeApplyReason,
					agreeApplyValue: item.agreeApplyValue
				}
			})
			let blIdList = this.selectedCheckbox.map(item => item.blId)
			this.auditQuery = {
				blNosArr,
				blIdList
			}
			this.auditPopShow = true
		},
		// 审核弹窗关闭回调
		async auditPopClose(action, value) {
			console.log('value', value)
			if (action === 'Confirm') {
				blFactoryDisagreeAudit(value).then(res => {
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
			} else {
				this.auditPopShow = false
			}
		},
		// //处理工作号跳转
		// handleOrderNo(row) {
		// 	let routeUrl = this.$router.resolve({
		// 		name: 'OrderRedirect',
		// 		query: {
		// 			orderNo: row.orderNo,
		// 		}
		// 	})
		// 	window.open(routeUrl.href, '_blank')
		// },
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
		// 导出
		handleExport() {
			let data = this.getListQuery()
			blFinExport({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: this.oldParams.query,
				scenesCode: 'BlFinApplyList'
			}).then(response => {
				let { filePath } = response.data
				window.location.href = filePath
			})
		}
	}
}
</script>
<style lang="scss">
.factory-disagree-noticeTip {
	padding: 0 10px 10px 0;
	line-height: 16px;
	color: #ff4949;
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
</style>
