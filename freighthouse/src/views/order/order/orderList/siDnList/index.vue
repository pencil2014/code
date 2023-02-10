<template>
	<div class="app-container">
		<div class="search-container">
			<Search 
				:config.sync="searchConfig" 
				:callback="searchCallBack" 
				:tableQuery.sync="tableQuery"
				:searchFiledGroup="searchInputGroup" 
				:filterGroups="filterGroups"
			>
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
		<div v-if="soPopShow">
			<SoPop :soListQuery="soListQuery" @close="soPopClose" />
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
// 弹出框
import SoPop from '../si/components/soPop'
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import { baseBusinessList, searchConditionInfo, searchConditionSave, searchConditionDelete, columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { blSiDnList, blSiDnExport } from '@/api/order/bl'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: ['etdTime'],
	descColumns: [],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	dnCheckStatus: 'all' // 补料状态，默认展示未审核
}
const defaultSearchInputGroup = [
	{ key: '', value: '', placeholder: '编号类型', category: 'numbers', queryValue: '' },
	{ key: '', value: '', placeholder: '时间类型', category: 'times', queryValue: '' },
	{ key: '', value: '', placeholder: '筛选类型', category: 'categorys', queryValue: '' }
]
const confirmOptions = [
	{ label: '是', value: 'y' },
	{ label: '否', value: 'n' }
]
const getOptions = [
	{ label: '已收到', value: 'y' },
	{ label: '未收到', value: 'n' }
]
const takeStatusOptions = [
	{ label: '已取单', value: 'finish' },
	{ label: '未取单', value: 'init' }
]
export default {
	mixins: [routerMixin],
	data() {
		return {
			state: '',
			showVal: null,
			defaultStyle: {
				width: '100%'
			},
			serviceTypeOptions: {},
			orderNo: '',
			// searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			numbers: ['universalNo', 'orderNo', 'blNo'], // 各类编号：工作号,提单号
			times: ['cyCutOff', 'etdTime'], // 时间
			categorys: ['shipCarrierCode'], // 筛选类型：
			allFilterGroups: {
				numbers: {},
				times: {},
				categorys: {},
				all: this.filterGroups
			},
			// 查询条件下拉选项
			filterGroups: {
				universalNo: { key: 'universalNo', label: '各类编号', type: 'input', searchType: 'eq', value: '' },
				orderNo: { key: 'orderNo', label: '工作号', type: 'input', searchType: 'like', value: '' },
				blNo: { key: 'blNo', label: '提单号', type: 'input', searchType: 'like', value: '' },
				shipCarrierCode: {
					key: 'shipCarrierCode',
					label: '船司',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.shipQuerySearch('', item)
					},
					filterMehod: (val, item) => {
						this.shipQuerySearch(val, item)
					}
				},
				bkgAgentSupplierName: { label: '订舱代理', key: 'bkgAgentSupplierName', type: 'input', searchType: 'like', value: '' },
				vessel: {
					key: 'vessel',
					label: '大船船名',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						if (val) {
							this.queryVessleList('', item)
						}
					},
					filterMehod: (val, item) => {
						this.queryVessleList(val, item)
					}
				},
				voyage: {
					key: 'voyage',
					label: '大船航次',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						if (val) {
							this.queryVoyageList('', item)
						}
					},
					filterMehod: (val, item) => {
						this.queryVoyageList(val, item)
					}
				},
				cyCutOff: { label: '大船截关时间', key: 'cyCutOff', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etdTime: { label: '预计开船时间', key: 'etdTime', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' }
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
				list: [],
				configColumns: store.state.order.blSiDnList.defaultColumns,
				columns: [],
				allColumns: store.state.order.blSiDnList.columnsBase(this.handleViewSo),
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
			resDefaConfList: [] // 后端配置的默认搜索模板
		}
	},
	// beforeRouteLeave (to, from, next) {
	//   if (to.name == 'SiDnDetail' && this.isClickInfo) {
	//     to.meta.isUseCache = false
	//   } else {
	//     to.meta.isUseCache = true
	//   }
	//   next();
	// },
	activated() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		this.init()
		this.getList()
		// this.getSearchConditionInfo()
	},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap,
			blSiDnList: state => state.order.blSiDnList,
			defaultColumns: state => state.order.blSiDnList.defaultColumns,
			specialColumns: state => state.order.blSiDnList.specialColumns,
			columnsBase: state => state.order.blSiDnList.columnsBase()
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
		},
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		BaseDialog,
		CustomColumns,
		SoPop
	},
	methods: {
		// 船名下拉
		queryVessleList(queryString, item) {
			this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
				console.log('vessel', data);
				this.searchSelectVisibleData(data, item)
			})
		},
		// 航次下拉
		queryVoyageList(queryString, item) {
			this.$store.dispatch('dict/queryVoyageList', { name: queryString }).then(data => {
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
		// 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			}).then(res => {
				// console.log('res', res)
				// console.log('this.tableConfig.columns', this.tableConfig.columns)
				let {columnWidthList} = res.data
				// table列宽重新渲染
				this.tableConfig.columns.map(item => {
					let findItem = columnWidthList.find(ele => ele.column === item.prop)
					// 服务器返回的新的列宽宽度 
					let newWidth = findItem ? findItem.width : ''
					return Object.assign(item, {width: newWidth || item.width})
				})
				this.tableColumnsWidthList = this.getTableColumnsWidth()
				console.log('this.tableColumnsWidthList', this.tableColumnsWidthList)
			})
		},
		// 获取本地table列表的字段和宽为数组集合
		getTableColumnsWidth() {
			let result = this.tableConfig.columns.map(item => {
				return {column: item.prop, width: item.width}
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
				return {...item}
			})
			columnWidthConfigSave({
				scenesCode: `${this.$route.name}`,
				columnWidthList: data
			}).then(res => {
			}).finally(() => {
			})
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
			this.tableQuery.dnCheckStatus = 'all'
			Object.assign(this.allFilterGroups, {
				numbers: this.filterObj(this.numbers),
				times: this.filterObj(this.times),
				categorys: this.filterObj(this.categorys),
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
		},
		// 增加一条搜索条件
		handleAddFilter() {
			this.searchInputGroup.push({ key: '', value: '', category: 'all', queryValue: '' })
		},
		// 船公司下拉列表自动补充的数据
		shipQuerySearch(queryString, item) {
			this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: 'valid' }).then(data => {
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
			this.$store.dispatch('dict/queryBkgAgentSupplierList', { category: 'category', value: 'bkg_carrier,bkg_agent', queryString: queryString, categoryType: 'in' }).then(data => {
				item.data = data.list.map(ele => {
					return Object.assign(ele, {
						label: this.$language == 'en' ? ele.ename : ele.name,
						value: ele.supplierId ? Number(ele.supplierId) : ''
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
			let delQuery = [{ column: 'state', type: 'eq', value: 'valid' }]
			// 全部
			if (this.tableQuery.dnCheckStatus === 'all') {
				statusQuery = [{ column: 'dnCheckStatus', type: 'in', value: 'submit,pass,refuse' }]
				delQuery = []
			}
			// 待审核
			if (this.tableQuery.dnCheckStatus === 'submit') {
				statusQuery = [{ column: 'dnCheckStatus', type: 'eq', value: 'submit' }]
			}
			// 已通过
			if (this.tableQuery.dnCheckStatus === 'pass') {
				statusQuery = [{ column: 'dnCheckStatus', type: 'eq', value: 'pass' }]
			}
			// 已拒绝
			if (this.tableQuery.dnCheckStatus === 'refuse') {
				statusQuery = [{ column: 'dnCheckStatus', type: 'eq', value: 'refuse' }]
			}
			// 已取消
			if (this.tableQuery.dnCheckStatus === 'state') {
				delQuery = [{ column: 'state', type: 'eq', value: 'invalid' }]
			}
			// 合并状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery, delQuery)
			})
			delete data.dnCheckStatus
			return data
		},
		// 列表数据
		async getList() {
			let {data} = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			})
			let {columnWidthList} = data
			let query = this.getListQuery()
			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'blNo','universalNo'].includes(item.column)) {
					// item.type = 'in'
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			blSiDnList(query).then(response => {
				let { list, totalCount, allColumns, configColumns, pageSize } = response.data
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
				this.tableQuery.pageSize = pageSize
				this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
				// this.tableConfig.configColumns.push('isCancelApply', 'isNotify', 'isChange')
				// this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
				// this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
				this.handleFilterColumns(this.tableConfig.configColumns)
				// 设置列宽为服务器返回的新的列宽宽度 
				this.tableConfig.columns.map(item => {
					let findItem = columnWidthList.find(ele => ele.column === item.prop)
					let newWidth = findItem ? findItem.width : ''
					return Object.assign(item, {width: newWidth || item.width})
				})
				this.tableColumnsWidthList = this.getTableColumnsWidth()
				// this.getTableColumnWidthInfo()
				// this.fillPolName()
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
									if (item.value) query.push({ column: item.key, type: 'ge', value: item.value[0] + ' 00:00:00' }, { column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
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
							if (item.key === 'dnCheckStatus') {
								this.tableQuery.dnCheckStatus = item.value
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
				return {...item}
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
		handleSizeChange() {
			this.getList()
		},
		handleCurrentChange() {
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
		// 去详情页
		handleInfo(row) {
			let urlQuery = ''
			this.isClickInfo = true
			// this.$router.push({
			//   path: `siDnDetail?orderNo=${row.orderNo}&oid=${row.oid}&blId=${row.blId}`
			// })
			this.routerPush('SiDnDetail', {
				orderNo: row.orderNo,
				oid: row.oid,
				blId: row.blId
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
		},
		// 导出
		handleExport() {
			let data = this.getListQuery()
			blSiDnExport({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: data.query
			}).then(response => {
				let { filePath } = response.data
				window.location.href = filePath
			})
		}
	}
}
</script>
<style lang="scss"></style>
