<template>
	<div class="">
		<div class="search-container">
			<Search :searchConditionHide="true" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiedGroup="searchInputGroup" :filterGroups="filterGroups">
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
				<!-- <div class="btn-plus-search" @click="handleAddFilter"></div> -->
			</Search>
		</div>
		<div class="table-container">
			<!-- <TableFilter ref="tableFilter" :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" /> -->
			<BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
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
import { baseEmployeeListName, baseBusinessList, searchConditionInfo, searchConditionSave, searchConditionDelete, citySelectList } from '@/api/base'
import { lclUnbindList, lclListExport, lclFclCreate, lclFclBind } from '@/api/railway/list'
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

const defaultSearchInputGroup = [
	{ key: 'universalNo', value: '', placeholder: '筛选条件', category: 'all', queryValue: '' },
	{
		key: 'polPortCode',
		value: '',
		placeholder: '起运站',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'podPortCode',
		value: '',
		placeholder: '目的站',
		category: 'all',
		queryValue: ''
	},
	{ key: 'custName', label: '委托单位', type: 'input', searchType: 'like', value: '',category: 'all', },
	{
		category: 'all',
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
]

export default {
	mixins: [routerMixin],
	data() {
		return {
			cTimestamp: 0,
			state: '',
			showVal: null,
			defaultStyle: {
				width: '100%'
			},
			businessTypeOptions: [],
			serviceTypeOptions: {},
			searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 10, // 默认显示搜索框的个数

			allFilterGroups: {
				all: this.filterGroups
			},

			// 查询条件下拉选项
			filterGroups: {
				universalNo: { key: 'universalNo', label: '各类编号', type: 'input', searchType: 'like', value: '' },
				polPortCode: {
					key: 'polPortCode',
					label: '起运站',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, item)
					},
					change: (val, item) => {
						let findItem = item.data.find(ele => ele.value === val)
						Object.assign(item, {
							queryValue: val,
							text: findItem ? findItem.label : ''
						})
					}
				},
				podPortCode: {
					key: 'podPortCode',
					label: '目的站',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, item)
					},
					change: (val, item) => {
						let findItem = item.data.find(ele => ele.value === val)
						Object.assign(item, {
							queryValue: val,
							text: findItem ? findItem.label : ''
						})
					}
				},
				custName: { key: 'custName', label: '委托单位', type: 'input', searchType: 'like', value: '' },
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
					checkSelectable({ orderNo }) {
						return orderNo ? true : false
					}
				},
				list: [],
				configColumns: [],
				columns: [],
				allColumns: store.state.railway.lclRelateList.columnsBase(this.handleOrderNoInfo),

				// 操作按钮组
				operationBtns: {
					width: '120px',
					fixed: 'right',
					show: false,
					callback: (action, $index, row, item) => {
						if (action === 'Info') {
							this.handleInfo(row)
						}

						if (action === 'Refuse') {
							this.handleRefuse(row)
						}

						if (action === 'Audit') {
							this.handleAudit(row)
						}
					},
					data: [
						// {
						// 	label: '详情',
						// 	type: 'text',
						// 	show: true,
						// 	action: 'Info'
						// }
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

			// 新建订单弹窗
			createOrderPopShow: false,

			// 拒绝弹窗
			refusePopShow: false,
			refuseProp: {
				id: '',
				orderNo: '',
				jointNo: ''
			},
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
	destroyed() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
		this.cTimestamp = new Date().getTime()
		this.getBusinessType()
		this.init()
		this.getList()
	},
	mounted() {},

	computed: {
		...mapState({
			roles: state => state.user.roles,
			dictMap: state => state.dict.dictMap,
			defaultColumns: state => state.railway.lclRelateList.defaultColumns,
			specialColumns: state => state.railway.lclRelateList.specialColumns,
			columnsBase: state => state.railway.lclRelateList.columnsBase()
		})
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter
	},
	methods: {
		// 获取员工name
		getEmployeeName(val, item) {
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
		//关联子单
		lclFclBind() {
			let orderNo = this.$route.query.orderNo
			let lclOrderNoList = this.getOrderNos()
			if (lclOrderNoList.length === 0) return this.$message.warning('请至少选择一条数据!')
			lclFclBind({ orderNo, lclOrderNoList }).then(res => {
				this.$message.success('关联成功!')
				this.$emit('getList')
				this.$emit('closeRelate')
			})
		},
		// 获取服务类型
		getBusinessType() {
			let result = []
			baseBusinessList().then(res => {
				this.businessTypeOptions = res.data
				res.data.forEach(item => {
					if (item.business === 'rail' && item.serviceTypeList && item.serviceTypeList.length) {
						item.serviceTypeList.forEach(ele => {
							result.push({
								label: ele.businessType === 'rail_export_fcl' ? '铁路出口整箱-' + ele.name : '铁路出口拼箱-' + ele.name,
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
				}
			]
		},
		// 远程搜索港口下拉数据
		portSearch(portName, item) {
			this.$store.dispatch('dict/baseRailPortList', { portName }).then(data => {
				let portList = data.map(ele => {
					return Object.assign(ele, {
						label: ele.label,
						value: ele.value
					})
				})
				item.data = portList
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
				statusQuery = []
			} else {
				statusQuery = [{ column: 'orderStatus', type: 'eq', value: this.tableQuery.orderStatus }]
			}

			// 合并状态参数
			let data = {}

			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.orderStatus
			data.query.push({ column: 'lclStatus', type: 'ne', value: 'done' })
			return data
		},

		// 列表数据
		getList() {
			let data = this.getListQuery()
			getParamMethod('RAIL_ORDER_LCL_LIST', data).then(queryObj => {
                lclUnbindList(queryObj).then(response => {
					this.oldParams = queryObj
					let { list, totalCount, allColumns, configColumns } = response.data
					list.forEach(item => {
						item.serviceTypeName = item.serviceType ? this.serviceTypeOptions[item.serviceType] : ''
						let findItem = this.businessTypeOptions.find(ele => ele.businessType === item.businessType)
						item.businessTypeCn = findItem ? findItem.name : ''
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
								if (this.filterGroups[item.key].type === 'remoteSelect' && this.filterGroups[item.key].multiple) {
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
				console.log('serach:', this.tableQuery)
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
			// 	this.$refs.tableFilter.status = '0'
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
		// 撤回审核
		handleAudit(row) {},

		// 导出
		handleExport() {
			let data = this.getListQuery()
			lclListExport({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: this.oldParams.query
			}).then(response => {
				let { filePath } = response.data
				window.location.href = filePath
			})
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

			let routeUrl = this.$router.resolve({
				name: 'RailwayOrderDetail',
				params: {
					orderNo: row.orderNo
				},
				query: {
					orderNo: row.orderNo,
					showBl: true,
					showRelate: false
				}
			})
			window.open(routeUrl.href, '_blank')
		},

		// 按订单状态筛选
		handleSearchByOrderStatus() {
			this.tableQuery.currPage = 1
			this.getList()
		},

		handleSizeChange(val) {
			this.getList()
		},

		handleCurrentChange(val) {
			this.getList()
		},

		// 拒绝
		handleRefuse(row) {
			Object.assign(this.refuseProp, {
				id: row.id,
				orderNo: row.orderNo,
				jointNo: row.jointNo
			})
			this.refusePopShow = true
		},

		// 撤回
		handleCancel(row) {},

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

		// 新建
		handleAdd() {
			if (!this.selectedCheckbox.length) {
				return this.$message.error('请选择要拼箱的散货订单')
			}
			this.createOrderPopShow = true
		},
		// 新建订单关闭回调
		createOrderPopClose(action, value, includeFeederType) {
			this.createOrderPopShow = false
			if (action === 'Confirm') {
				this.handleCreateOrder(value, includeFeederType)
			}
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
		},
		// 新建订单保存
		handleCreateOrder(value, includeFeederType) {
			let orderNos = this.getOrderNos()
			let data = Object.assign(
				{ ...value },
				{
					orderNos
				}
			)

			lclFclCreate(data).then(res => {
				let { orderNo } = res.data

				sessionStorage.setItem('fclCreateOrderStr', JSON.stringify(res.data))
				this.isJumpRouteFromPage = true
				this.$router.push({
					name: 'FclOrderDetail',
					params: {
						orderNo: row.orderNo
					},
					query: {
						orderNo: orderNo,
						includeFeeder: includeFeederType,
						action: 'add'
					}
				})
			})
		}
	}
}
</script>
<style lang="scss"></style>
