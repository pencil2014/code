<template>
	<div class="">
		<div class="search-container">
			<Search ref="search" scenesCode="PenddingList" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
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
		<div v-if="refuseShow">
			<Apply :param="refuseQuery" @close="refusePopClose" />
		</div>
		<!-- 附件列表 -->
		<div v-if="cargoFileListShow">
			<FileList @close="cargoFileListShow = false" :param="listItemQuery" />
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
import Apply from './components/apply'
import CustomColumns from '@/components/customColumns/index'
import { columnWidthConfigInfo, columnWidthConfigSave, baseCompanySettleList } from '@/api/base'
import { getParamMethod } from '@/utils/allKindNumber'
import FileList from '@/views/order/order/orderList/penddingList/components/cargoFileList'
import { saveHscode, importApplyListPage, importApplyAccept, cargoHscodeList, hscodeTypeList, cargoUnnoList, hscodeChangeStatus } from '@/api/base'
import { customerListAllStatusNew } from '@/api/crm/supplier'
import { baseEmployeeListName } from '@/api/base'
import { abroadCompanyList } from '@/api/order/list'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime', 'oid'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	scenesCode: 'PenddingList',
	applyStatus: 'all'
}
const defaultSearchInputGroup = [
	{
		key: 'orderNo',
		value: '',
		placeholder: '出口单号',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'importOrderNo',
		value: '',
		placeholder: '进口单号',
		category: 'all',
		queryValue: ''
	}
]

export default {
	mixins: [routerMixin],
	data() {
		return {
			listItemQuery: {},
			cargoFileListShow: false,
			loading: false,
			serviceTypeOptions: {},
			defaultSearchLength: 0, // 默认显示搜索框的个数

			allFilterGroups: {
				all: this.filterGroups
			},
			// 查询条件下拉选项

			filterGroups: {
				orderNo: {
					key: 'orderNo',
					label: '出口单号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				importOrderNo: {
					key: 'importOrderNo',
					label: '进口单号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				compDeptName: {
					key: 'compDeptName',
					label: '委托单位',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true,
					filterable: true,
					saveList: [],
					queryValue: ''
				},

				etdTime: { label: '预计开船时间', key: 'etdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				tdTime: { label: '实际开船时间', key: 'tdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etaTime: { label: '预计到港时间', key: 'etaTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				taTime: { label: '实际到港时间', key: 'taTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				createdBy: {
					key: 'createdBy',
					label: '申请人',
					type: 'remoteSelect',
					searchType: 'eq',
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
				applyTime: { label: '申请时间', key: 'applyTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				acceptTime: { label: '接单时间', key: 'acceptTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				refuseTime: { label: '拒绝时间', key: 'refuseTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				cancelTime: { label: '撤回时间', key: 'cancelTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' }
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
				configColumns: store.state.order.penddingList.defaultColumns,
				columns: [],
				allColumns: store.state.order.penddingList.columnsBase(this.handleViewFileList),
				// 操作按钮组
				operationBtns: {
					minWidth: '100',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Apply') {
							this.handleApply(row)
						}
						if (action === 'Refuse') {
							this.handleRefuse(row)
						}
					},
					data: [
						{
							label: '接单',
							type: 'text',
							show: (item, row) => {
								return row.applyStatus.toLowerCase() === 'submit'
							},
							action: 'Apply'
						},
						{
							label: '拒绝',
							className: 'red',
							type: 'text',
							show: (item, row) => {
								return row.applyStatus.toLowerCase() === 'submit'
							},
							action: 'Refuse'
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
			refuseShow: false,
			refuseQuery: {},
			oldParams: {}
		}
	},
	activated() {
		console.log('🚀 ~ activated')
		// 保存url中的orderNo
		let queryOrderNo = this.$route.query.orderNo || ''
		sessionStorage.setItem('queryOrderNo', queryOrderNo)
		this.init()

		// 有orderNo 请求列表接口
		// queryOrderNo && this.getList()
		this.$refs.search.getSearchConditionInfo(true)
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		console.log('🚀 ~ created')
		// this.getAbroadCompanyList()
		this.getCompanySettleList()
	},
	mounted() {
		console.log('🚀 ~ this.dictMap', this.dictMap.importApplyStatus)
	},

	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap,
			defaultColumns: state => state.order.penddingList.defaultColumns,
			specialColumns: state => state.order.penddingList.specialColumns,
			columnsBase: state => state.order.penddingList.columnsBase()
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
		Apply,
		FileList
	},
	methods: {
		// 获取结算公司
		getCompanySettleList() {
			baseCompanySettleList().then(res => {
				let result = res.data.map(ele => {
					return Object.assign({}, ele, {
						label: ele.name,
						value: ele.name
					})
				})
				this.filterGroups.compDeptName.data = result
			})
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
		getAbroadCompanyList() {
			// 海外分公司
			abroadCompanyList({ isAbroad: 'yes' }).then(res => {
				if (res.data) {
					this.filterGroups.compDeptCode.data = res.data.map(item => {
						return {
							label: item.companyName,
							value: item.companyCode
						}
					})
				}
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
		// 获取委托单位
		getCustList(val, item) {
			let data = {
				currPage: 1,
				pageSize: 50,
				query: val ? [{ column: 'name', type: 'like', value: val }] : []
				// query: val
				// 	? [
				// 			{ column: 'name', type: 'like', value: val },
				// 			{ column: 'roleType', type: 'eq', value: 'client' }
				// 	  ]
				// 	: [{ column: 'roleType', type: 'eq', value: 'client' }]
			}
			customerListAllStatusNew(data).then(res => {
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
		// 禁用
		handleDisable() {
			if (this.selectedCheckbox.length === 0) return this.$message.error('请先选择要禁用的数据')
			if (this.selectedCheckbox.some(item => item.status != 'valid')) return this.$message.error('只能勾选状态为有效的数据')
			let oids = this.selectedCheckbox.map(item => item.oid)
			this.$confirm('是否确定禁用数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					hscodeChangeStatus({ oids, status: 'invalid' }).then(res => {
						if (res.code === 0) {
							this.$message.success('禁用成功!')
							this.getList()
						}
					})
				})
				.catch(err => {})
		},
		// 查看附件弹窗
		handleViewFileList(index, row) {
			console.log('🚀 ~ row', row)
			console.log('🚀 ~ index', index)
			// this.cargoFileListShow = true
			this.listItemQuery = {
				oid: row.oid,
				className: row.className
			}
		},

		// 获取hscode
		getHscode(val, item) {
			let data = val ? val.replace(/^\s+|\s+$/g, '') : ''
			data &&
				cargoHscodeList({ keyword: data }).then(res => {
					// 单选下拉不保存选择后的数据
					if (!item.multiple) item.saveList = []
					let filterArr = res.data.filter(ele => !item.saveList.find(o => o.value === ele.hscode))
					let itemList = filterArr.map(ele => {
						return {
							...ele,
							label: ele.cargoDesc,
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
				scenesCode: `PenddingList`,
				columnWidthList: data
			})
				.then(res => {})
				.finally(() => {})
		},

		init() {
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			// this.getList()
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
			console.log('🚀 ~ this.tableQuery.applyStatu', this.tableQuery.applyStatus)
			let statusQuery = []
			// 全部
			if (this.tableQuery.applyStatus === 'all') {
				statusQuery = []
			} else {
				statusQuery = [{ column: 'applyStatus', type: 'eq', value: this.tableQuery.applyStatus }]
			}

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
				scenesCode: `PenddingList`
			})
			let { columnWidthList } = data
			let { orderNo } = this.$route.query
			let query = this.getListQuery(orderNo)
			// 处理url中的orderNo
			this.mapOrderNo(query)

			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo'].includes(item.column)) {
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			getParamMethod(this.$route.name, query).then(queryObj => {
				this.loading = true
				importApplyListPage(queryObj)
					.then(response => {
						this.oldParams = queryObj
						let { list, totalCount, allColumns, configColumns, pageSize } = response.data
						// 请求无数据显示的文案
						if (!list || !list.length) {
							this.$set(this.tableConfig, 'defaultEmpty', false)
						}

						this.tableConfig.list = list
						this.tableConfig.pagination.total = totalCount
						this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
						this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
						this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
						this.tableConfig.pagination.isLastPage = response.data.isLastPage
						this.tableQuery.currPage = response.data.currPage
						this.tableQuery.pageSize = pageSize
						this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns

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
				let { orderNo } = this.$route.query

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
							placeholder: '出口单号',
							category: 'all',
							queryValue: ''
						})
					}
				}
			}
			if (action === 'Refresh') {
				this.getList()
			}
			// 保存搜索模板
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
			}
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		handlePenddingStatus() {
			this.tableQuery.currPage = 1
			this.getList()
		},
		// 接单
		handleApply(row) {
			console.log('🚀 ~ row', row)
			this.$confirm('接单会自动生成进口单相关数据，是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					importApplyAccept({ oid: row.oid, orderNo: row.orderNo }).then(res => {
						if (res.code === 0) {
							let { orderNo } = res.data
							this.$message({
								message: '接单成功',
								type: 'success',
								duration: 1000,
								onClose: () => {
									this.getList()
									this.isJumpRouteFromPage = true
									let routeUrl = this.$router.resolve({
										name: 'OrderDetail',
										params: {
											orderNo: orderNo
										},
										query: {
											orderNo: orderNo,
											source: 'orderList',
											isPendding: 'pendding',
											showContainer: true,
											showBl: true,
											showRelate: false
										}
									})
									window.open(routeUrl.href, '_blank')
								}
							})
						}
					})
				})
				.catch(err => {})
		},
		// 拒绝
		handleRefuse(row) {
			console.log('🚀 ~ row', row)
			this.refuseQuery = { ...row }
			this.refuseShow = true
		},
		// 拒绝弹窗关闭回调
		async refusePopClose(action) {
			if (action === 'Confirm') {
				this.refuseShow = false
				this.getList()
			} else {
				this.refuseShow = false
			}
		},

		// 排序
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
