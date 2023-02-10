<template>
	<div class="">
		<div class="search-container">
			<Search :searchConditionHide="true" :config.sync="searchConfig" :searchConditionConfig="searchConditionList" :callback="searchCallBack" :tableQuery.sync="tableQuery">
				<AddFilter
					:searchInputGroup="searchInputGroup"
					:allFilterGroups="allFilterGroups"
					:filterGroups="filterGroups"
					:defaultSearchLength="defaultSearchLength"
					:index="index"
					:item="item"
					v-for="(item, index) in searchInputGroup"
					:key="'filter' + index"
				/>
			</Search>
		</div>
		<div class="table-container">
			<BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
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
// 弹出框
import { baseBusinessList, searchConditionDelete, citySelectList } from '@/api/base'
import { lclList, lclFclBind } from '@/api/order/list'
import { getParamMethod } from '@/utils/allKindNumber'

const defaultPage = {
	pageSize: 10,
	currPage: 1
}

const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	orderStatus: 'all', // 订单状态，默认展示未审核
	cancelApplyStatus: '0' // 是否有未处理的撤回申请(1, 0)
}

const defaultSearchInputGroup = [{ key: '', value: '', placeholder: '筛选条件', category: 'all', queryValue: '' }]

export default {
	mixins: [routerMixin],
	data() {
		return {
			state: '',
			defaultStyle: {
				width: '100%'
			},
			searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 10, // 默认显示搜索框的个数
			allFilterGroups: {
				all: this.filterGroups
			},

			// 查询条件下拉选项
			filterGroups: {
				universalNo: { key: 'universalNo', label: '各类编号', type: 'input', searchType: 'eq', value: '' },
				whPoNo: { key: 'whPoNo', label: '入舱单号', type: 'input', searchType: 'like', value: '' },
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
				podPortCode: {
					key: 'podPortCode',
					label: '目的地',
					type: 'remoteSelect',
					searchType: 'eq',
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
				whBookStatus: { key: 'whBookStatus', label: '订舱状态', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				whAgentSupplierId: {
					key: 'whAgentSupplierId',
					label: '订舱代理',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.getSupplierList('', item)
					},
					filterMehod: (val, item) => {
						this.getSupplierList(val, item)
					}
				},
				orderStatus: { key: 'orderStatus', label: '订单状态', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				serviceType: { key: 'serviceType', label: '服务类型', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true, propInDict: 'shipServiceType' }
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
				list: [],
				configColumns: [],
				columns: [],
				allColumns: store.state.order.lclRelateList.columnsBase(this.handleOrderNoInfo),

				// 操作按钮组
				operationBtns: {
					width: '120px',
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
			}
		}
	},
	destroyed() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
		this.init()
		this.getList()
		//订舱状态数据源
		this.filterGroups.whBookStatus.data = this.dictMap.whBookStatus
		//订单状态数据源
		this.filterGroups.orderStatus.data = this.dictMap.orderStatus
	},
	mounted() {
		console.log('🚀 ~ dictMap', this.dictMap.whBookStatus)
	},

	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap,
			defaultColumns: state => state.order.lclRelateList.defaultColumns,
			specialColumns: state => state.order.lclRelateList.specialColumns,
			columnsBase: state => state.order.lclRelateList.columnsBase()
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
		BaseTableMuti
	},
	methods: {
		// 获取订舱代理
		getSupplierList(queryString, item) {
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'whbook,proxy_whbook', queryString: queryString, categoryType: 'in' }).then(data => {
				// item.data = data.list.map(ele => {
				// 	return Object.assign(ele, {
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
		//关联子单
		lclFclBind() {
			let orderNo = this.$route.query.orderNo
			let lclOrderNoList = this.getOrderNos()
			console.log('🚀 ~ lclOrderNoList', lclOrderNoList)
			if (lclOrderNoList.length === 0) return this.$message.warning('请至少选择一条数据!')
			lclFclBind({ orderNo, lclOrderNoList }).then(res => {
				this.$message.success('关联成功!')
				this.$emit('getList')
				this.$emit('closeRelate')
			})
		},
		init() {
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = [
				{
					key: 'universalNo',
					value: '',
					placeholder: '各类编号',
					category: 'all',
					queryValue: ''
				},
				{
					key: 'whPoNo',
					value: '',
					placeholder: '入舱单号',
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
				{
					key: 'podPortCode',
					value: '',
					placeholder: '目的地',
					category: 'all',
					queryValue: ''
				},
				{
					key: 'whBookStatus',
					value: '',
					placeholder: '订舱状态',
					category: 'all',
					queryValue: ''
				},
				{
					key: 'whAgentSupplierId',
					value: '',
					placeholder: '订舱代理',
					category: 'all',
					queryValue: ''
				},
				{
					key: 'orderStatus',
					value: '',
					placeholder: '订单状态',
					category: 'all',
					queryValue: ''
				},
				{
					key: 'serviceType',
					value: '',
					placeholder: '服务类型',
					category: 'all',
					queryValue: ''
				}
			]
		},

		// 远程搜索港口下拉数据
		portSearch(queryString, portAttribute, state, type, item) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				// let portList = data.map(ele => {
				// 	return Object.assign(ele, {
				// 		label: ele.value,
				// 		value: ele.key
				// 	})
				// })
				// item.data = portList
				let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.key))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: ele.value, value: ele.key }
				})
				item.data = [...item.saveList, ...itemList]
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
				// statusQuery = [{'column': 'orderStatus', 'type': 'in', 'value': 'submit,draft,pass,refuse,complete'}]
				statusQuery = []
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
			// delete(data.cancelApplyStatus)
			// delete(data.isServiceComplete)
			console.log('🚀 ~ data', data)
			data.query.push({ column: 'lclStatus', type: 'ne', value: 'done' })
			return data
		},

		// 列表数据
		getList() {
			let data = this.getListQuery()
			//处理逗号分割的多个订单号
			data.query.map(item => {
				if (['whPoNo'].includes(item.column)) {
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			getParamMethod('ORDER_LCL_LIST', data).then(queryObj => {
                lclList(queryObj).then(response => {
					let { list, totalCount, allColumns, configColumns } = response.data
					list.forEach(item => {
						item.serviceTypeName = getDictLabel('shipServiceType', item.serviceType)
						item.businessTypeCn = getDictLabel('shipBusinessType', item.businessType)
					})
					if (configColumns && configColumns.length) {
						configColumns = configColumns.filter(item => item !== 'jointNo')
					}
					this.tableConfig.list = list
					this.tableConfig.pagination.total = totalCount
					this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
					this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
					this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
					this.tableConfig.pagination.isLastPage = response.data.isLastPage
					this.tableQuery.currPage = response.data.currPage
					this.tableConfig.configColumns = this.defaultColumns
					this.handleFilterColumns(this.tableConfig.configColumns)
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
									if (item.value) query.push({ column: item.key, type: 'ge', value: item.value[0] + ' 00:00:00' }, { column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
								} else if (['prefinCloseStatus', 'finCloseStatus'].includes(item.key)) {
									// 特殊处理预关账状态，关账状态
									if (item.value) {
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

							// if (item.key === 'orderStatus') {
							// 	this.tableQuery.orderStatus = item.value
							// }
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
				this.init()
				Object.assign(this.tableQuery, defaultTableQuery, defaultPage)
				// this.$refs.tableFilter.status = '0'
				this.getList()
				Object.assign(this.tableConfig, { tips: { text: '', show: false } })
			}
		},

		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 点击订单号查看详情
		handleOrderNoInfo(index, row) {
			this.handleInfo(row)
		},
		// 去详情页
		handleInfo(row) {
			this.isJumpRouteFromPage = true
			// this.$router.push({
			// 	name: 'LclOrderDetail',
			// 	params: {
			// 		orderNo: row.orderNo
			// 	},
			// 	query: {
			// 		source: 'lclOrderList',
			// 		orderNo: row.orderNo,
			// 		jointNo: row.jointNo
			// 	}
			// })
			let routeUrl = this.$router.resolve({
				name: 'LclOrderDetail',
				params: {
					orderNo: row.orderNo
				},
				query: {
					source: 'lclOrderList',
					orderNo: row.orderNo,
					jointNo: row.jointNo
				}
			})
			window.open(routeUrl.href, '_blank')
		},

		handleSizeChange(val) {
			this.getList()
		},

		handleCurrentChange(val) {
			this.getList()
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
			console.log('tableColumns:', this.tableConfig.columns)
		},

		// 多选
		handleMuti(arr) {
			this.selectedCheckbox = arr
		},
		// 获取table选中行的orderNo
		getOrderNos() {
			let orderNos = []
			this.selectedCheckbox.forEach(item => {
				orderNos.push(item.orderNo)
			})
			return orderNos
		}
	}
}
</script>
<style lang="scss"></style>
