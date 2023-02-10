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
    <div v-if="addShow">
      <add @close="addClose" />
    </div>
    <div v-if="transferPopShow">
      <transferPop :rowData="rowData" @close="transferPopClose" />
    </div>
    <div v-if="refusedPopShow">
      <refusedPop :oid="rowData.oid" @close="refusedPopClose" />
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
import TableFilter from './transfer/tableFilter'
import CustomColumns from '@/components/customColumns/index'
import { getTakeEmployee, companyPageList, columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { blPagerTransferListPage, blPagerTransferFinish, blPagerTransferCancel } from '@/api/railway/blPage'
import add from './transfer/addPop.vue'
import transferPop from './transfer/transferPop.vue'
import refusedPop from './transfer/refusedPop.vue'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: [],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	transferStatus: 'all'
}
const defaultSearchInputGroup = [
	{ key: 'applyEmployeeId', value: '', placeholder: '申请人', category: 'all', queryValue: '' },
	{ key: 'code', value: '', placeholder: '提单纸编码', category: 'all', queryValue: '' },
	{ key: 'companyId', value: '', placeholder: '提单纸所在分公司', category: 'all', queryValue: '' },
]
export default {
	mixins: [routerMixin],
	data() {
		return {
			rowData: {},
			uploadShow: false,
			cTimestamp: 0,
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
        code: { key: 'code', label: '提单纸编码', type: 'numberRange', searchType: 'like', value: '', category: 'numberRange' },
				companyId: {
					key: 'companyId',
					label: '提单纸所在公司',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getCompanyName('', item)
					},
					filterMehod: (val, item) => {
						this.getCompanyName('', item)
					}
				},
				applyEmployeeId: {
					key: 'applyEmployeeId',
					label: '申请人',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item)
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item)
					}
				},
        auditEmployeeId: {
					key: 'auditEmployeeId',
					label: '审核人',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item)
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item)
					}
				},
        expressNo: { key: 'expressNo', label: '快递单号', type: 'input', searchType: 'like', value: '' },
				applyTime: {
					label: '申请时间',
					key: 'applyTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
        transferStartTime: {
					label: '开始转移时间',
					key: 'transferStartTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
        transferFinishTime: {
					label: '转移完成时间',
					key: 'transferFinishTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
        revokeTime: {
					label: '转移撤回时间',
					key: 'revokeTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
        rejectTime: {
					label: '转移拒绝时间',
					key: 'rejectTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
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
				allColumns: store.state.railway.transferRecordsList.columnsBase(),
				// 操作按钮组
				operationBtns: {
					minWidth: '120',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Finish') {
							this.handleFinish(row)
						}
            if (action === 'Refused') {
              this.handleRefused(row)
            }
						if (action === 'Cancel') {
							this.handleCancel(row)
						}
						if (action === 'Transfer') {
							this.handleTransfer(row)
						}
					},
					data: [
						{
							label: '完成',
							type: 'text',
							show: (item, row) => {
								// 转移中才能点击完成
								return row.transferStatus === 'transfering'
							},
							action: 'Finish'
						},
            {
							label: '拒绝',
							type: 'text',
							show: (item, row) => {
								// 申请中才能点击拒绝
								return row.transferStatus === 'applying'
							},
							action: 'Refused'
						},
						{
							label: '撤回',
							type: 'text',
							show: (item, row) => {
								// 申请中才能点击撤回
								return row.transferStatus === 'applying'
							},
							action: 'Cancel'
						},
						{
							label: '转移',
							type: 'text',
							show: (item, row) => {
								// 申请中才能点击转移
								return row.transferStatus === 'applying'
							},
							action: 'Transfer'
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
			oldParams: {},
      addShow: false,
      transferPopShow: false,
      refusedPopShow: false,
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
		// this.getList()
	},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.user.currRole,
			dictMap: state => state.dict.dictMap,
			blTakeList: state => state.railway.transferRecordsList,
			defaultColumns: state => state.railway.transferRecordsList.defaultColumns,
			specialColumns: state => state.railway.transferRecordsList.specialColumns,
			columnsBase: state => state.railway.transferRecordsList.columnsBase()
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
		CustomColumns,
    add,
    transferPop,
    refusedPop,
	},
	methods: {
		getCompanyName(value, item) {
			let data = {
        query: [
          { column: 'companyName', type: 'like', value },
          { column: 'state', type: 'eq', value: 'valid' }
        ],
        pageSize: 1000
      }
			companyPageList(data).then(res => {
				let {list} = res.data
				list = list.map(item => {
					return Object.assign({}, item, {
						label: item.name,
						value: item.companyCode
					})
				})
				item.data = [...list]
			})
		},
		getMulEmployeeName(val, item, role) {
			let data =  val ? val.replace(/^\s+|\s+$/g, '') : ''
			getTakeEmployee(data).then(res => {
				let itemList = res.data.map(ele => {
					return { ...ele, label: ele.cname, value: ele.employeeId }
				})
				item.data = [ ...itemList ]
			})
		},
		// 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: `${this.$route.name}_transgfer`
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
				scenesCode: `${this.$route.name}_transgfer`,
				columnWidthList: data
			})
				.then(res => {})
				.finally(() => {})
		},
		init() {
			// 默认展示全部
			this.tableQuery.transferStatus = 'all'
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			this.tableConfig.columns = store.state.railway.transferRecordsList.columnsBase()
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
			if (this.tableQuery.transferStatus === 'all') {
				statusQuery = []
			} else {
				statusQuery = [{ column: 'transferStatus', type: 'eq', value: this.tableQuery.transferStatus }]
			}

			// 合并状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.transferStatus
			return data
		},

		// 列表数据
		async getList() {
			let { data } = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}_transgfer`
			})
			let { columnWidthList } = data
			let query = this.getListQuery()
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
			blPagerTransferListPage(query).then(response => {
				this.oldParams = query
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
								if (this.filterGroups[item.key].type === 'remoteSelect' && this.filterGroups[item.key].multiple) {
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
								} else if (this.filterGroups[item.key].category === 'numberRange') {
                  if (item.value && item.value[0]) query.push({ column: item.key, type: 'ge', value: item.value[0]})
									if (item.value && item.value[1]) query.push({ column: item.key, type: 'le', value: item.value[1]})
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
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return { ...item }
			})
			// console.log('重置')
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
		// 新增提单纸
		handleApply() {
      this.addShow = true
		},
    addClose(action, value) {
      this.addShow = false
			if (action === 'Confirm') {
				this.getList()
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
			if (val === 1) return (this.tableConfig.list = [])
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 完成
		handleFinish(row) {
			console.log('🚀 ~ row', row)
			this.rowData = row
			this.$confirm('完成, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          blPagerTransferFinish({ oid: row.oid })
					.then(res => {
						this.$message.success('已完成')
						this.getList()
					})
        })
		},
		// 撤回
		handleCancel(row) { 
			console.log('🚀 ~ row', row)
			this.rowData = row
				this.$confirm('撤回, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          blPagerTransferCancel({ oid: row.oid })
					.then(res => {
						this.$message.success('已撤回')
						this.getList()
					})
        })
		},
		// 转移
		handleTransfer(row) {
			console.log('🚀 ~ row', row)
			this.rowData = row
			this.transferPopShow = true
		},
		transferPopClose(action) {
			this.transferPopShow = false
			if (action === 'Confirm') {
				this.getList()
			}
		},
    handleRefused(row) {
      this.rowData = row
      this.refusedPopShow = true
    },
    refusedPopClose(action) {
      this.refusedPopShow = false
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
