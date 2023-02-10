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
			<BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" v-loading="loading" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
		<div v-if="soPopShow">
			<SoPop :soListQuery="soListQuery" @close="soPopClose" />
		</div>
		<!-- 补料要求弹窗 -->
		<div v-if="siRemarkPopShow">
			<SiRemark :siRemarkQuery="siRemarkQuery" @close="siRemarkPopClose" />
		</div>
		<!--新增提单弹窗 -->
		<div v-if="addBlShow">
			<AddBl @close="addBlClose" />
		</div>
	</div>
</template>
<script>
import Vue from 'vue'
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
import SoPop from './components/soPop'
// 弹出框
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import { baseBusinessList, searchConditionInfo, searchConditionSave, searchConditionDelete, baseEmployeeListName, columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { blSiList, blSiExport, blBillInfo, blBillUpload } from '@/api/order/bl'
import SiRemark from './components/blSiRemark.vue'
import AddBl from './components/addBill.vue'
import { getParamMethod } from '@/utils/allKindNumber'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: ['siCutOff'],
	descColumns: [],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	siStatus: 'all' // 补料状态，默认展示未审核
}
const defaultSearchInputGroup = [
	{ key: 'universalNo', value: '', placeholder: '编号类型', category: 'all', queryValue: '' },
	{ key: 'siCutOff', value: '', placeholder: '时间类型', category: 'all', queryValue: '' },
	{ key: 'blMode', value: '', placeholder: '筛选类型', category: 'all', queryValue: '' },
	{ key: 'bdEmployeeId', value: '', placeholder: '编号类型', category: 'all', queryValue: '' }
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
			addBlShow: false,
			loading: false,
			siRemarkQuery: {},
			siRemarkPopShow: false, // 	补料要求弹窗
			cTimestamp: 0,
			dialogOrderShow: false,
			state: '',
			showVal: null,
			defaultStyle: {
				width: '100%'
			},
			serviceTypeOptions: {},
			orderNo: '',
			// searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			// numbers: ['universalNo', 'orderNo', 'blNo', 'soInfo'], // 各类编号：工作号,提单号
			// times: ['siCutOff', 'etdTime'], // 截补料时间,预计开船时间
			// categorys: ['blMode', 'shipCarrierCode'], // 筛选类型：出单方式,copy是否确认,dn是否获取,dn确认结果
			// bdEmployees: ['bdEmployeeId'], // 筛选类型：出单方式,copy是否确认,dn是否获取,dn确认结果
			allFilterGroups: {
				// numbers: {},
				// times: {},
				// categorys: {},
				// bdEmployees: {},
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				universalNo: { key: 'universalNo', label: '各类编号', type: 'input', searchType: 'eq', value: '' },
				orderNo: { key: 'orderNo', label: '工作号', type: 'input', searchType: 'like', value: '' },
				blMode: { label: '出单方式', key: 'blMode', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				// copySiCheck: {label: 'copy件单证确认', key: 'copySiCheck', type: 'select', searchType: 'eq', value: '', data: confirmOptions, nonDictionary: true},
				blNo: { key: 'blNo', label: '提单号', type: 'input', searchType: 'like', value: '' },
				// obdCheck: {key: 'obdCheck', label: 'OBD提单是否收到', type: 'select', searchType: 'eq', value: '', data: confirmOptions, nonDictionary: true},
				// dnGet: {key: 'dnGet', label: 'D/N是否收到', type: 'select', searchType: 'eq', value: '', data: confirmOptions, nonDictionary: true},
				// dnFeeInput: {key: 'dnFeeInput', label: 'D/N是否录入', type: 'select', searchType: 'eq', value: '', data: confirmOptions, nonDictionary: true},
				// takeApplyStatus: {label: '取单状态', key: 'takeApplyStatus', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true},
				siCutOff: { label: '截补料时间', key: 'siCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etdTime: { label: '预计开船时间', key: 'etdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				soInfo: { key: 'soInfo', label: 'SO号', type: 'input', searchType: 'like', value: '' },
				freetimeSys: { key: 'freetimeSys', label: '免用免堆', type: 'input', searchType: 'like', value: '' },
				siRemark: { key: 'siRemark', label: '备注', type: 'input', searchType: 'like', value: '' },
				shipCarrierCode: {
					key: 'shipCarrierCode',
					label: '船公司',
					type: 'autocomplete',
					searchType: 'like',
					value: '',
					queryValue: '',
					querySearch: (queryString, cb) => {
						this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: 'valid' }).then(data => {
							cb(data)
						})
					},
					select: (value, item) => {
						Object.assign(item, {
							queryValue: value.key
						})
					},
					change: (value, item) => {
						Object.assign(item, {
							queryValue: value
						})
					},
					clear: (value, item) => {
						Object.assign(item, {
							queryValue: ''
						})
					}
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
						this.getEmployeeName('', item)
					},
					filterMehod: (val, item) => {
						this.getEmployeeName(val, item)
					}
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
				allColumns: store.state.order.blSiList.columnsBase(this.handleOrderNoInfo, this.handleViewSo, this.handleViewSiRemark),
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
			// 点击的是补料列表里的详情
			isClickInfo: false,
			soPopShow: false, // so弹窗
			soListQuery: {},
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
	},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap,
			blSiList: state => state.order.blSiList,
			defaultColumns: state => state.order.blSiList.defaultColumns,
			specialColumns: state => state.order.blSiList.specialColumns,
			columnsBase: state => state.order.blSiList.columnsBase()
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
		SoPop,
		SiRemark,
		AddBl
	},
	methods: {
		// 新增提单
		handleAddBl() {
			this.addBlShow = true
		},
		addBlClose(action, value) {
			console.log('🚀 ~ action', action)
			this.addBlShow = false
			let routeUrl = this.$router.resolve({
				name: 'BlList',
				params: {
					orderNo: value.orderNo
				},
				query: {
					orderNo: value.orderNo,
					source: 'SiListAddBl',
					showContainer: false,
					showBl: true,
					showRelate: false
				}
			})
			window.open(routeUrl.href, '_blank')
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
		// 获取员工name
		getEmployeeName(val, item) {
			// console.log('item.saveList', item.saveList)
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: 'bd' // 角色
			}
			baseEmployeeListName(data).then(res => {
				let filterArr = res.data.filter(ele => !item.saveList.find(o => o.value === ele.employeeId))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: this.$language === 'en' ? ele.ename : ele.cname, value: ele.employeeId ? Number(ele.employeeId) : '' }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		handleViewSiRemark(index, row) {
			this.siRemarkPopShow = true
			this.siRemarkQuery = {
				siRemark: row.siRemark
			}
		},
		siRemarkPopClose(action, value) {
			this.siRemarkPopShow = false
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
			this.tableQuery.siStatus = 'all'
			Object.assign(this.allFilterGroups, {
				// numbers: this.filterObj(this.numbers),
				// times: this.filterObj(this.times),
				// categorys: this.filterObj(this.categorys),
				// bdEmployees: this.filterObj(this.bdEmployees),
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
		},
		// 增加一条搜索条件
		handleAddFilter() {
			this.searchInputGroup.push({ key: '', value: '', category: 'all', queryValue: '' })
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
			let delQuery = [{ column: 'state', type: 'eq', value: 'valid' }]
			// 全部
			if (this.tableQuery.siStatus === 'all') {
				statusQuery = []
				delQuery = []
			}
			// 待补料
			if (this.tableQuery.siStatus === 'siCheck') {
				statusQuery = [
					{ column: 'isCancel', type: 'eq', value: 'n' },
					{ column: 'siCheck', type: 'ne', value: 'y' }
				]
			}
			// copy件单证待确认
			if (this.tableQuery.siStatus === 'copySiCheck') {
				statusQuery = [
					{ column: 'isCancel', type: 'eq', value: 'n' },
					{ column: 'copySiCheck', type: 'ne', value: 'y' },
					{ column: 'siCheck', type: 'eq', value: 'y' }
				]
			}
			// copy件客户待确认
			if (this.tableQuery.siStatus === 'copyCheckStatus') {
				statusQuery = [
					{ column: 'isCancel', type: 'eq', value: 'n' },
					{ column: 'copyCheckStatus', type: 'in', value: 'draft,submit' },
					{ column: 'copySiCheck', type: 'eq', value: 'y' }
				]
			}
			// 待收OBD提单
			if (this.tableQuery.siStatus === 'obdCheck') {
				statusQuery = [
					{ column: 'isCancel', type: 'eq', value: 'n' },
					{ column: 'obdCheck', type: 'ne', value: 'y' },
					{ column: 'copyCheckStatus', type: 'eq', value: 'pass' }
				]
			}
			// 待收费用单
			if (this.tableQuery.siStatus === 'dnGet') {
				statusQuery = [
					{ column: 'isCancel', type: 'eq', value: 'n' },
					{ column: 'dnGet', type: 'ne', value: 'y' },
					{ column: 'copyCheckStatus', type: 'eq', value: 'pass' }
				]
			}
			// 商务待签单
			if (this.tableQuery.siStatus === 'dnGetY') {
				statusQuery = [
					{ column: 'isCancel', type: 'eq', value: 'n' },
					{ column: 'dnCheckStatus', type: 'in', value: 'submit,refuse' }
				]
			}
			// 费用待录入
			if (this.tableQuery.siStatus === 'dnFeeInput') {
				statusQuery = [
					{ column: 'isCancel', type: 'eq', value: 'n' },
					{ column: 'dnFeeInput', type: 'ne', value: 'y' },
					{ column: 'dnCheckStatus', type: 'eq', value: 'pass' }
				]
			}
			// 取单申请
			if (this.tableQuery.siStatus === 'takeApplyStatus') {
				statusQuery = [
					{ column: 'isCancel', type: 'eq', value: 'n' },
					{ column: 'takeApplyStatus', type: 'eq', value: 'submit' }
				]
			}
			// 已撤回
			if (this.tableQuery.siStatus === 'isCancel') {
				statusQuery = [{ column: 'isCancel', type: 'eq', value: 'y' }]
			}
			// 已取消
			if (this.tableQuery.siStatus === 'state') {
				delQuery = [
					{ column: 'isCancel', type: 'eq', value: 'n' },
					{ column: 'state', type: 'eq', value: 'invalid' }
				]
			}
			// 合并状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery, delQuery)
			})
			delete data.siStatus
			return data
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
			console.log('🚀 ~ query', query)
			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'soInfo', 'blNo'].includes(item.column)) {
					// item.type = item.column === 'soInfo' ? 'like' : 'in'
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			this.loading = true
			getParamMethod(this.$route.name, query).then(queryObj => {
				blSiList(queryObj)
					.then(response => {
						this.loading = false
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
					.catch(() => {
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
								} else if (['copySiCheck', 'obdCheck', 'dnGet', 'dnFeeInput'].includes(item.key)) {
									// 特殊处理只有“是”，“否”选项的下拉，选择是，eq为y,选择否，ne为y
									if (item.value === 'n') {
										Object.assign(tempItem, {
											column: item.key,
											type: 'ne',
											value: 'y'
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
									value: this.filterGroups[item.key].queryValue
								})
							}
							if (item.key === 'siStatus') {
								this.tableQuery.siStatus = item.value
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
			}
			// if (action === 'Reset') {
			// 	console.log(param.composeKey)
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
			// 	// this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
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
		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},
		// 按补料状态筛选
		handleSearchByOrderStatus() {
			this.tableQuery.currPage = 1
			this.getList()
		},
		// 多选
		handleMuti(arr) {
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
		// 查看so弹窗
		handleViewSo(index, row) {
			this.soListQuery = {
				blId: row.blId,
				orderNo: row.orderNo
			}
			this.soPopShow = true
			console.log('查看so', this.soListQuery)
		},
		// so弹窗关闭回调
		soPopClose(action, value) {
			this.soPopShow = false
		},
		// 获取table选中行的orderNo
		getOrderNos() {
			let orderNos = []
			this.selectedCheckbox.forEach(item => {
				orderNos.push(item.orderNo)
			})
			return orderNos
		},
		handleOrderNoInfo(row) {
			this.handleInfo(row)
		},
		// 去详情页
		handleInfo(row) {
			console.log('🚀 ~ row', row)
			let urlQuery = ''
			this.isClickInfo = true
			this.$router.push({
				name: 'SiDetail',
				params: {
					blId: row.blId
				},
				query: {
					orderNo: row.orderNo,
					oid: row.oid,
					blId: row.blId,
					jointNo: row.jointNoOnline ? row.jointNoOnline : row.jointNo
				}
			})
			// this.routerPush('SiDetail', {
			// 	orderNo: row.orderNo,
			// 	oid: row.oid,
			// 	blId: row.blId
			// })
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
			blSiExport({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: this.oldParams.query
			}).then(response => {
				let { filePath } = response.data
				window.location.href = filePath
			})
		}
	}
}
</script>
<style lang="scss">
.app-container {
	.si-import-bill {
		.el-form-item {
			width: 45%;
		}
		.import-bill-remark {
			width: 90%;
			.el-form-item__content {
				width: 708px;
				textarea {
					max-height: 180px;
				}
			}
		}
		.el-form-item__content {
			width: 70%;
		}
		.el-form-item__label {
			// font-size: 14px;
			// color: #222222;
			font-weight: 700;
		}
		.el-input,
		.el-autocomplete,
		.el-select {
			width: 100%;
		}
	}
}
</style>
